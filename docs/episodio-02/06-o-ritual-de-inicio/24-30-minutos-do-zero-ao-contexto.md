---
title: 24 - 30 Minutos do Zero ao Contexto
sidebar_position: 24
description: O kickoff.prompt.md executado ao vivo, sem cortes, numa demanda real — do momento em que chega até os 6 artefatos produzidos e os dois devs com o mesmo contexto.
---

> *"Você não precisa de uma reunião de alinhamento de 1 hora. Você precisa de um ritual de 30 minutos que termina com artefatos reais."*

**Duração estimada:** ~50 min (a aula é uma demo longa intencional)

## Vídeo introdutório

<video controls width="100%" preload="metadata">
	<source src="/copilot-na-pratica/videos/24-30-minutos-do-zero-ao-contexto.mp4" type="video/mp4" />
	Seu navegador não suporta vídeo HTML5.
</video>

## O Que Esta Aula É (e O Que Não É)

Esta aula é diferente das anteriores. Não tem muito conceito novo. O que tem é:

- O `kickoff.prompt.md` sendo executado em tempo real
- Uma demanda real (ou muito próxima de real): sistema de aprovação de despesas
- As 6 etapas completas, com os artefatos reais que cada uma produz
- O que acontece quando o agente trava numa etapa (e como desbloquear)
- O ajuste fino do kickoff baseado no que não funcionou

O objetivo não é ensinar um novo conceito — é **calibrar a sua expectativa do que o ritual produz quando funciona bem.**

## A Demanda

```
Sistema de aprovação de despesas

Contexto: empresa tem ~200 funcionários que submetem despesas via app mobile.
Aprovação é multi-nível: gestor direto → director de área → financeiro (se > R$ 5k).
Integração obrigatória: ERP interno (tem API REST, documentação parcial).
Notificação: Teams via webhook para cada mudança de status.
Histórico: 3 meses de prazo, estimativa do PO: 6 semanas de trabalho.
```

## Execução Completa: As 6 Etapas

### A Instrução Inicial

Com os Droids conectados e Agent Mode ativo:

```
Temos uma nova demanda: sistema de aprovação de despesas multi-nível com integração
ao ERP interno (API REST) e notificações via Teams webhook.

Aprovadores: gestor direto → director → financeiro se valor > R$5k.
Prazo: 3 meses. Estimativa: 6 semanas.

Execute o kickoff.prompt.md completo para esta demanda.
Os repositórios do ERP estão em gitlab.empresa.com/grupo/erp-api e erp-adapter.
```

### Etapa 1 — Discovery (tempos típicos: 8-12 min)

O agente vai produzir o `DISCOVERY.md`. Trechos relevantes que devem aparecer:

```markdown
## Mapeamento de APIs Externas

### ERP Interno (api.erp.empresa.com)
- **Autenticação:** OAuth2 com client_credentials (token expira em 3600s)
- **Despesas:** `POST /v2/expenses` — cria entrada contábil após aprovação
- **Tenants:** campo `company_code` (string, 6 chars) — não é o UUID do sistema
- **Rate limit:** documentação diz 100 req/min, mas histórico mostrou throttling a 80
- **Cabeçalhos obrigatórios:** `X-Correlation-ID` (rastreabilidade obrigatória, gerado por nós)
- **Valores:** `amount` como decimal com 2 casas (diferente da API de cobrança!)
  🔍 PENDÊNCIA: confirmar se amount tem casa decimal ou é inteiro em centavos — documentação inconsistente

### Teams Webhook
- **Formato:** Adaptive Card ou mensagem simples (confirmar qual o padrão da empresa)
- **Rate limit:** 4 mensagens por segundo por webhook URL
  🔍 PENDÊNCIA: confirmar se é 1 webhook global ou 1 por aprovador

## Casos de Borda
- Aprovador inativo: o que acontece? Escalar automaticamente? Notificar RH?
  🔍 PENDÊNCIA: regra de negócio indefinida
- Valor de despesa em moeda estrangeira: converter para BRL? Qual taxa?
  🔍 PENDÊNCIA: regra de negócio indefinida
- Timeout no ERP: reverter a aprovação internamente? Fila para retry?
```

