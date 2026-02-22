---
title: 26 - A Squad em Campo
sidebar_position: 26
description: A missão final — execução do sistema completo numa demanda real end-to-end, com os dois Droids, a biblioteca, o DNA e o kickoff operando em conjunto.
---

> *"A squad não improvisa mais. O que antes pedia um dia agora pede uma manhã. E cada projeto deixa a squad mais rápida no próximo."*

**Duração estimada:** ~60 min (a missão é intencional — é a síntese de tudo)

## Vídeo introdutório

<video controls width="100%" preload="metadata">
	<source src="/copilot-na-pratica/videos/26-a-squad-em-campo.mp4" type="video/mp4" />
	Seu navegador não suporta vídeo HTML5.
</video>

## A Missão Final

Esta é a última aula. Não há conceito novo aqui — o que há é a síntese de tudo que foi construído nos dois episódios operando em conjunto numa demanda real e complexa.

A demanda:

```
Sistema de faturamento consolidado

Contexto:
- Empresa tem 3 produtos com sistemas de faturamento independentes (legado, SaaS, marketplace)
- Objetivo: novo serviço que consolida os 3 em uma visão unificada de fatura
- Integrações obrigatórias:
    * API legada (SOAP/REST híbrido, autenticação proprietária, sem documentação oficial)
    * API SaaS (REST moderna, bem documentada, rate limit 200 req/min)
    * API Marketplace (GraphQL, autenticação via gateway central)
    * Gateway de autenticação central (OAuth2, usado pelos 3)
- Infraestrutura:
    * Banco: PostgreSQL novo (sem dados iniciais)
    * Cache: Redis para deduplicação e rate limiting
    * Serviço: FastAPI + Docker, padrão da squad
- Restrição: o gateway de autenticação central tem downtime programado de 2h/semana
  e a squad precisa lidar com isso sem impacto para o usuário final
```

## Execução Completa: 8 Etapas

### Etapa 0 — Configurando o Campo (antes de abrir o kickoff)

**A squad verifica:**

1. Dois Droids conectados e testados:
   ```
   → Droid GitLab: ferramenta ler_arquivo retorna conteúdo correto ✅
   → Droid Confluence: publicação de teste criada e deletada ✅
   ```

2. Biblioteca de prompts disponível:
   ```
   squad-prompts/
     discovery/discovery.prompt.md ✅
     spike/spike.prompt.md ✅
     kickoff/kickoff.prompt.md ✅
     revisao/revisao-mr.prompt.md ✅
   ```

3. DNA da squad disponível:
   ```
   .github/copilot-instructions.md (squad) ✅ — hash sincronizado nos dois laptops
   ```

**Resultado:** campo configurado. Pode executar o kickoff.

### Etapa 1 — Discovery (via kickoff.prompt.md, Etapa 1)

A análise do Droid GitLab encontra nos repos do legado:

```markdown
## Descobertas Relevantes

### API Legada
- Autenticação: sistema proprietário com token de sessão (TTL 30min)
  → Token precisa ser renovado durante operações longas — cache Redis necessário
- Campo amount: inteiro em centavos (diferente da API SaaS!)
- Campo status: misto de strings inglês + português ("paid", "pago", "PENDENTE")
  → 🔍 PENDÊNCIA: normalização de status é uma decisão de produto, não técnica
- Não há endpoint de listagem paginada — endpoint retorna tudo ou nada
  → 🔍 PENDÊNCIA: como fazer o pull periódico sem sobrecarregar?

### API SaaS
- Bem documentada, REST padrão
- Rate limit: 200 req/min documentado (testado: real é ~190)
- amount: decimal com 2 casas (ex: 1500.00)

### API Marketplace (GraphQL)
- Autenticação via gateway central — o downtime de 2h impacta essa integração
  → 🔍 PENDÊNCIA: estratégia de fallback durante o downtime do gateway?
- amount: decimal com 2 casas

### Gateway Central
- OAuth2 client_credentials
- Token TTL: 3600s com renovação transparente
- Downtime programado: domingos 2h-4h (UTC-3)
```

### Etapa 2 — DISCOVERY.md Consolidado

