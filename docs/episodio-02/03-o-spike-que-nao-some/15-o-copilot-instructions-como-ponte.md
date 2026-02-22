---
title: 15 - O copilot-instructions.md como Ponte
sidebar_position: 15
description: Como criar o copilot-instructions.md de projeto que conecta o desenvolvimento ao spike — e qual é a fronteira entre o que fica aqui e o que fica no Confluence.
---

> *"O Holocron não contém toda a sabedoria Jedi. Contém o que você precisa agora — e sabe onde buscar o resto."*

**Duração estimada:** ~35 min

## Vídeo introdutório

<video controls width="100%" preload="metadata">
	<source src="/copilot-na-pratica/videos/15-o-copilot-instructions-como-ponte.mp4" type="video/mp4" />
	Seu navegador não suporta vídeo HTML5.
</video>

## O Problema Real: O Contexto Que Evaporou No Chat

Sem o `copilot-instructions.md` de projeto, cada sessão de desenvolvimento começa do zero:

```
Segunda, sessão com Kássia: "A API de pagamentos usa OAuth2..."
Terça, sessão com Daniel: "A API de pagamentos usa OAuth2..."
Quarta, sessão com Kássia: explicar de novo
Quinta: Daniel faz um commit errado com amount como float
```

O contexto existe — no spike, no `DISCOVERY.md`, na cabeça das pessoas. Mas não está acessível para o Copilot de forma estruturada. Cada sessão é uma ilha.

Com o `copilot-instructions.md` de projeto:

```
Segunda: o Copilot já sabe sobre OAuth2 e amount em centavos
Terça: o Copilot já sabe sobre a estratégia de retry
Quarta: o Copilot já sabe sobre a invalidação do cache
Quinta: o Copilot não vai gerar amount como float porque está explícito no arquivo
```

O arquivo existe uma vez. O contexto está sempre presente.

## A Fronteira: O Que Fica Onde

```
┌──────────────────────────────────────────────────────────────────────┐
│                   FRONTEIRA DE CONTEXTO                              │
├───────────────────────┬──────────────────────────────────────────────┤
│  copilot-             │  Confluence (spike) / DISCOVERY.md           │
│  instructions.md      │                                              │
├───────────────────────┼──────────────────────────────────────────────┤
│  Decisões técnicas    │  Alternativas que foram descartadas          │
│  chave (DT-01...)     │  (contexto histórico das decisões)           │
├───────────────────────┼──────────────────────────────────────────────┤
│  Padrões desta        │  Detalhes de como as APIs funcionam          │
│  integração           │  internamente (documentação da API)          │
├───────────────────────┼──────────────────────────────────────────────┤
│  Campos não óbvios    │  Curl completo de autenticação               │
│  ("amount em centavos")│  (no DISCOVERY.md)                          │
├───────────────────────┼──────────────────────────────────────────────┤
│  Onde buscar mais     │  O que buscar em cada fonte                  │
│  contexto (links)     │  (detalhe do conteúdo)                       │
├───────────────────────┼──────────────────────────────────────────────┤
│  Regra: < 50 linhas   │  Regra: sem limite                          │
└───────────────────────┴──────────────────────────────────────────────┘
```

**Teste prático:** se você precisaria de mais de 3 parágrafos para explicar algo — vai pro Confluence. O `copilot-instructions.md` guarda o essencial e aponta pro resto.

## Template do copilot-instructions.md de Projeto

Crie como `.github/copilot-instructions.md` no repositório do projeto:

```markdown
# Contexto do Projeto — {Nome da Demanda}

## Spike
{URL do spike no Confluence}
Leia este spike antes de começar qualquer tarefa nova.

## Decisões Técnicas Chave

### Auth
OAuth2 Client Credentials via empresa-auth v3.2.1.
`refresh=True` obrigatório em `validate()`.
Variáveis: PAYMENTS_CLIENT_ID, PAYMENTS_CLIENT_SECRET.

### API de Pagamentos
`amount` é integer em centavos, nunca float.
Header `X-Idempotency-Key: {uuid}` obrigatório em todos os POSTs.
Rate limit: 200 req/min (volume atual ~50/dia — sem risco).

### Retry
3 tentativas, backoff exponencial, intervalo mínimo 24h entre tentativas.
Classe base: `notification-service/app/jobs/base_job.py` (analisar antes de implementar).

### Cache de Assinatura
Endpoint `GET /subscriptions/{id}` tem cache Redis TTL 600s.
Sempre invalidar o cache ao atualizar o status da assinatura.

## Padrões desta Integração

```python
# Sempre usar idempotency key em cada request
idempotency_key = str(uuid.uuid4())

# amount sempre em centavos
amount_cents = int(amount_reais * 100)

# retry com empresa-scheduler
@scheduler.task(max_retries=3, retry_delay=86400)  # 86400s = 24h
async def process_subscription_payment(subscription_id: int):
    ...
```

## Tarefas Pendentes

`docs/spike-template.md` tem a lista completa de tarefas de backlog com critérios de aceite.
Atualize o status conforme avançar.

## Quando Buscar Mais Contexto

| Precisa de... | Busque em... |
|---|---|
| Detalhes da API de pagamentos | Spike no Confluence (link acima) |
| Curl de autenticação | DISCOVERY.md na raiz do repo |
| Exemplos de uso do empresa-scheduler | `squad-pagamentos/notification-service/app/jobs/` |
| Schema completo do banco | DISCOVERY.md → seção Bancos de Dados |
| Padrões de código da squad | `.github/copilot-instructions.md` (squad, não projeto) |
```

