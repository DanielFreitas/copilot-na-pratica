---
title: 8 - O Agente Conduz, a Squad Responde
sidebar_position: 8
description: Como executar o fluxo completo de discovery em tempo real com Agent Mode — incluindo o que fazer quando você não sabe a resposta.
---

> *"Um bom discovery não é o que termina sem dúvidas. É o que termina com as dúvidas certas tornadas visíveis."*

**Duração estimada:** ~40 min

## Vídeo introdutório

<video controls width="100%" preload="metadata">
	<source src="/copilot-na-pratica/videos/08-o-agente-conduz-a-squad-responde.mp4" type="video/mp4" />
	Seu navegador não suporta vídeo HTML5.
</video>

## O Problema Real: O Discovery que Bloqueia ou Mente

Existe um ponto de ruptura comum no discovery: a primeira dimensão que o dev não sabe responder. Nesse momento, acontece uma de duas coisas:

**Cenário A — Discovery que bloqueia:**

```
Agente: "Qual é o rate limit da API de pagamentos por ambiente?"
Daniel: "Não sei. Vou descobrir antes de continuar."
[Daniel para, vai ao Slack, espera resposta, não volta pro discovery naquele dia]
[Discovery fica para depois, demanda começa sem contexto]
```

**Cenário B — Discovery que mente:**

```
Agente: "Qual é o TTL do cache para o endpoint de saldo?"
Daniel: "Provavelmente uns 5 minutos, não deve ter cache específico pra isso."
[Registra como "TTL: ~300s" sem verificar]
[Em produção: TTL é 3600s e tem evento de invalidação que Daniel não implementou]
```

Os dois cenários têm o mesmo resultado: o desenvolvimento começa com informação incompleta ou incorreta.

**Com o protocolo correto:**

```
Agente: "Qual é o rate limit da API de pagamentos por ambiente?"
Daniel: "Não sei ainda."
Agente: [registra] "🔍 Rate limit da API de pagamentos: verificar com @plataforma-api"
Agente: [avança] "Próxima dimensão: Bancos de Dados..."

Ao final do discovery:
DISCOVERY.md tem 6 dimensões preenchidas + 2 pendências com 🔍
Daniel sabe exatamente o que falta antes de começar
```

**Diferença:** pendência visível no DISCOVERY.md é acionável. Lacuna silenciosa no código é um bug esperando para acontecer.

## O Protocolo do "Não Sei"

Antes de executar o fluxo ao vivo, internalize o protocolo:

```
┌─────────────────────────────────────────────────────────────────────┐
│                    PROTOCOLO DE RESPOSTA                            │
│                                                                      │
│  Você sabe a resposta?                                               │
│  └── SIM → Responda com especificidade. Valide curls antes de       │
│            registrar. Não assuma: confirme.                         │
│                                                                      │
│  Você tem uma ideia mas não tem certeza?                             │
│  └── PESQUISE antes de responder. "Acho que é X" sem verificação    │
│      é pior que uma pendência honesta.                              │
│                                                                      │
│  Você genuinamente não sabe?                                         │
│  └── Diga "não sei ainda" → registre como 🔍 → avance.             │
│      Não bloqueie o discovery em busca da resposta perfeita agora.  │
│                                                                      │
│  Você sabe quem pode responder?                                      │
│  └── Registre junto com a pendência: "🔍 [questão]: perguntar @X"  │
│      Isso transforma a pendência em tarefa acionável.               │
└─────────────────────────────────────────────────────────────────────┘
```

## Demo: Fluxo Completo em Tempo Real

Demanda: **implementar cobrança recorrente no serviço de assinaturas**.

O que Daniel e Kássia sabem antes de começar:
- O serviço usa FastAPI + PostgreSQL
- A cobrança usa a API de pagamentos interna
- Existe um scheduler service no ambiente da empresa
- Não sabem os detalhes de rate limit, cache, nem a versão do scheduler

Executando `discovery.prompt.md` no Agent Mode:

---

**Etapa 1 — Contexto inicial**

```
Agente: Antes de começar, me diga:
        - Qual é o nome da demanda?
        - Qual é o link para o ticket?
        - Quem está participando?

Daniel: Demanda: Cobrança Recorrente de Assinaturas
        Ticket: https://gitlab.empresa.com/squad/issues/847
        Participantes: Daniel e Kássia
```

