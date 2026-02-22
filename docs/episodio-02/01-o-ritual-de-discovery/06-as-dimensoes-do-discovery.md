---
title: 6 - As Dimensões do Discovery
sidebar_position: 6
description: As 8 dimensões do DISCOVERY.md — o que capturar em cada uma, as perguntas certas a fazer, e o que esquecer custa caro.
---

> *"O discovery que parece completo mas está vazio numa dimensão crítica é pior que o discovery que claramente falta informação. O primeiro te dá falsa segurança. O segundo te avisa."*

**Duração estimada:** ~40 min

## Vídeo introdutório

<video controls width="100%" preload="metadata">
	<source src="/copilot-na-pratica/videos/06-as-dimensoes-do-discovery.mp4" type="video/mp4" />
	Seu navegador não suporta vídeo HTML5.
</video>

## O Problema Real: O Discovery que Parece Completo

Existe um tipo de discovery mais perigoso que o ausente: o parcialmente completo. APIs mapeadas, banco documentado — e cache em branco. "Não tem cache nessa parte" é uma conclusão que exige verificação, não um campo a deixar vazio.

**Sem dimensões estruturadas:**

```
Daniel faz discovery da integração com o módulo de estoque:

✅ API de estoque: mapeada (URL, autenticação, rate limit)
✅ Banco: mapeado (tabela inventario, schema relevante)
⬜ Cache: (não verificou — "não parecia ter cache")

Resultado no dia 4 de desenvolvimento:
├── Endpoint GET /estoque/{id} retorna dado com 10 minutos de atraso
├── Cache Redis com TTL de 600s não documentado em nenhum lugar
├── Estratégia de invalidação: evento "estoque_atualizado" no Kafka
│   que Daniel não sabia que existia
│
└── Retrabalho: implementar consumidor do evento de invalidação
               Custo: 1.5 dias + reteste de toda a integração
```

**Com dimensões estruturadas:**

```
Daniel executa discovery.prompt.md (Aula 7):

Pergunta da dimensão Cache:
"O recurso /estoque/{id} usa cache? Se sim: tipo, TTL, estratégia de
invalidação, quem publica o evento de limpeza?"

Resposta durante o levantamento (30 min):
"Sim — Redis, TTL 600s, evento 'estoque_atualizado' no tópico
kafka-inventory-events publicado pelo inventory-service"

Registrado no DISCOVERY.md antes de escrever uma linha.
Daniel implementa o consumidor do evento desde o início.
```

**Diferença:** cada dimensão tem perguntas específicas que tornam impossível deixar em branco por descuido — você decide que não se aplica ou registra o que descobriu.

## As 8 Dimensões

### Visão Geral

| Dimensão | O que capturar | O que esquecer custa |
|---|---|---|
| **APIs** | URL, autenticação, rate limit, curls validados, campos não óbvios | Integração quebra em produção por restrição desconhecida |
| **Bancos de Dados** | Tipo, schema relevante, permissões, índices | Query errada ou migration inválida |
| **Cache** | Tipo, TTL por recurso, estratégia de invalidação | Race condition ou dado stale em produção |
| **Gateways** | Regras de roteamento, rate limit, headers obrigatórios, validações silenciosas | Deploy bloqueado — 403 sem mensagem clara |
| **Filas / Mensageria** | Broker, tópicos, formato de mensagem, quem produz e quem consome | Consumidor incompatível com produtor |
| **Libs Internas** | Nome, versão, breaking changes, exemplos no GitLab | Uso incorreto com bug silencioso |
| **Ambientes** | URLs por ambiente, como obter credenciais, diferenças de comportamento | Testou em dev, quebrou em staging/prod |
| **Repositórios** | Quais repos o Droid GitLab deve analisar e por quê | Análise incompleta, contexto de código faltando |

---

### Dimensão 1 — APIs

**O que capturar:** tudo que você precisaria saber para integrar do zero sem falar com ninguém.

**Perguntas a fazer:**
- Qual é a URL base por ambiente (dev, staging, prod)?
- Qual é o mecanismo de autenticação? OAuth2, API key, JWT, mutual TLS?
- Qual é o rate limit? Por minuto? Por segundo? Por ambiente?
- Existe algum header obrigatório além do Authorization?
- Tem algum campo com nome ou tipo contraintuitivo?
- Qual é a versão da API que está em produção?
- O curl de autenticação funciona diretamente? (valide antes de registrar)