## Dois copilot-instructions.md: Squad vs Projeto

É importante diferenciar os dois:

```
.github/copilot-instructions.md (squad):
  → DNA compartilhado da squad
  → Padrões de código, estilo, workflow
  → Válido para TODOS os projetos da squad
  → Muda via MR com revisão dos dois devs
  → Construído no Cap. 5 (Aulas 20-22)

.github/copilot-instructions.md (projeto):
  → Contexto específico desta demanda
  → Decisões técnicas, padrões desta integração
  → Válido APENAS para este projeto
  → Criado no kickoff, atualizado durante o desenvolvimento
  → Arquivado quando a feature vai pra produção
```

Quando os dois existem no mesmo repositório, o Copilot lê os dois. O de projeto sobrescreve e complementa o da squad para o contexto específico.

## Como o Copilot Usa o Arquivo

Com o `.github/copilot-instructions.md` de projeto no repositório, o Copilot o lê automaticamente em cada sessão sem você precisar usar `#file`. Quando você instrui:

```
Implemente o PaymentProcessor para processar cobranças de assinatura.
```

O Copilot já sabe:
- Auth: OAuth2 via empresa-auth, `refresh=True`
- `amount` em centavos
- Header `X-Idempotency-Key`
- Estratégia de retry: 3 tentativas, 24h

O resultado é código correto na primeira geração — não na terceira depois de você corrigir o `amount` como float.

## Anti-padrões vs Padrão Correto

❌ **copilot-instructions.md copiando o spike inteiro:**
```markdown
# Contexto do Projeto
[250 linhas do spike inteiro copiadas aqui]
→ Copilot ignora partes do arquivo quando é grande demais
→ Perde o sinal de qual contexto é crítico
```

⚠️ **copilot-instructions.md sem "onde buscar mais":**
```markdown
## Decisões Técnicas
- Usar empresa-auth v3.2.1
- amount em centavos
→ Funciona para o básico, mas quando o dev precisa de mais detalhe
  não sabe onde ir sem perguntar ao colega
```

✅ **copilot-instructions.md como ponte — < 50 linhas, com links:**
```markdown
## Decisões Técnicas Chave
[apenas as decisões críticas — 15 linhas]

## Quando Buscar Mais Contexto
[tabela com link para cada fonte — 8 linhas]
→ Arquivo conciso + contexto sempre acessível via Droid Confluence
```

## Exercício Prático

**Missão:** Criar o `copilot-instructions.md` do projeto a partir do spike gerado na Aula 14.

1. Abra o spike gerado na Aula 14 (no Confluence ou localmente).
2. Identifique as informações que se enquadram em cada categoria:
   - Decisões técnicas que o dev precisa durante a implementação
   - Padrões de código específicos desta integração
   - Links para contexto adicional (spike, DISCOVERY.md, exemplos nos repos)
3. Crie o arquivo `.github/copilot-instructions.md` com menos de 50 linhas usando o template.
4. Teste com o Copilot:
   ```
   Crie a função process_payment para processar uma cobrança de assinatura.
   ```
   Verifique se o código gerado está correto sem você explicar nada (amount em centavos, idempotency key, etc.).

5. Avalie:

| Critério | Status |
|---|---|
| Arquivo tem menos de 50 linhas | |
| Copilot gerou amount em centavos sem você pedir | |
| Copilot usou o mecanismo de auth correto | |
| Seção "quando buscar mais contexto" tem pelo menos 3 links | |

**Critério de sucesso:** o Copilot gerou código correto na primeira tentativa sem precisar de correção de contexto.

## Troubleshooting

### 💡 Problema: O Copilot não está usando o copilot-instructions.md

**Causa:** o arquivo pode estar no caminho errado ou o Copilot pode não reconhecê-lo como instruções.

**Solução:**
1. O caminho correto é `.github/copilot-instructions.md` (com o ponto no início, pasta oculta)
2. Não `copilot-instructions.md` na raiz, não `docs/copilot-instructions.md`
3. Verifique via `git status` se o arquivo está no repositório (não ignorado)
4. Reabra o VS Code após criar o arquivo na primeira vez

### 💡 Problema: O arquivo ficou com 100+ linhas e o Copilot está ignorando partes

**Causa:** você colocou contexto de referência (deveria estar no Confluence) junto com contexto operacional.

**Solução:** aplique a regra da fronteira:
1. Leia cada parágrafo com a pergunta: "o dev precisa disso durante a implementação ou é referência histórica?"
2. Referência histórica → mova pro Confluence e substitua por um link
3. O arquivo deve ter só o que o dev precisa para o próximo commit

:::tip 🏆 Treinamento Jedi Completo
Você está pronto para a próxima aula se:

- [ ] O `.github/copilot-instructions.md` do projeto existe com menos de 50 linhas
- [ ] O Copilot está usando as decisões técnicas do arquivo sem eu precisar explicar (testei gerando código)
- [ ] O arquivo tem uma seção "quando buscar mais contexto" com links úteis
- [ ] Sei a diferença entre o `copilot-instructions.md` da squad (DNA compartilhado) e o do projeto (contexto específico)
:::

---

O `copilot-instructions.md` do projeto mantém o contexto crítico acessível. Mas há situações onde o desenvolvimento precisa de mais detalhe do que o arquivo tem — contratos de API completos, spikes de decisões anteriores, documentação de libs. Na **Aula 16 — Contexto Sob Demanda**, você vai aprender a usar o Droid Confluence como memória estendida da sessão: como instruir o agente a buscar contexto adicional exatamente quando precisar, sem sobrecarregar o `copilot-instructions.md`.