---

**Etapa 2 — Demanda**

```
Agente: Como você descreveria essa demanda em termos técnicos?
        O que muda no sistema?

Kássia: O serviço de assinaturas precisa cobrar automaticamente os clientes
        no dia de vencimento. A cobrança é via API de pagamentos interna.
        Falhas devem gerar 3 tentativas com 24h de intervalo.
        O status da assinatura deve ser atualizado após cada tentativa.

Agente: [registra] ✅ Demanda documentada
```

---

**Etapa 3 — APIs**

```
Agente: Qual é a URL base da API de pagamentos por ambiente?

Daniel: Dev e staging: https://staging-api.empresa.com/v2
        Prod: https://api.empresa.com/v2

Agente: Qual é o mecanismo de autenticação?

Daniel: OAuth2 Client Credentials.
        Token endpoint: https://auth.empresa.com/oauth/token
        Credenciais via variáveis de ambiente: PAYMENTS_CLIENT_ID e PAYMENTS_CLIENT_SECRET

Agente: Qual é o rate limit?

Daniel: Não sei exatamente. Acho que é 200 por minuto.

Agente: Vou registrar como pendência para confirmar.
        🔍 Rate limit exato da API de pagamentos: confirmar com @plataforma-api
        Você tem um curl validado com autenticação real?

Daniel: Tenho. Vou incluir:
        curl -X POST https://auth.empresa.com/oauth/token \
          -d "grant_type=client_credentials" \
          -d "client_id=$PAYMENTS_CLIENT_ID" \
          -d "client_secret=$PAYMENTS_CLIENT_SECRET" \
          -d "scope=payments:write"

Agente: [registra curl] Existe algum header obrigatório além do Authorization?

Kássia: Sim — X-Idempotency-Key com um UUID em todos os POSTs

Agente: [registra] Algum campo com tipo não óbvio?

Daniel: O campo amount é em centavos, não reais.

Agente: [registra] ✅ Dimensão APIs documentada (1 pendência)
```

---

**Etapa 4 — Cache**

```
Agente: O recurso de assinatura usa cache? Se tiver dúvida, verifique
        antes de responder N/A.

Kássia: Deixa eu verificar... [consulta o repositório subscription-service]
        Sim. O endpoint GET /subscriptions/{id} tem cache Redis.
        TTL de 600s.

Agente: Como é invalidado quando o status da assinatura muda?

Kássia: Não sei. Nunca tinha pensado nisso.

Agente: 🔍 Estratégia de invalidação do cache de assinatura:
        verificar subscription-service ou perguntar ao time
        Próxima dimensão: Gateways...
```

---

**Etapa 5 — Libs Internas**

```
Agente: Quais libs internas serão usadas?

Daniel: empresa-auth para autenticação e empresa-scheduler para jobs recorrentes.

Agente: Qual versão do empresa-scheduler está em produção?

Daniel: Não sei. Nunca usei essa lib.

Agente: 🔍 Versão do empresa-scheduler em prod + breaking changes recentes:
        verificar gitlab.empresa.com/libs/empresa-scheduler
        Onde estão os exemplos de uso mais recentes?

Daniel: Não sei.

Agente: 🔍 Exemplos de uso do empresa-scheduler: verificar README da lib
        ou perguntar a quem usa (buscar no GitLab por "empresa-scheduler" nos repos)
```

---

**Etapa 6 — Repositórios para Analisar**

```
Agente: Qual serviço já implementa cobrança recorrente ou jobs similares?

Kássia: O billing-service tem cobrança manual. E o notification-service
        tem jobs recorrentes com retry.

Agente: [registra ambos]

Daniel: E o scheduler-service precisa ser mapeado — vai orquestrar os jobs.

Agente: [registra]
        Repositórios identificados:
        - billing-service: padrão de cobrança existente
        - notification-service: padrão de job com retry
        - scheduler-service: orquestração dos jobs
        - libs/empresa-scheduler: implementação da lib
```

---

**DISCOVERY.md Gerado pelo Agente**