**Como validar:** leia o DISCOVERY.md com atenção. As pendências com 🔍 são perguntas reais para o PO — estão corretas? Faltou alguma?

### Etapa 2 — Análise de Fontes (tempos típicos: 5-8 min)

O Droid GitLab vai analisar `erp-api` e `erp-adapter`:

```
Resultado da análise (Droid GitLab):

Repositório: erp-api
- Endpoints expostos: 14 endpoints mapeados
  → /v2/expenses, /v2/expenses/{id}, /v2/expenses/{id}/status
  → /v2/approvals/{id} (EXISTENTE — processo de aprovação já tem endpoint!)
  → /v2/audit-log (histórico de mudanças — pode ser útil)
- amount: todos os exemplos usam decimal com 2 casas (1500.00, não 150000)
  → confirma que NÃO é centavos — resolve a pendência 🔍 do DISCOVERY.md

Repositório: erp-adapter
- Lib de autenticação: empresa-auth v3.2.1 já é usada aqui
- Retry: usa tenacity (diferente da squad — squad usa stamina)
  → DECISÃO TÉCNICA a registrar no spike: usar stamina, não tenacity

Achado relevante: erp-adapter tem um cliente HTTP para o ERP já implementado
→ pode ser extraído ou reutilizado
```

**Como validar:** os endpoints encontrados fazem sentido? O achado do cliente HTTP existente é algo que vocês querem reutilizar ou reescrever?

### Etapa 3 — Spike (tempos típicos: 10-15 min)

Baseado no DISCOVERY.md completo, o agente produz o spike. Trecho das decisões técnicas:

```markdown
## Decisões Técnicas

### DT-01: Estratégia de retry para chamadas ao ERP
**Problema:** ERP faz throttling a 80% do rate limit documentado (🔍 resolvido na Etapa 2).
**Decisão:** Usar stamina (padrão da squad) com backoff exponencial,
máximo 3 tentativas, espera mínima de 5s.
**Alternativa descartada:** tenacity (encontrado no erp-adapter) — fora do padrão da squad.

### DT-02: Campo amount no ERP
**Problema:** documentação inconsistente sobre formato.
**Decisão:** Decimal com 2 casas (ex: 1500.00) — confirmado pela análise do erp-adapter.
**Risco:** se o ERP mudar, o adapter explode imediatamente → adicionar assertion no startup.

### DT-03: Aprovador inativo
**Problema:** regra de negócio pendente (🔍 do DISCOVERY.md).
**Decisão temporária:** bloquear submissão enquanto a regra estiver indefinida.
Spike não vai implementar aprovador inativo — é requisito do PO, não técnico.
**Ação:** PO deve responder antes do refinamento.

### DT-04: Webhook Teams
**Decisão:** 1 webhook global (mais simples) + incluir nome do aprovador na mensagem.
Se a empresa quiser 1 por aprovador, é configuração futura.

## Tarefas de Backlog

### T-01: Modelo de dados de despesas e aprovações
**Critério de aceite:** tabelas `expenses`, `approvals` e `audit_log` criadas,
migration rodando em ambiente local.

### T-02: Endpoint de submissão de despesa
**Critério de aceite:** `POST /expenses` aceita a despesa, salva com status `pending`,
retorna o `expense_id`. Testes cobrem: submissão válida, amount inválido,
usuário sem permissão.

### T-03: Motor de aprovação multi-nível
**Critério de aceite:** dado um expense_id, o motor determina o próximo aprovador
com base no valor e hierarquia configurada. Testes cobrem: os 3 níveis possíveis.

### T-04: Integração com ERP
**Critério de aceite:** ao final approval, `POST /v2/expenses` no ERP é chamado
com amount decimal, company_code correto e X-Correlation-ID. Retry com stamina.
Testes cobrem: sucesso, retry, falha permanente.
```

### Etapa 4 — Publicação (tempos típicos: 2-3 min)