**Exemplo de preenchimento correto:**

```markdown
## APIs Envolvidas

### API de Pagamentos v2
- **URL base:** https://api.empresa.com/v2 (prod) | https://staging-api.empresa.com/v2 (staging)
- **Autenticação:** OAuth2 Client Credentials
  - Token endpoint: https://auth.empresa.com/oauth/token
  - Client ID e Secret: variáveis `PAYMENTS_CLIENT_ID` e `PAYMENTS_CLIENT_SECRET`
  - Scope obrigatório: `payments:write payments:read`
- **Rate limit:** 200 req/min por client_id (não por IP)
  - Burst: até 50 req em rajada de 5s antes do throttle
- **Header obrigatório:** `X-Idempotency-Key: {uuid}` em todos os POSTs
- **Versão atual em prod:** v2.3.1
- **Campos não óbvios:**
  - `amount`: integer em centavos (não float em reais)
  - `referencia_externa`: obrigatório para clientes B2B, opcional para PF
- **Curl validado:**
  ```bash
  # Obter token
  curl -X POST https://auth.empresa.com/oauth/token \
    -d "grant_type=client_credentials" \
    -d "client_id=$PAYMENTS_CLIENT_ID" \
    -d "client_secret=$PAYMENTS_CLIENT_SECRET" \
    -d "scope=payments:write"

  # Criar pagamento
  curl -X POST https://api.empresa.com/v2/pagamentos \
    -H "Authorization: Bearer $TOKEN" \
    -H "X-Idempotency-Key: $(uuidgen)" \
    -H "Content-Type: application/json" \
    -d '{"amount": 10000, "referencia_externa": "ORD-001", "cliente_id": 42}'
  ```
```

**Anti-padrão a evitar:**

```markdown
# ❌ Vago demais — não evita nenhuma surpresa
## APIs Envolvidas
- API de Pagamentos: autenticação por token, tem rate limit
  (verificar documentação em https://confluence.empresa.com/api-pagamentos)
```

O link para documentação é útil como referência — mas não substitui o levantamento específico. A documentação pode estar desatualizada. O curl validado não mente.

---

### Dimensão 2 — Bancos de Dados

**O que capturar:** o schema relevante para a demanda — não o schema completo do banco.

**Perguntas a fazer:**
- Qual banco é o principal para esta feature? PostgreSQL, MongoDB, outro?
- Quais tabelas/collections serão lidas ou escritas?
- Quais colunas têm nomes contraintuitivos ou tipos não óbvios?
- Quais são as restrições de constraint que impactam a implementação?
- O serviço tem permissão de escrita ou apenas leitura?
- Existe algum índice que precisa ser criado para as queries planejadas?

**Exemplo de preenchimento correto:**

```markdown
## Bancos de Dados

### PostgreSQL — payments-db
- **Schema relevante:**
  ```sql
  -- Tabela principal
  CREATE TABLE payments (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT NOT NULL REFERENCES users(id),
    amount      INTEGER NOT NULL,           -- centavos, não reais
    status      VARCHAR(20) NOT NULL,       -- pending | success | failed | refunded
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    metadata    JSONB                       -- dados adicionais sem schema fixo
  );

  -- Índices existentes (relevantes para esta feature)
  CREATE INDEX idx_payments_user_id ON payments(user_id);
  CREATE INDEX idx_payments_status  ON payments(status);
  -- ⚠️ Não existe índice em created_at — query com filtro de data vai fazer seq scan
  ```
- **Permissões do serviço:** INSERT, SELECT, UPDATE em payments; SELECT em users
- **Observação:** campo `metadata` JSONB — sem validação na camada de banco,
  validar na aplicação
```

---

### Dimensão 3 — Cache

**Regra:** se você não tem certeza que não tem cache, verifique. "Não parece ter cache" não é resposta.

**Perguntas a fazer:**
- Este recurso tem cache? Redis, Memcached, cache em memória no serviço?
- Qual é o TTL por tipo de recurso?
- Como o cache é invalidado quando o dado muda?
- Quem é responsável por publicar o evento de invalidação?
- Existe algum endpoint de consulta que deve sempre retornar dado fresco (cache bypass)?

**Exemplo de preenchimento correto:**