```markdown
# DISCOVERY — Cobrança Recorrente de Assinaturas

**Data:** 2026-02-21
**Demanda:** https://gitlab.empresa.com/squad/issues/847
**Squad:** Daniel, Kássia

---

## Demanda

Adicionar cobrança automática no vencimento das assinaturas via API de
pagamentos interna. Falhas geram 3 tentativas com 24h de intervalo.
Status da assinatura é atualizado após cada tentativa.

---

## APIs Envolvidas

### API de Pagamentos v2
- **URL base:** https://api.empresa.com/v2 (prod) | https://staging-api.empresa.com/v2 (staging)
- **Autenticação:** OAuth2 Client Credentials
  - Token endpoint: https://auth.empresa.com/oauth/token
  - Variáveis: PAYMENTS_CLIENT_ID, PAYMENTS_CLIENT_SECRET
  - Scope: payments:write
- **Rate limit:** 🔍 confirmar com @plataforma-api (estimativa: 200 req/min)
- **Header obrigatório:** X-Idempotency-Key: {uuid} em todos os POSTs
- **Campo não óbvio:** amount em centavos (integer), não reais (float)
- **Curl validado:**
  ```bash
  curl -X POST https://auth.empresa.com/oauth/token \
    -d "grant_type=client_credentials" \
    -d "client_id=$PAYMENTS_CLIENT_ID" \
    -d "client_secret=$PAYMENTS_CLIENT_SECRET" \
    -d "scope=payments:write"
  ```

---

## Cache

### Redis
- Endpoint com cache: GET /subscriptions/{id} — TTL: 600s
- 🔍 Estratégia de invalidação: verificar subscription-service ou time responsável

---

## Libs Internas

### empresa-auth
- Versão em prod: 3.2.1
- ⚠️ v3.x exige refresh=True no método validate()

### empresa-scheduler
- 🔍 Versão em prod: verificar gitlab.empresa.com/libs/empresa-scheduler
- 🔍 Exemplos de uso: verificar README ou buscar uso nos repos via Droid GitLab (Aulas 9-10)

---

## Repositórios para Analisar

- [ ] billing-service: padrão de cobrança existente
- [ ] notification-service: padrão de job recorrente com retry
- [ ] scheduler-service: como os jobs são orquestrados
- [ ] libs/empresa-scheduler: exemplos de uso da lib

---

## Pendências 🔍

- 🔍 Rate limit da API de pagamentos: confirmar com @plataforma-api
- 🔍 Estratégia de invalidação do cache de assinatura: verificar subscription-service
- 🔍 Versão do empresa-scheduler em prod + breaking changes: gitlab.empresa.com/libs/empresa-scheduler
- 🔍 Exemplos de uso do empresa-scheduler: buscar via Droid GitLab nos repos listados
```

---

## Análise do Discovery Gerado

Observe o que aconteceu:

```
┌──────────────────────────────────────────────────────────────────────┐
│                    ANTES vs DEPOIS                                   │
├────────────────────────────┬─────────────────────────────────────────┤
│  Antes do discovery        │  Depois do discovery                    │
├────────────────────────────┼─────────────────────────────────────────┤
│  "A cobrança é via API     │  URL base por ambiente, auth OAuth2,    │
│  de pagamentos"            │  header X-Idempotency-Key, curl validado│
├────────────────────────────┼─────────────────────────────────────────┤
│  "Não sabia que tinha cache│  Cache Redis TTL 600s identificado      │
│  no endpoint de assinatura"│  Estratégia de invalidação: 🔍 pendente│
├────────────────────────────┼─────────────────────────────────────────┤
│  "empresa-scheduler existe"│  3 repos identificados para análise     │
│  (nunca usada)             │  🔍 versão e exemplos: pendentes        │
├────────────────────────────┼─────────────────────────────────────────┤
│  Contexto: só na cabeça    │  DISCOVERY.md no repositório            │
│  de Daniel e Kássia        │  Consultável pelo Copilot de qualquer um│
└────────────────────────────┴─────────────────────────────────────────┘
```

**4 pendências registradas** — isso é um acquis positivo, não negativo. Cada pendência é:
1. Visível (não escondida numa suposição)
2. Acionável (tem quem pode responder ou onde buscar)
3. Prioritizável (Daniel e Kássia sabem o que resolver antes de começar)