```markdown
## Casos de Borda Identificados

1. **Valores inconsistentes entre APIs:**
   - Legado: inteiros em centavos (150000 = R$1500,00)
   - SaaS + Marketplace: decimal com 2 casas (1500.00 = R$1500,00)
   - Decisão necessária: normalização interna antes de persistir

2. **Status heterogêneos:**
   - Legado retorna "paid", "pago", "PENDENTE", "cancelado" (sem padrão)
   - SaaS retorna "paid", "pending", "cancelled" (inglês, lowercase)
   - Marketplace retorna "PAID", "PENDING", "CANCELLED" (inglês, uppercase)
   - Decisão necessária: enum interno de status normalizado

3. **Downtime do gateway (domingos 2h-4h):**
   - Durante o downtime, o Marketplace fica inacessível
   - O que mostrar ao usuário? Fatura desatualizada? Erro? Dados em cache?

4. **API Legada sem paginação:**
   - Pull completo a cada sincronização pode sobrecarregar
   - Frequência de sincronização a definir

## Pendências (🔍)
🔍-01: Normalização de status — produto decide ou técnico normaliza arbitrariamente?
🔍-02: Fallback do Marketplace durante downtime — cache stale ou degradação graceful?
🔍-03: Frequência de sincronização da API legada — pull completo aceitável?
```

### Etapa 3 — Spike

**Decisões Técnicas principais produzidas:**

```markdown
### DT-01: Normalização de Valores Monetários
Problema: 3 sistemas com formatos diferentes (centavos vs decimal).
Decisão: camada de normalização na ingestão — todos os valores persistidos como
integer em centavos internamente. A camada de API expõe como decimal.
Alternativa descartada: normalizar na exibição — mais frágil, erro em qualquer camada expõe o bug.

### DT-02: Enum Interno de Status
Problema: strings heterogêneas (paid/pago/PAID/PENDENTE).
Decisão: StatusEnum Python com mapeamento por fonte:
  LEGADO_MAP = {"paid": Status.PAID, "pago": Status.PAID, "PENDENTE": Status.PENDING, ...}
  SAAS_MAP   = {"paid": Status.PAID, "pending": Status.PENDING, ...}
  MKT_MAP    = {"PAID": Status.PAID, "PENDING": Status.PENDING, ...}

### DT-03: Cache de Token da API Legada
Problema: token TTL de 30min, operações podem durar mais.
Decisão: Redis com TTL de 25min (5min de margem) + renovação lazy no primeiro request após expiração.

### DT-04: Fallback Durante Downtime do Gateway
Problema: Marketplace fica inacessível aos domingos 2h-4h.
Decisão: servir dados em cache com header `X-Data-Freshness: stale` e timestamp da última sincronização.
Usuário vê dados desatualizados com indicação clara — não vê erro.

### DT-05: Sincronização da API Legada
Problema: sem paginação — pull completo pode ser pesado.
Decisão: pull incremental por data de modificação usando campo `updated_at` do legado.
Primeira sincronização: full pull em horário de baixo tráfego.
```

### Etapa 4 — Publicação no Confluence

```
Spike publicado:
URL: https://empresa.atlassian.net/wiki/spaces/ENG/pages/19287632/SPIKE-faturamento-consolidado
Status: RASCUNHO
```

### Etapa 5 — copilot-instructions.md do Projeto

```markdown
# Contexto: Sistema de Faturamento Consolidado

## Spike de Referência
[SPIKE] Faturamento Consolidado → https://empresa.atlassian.net/wiki/.../SPIKE-faturamento-consolidado

## Contexto Crítico (sempre considere)
- amount sempre em centavos internamente — NUNCA persista decimal
- StatusEnum obrigatório — NUNCA use strings de status diretamente das fontes
- Token da API legada: cache Redis com TTL 25min (5min de margem)
- Downtime do gateway (domingos 2h-4h): servir cache com X-Data-Freshness: stale
- Pull incremental da API legada via campo updated_at

## Padrões Técnicos
- HTTP client: httpx (assíncrono)
- Retry: stamina com backoff exponencial
- Cache: redis-py com typing correto
- Tests: pytest + respx para mock de HTTP
```

### Etapa 6 — Divisão de Trabalho