```markdown
## Cache

### Redis — cache-cluster-prod
- **Recursos com cache:**
  | Recurso | TTL | Chave |
  |---|---|---|
  | GET /payments/{id} | 60s | `payment:{id}` |
  | GET /users/{id}/balance | 300s | `balance:{user_id}` |
  | GET /products/{id} | 3600s | `product:{id}` |

- **Estratégia de invalidação:**
  - Pagamento criado/atualizado → evento `payment.updated` no topic `cache-invalidation`
  - Consumidor: cache-invalidation-service (não implementar no payments-service)
  - ⚠️ Balance é invalidado quando payment muda de status para 'success' ou 'refunded'

- **Bypass de cache:**
  - Header `Cache-Control: no-cache` force-retorna dado do banco
  - Usar apenas em endpoints de auditoria e debugging
```

**Anti-padrão crítico:**

```python
# ❌ Não verificar o cache antes de implementar
# Por que parece certo: "esse endpoint é simples, não vai ter cache"

# O que acontece:
# Você implementa endpoint GET /users/{id}/balance
# Em dev: sempre correto (sem cache local)
# Em staging: dado fica "travado" por 5 minutos após cada transação
# Diagnóstico: 2h para descobrir que é o TTL do Redis de 300s
# Fix: nada no seu código — o problema está em como o evento de invalidação
#      é publicado (que você não sabia que existia)
# Custo: 2h de diagnóstico + comunicação de bug para stakeholders
```

---

### Dimensão 4 — Gateways

**Atenção especial:** gateways são a dimensão com maior probabilidade de bloquear um deploy. As restrições não aparecem em desenvolvimento — só em staging ou produção quando o tráfego passa pelo gateway.

**Perguntas a fazer:**
- Existe um API gateway entre o cliente e o serviço?
- Quais são os headers obrigatórios (além de Authorization)?
- O gateway valida o payload? Tipos, campos, tamanhos?
- Qual é o rate limit do gateway (pode ser diferente do serviço)?
- Existem regras de roteamento que afetam qual versão da API é chamada?
- O gateway adiciona ou modifica headers antes de chegar ao serviço?

**Exemplo de preenchimento correto:**

```markdown
## Gateways

### API Gateway v3 (Kong)
- **Headers obrigatórios:**
  - `X-Client-Version: 2.1` (versão mínima — menor que 2.0 retorna 400)
  - `X-Correlation-Id: {uuid}` (usado para rastreamento, não obrigatório mas recomendado)
- **Validações do gateway (não chegam ao serviço se falharem):**
  - `amount` deve ser integer — floats retornam 422 silenciosamente
  - `Content-Type: application/json` obrigatório em POSTs
- **Rate limit:** 100 req/min por IP (diferente do rate limit da API: 200/min por client_id)
- **Roteamento:** /v2/* → payments-service-v2.payments.svc; /v1/* → payments-service-v1.payments.svc
  - ⚠️ v1 entra em EOL em 60 dias — usar apenas v2
- **Contato para dúvidas:** @plataforma-infra no Slack / canal #api-gateway
```

---

### Dimensão 5 — Filas / Mensageria

**Perguntas a fazer:**
- O sistema usa mensageria? Kafka, RabbitMQ, SQS, outro?
- Quais tópicos/filas são relevantes para esta feature?
- Qual é o formato da mensagem? JSON, Avro, Protobuf?
- Quem produz e quem consome cada tópico?
- Existe schema registry? Como versionar mensagens?
- Qual é a política de retry e dead letter queue?

**Exemplo de preenchimento correto:**

```markdown
## Filas / Mensageria

### Kafka — kafka-prod-cluster
- **Tópico: payments.events**
  - Produtor: payments-service
  - Consumidores: notification-service, reporting-service, cache-invalidation-service
  - Formato: JSON (sem Avro — schema livre)
  - Schema atual:
    ```json
    {
      "event_type": "payment.created | payment.updated | payment.refunded",
      "payment_id": 12345,
      "user_id": 42,
      "amount": 10000,
      "status": "success",
      "timestamp": "2026-02-21T10:30:00Z"
    }
    ```
  - Retention: 7 dias
  - Partições: 12 (particionado por user_id)
  - ⚠️ Nova feature deve publicar neste tópico após cada mudança de status
```

---

### Dimensão 6 — Libs Internas

**A dimensão mais subestimada.** Libs internas mudam sem aviso, têm breaking changes em versões menores, e os exemplos de uso costumam estar espalhados em outros repositórios.