## Como o Copilot Usa o DISCOVERY.md nas Sessões Seguintes

Após o discovery, o DISCOVERY.md vira o contexto de qualquer sessão de desenvolvimento:

```python
# Sessão de desenvolvimento — dia seguinte

# Kássia: #file:DISCOVERY.md
# Kássia: Implemente o job de cobrança recorrente. O job deve:
#         - Buscar assinaturas com vencimento hoje
#         - Chamar a API de pagamentos para cada uma
#         - Registrar o resultado e atualizar o status

# Copilot lê o DISCOVERY.md → sabe:
# - API de pagamentos: OAuth2, header X-Idempotency-Key, amount em centavos
# - empresa-auth: versão 3.2.1, refresh=True obrigatório
# - Cache: endpoint de assinatura tem TTL 600s (pendência de invalidação)

# Copilot gera código com:
from empresa.auth import AuthClient
import httpx
import uuid

async def process_subscription_payment(subscription_id: int, amount_cents: int):
    """Processa cobrança de assinatura via API de pagamentos v2"""
    
    # Autentica via OAuth2 (conforme DISCOVERY.md: empresa-auth v3.2.1)
    auth_client = AuthClient(token=os.environ["PAYMENTS_CLIENT_ID"])
    token = await auth_client.get_token(
        client_id=os.environ["PAYMENTS_CLIENT_ID"],
        client_secret=os.environ["PAYMENTS_CLIENT_SECRET"],
        scope="payments:write"
    )
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{settings.PAYMENTS_API_URL}/v2/pagamentos",
            headers={
                "Authorization": f"Bearer {token}",
                # Header obrigatório identificado no DISCOVERY.md
                "X-Idempotency-Key": str(uuid.uuid4()),
            },
            json={
                # amount em centavos conforme DISCOVERY.md
                "amount": amount_cents,
                "subscription_id": subscription_id,
            }
        )
    
    return response.json()
```

O Copilot não gerou `amount` como float. Não esqueceu o `X-Idempotency-Key`. Não usou a lib de auth errada. Tudo isso porque o DISCOVERY.md estava carregado.

## Discovery com Informações Contraditórias

Às vezes você vai receber informações diferentes de fontes diferentes:

```
Kássia pergunta ao time A: "O campo amount é em reais"
Kássia encontra no código: `amount_cents` como nome da coluna
Kássia vê no curl da documentação: `"amount": 10.50` (float)
```

Quando isso acontece, o protocolo é:

```python
# Prioridade de fontes (do mais confiável ao menos):
#
# 1. Código em produção (o que realmente está rodando)
# 2. Testes automatizados (o que foi testado)
# 3. Curl validado em staging (o que funciona de fato)
# 4. Time responsável pelo serviço (quem implementou)
# 5. Documentação interna (pode estar desatualizada)

# No caso da contradição acima:
# Código tem `amount_cents` → provavelmente é inteiro em centavos
# Curl da documentação tem float → documentação provavelmente está desatualizada
# Ação: testar um curl com integer e outro com float em staging
#        registrar o resultado verificado no DISCOVERY.md
```

Quando encontrar contradição, registre-a no DISCOVERY.md como observação — não resolva silenciosamente escolhendo um lado:

```markdown
## APIs Envolvidas
### API de Pagamentos
- **Campo amount:** ⚠️ CONTRADIÇÃO — documentação usa float (10.50),
  código usa integer (amount_cents). Verificado em staging: integer
  em centavos é o correto (float recebia 422). Documentação desatualizada.
```

## Exercício Prático

**Missão:** Executar o discovery de uma demanda real usando o fluxo completo.

1. Escolha uma demanda atual ou da próxima sprint — de preferência algo com pelo menos 2 dimensões técnicas não triviais (APIs + banco, banco + cache, etc.).

2. Execute o `discovery.prompt.md` no Agent Mode.

3. Durante a sessão:
   - Responda com honestidade — não invente onde não sabe
   - Use "não sei" livremente — marque como 🔍
   - Para curls: só registre os que você verificou de verdade

4. Ao final, analise o DISCOVERY.md gerado:

| Item | Resultado |
|---|---|
| Dimensões cobertas (de 8) | |
| Pendências com 🔍 | |
| Pendências com "quem pode responder" identificado | |
| Curls validados | |
| Tempo total da sessão | |

5. **Teste o DISCOVERY.md com o Copilot:**
   ```
   #file:DISCOVERY.md
   Qual é o mecanismo de autenticação da API principal desta demanda?
   ```
   O Copilot deve responder usando os dados do arquivo — não uma suposição genérica.

**Critério de sucesso:** o DISCOVERY.md existe no repositório, foi gerado pelo agente ao final da sessão, e o Copilot responde sobre o conteúdo usando os dados do arquivo. Pendências com 🔍 são esperadas — o discovery honesto quase sempre tem pelo menos duas.

## Troubleshooting

### 💡 Problema: O agente gera o DISCOVERY.md com algumas seções genéricas

**Sintoma:**
O DISCOVERY.md gerado tem seções como "APIs Envolvidas: a ser definido" ou deixa algumas seções em branco mesmo quando você respondeu durante a sessão.

**Causa:**
O agente pode ter perdido parte das respostas em sessões longas, ou o prompt file não instrui explicitamente a incluir tudo que foi discutido.

**Solução:**
1. Adicione ao final do prompt file:
   ```markdown
   ## Geração do DISCOVERY.md
   Inclua **todas** as informações discutidas durante a sessão.
   Para cada dimensão: se discutimos e há informação → inclua.
   Se não discutimos → use N/A com justificativa.
   Se discutimos mas não há resposta → use 🔍 com quem pode responder.
   ```
2. Se a sessão foi muito longa e o agente perdeu contexto, divida em sessões menores — uma a cada 3-4 dimensões.

### 💡 Problema: O DISCOVERY.md ficou grande demais (mais de 100 linhas)

**Sintoma:**
O arquivo ficou extenso ao ponto de dificultar a leitura e possivelmente sobrecarregar o contexto do Copilot em sessões futuras.

**Causa:**
Algumas dimensões foram documentadas com mais detalhe do que o necessário para o desenvolvimento.

**Solução:**
Separe contexto essencial de complementar:

```markdown
# ✅ Essencial no DISCOVERY.md (o que o dev precisa durante o desenvolvimento)
## APIs Envolvidas
### API de Pagamentos
- URL, auth, rate limit, headers obrigatórios, curl validado

# ✅ Complementar → referência no DISCOVERY.md mas detalhes no Confluence
## APIs Envolvidas
### API de Pagamentos
- Contexto completo: https://confluence.empresa.com/api-pagamentos
- Resumo operacional: [rate limit, auth, curl] ← só isso aqui
```

Regra prática: se uma seção tem mais de 15 linhas, considere se o excesso poderia ficar num documento separado referenciado.

:::tip 🏆 Treinamento Jedi Completo
Você está pronto para a próxima aula se:

- [ ] Executei o `discovery.prompt.md` no Agent Mode e o agente conduziu o fluxo dimensão por dimensão
- [ ] O `DISCOVERY.md` foi gerado automaticamente ao final e tem pelo menos 1 pendência com 🔍 — o discovery não terminou com zero incertezas
- [ ] Testei o DISCOVERY.md com `#file:DISCOVERY.md` no Copilot Chat — ele respondeu usando dados do arquivo, não suposições
- [ ] Sei o que fazer quando recebo informações contraditórias de fontes diferentes (prioridade de fontes)
- [ ] Sei a diferença entre um discovery que bloqueia (para em cada "não sei") e um discovery que avança (marca pendências e continua)
:::

---

O Capítulo 1 está completo. Você tem o `DISCOVERY.md` como artefato vivo e o `discovery.prompt.md` como condutor do levantamento. Mas agora o `DISCOVERY.md` lista repositórios para analisar — e analisar manualmente cada um deles seria exatamente o tipo de trabalho operacional que o sistema deve automatizar.

O **Capítulo 2 — Os Droids da Squad** começa aqui. A **Aula 9 — Construindo o Droid GitLab** vai transformar a lista de repositórios do `DISCOVERY.md` em análise automatizada: o Droid consulta, mapeia endpoints, identifica dependências — sem você baixar nada, sem você sair do VS Code.