```markdown
## Divisão de Trabalho

### Daniel — Domínio de Ingestão
- T-01: Modelos e migration (sem dependências) → estimativa: M
- T-02: Ingestão da API Legada com normalização (depende de T-01) → estimativa: G
- T-03: Cache de token da API Legada (depende de T-02) → estimativa: P

### Kássia — Domínio de Consolidação
- T-04: Ingestão da API SaaS (depende de T-01) → estimativa: M
- T-05: Ingestão da API Marketplace com fallback de downtime (depende de T-01) → estimativa: M
- T-06: Endpoint de visão consolidada + normalização de status (depende de T-02, T-04, T-05) → estimativa: G

### Dependências Críticas
- T-06 espera T-02 e T-04 e T-05 → ambos devs precisam terminar ingestão antes da consolidação
- T-03 (cache) pode ser feito em paralelo com T-04 e T-05 — sem conflito
```

### Etapa 7 — Implementação (os dois Copilots em paralelo)

Com o sistema completo operando:

**Daniel inicia a Etapa T-01:**
```
#file:.github/copilot-instructions.md (projeto)

Crie a migration Alembic para o modelo de Fatura (campo amount como Integer,
status como StatusEnum, source como SourceEnum, external_id, timestamps).
```

O Copilot de Daniel gera a migration com `amount: Integer` (não decimal) e `StatusEnum` — os padrões estão no arquivo. Sem instrução extra.

**Kássia inicia a Etapa T-04:**
```
#file:.github/copilot-instructions.md (projeto)

Implemente o ingestion da API SaaS: GET /v1/invoices, normaliza amount (decimal→centavos),
status (SaaS_MAP), persiste. Inclui retry stamina e testes para sucesso + rate limit.
```

O Copilot de Kássia: `httpx`, `stamina`, `amount * 100` (decimal para centavos), `SAAS_MAP[status]`, testes com `respx`. Tudo conforme o spike e o DNA.

Os dois trabalhando em paralelo. Contexto idêntico. Zero reunião de alinhamento intermediária.

### Etapa 8 — Revisão Cruzada

Daniel cria MR com a ingestão do legado. Kássia executa a pré-revisão:

```
#file:DISCOVERY.md
#file:.github/copilot-instructions.md (projeto)
[diff do MR]

Execute a revisão do MR usando o revisao-mr.prompt.md.
Spike de referência: {URL}.
```

```
✅ Correto
- amount convertido para centavos corretamente (int(decimal_value * 100)) ✅
- Cache de token Redis com TTL 25min ✅ — conforme DT-03
- Retry stamina com backoff ✅ — conforme DNA da squad
- StatusEnum com LEGADO_MAP ✅ — conforme DT-02
- X-Correlation-ID incluído nos requests ✅

⚠️ Pode melhorar
- Método de ingestão tem 85 linhas — considere extrair _build_request_payload()

❌ Precisa mudar antes do merge
- Pull incremental não está usando updated_at: o código está fazendo full pull
  sempre, não só na primeira sincronização
  → DT-05 do spike: "pull incremental via updated_at após a primeira sincronização"
  → Risco: sobrecarga na API legada após o full pull inicial
```

Um item crítico identificado antes de chegar Ã  homolog.

## Retrospectiva: O Que o Sistema Entregou

Ao final das 2-3 horas de kickoff + primeiros artefatos de código:

| O que tinha antes | O que tem agora |
|---|---|
| Demanda vaga ("integrar 3 sistemas") | 5 decisões técnicas documentadas como DT-xx |
| Contexto mental nos dois devs | Artefatos físicos: DISCOVERY.md + spike + copilot-instructions.md |
| Reunião de alinhamento | Divisão de tarefas com dependências mapeadas |
| Contexto divergente nos dois Copilots | Hash idêntico nos dois copilot-instructions.md |
| Bugs descobertos na homolog | Casos de borda no DISCOVERY.md desde o início |
| Revisão de 2 horas sem foco | Pré-revisão com referências ao spike: 30 min |

## O Checklist Final da Squad

Se você passou pelo Episódio II e chegou aqui, sua squad tem:

**Os 4 Pilares Completos (Episódio I — revisitados como squad):**
- [ ] Dois `copilot-instructions.md` da squad sincronizados
- [ ] Biblioteca `squad-prompts/` com discovery, spike, kickoff e revisão de MR
- [ ] Dois Droids configurados: GitLab + Confluence
- [ ] `copilot-instructions.md` de projeto com link do spike após todo kickoff

**O Ritual de Discovery:**
- [ ] `DISCOVERY.md` preenchido antes de qualquer spike
- [ ] Droid GitLab consultado antes de qualquer decisão técnica sobre repositórios existentes
- [ ] Pendências explícitas com 🔍 resolvidas antes do spike

**O Spike que Não Some:**
- [ ] Spike no template padrão com DT-xx e tarefas de backlog com critério de aceite
- [ ] Spike sempre publicado no Confluence com URL
- [ ] Link do spike no copilot-instructions.md do projeto

**A Memória da Squad:**
- [ ] Qualquer prompt útil salvo na biblioteca com cabeçalho de documentação
- [ ] Biblioteca versionada no GitLab com MR obrigatório para mudanças

**O Estilo da Squad:**
- [ ] DNA da squad em `.github/copilot-instructions.md` com tabela de autonomia
- [ ] Evolução via MR — nunca edição direta
- [ ] Hash verificado em ambos os laptops após cada MR merged

**O Ritual de Início:**
- [ ] `kickoff.prompt.md` executado antes de qualquer nova demanda
- [ ] 6 artefatos antes da primeira linha de código
- [ ] Kickoff nunca opcional — mesmo a versão mínima tem Discovery + Spike + Ponte

## Exercício Final

**Missão:** Execute o sistema completo numa demanda real da sua squad.

1. Escolha uma demanda real do backlog — preferencialmente uma nova, ainda não iniciada.
2. Execute o kickoff completo com os dois Droids e os dois devs.
3. Registre:
   - Tempo total do kickoff
   - Quantos artefatos foram produzidos
   - Quantas pendências 🔍 foram identificadas que você provavelmente teria descoberto durante a implementação
   - Qual foi o maior "aha moment" — a coisa mais importante que o Droid ou o agente encontrou e que vocês teriam perdido sem o ritual

4. Compare com a última demanda iniciada sem o ritual:

| Métrica | Com ritual | Sem ritual (estimativa) |
|---|---|---|
| Tempo até primeiro contexto compartilhado entre devs | | |
| Decisões técnicas documentadas antes de codar | | |
| Bugs descobertos na homolog que estavam nos casos de borda | | |

**Critério de sucesso:**
- [ ] Missão completa com todos os entregáveis do kickoff
- [ ] Discovery + alinhamento < 45 min
- [ ] Os dois devs com mesmo contexto sem reunião intermediária de alinhamento

:::tip 🏆 Missão Completa — Episódio II Concluído
Você completou o Episódio II se:

- [ ] Os 4 pilares do Episódio I estão funcionando para a squad
- [ ] Os dois Droids estão configurados e testados
- [ ] A biblioteca squad-prompts/ tem ao menos 4 prompts em uso
- [ ] O DNA da squad está no `.github/copilot-instructions.md` com tabela de autonomia
- [ ] O kickoff é o ritual padrão para toda nova demanda
- [ ] Os dois Copilots têm o mesmo contexto com hash verificado
- [ ] A revisão cruzada usa o prompt file de MR com contexto do spike
- [ ] Sei diagnosticar e recuperar cada tipo de falha do ritual
:::

---

## Epílogo

A squad não improvisa mais.

Cada demanda encontra um ritual pronto: um `kickoff.prompt.md` que conduz as 6 etapas e produz os 6 artefatos antes que a primeira linha de código seja escrita. Dois Droids de prontidão que conhecem os repositórios e publicam automaticamente no Confluence. Uma biblioteca de conhecimento acumulado que cresce a cada sprint — prompts testados, abordagens validadas, contexto cristalizado. E dois Copilots que compartilham o mesmo contexto, o mesmo DNA, o mesmo spike, sem que uma reunião de alinhamento seja necessária.

O que antes levava um dia agora leva uma manhã.

E cada projeto deixa a squad mais rápida no próximo.

**O Episódio III aguarda.**