**Perguntas a fazer:**
- Quais libs internas da empresa serão usadas?
- Qual é a versão atual em produção?
- Houve breaking changes nos últimos 3 meses?
- Onde estão os exemplos de uso mais recentes no GitLab?
- Existe um canal de suporte para dúvidas sobre a lib?

**Exemplo de preenchimento correto:**

```markdown
## Libs Internas

### empresa-auth (autenticação)
- **Versão atual em prod:** 3.2.1
- **Breaking change v2 → v3:**
  - `validate()` agora exige `refresh=True` para verificar expiração
  - Sem `refresh=True`, usa cache local — tokens expirados são aceitos
  ```python
  # ✅ Correto para v3.x:
  from empresa.auth import AuthClient
  client = AuthClient(token=os.environ["AUTH_TOKEN"])
  result = client.validate(user_id=user_id, refresh=True)  # obrigatório
  ```
- **Exemplos de uso:** gitlab.empresa.com/platform/auth-examples/tree/main/v3
- **Canal de suporte:** #libs-internas no Slack

### empresa-events (publicação de eventos)
- **Versão atual em prod:** 1.5.0
- **Sem breaking changes recentes**
- **Atenção:** `publish()` é assíncrono — use `await publish()` ou chame
  `publish_sync()` se estiver fora de contexto async
```

---

### Dimensão 7 — Ambientes

**Perguntas a fazer:**
- Qual é a URL base em cada ambiente (dev, staging, prod)?
- Como obter credenciais para cada ambiente?
- Existe algum comportamento diferente entre ambientes que afeta o desenvolvimento?
- Quais features flags estão ativas em staging e não em prod?
- Existe um ambiente de homologação separado do staging?

**Exemplo de preenchimento correto:**

```markdown
## Ambientes

| Ambiente | URL Base | Como obter credenciais |
|---|---|---|
| dev | http://localhost:8080 | .env do projeto (ver README) |
| staging | https://staging.empresa.com | Vault: `vault kv get secrets/payments/staging` |
| prod | https://api.empresa.com | Vault: `vault kv get secrets/payments/prod` (acesso restrito) |

**Diferenças de comportamento:**
- **Staging:** rate limit desativado para testes de carga (diferente da prod!)
- **Staging:** emails não são enviados de verdade (sink configurado)
- **Prod:** feature flag `async_refunds` ainda desativada — não implementar por enquanto
```

---

### Dimensão 8 — Repositórios para Analisar

Esta é a dimensão que alimenta o Droid GitLab (Aula 9). Não é sobre documentação — é sobre código real.

**Perguntas a fazer:**
- Qual serviço já implementa algo similar ao que será feito?
- Quais repos contêm exemplos de uso das libs internas?
- Qual repo tem o contrato de API que será consumida?
- Qual repo do scheduler/jobs é relevante para esta feature?

**Exemplo de preenchimento correto:**

```markdown
## Repositórios para Analisar

- [ ] payments-service: entender como cobranças avulsas são processadas hoje
      (foco: api/v1/endpoints/payments.py e services/payment_service.py)
- [ ] scheduler-service: entender padrão de jobs recorrentes
      (foco: pasta jobs/ e como dependências são injetadas)
- [ ] libs/empresa-payments: ver exemplos de uso da versão atual
      (foco: README e pasta examples/)
```

## Obrigatório vs Opcional por Tipo de Projeto

Nem toda dimensão é obrigatória em todo projeto. Mas a decisão de pular deve ser explícita:

| Dimensão | Integração com API | Feature de banco | Job recorrente | Refatoração interna |
|---|---|---|---|---|
| APIs | ✅ Obrigatório | Geralmente N/A | Pode ser necessário | N/A |
| Bancos | ✅ Obrigatório | ✅ Obrigatório | ✅ Obrigatório | ✅ Obrigatório |
| Cache | ✅ Verificar | ✅ Verificar | ✅ Verificar | ✅ Verificar |
| Gateways | ✅ Obrigatório | N/A | N/A | N/A |
| Filas | Verificar | Verificar | ✅ Obrigatório | Verificar |
| Libs Internas | Verificar | Verificar | Verificar | ✅ Obrigatório |
| Ambientes | ✅ Obrigatório | ✅ Obrigatório | ✅ Obrigatório | ✅ Obrigatório |
| Repositórios | ✅ Obrigatório | ✅ Obrigatório | ✅ Obrigatório | ✅ Obrigatório |

**Convenção de preenchimento quando não se aplica:**

