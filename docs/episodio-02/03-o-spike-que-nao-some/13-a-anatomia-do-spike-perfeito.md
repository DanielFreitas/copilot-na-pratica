---
title: 13 - A Anatomia do Spike Perfeito
sidebar_position: 13
description: Como construir o spike-template.md — o padrão que garante consistência entre Daniel e Kássia e transforma análise técnica em contexto acionável.
---

> *"Um spike sem estrutura é um monólogo. Um spike com estrutura é uma conversa que continua mesmo quando você não está na sala."*

**Duração estimada:** ~35 min

## Vídeo introdutório

<video controls width="100%" preload="metadata">
	<source src="/copilot-na-pratica/videos/13-a-anatomia-do-spike-perfeito.mp4" type="video/mp4" />
	Seu navegador não suporta vídeo HTML5.
</video>

## O Problema Real: Spikes que Não Servem Quando Mais Precisam

Você vai precisar de um spike quando:
- A demanda voltou pra corrigir algo e você não lembra o contexto
- Outro dev assume a tarefa e precisa entender o que foi decidido
- O revisor do MR precisa entender por que o código ficou assim
- Você está num incidente às 2h da manhã e precisa saber qual API pode falhar

Em todos esses casos, um spike mal estruturado não ajuda. Você vai gastar mais tempo interpretando o spike do que teria gasto sem ele.

❌ **Spike que não serve:**
```markdown
# Cobrança Recorrente

Analisei o sistema de cobrança. Vamos usar a API de pagamentos com retry.
O banco de dados tem uma tabela de assinaturas.
O scheduler vai chamar o job todo dia às 2h.
Veja o billing-service para referência.
```

Por que não serve:
- Não documenta o As-Is (o que existe hoje)
- Não explica por que escolheu a API de pagamentos (havia alternativas?)
- "Com retry" — qual estratégia? Quantas tentativas? Intervalo?
- "Veja o billing-service" — qual arquivo? Qual função?
- Zero tarefas de backlog

✅ **O mesmo spike com o template correto:** veja a seção abaixo.

## As Seções do Spike Perfeito

### 1. Cabeçalho

```markdown
# [SPIKE] Cobrança Recorrente de Assinaturas

**Data:** 2026-02-21
**Demanda:** https://gitlab.empresa.com/squad/issues/847
**Responsável:** Daniel e Kássia
**Status:** Em andamento | Aprovado | Implementado
**Discovery:** [DISCOVERY.md no repositório](link)
```

**Por que importa:** rastreabilidade imediata. Você sabe quando foi escrito, por quem, para qual demanda, e onde está o contexto técnico detalhado.

### 2. Contexto

```markdown
## Contexto

O serviço de assinaturas precisa cobrar automaticamente os clientes no dia
de vencimento da assinatura. Hoje a cobrança é feita manualmente pelo time
de suporte via painel administrativo — o que gera atraso médio de 2 dias e
depende de processo humano.

A demanda é eliminar o processo manual e automatizar a cobrança no momento
exato do vencimento, com tratamento de falhas e notificação ao cliente.
```

**Por que importa:** contextualiza o **problema de negócio**, não a solução técnica. Qualquer pessoa lê e entende por que isso existia antes de entrar no técnico.

### 3. As-Is (Situação Atual)

```markdown
## As-Is

### Processo Atual
1. Time de suporte verifica lista de assinaturas vencendo hoje (painel)
2. Para cada assinatura: clica em "Cobrar" no painel admin
3. Painel chama `POST /pagamentos` na API de pagamentos interna
4. Resultado registrado manualmente no Zendesk

### Limitações
- Processo manual → dependente de disponibilidade humana
- Sem retry: se a cobrança falha, ninguém cobra de novo automaticamente
- Atraso médio de 2 dias entre vencimento e cobrança real
- Nenhum registro estruturado das tentativas de cobrança

### Infraestrutura Relevante
- **API de pagamentos:** https://api.empresa.com/v2 (POST /pagamentos)
  - Autenticação: OAuth2 client credentials
  - Rate limit: 200 req/min (confirmado com @plataforma-api)
- **Banco:** PostgreSQL — tabela `subscriptions` com coluna `due_date` e `status`
- **Scheduler:** plataforma/scheduler-service disponível, usa empresa-scheduler v2.1.0
```

**Por que importa:** documenta o **ponto de partida real**, não idealizado. Se o sistema tem gambiarras, elas devem aparecer aqui — porque senão alguém vai tropeçar nelas na implementação.

### 4. To-Be (Situação Desejada)