```
Publicação concluída.

URL: https://empresa.atlassian.net/wiki/spaces/ENG/pages/18472936/SPIKE-aprovacao-despesas

Título: [SPIKE] Sistema de Aprovação de Despesas Multi-nível
Status: RASCUNHO
```

### Etapa 5 — Ponte (tempos típicos: 2-3 min)

`copilot-instructions.md` do projeto produzido com:

```markdown
# Contexto do Projeto: Sistema de Aprovação de Despesas

## Spike de Referência
[SPIKE] Sistema de Aprovação de Despesas — https://empresa.atlassian.net/wiki/...

## Padrões Técnicos
- Retry: stamina (não tenacity — ver DT-01 do spike)
- ERP amount: decimal com 2 casas (ex: 1500.00 — ver DT-02)
- X-Correlation-ID: sempre incluir nas chamadas ao ERP
- Teams webhook: 1 webhook global, máximo 4 msg/s
```

### Etapa 6 — Alinhamento (tempos típicos: 3-5 min)

```markdown
## Divisão de Trabalho

### Daniel (responsável pelo domínio de despesas)
- T-01: Modelo de dados (sem dependências)
- T-02: Endpoint de submissão (depende de T-01)
- T-04: Integração ERP (depende de T-02 + T-03)

### Kássia (responsável pelo domínio de aprovação)
- T-03: Motor de aprovação multi-nível (depende de T-01)
- T-05: Notificações Teams (depende de T-03)
- T-06: Histórico e audit log (depende de T-01)

### Dependências críticas
- T-03 precisa do modelo da T-01 → Daniel avisa quando migration estiver pronta
- T-04 precisa do motor da T-03 → Kássia avisa quando T-03 estiver pronta
```

## Resultado: 30-45 Minutos, 6 Artefatos

| Artefato | Etapa | Tamanho / Conteúdo |
|---|---|---|
| `DISCOVERY.md` | 1 | Pendências explícitas, fontes, rate limits, casos de borda |
| Mapa de endpoints + uso de libs | 2 | 14 endpoints, client HTTP existente, amount = decimal |
| Spike completo | 3 | 4 DTs, 6 tarefas de backlog com critério de aceite |
| URL no Confluence | 4 | Link compartilhável com o time |
| `copilot-instructions.md` | 5 | Link do spike + padrões técnicos específicos |
| Divisão de responsabilidades | 6 | Tarefas por dev, dependências mapeadas |

**Sem o ritual:** o mesmo material teria ficado em post-its mentais, Slack e "a gente sabe o que foi decidido." A partir da Semana 3, começariam os conflitos sobre o que foi ou não decidido.

## Quando o Agente Trava

O agente pode travar em qualquer etapa. O que fazer:

**Trava na Etapa 2 (Droid GitLab não acha os repos):**
```
"Os repositórios que você mencionou retornaram erro de acesso.
Forneça os nomes exatos dos repos no GitLab ou as URLs de acesso."
→ Solução: confirme o nome exato do repo no GitLab e informe ao agente.
Se não tiver acesso ao GitLab ainda, pule a Etapa 2 e avance com o que tem.
```

**Trava na Etapa 4 (Confluence retorna erro):**
```
"A publicação falhou. Erro: 403 Forbidden."
→ Solução: verifique se o token do Confluence está ativo (Aula 11).
Se não resolver agora, copie o spike para um arquivo .md local — o artefato existe mesmo sem a publicação.
A URL vai ficar como pendência para resolver depois do kickoff.
```

**Spike fica genérico na Etapa 3:**
```
O DISCOVERY.md da Etapa 1 estava incompleto.
→ Solução: volte ao DISCOVERY.md, preencha as seções vazias, e repita a Etapa 3.
A regra da Aula 14 vale aqui: spike genérico = discovery incompleto.
```

## O Ajuste Fino do Kickoff

Depois da primeira execução, você vai perceber coisas que podem melhorar. Itens comuns de ajuste:

**1. Adicionar contexto obrigatório ao prompt de kickoff:**
Se a Etapa 2 sempre pede confirmação do nome dos repos, acrescente ao kickoff:
```markdown
## Contexto inicial obrigatório
- Grupo de repos no GitLab: {informar ao iniciar o kickoff}
- Espaço do Confluence para publicação: {informar ao iniciar o kickoff}
```

**2. Incluir critério mínimo para o DISCOVERY.md:**
Se o discovery está saindo muito curto:
```markdown
## Critério mínimo do DISCOVERY.md (Etapa 1)
O artefato só está completo se tiver:
- Ao menos 1 pendência explícita com 🔍 (se não houver pendências, é discovery incompleto)
- Rate limits de todas as APIs externas mapeadas
- Ao menos 3 casos de borda identificados
```

**3. Tornar a Etapa 6 mais específica ao volume de tarefas:**
Se a divisão de tarefas sai genérica:
```markdown
## Requisitos da Divisão de Trabalho (Etapa 6)
Para cada tarefa do backlog do spike:
- Dev responsável
- Dependências: lista de outras tarefas que precisam estar prontas antes
- Estimativa: P/M/G (pequena/média/grande)
```

## Exercício Prático

**Missão:** Executar o kickoff completo cronometrando cada etapa.

1. Escolha uma demanda real do backlog (ou use a de aprovação de despesas dessa aula).
2. Antes de executar, prepare:
   - Nomes dos repos no GitLab que são relevantes
   - Espaço no Confluence para publicação
   - Descrição da demanda com o máximo de contexto possível
3. Execute o kickoff e registre o tempo de cada etapa:

| Etapa | Tempo | Artefato produzido? | Ajustes necessários |
|---|---|---|---|
| 1 — Discovery | | Sim/Não | |
| 2 — Análise | | Sim/Não | |
| 3 — Spike | | Sim/Não | |
| 4 — Publicação | | Sim/Não | |
| 5 — Ponte | | Sim/Não | |
| 6 — Alinhamento | | Sim/Não | |
| **Total** | | | |

4. Após o kickoff: identifique 1-2 ajustes para melhorar o `kickoff.prompt.md` e incorpore.

**Critério de sucesso:** execução < 45 minutos com 6 artefatos produzidos e menos de 2 intervenções manuais significativas.

## Troubleshooting

### 💡 Problema: O kickoff levou 90 minutos — muito acima da expectativa

**Causa:** ou o discovery gerou muitas pendências que exigiram pesquisa humana no meio, ou o Droid GitLab encontrou muitas coisas e pediu confirmação várias vezes.

**Solução:**
1. Pendências do discovery que exigem resposta humana: pre-resolva antes de executar o kickoff. Se não tiver resposta, registre como 🔍 e avance.
2. Droid GitLab pedindo confirmação: seja mais específico nos repos que você informa ao kickoff. Menos repos mais direcionados = menos interrupções.

### 💡 Problema: Os dois devs chegaram ao trabalho e o de prontidão não tinha executado o kickoff

**Causa:** o ritual ficou opcional. Existe a percepção de que "quando a pressão for grande, pula o kickoff."

**Solução:** o kickoff não é opcional. Ele é a porta de entrada da demanda. Sem os 6 artefatos, o código não começa. Isso precisa ser uma decisão de squad, não individual.

:::tip 🏆 Treinamento Jedi Completo
Você está pronto para a próxima aula se:

- [ ] Executei o kickoff do início ao fim e registrei o tempo de cada etapa
- [ ] 6 artefatos foram produzidos e são verificáveis
- [ ] Identifiquei e apliquei pelo menos 1 ajuste ao meu `kickoff.prompt.md`
- [ ] A execução total ficou abaixo de 45 minutos
- [ ] Entendo o que fazer quando uma etapa trava
:::

---

O ritual funciona quando as condições são boas. Mas as condições nem sempre são boas. Na **Aula 25 — Quando o Ritual Quebra**, você vai aprender a diagnosticar cada tipo de falha do sistema — e como recuperar sem perder o que já foi construído.