```markdown
## Cache
N/A — job recorrente sem dependências de cache (verificado com @equipe-infra)
```

Escreva "N/A" com justificativa, não deixe em branco. Em branco significa "não verifiquei". N/A significa "verifiquei e não se aplica".

## Exercício Prático

**Missão:** Preencher todas as dimensões para um projeto real da sua empresa.

1. Abra o `DISCOVERY.md` que você criou na Aula 5.

2. Para cada uma das 8 dimensões, responda antes de preencher:
   - "Esta dimensão se aplica a esta feature?"
   - Se sim → preencha com as informações específicas (use as perguntas desta aula)
   - Se não → escreva `N/A — [justificativa de 1 linha]`

3. Ao final, verifique: quantas dimensões ficaram em branco (nem preenchidas nem N/A)?
   - Zero blancos = discovery honesto
   - Qualquer blank = dimensão não verificada

4. Identifique as dimensões que você teve dificuldade de preencher — essas são as pendências genuínas. Registre com 🔍.

| Dimensão | Status | Observação |
|---|---|---|
| APIs | Preenchida / N/A / 🔍 Pendente | |
| Bancos de Dados | Preenchida / N/A / 🔍 Pendente | |
| Cache | Preenchida / N/A / 🔍 Pendente | |
| Gateways | Preenchida / N/A / 🔍 Pendente | |
| Filas / Mensageria | Preenchida / N/A / 🔍 Pendente | |
| Libs Internas | Preenchida / N/A / 🔍 Pendente | |
| Ambientes | Preenchida / N/A / 🔍 Pendente | |
| Repositórios | Preenchida / N/A / 🔍 Pendente | |

**Critério de sucesso:** nenhuma dimensão em branco — todas têm conteúdo, "N/A", ou "🔍 Pendente". O DISCOVERY.md está honesto sobre o que se sabe e o que ainda falta.

## Troubleshooting

### 💡 Problema: "Não consigo responder a maioria das perguntas"

**Sintoma:**
Você tenta preencher as dimensões e percebe que sabe muito pouco — a maioria vai para pendências.

**Causa:**
Esse é exatamente o valor do discovery estruturado. Você descobriu o que não sabe antes de começar — não no meio do desenvolvimento.

**Solução:**
Um discovery com muitas pendências é um discovery bem-sucedido: ele tornou visível o que precisa ser descoberto. O próximo passo é resolver as pendências antes de começar (para as dimensões críticas) ou durante o desenvolvimento (para as complementares). Use a coluna "quem pode responder" de cada 🔍 para saber com quem falar. Na Aula 8 você vai ver como o agente conduz esse processo de forma interativa.

### 💡 Problema: "Algumas dimensões ficam com informação que muda frequentemente"

**Sintoma:**
Dimensões como Ambientes têm URLs e credenciais que mudam — manter atualizado parece inviável.

**Causa:**
Confundir granularidade da informação. Você não precisa registrar senhas — registre "como obter credenciais" (ex: `vault kv get secrets/payments/staging`). O comando não muda. As credenciais mudam, mas o caminho para obtê-las permanece estável.

**Solução:**
```markdown
# ❌ Registrar credencial (muda frequentemente, risco de segurança)
## Ambientes
- staging: https://staging.empresa.com | senha: p@ss123

# ✅ Registrar como obtê-las (estável, seguro)
## Ambientes
- staging: https://staging.empresa.com | credenciais: vault kv get secrets/payments/staging
```

:::tip 🏆 Treinamento Jedi Completo
Você está pronto para a próxima aula se:

- [ ] Preenchi as 8 dimensões do DISCOVERY.md para um projeto real — sem nenhuma em branco (todas têm conteúdo, N/A, ou 🔍 Pendente)
- [ ] Consigo explicar por que "N/A" e espaço em branco são coisas diferentes
- [ ] Sei quais dimensões são obrigatórias para integração com API vs job recorrente vs refatoração interna
- [ ] Para pelo menos uma dimensão Cache, verifiquei com uma fonte humana ou com código — não assumi "provavelmente não tem"
:::

---

Você sabe o que registrar em cada dimensão. Agora precisa de um mecanismo que faça as perguntas certas de forma consistente — toda demanda, com qualquer desenvolvedor da squad. A **Aula 7 — O Prompt File de Discovery** constrói exatamente isso: o `discovery.prompt.md` que transforma o levantamento num ritual replicável, não numa habilidade individual.