```markdown
## To-Be

### Processo Proposto
1. Job recorrente dispara todo dia às 02:00 via scheduler-service
2. Job busca assinaturas com `due_date = hoje` e `status = ativo`
3. Para cada assinatura: chama `POST /pagamentos` com retry automático
4. Retry: 3 tentativas, backoff exponencial, intervalo mínimo 24h
5. Resultado registrado na tabela `payment_attempts` (nova)
6. Falha após 3 tentativas: status da assinatura → `cobranças_falhas` + notificação

### Mudanças no Banco
```sql
-- Nova tabela
CREATE TABLE payment_attempts (
    id          BIGSERIAL PRIMARY KEY,
    subscription_id BIGINT REFERENCES subscriptions(id),
    attempted_at    TIMESTAMPTZ NOT NULL,
    status          VARCHAR(20) NOT NULL, -- success, failed, pending
    error_code      VARCHAR(50),
    attempt_number  SMALLINT NOT NULL
);
```

### Componentes Novos
- `app/jobs/recurring_billing_job.py` — lógica do job
- `app/services/payment_processor.py` — cliente para API de pagamentos
- `app/models/payment_attempt.py` — modelo da nova tabela
```

**Por que importa:** documenta o **estado desejado com especificidade suficiente** para o desenvolvimento começar sem reunião. As decisões (schedule, retry, tabela nova) estão explícitas.

### 5. Análise Técnica

```markdown
## Análise Técnica

### APIs Envolvidas
- `POST /pagamentos` — API de pagamentos interna v2
  - Autenticação: OAuth2, token via `empresa-auth`
  - Header obrigatório: `X-Idempotency-Key: {uuid}`
  - Campo `amount` em **centavos** (integer), não reais
  - Rate limit: 200 req/min — não representa risco (job processa ~50/dia)

### Dependências Identificadas
- `empresa-scheduler v2.1.0` — para registrar o job recorrente
  - API: `scheduler.register(job_type="recurring_billing", cron="0 2 * * *")`
  - Padrão de uso: notification-service (squad-pagamentos/notification-service)
- `empresa-auth v3.2.1` — autenticação OAuth2
  - ⚠️ v3.x: `refresh=True` obrigatório em `validate()`

### Riscos e Incertezas
| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Cache de assinatura (TTL 600s) desatualizado no vencimento | Média | Alta | Invalidar cache ao atualizar status |
| API de pagamentos indisponível no horário do job | Baixa | Alta | Retry + alertas pelo scheduler |
| Volume maior que 200 req/min em datas festivas | Muito baixa | Média | Rate limiting no job se necessário |
```

**Por que importa:** documenta as **decisões que não ficam óbvias no código**. "Por que usamos centavos?" está aqui. "Por que 3 tentativas com 24h?" está aqui. O dev que abre o código 6 meses depois entende o raciocínio.

### 6. Decisões Técnicas

```markdown
## Decisões Técnicas

### DT-01: Backoff Exponencial com Mínimo de 24h
**Decisão:** retry com 3 tentativas, intervalo mínimo 24h entre tentativas.
**Alternativas consideradas:**
- Retry imediato (3 tentativas em minutos): descartado — falha de pagamento raramente se resolve em minutos
- 7 tentativas com backoff agressivo: descartado — acordo comercial limita a 3 tentativas antes de marcar inadimplência
**Justificativa:** acordo com o time de negócios: 3 tentativas em 3 dias consecutivos é o máximo antes de notificar o cliente sobre inadimplência.

### DT-02: Idempotency Key por Tentativa
**Decisão:** UUID gerado por tentativa, não por cobrança.
**Justificativa:** se o job rodar duas vezes no mesmo dia (ex: restart do scheduler), a segunda execução vai gerar um UUID diferente — o que é o comportamento correto, pois queremos cobrar uma vez por tentativa, não uma vez por cobrança total.
```

**Por que importa:** a seção mais valiosa do spike no longo prazo. Documenta **o que foi considerado e descartado** e **por que**. Sem isso, alguém vai "redescobrir" as alternativas descartadas e refazer o mesmo raciocínio.

### 7. Tarefas de Backlog

```markdown
## Tarefas de Backlog

- [TASK] Criar migration para tabela `payment_attempts`
  - Critério de aceite: migration executada em staging sem erros
  
- [TASK] Implementar `PaymentProcessor` com retry e idempotency key
  - Critério de aceite: testes unitários para success, failure, e retry esgotado
  
- [TASK] Implementar `RecurringBillingJob` que processa assinaturas do dia
  - Critério de aceite: job processa lista de assinaturas e registra tentativas
  
- [TASK] Registrar job no scheduler-service com cron `0 2 * * *`
  - Critério de aceite: job aparece no painel do scheduler, dispara no horário
  
- [TASK] Invalidar cache de assinatura ao atualizar status
  - Critério de aceite: cache inválido não retorna status desatualizado no dia seguinte
  
- [TASK] Alertas: notificar canal #pagamentos quando job falha por 2+ tentativas
  - Critério de aceite: alerta enviado em staging ao simular falha por 2 tentativas
```

**Por que importa:** o spike vira o backlog da sprint. Não existe momento separado de "decompor as tarefas" — elas nascem do spike.

## O Template Completo

Salve como `docs/spike-template.md` no repositório da squad:

```markdown
# [SPIKE] {Nome da Demanda}

**Data:** {YYYY-MM-DD}
**Demanda:** {link do ticket}
**Responsável:** {nomes}
**Status:** Em andamento
**Discovery:** {link do DISCOVERY.md ou N/A}

---

## Contexto

{Descrição do problema de negócio em 2-3 parágrafos.
Não descreva a solução — descreva o problema.}

---

## As-Is

### Processo Atual
{Como o processo funciona hoje, passo a passo}

### Limitações
{O que não funciona, o que é manual, o que é frágil}

### Infraestrutura Relevante
{APIs, banco, libs que já existem e são relevantes para a demanda}

---

## To-Be

### Processo Proposto
{Como vai funcionar após a implementação, passo a passo}

### Mudanças no Banco
{SQL de migrations necessárias, se houver}

### Componentes Novos
{Arquivos novos que serão criados}

---

## Análise Técnica

### APIs Envolvidas
{Cada API com: endpoint, autenticação, campos não óbvios, rate limit}

### Dependências Identificadas
{Libs internas com versão e como usar, com exemplo de código se necessário}

### Riscos e Incertezas
| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| {risco} | Alta/Média/Baixa | Alta/Média/Baixa | {mitigação} |

---

## Decisões Técnicas

### DT-01: {Título da Decisão}
**Decisão:** {o que foi decidido}
**Alternativas consideradas:** {o que foi descartado e por quê}
**Justificativa:** {razão da decisão}

---

## Tarefas de Backlog

- [TASK] {Título claro e acionável}
  - Critério de aceite: {como saber que está pronto}
```

## Anti-padrões vs Padrão Correto

❌ **Spike sem As-Is:**
```markdown
## To-Be
Vamos implementar cobrança automática.
→ O dev não sabe a partir de onde está partindo
→ Pode reimplementar algo que já existe
```

⚠️ **Tarefas sem critério de aceite:**
```markdown
- [TASK] Implementar o job de cobrança
→ Funciona como ponto de partida, mas "implementado" é subjetivo
→ Revisor do MR não sabe o que validar
```

✅ **Tarefas com critério de aceite específico:**
```markdown
- [TASK] Implementar o job de cobrança
  - Critério de aceite: job processa lista de assinaturas,
    registra tentativas na tabela payment_attempts,
    testes unitários cobrem success, failure e retry esgotado
→ Inequívoco. Dev e revisor têm o mesmo critério.
```

## Exercício Prático

**Missão:** Criar o `spike-template.md` e aplicá-lo num projeto real.

1. Adicione o template completo ao seu repositório como `docs/spike-template.md`.
2. Escolha uma demanda recente (ou planejada) que tem pelo menos:
   - Uma API externa ou interna
   - Uma mudança de banco de dados
   - Pelo menos uma decisão técnica não trivial
3. Escreva o spike para essa demanda usando o template — sem pular nenhuma seção.
4. Avalie seu spike preenchido com este checklist:

| Critério | Seu Spike |
|---|---|
| As-Is descreve o processo atual com especificidade | |
| To-Be tem passo a passo do processo proposto | |
| Cada API com: endpoint, auth, campos não óbvios | |
| Pelo menos 1 decisão técnica com alternativas descartadas | |
| Tarefas com critério de aceite (não só título) | |
| Decisão técnica mais importante tem justificativa | |

**Critério de sucesso:** se você abrir esse spike em 6 meses, vai entender o contexto sem precisar de memória adicional.

## Troubleshooting

### 💡 Problema: O spike ficou muito longo (mais de 5 páginas)

**Causa:** As seções "Análise Técnica" e "As-Is" estão documentando detalhes que deveriam ficar no `DISCOVERY.md`.

**Solução:** regra de divisão:
- O que **o dev precisa DURANTE o desenvolvimento** → spike
- O que **o dev precisaria para refazer o discovery** → DISCOVERY.md
- O que é **referência histórica completa** → Confluence com mais espaço

O spike deve ser legível em 10 minutos. Se não for, está detalhado demais.

### 💡 Problema: As tarefas de backlog ficaram muito granulares (20+ tarefas)

**Causa:** você está decompondo implementação, não planejando o escopo.

**Solução:** spike deve ter entre 5 e 10 tarefas. Se precisar de mais, um spike não vai dar conta — você tem múltiplos contextos diferentes que merecem spikes separados. Revise se a demanda não deveria ser dividida em duas.

:::tip 🏆 Treinamento Jedi Completo
Você está pronto para a próxima aula se:

- [ ] O `spike-template.md` está no repositório em `docs/spike-template.md`
- [ ] Apliquei o template num projeto real e preenchi todas as seções (sem pular nenhuma)
- [ ] O spike tem pelo menos 1 decisão técnica com alternativas descartadas documentadas
- [ ] As tarefas de backlog têm critério de aceite — não são só títulos
- [ ] Sei a regra de divisão: o que vai no spike vs o que vai no DISCOVERY.md vs o que vai no Confluence
:::

---

O template existe. Mas aplicá-lo manualmente toda vez para cada demanda seria exatamente o tipo de trabalho que o sistema deve automatizar. Na **Aula 14 — Do Discovery ao Spike**, você vai construir o `spike.prompt.md` que transforma o `DISCOVERY.md` preenchido em um spike estruturado automaticamente. E vai aprender a regra de ouro: quando o spike gerado está genérico, o problema está no discovery — não no prompt.



