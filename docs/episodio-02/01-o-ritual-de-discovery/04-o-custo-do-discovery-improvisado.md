---
title: 4 - O Custo do Discovery Improvisado
sidebar_position: 4
description: Como quantificar o custo real de começar sem discovery — e por que o custo aparece sempre depois, nunca antes.
---

> *"O problema com o discovery improvisado não é que ele falha. É que parece funcionar até o momento em que custa mais caro refazer do que teria custado descobrir."*

**Duração estimada:** ~35 min

## Vídeo introdutório

<video controls width="100%" preload="metadata">
	<source src="/copilot-na-pratica/videos/04-o-custo-do-discovery-improvisado.mp4" type="video/mp4" />
	Seu navegador não suporta vídeo HTML5.
</video>

## O Problema Real: O Projeto que "Ia Bem" até o Meio

O discovery improvisado tem uma característica traiçoeira: ele funciona na maioria dos projetos simples. A integração com API pública que tem documentação decente. O CRUD que segue o padrão do projeto. O endpoint que só adiciona uma coluna no banco. Nesses casos, ir direto pro código é eficiente — o contexto está acessível e o risco é baixo.

O problema é que essa eficiência cria um padrão mental: *"ir direto pro código funciona"*. E quando chega uma demanda com complexidade oculta — cache com lógica não documentada, gateway com restrições não óbvias, lib interna com comportamento específico de versão — a squad vai direto pro código com a mesma confiança de sempre.

**Sem discovery estruturado:**

```
Demanda chega: "integrar com a API de pagamentos da empresa"

├── Daniel lê a documentação da API (a pública, que está desatualizada)
├── Daniela implementa o fluxo de pagamento
├── Testa em dev → funciona
├── Testa em staging → falha com 429 Too Many Requests
│
│   Descoberta: a API tem rate limit de 100 req/min por ambiente,
│   mas a documentação pública não menciona o burst de 50 req/s
│   que dispara em horários de pico no staging.
│
│   Retrabalho: implementar retry com backoff exponencial + fila
│   Tempo perdido: 2 dias de refatoração
│
└── Deploy atrasado. Cliente notificado.
```

**Com discovery estruturado:**

```
Demanda chega: "integrar com a API de pagamentos da empresa"

└── discovery.prompt.md conduz:
    "Quais são as restrições de rate limit por ambiente?"
    → Resposta: "100 req/min, burst de 50 req/s em horários de pico"
    Registrado no DISCOVERY.md antes de escrever uma linha

Daniel implementa com retry e fila desde o início.
Nenhum retrabalho. Deploy no prazo.
```

**Diferença:** o discovery não evita complexidade — ele move o custo de descoberta do meio do desenvolvimento para o início, quando é barato.

## Por Que o Custo Aparece Depois, Nunca Antes

O discovery improvisado tem uma física particular: o custo é invisível até que você já investiu o suficiente para que ele doa.

```
┌──────────────────────────────────────────────────────────────────────┐
│                      CURVA DO CUSTO                                  │
│                                                                      │
│  Análise   │▓▓░░░░░░░░░░░░░░░░░░░░░░░░│ custo baixo de descoberta   │
│  Dev       │░░▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░│ investimento crescente      │
│  Descoberta│░░░░░░░░░░░▓░░░░░░░░░░░░░│ ← aqui a restrição aparece  │
│  Retrabalho│░░░░░░░░░░░░▓▓▓▓▓▓▓▓▓▓▓▓│ custo máximo                │
│            └────────────────────────────────────────────────────────│
│            início        meio          fim                           │
└──────────────────────────────────────────────────────────────────────┘
```

A restrição não ficou oculta por má vontade — ficou oculta porque ninguém perguntou sobre ela antes de começar. E ninguém perguntou porque o padrão sem discovery é: começa, encontra, ajusta.

O problema é que "ajusta" no meio do desenvolvimento tem um custo multiplicado pelo progresso já feito.

## Anatomia dos Anti-Padrões

Quatro situações reais. Cada uma com o mesmo padrão: descoberta tardia que poderia ter sido uma pergunta no início.

### Anti-padrão 1 — Cache Esquecido

```python
# ❌ Anti-padrão: implementar sem saber a estratégia de cache
# Por que parece certo: o endpoint funciona em dev (sem cache)
# O que acontece na prática: em produção, o cache retorna dado desatualizado
#                             e ninguém sabe por quê

# Descoberta no dia 3 de desenvolvimento:
# "Por que o saldo do usuário continua mostrando o valor antigo?"
#
# Causa: Redis com TTL de 300s para o endpoint de saldo
#        Ninguém sabia — estava documentado só no código da lib interna
#
# Retrabalho: adicionar invalidação de cache em 5 endpoints diferentes
#             que modificam o saldo de formas diferentes
# Custo: 2 dias de dev + 1 dia de QA regressiva

# ⚠️ Parcial: perguntar "tem cache?" no início
# O que ainda falta: saber a estratégia de invalidação e o TTL —
#                    "tem cache" sem os detalhes não evita o retrabalho

# ✅ Correto: dimensão Cache no DISCOVERY.md (Aula 6)
#
# ## Cache
# - Tipo: Redis
# - TTL do endpoint /saldo: 300s
# - Estratégia de invalidação: manual via evento "saldo_alterado"
# - Quem publica o evento: serviço de pagamentos (topic: payments.events)
#
# Com esse contexto antes de começar:
# Daniel implementa a publicação do evento desde a primeira linha
# Nenhum retrabalho necessário
```

### Anti-padrão 2 — Gateway que Bloqueia o Deploy

```python
# ❌ Anti-padrão: não mapear as regras do gateway de API antes de implementar
# Por que parece certo: "o gateway é transparente, só roteia"
# O que acontece na prática: o gateway tem regras de autenticação e headers
#                             que não estão documentados na API downstream

# Descoberta no dia do deploy em staging:
# "O endpoint retorna 403 — mas o mesmo payload funciona direto"
#
# Causa: o gateway exige header X-Client-Version >= 2.0
#        e valida o campo "amount" como integer, não float
#        Requisições com amount=10.50 são silenciosamente rejeitadas
#
# Retrabalho: adicionar header em todas as requisições
#             converter tipos em toda a camada de serialização
#             re-testar todos os fluxos de pagamento
# Custo: rollback em staging, 1.5 dias de ajuste + 1 dia de reteste

# ⚠️ Parcial: ler a documentação do gateway
# O que ainda falta: documentação pública frequentemente está desatualizada —
#                    as restrições reais estão na equipe de suporte ou no código

# ✅ Correto: dimensão Gateway no DISCOVERY.md, validado com a equipe dona
#
# ## Gateways
# - Nome: API Gateway v3
# - Header obrigatório: X-Client-Version: 2.1
# - Validação de tipo: amount deve ser integer (centavos), não float
# - Rate limit: 200 req/min por cliente
# - Quem consultar para dúvidas: @plataforma-api no Slack
```

### Anti-padrão 3 — Lib Interna Usada Errada

```python
# ❌ Anti-padrão: usar lib interna sem verificar a versão e os exemplos internos
# Por que parece certo: "é uma lib interna, alguém vai explicar se eu errar"
# O que acontece na prática: o bug é silencioso — a lib aceita, processa errado,
#                             e o erro aparece em produção dias depois

# Cenário: lib de autenticação interna
from empresa.auth import AuthClient  # versão 3.x

# Dev assume comportamento da versão 2.x (que estava em prod até 3 meses atrás):
client = AuthClient(token=os.environ["AUTH_TOKEN"])
response = client.validate(user_id=user_id)
# Funciona em dev. Em produção, retorna True para tokens expirados.

# Causa: na versão 3.x, o método validate() precisa de refresh=True
#        para verificar expiração. Sem isso, retorna cache local.
#        Breaking change não documentado no README — estava só na CHANGELOG.
#
# Custo: bug em produção, tokens expirados aceitos por 48h,
#        auditoria de segurança, rollback de emergência
#        Estimativa: 3 dias de remediação + incidente de segurança

# ✅ Correto: dimensão Libs Internas no DISCOVERY.md
#
# ## Libs Internas
# - empresa.auth: versão 3.2.1 (ATENÇÃO: breaking change vs 2.x)
#   - validate() exige refresh=True para verificar expiração
#   - Exemplos de uso: gitlab.empresa.com/platform/auth-examples
# - empresa.events: versão 1.5.0 (estável, sem breaking changes recentes)
#
# Com esse contexto:
client = AuthClient(token=os.environ["AUTH_TOKEN"])
response = client.validate(user_id=user_id, refresh=True)  # correto para v3.x
```

### Anti-padrão 4 — Dois Entendimentos Diferentes da Mesma API

```python
# ❌ Anti-padrão: dois devs implementam integração sem discovery compartilhado
# Por que parece certo: "cada um implementa sua parte, a gente integra depois"
# O que acontece na prática: "depois" = code review = horas de realinhamento

# Daniel implementou (entendeu que o campo é opcional):
class PagamentoCreate(BaseModel):
    valor: float
    descricao: str
    cliente_id: int
    referencia_externa: str | None = None  # opcional, ele assumiu

# Kássia implementou (entendeu que o campo é obrigatório):
class PagamentoRequest(BaseModel):
    valor: float
    descricao: str
    cliente_id: int
    referencia_externa: str  # obrigatório, ela assumiu

# Code review:
# Daniel: "a documentação diz 'opcional'"
# Kássia: "mas o sistema de parceiros sempre manda — na prática é obrigatório"
# Resultado: reunião de 1h, consulta ao time de parceiros, realinhamento
# Custo: 1.5h de reunião + refatoração do lado que entendeu errado

# ✅ Correto: discovery.prompt.md conduz a pergunta certa ANTES de implementar
#
# ## APIs Envolvidas
# - API de Pagamentos v2
#   - Campo referencia_externa: **obrigatório para parceiros tipo B2B**
#                               opcional para transações diretas de usuário
#   - Curl validado:
#     curl -X POST https://api.empresa.com/v2/pagamentos \
#       -H "Authorization: Bearer $TOKEN" \
#       -H "Content-Type: application/json" \
#       -d '{"valor": 100, "descricao": "teste", "cliente_id": 1,
#            "referencia_externa": "REF-001"}'
#   - Retorna 422 se referencia_externa ausente em contexto B2B
```

## O Padrão dos Quatro Anti-Padrões

Olhando para os quatro casos, o padrão é sempre o mesmo:

```
┌─────────────────────────────────────────────────────────────────────┐
│                  ANATOMIA DO CUSTO TARDIO                           │
│                                                                      │
│  1. Informação crítica existe (rate limit, regra de gateway,        │
│     breaking change, comportamento real da API)                      │
│                                                                      │
│  2. Ninguém perguntou sobre ela antes de começar                    │
│                                                                      │
│  3. O desenvolvimento avança com base em suposição                  │
│                                                                      │
│  4. A suposição quebra num momento onde o retrabalho é caro:        │
│     staging, produção, code review, integração                      │
│                                                                      │
│  5. O custo é pago — em retrabalho, em atraso, em incidente         │
└─────────────────────────────────────────────────────────────────────┘
```

A pergunta que o discovery responde é: **o que precisamos saber antes de escrever a primeira linha?**

Não é uma pergunta sobre requisitos funcionais — esses você já tem. É uma pergunta sobre **restrições operacionais**: o que existe no ambiente que vai determinar como você implementa, e que não está nos requisitos porque quem escreveu os requisitos não era dev.

## A Pergunta Central

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                      │
│   "O que eu preciso saber sobre o ambiente antes de começar         │
│    que, se eu não souber, vai me fazer reescrever depois?"          │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

Essa pergunta tem quatro categorias de resposta:

| Categoria | Exemplos | Por que importa |
|---|---|---|
| **Dependências externas** | Rate limits, versões de API, headers obrigatórios | Determinam a arquitetura da integração |
| **Restrições operacionais** | Regras de gateway, permissões de banco, políticas de rede | Bloqueiam o deploy se descobertas tarde |
| **Conhecimento tribal** | Breaking changes não documentados, comportamentos de libs internas | Não aparecem em nenhuma documentação formal |
| **Decisões já tomadas** | Padrões arquiteturais do projeto, libs que já foram escolhidas | Evitam retrabalho de "já tínhamos isso" |

O `DISCOVERY.md` (Aula 5) organiza essas respostas em dimensões que garantem que nenhuma categoria seja esquecida. O `discovery.prompt.md` (Aula 7) faz as perguntas automaticamente.

## Exercício Prático

**Missão:** Calcular o custo de um discovery improvisado da sua história.

1. **Identifique um projeto** em que você teve que refazer algo porque descobriu uma restrição no meio do desenvolvimento. Pode ser da última sprint ou de um projeto anterior.

2. **Preencha a tabela**:

| Item | Sua resposta |
|---|---|
| Qual foi a restrição descoberta tarde? | |
| Em que momento do desenvolvimento apareceu? | |
| O que precisou ser refeito? | |
| Estimativa de tempo perdido em retrabalho | |
| Uma pergunta de discovery teria revelado isso? | Sim / Provavelmente / Não |
| Qual pergunta seria essa? | |

3. **Multiplique pelo número de projetos**: se esse padrão acontece 2-3 vezes por mês, qual é o custo acumulado por trimestre?

**Critério de sucesso:** você consegue identificar pelo menos uma situação real onde uma pergunta no início teria evitado um custo concreto no meio. Não precisa ser dramático — um dia de retrabalho já valida o exercício.

## Troubleshooting

### 💡 Problema: "Discovery toma tempo que eu não tenho"

**Sintoma:**
Toda vez que chega uma demanda urgente, o discovery cai porque "não há tempo para isso agora".

**Causa:**
O discovery sem estrutura parece demorado porque é percebido como "reunião" ou "documento". Com `discovery.prompt.md`, o levantamento leva 30-40 minutos e entrega o `DISCOVERY.md` preenchido.

**Solução:**
Compare os tempos reais:

| Opção | Tempo gasto |
|---|---|
| Discovery estruturado com `discovery.prompt.md` | 30–40 min |
| Um anti-padrão tipo cache esquecido | 1–2 dias de retrabalho |
| Um anti-padrão tipo gateway bloqueando deploy | 1 dia + incidente em staging |
| Dois devs com entendimentos diferentes | 1h de reunião + refatoração |

A urgência da demanda não elimina o risco — ela apenas diminui o tempo disponível para mitigá-lo. Um discovery em 30 minutos é sempre mais barato que um retrabalho de 2 dias.

Nas aulas seguintes você vai ver que o tempo de discovery cai ainda mais com o Droid GitLab analisando repositórios automaticamente.

### 💡 Problema: "Nosso time é ágil — discovery formal não combina com essa cultura"

**Sintoma:**
A empresa valoriza velocidade e autonomia. Qualquer coisa que pareça "processo" ou "documentação" é vista com desconfiança.

**Causa:**
"Discovery formal" evoca imagem de documento de requisitos de 30 páginas. O `DISCOVERY.md` é o oposto disso — é um caderno de campo com 20-40 linhas que o Copilot lê diretamente.

**Solução:**
O `DISCOVERY.md` não é um artefato de processo — é um arquivo técnico. Assim como você não começa a escrever código sem ler os testes existentes (porque seria ineficiente), você não começa a integrar sem saber o rate limit e a versão da lib (pelo mesmo motivo). Renomeie mentalmente: não é "discovery formal", é "verificação técnica pré-implementação". Ágil não significa ir às cegas — significa iterar com velocidade baseada em evidência.

:::tip 🏆 Treinamento Jedi Completo
Você está pronto para a próxima aula se:

- [ ] Preenchi a tabela do exercício com uma situação real da minha história — com um custo estimado associado
- [ ] Consigo explicar por que o custo do discovery improvisado aparece no meio do desenvolvimento, não no início
- [ ] Identifico pelo menos uma pergunta de discovery que teria evitado um retrabalho concreto nos últimos 3 meses
- [ ] Entendo a diferença entre as quatro categorias de informação que o discovery captura (dependências externas, restrições operacionais, conhecimento tribal, decisões já tomadas)
:::

---

Você já sente a dor. Na próxima aula, o antídoto. A **Aula 5 — O Caderno de Campo** apresenta o `DISCOVERY.md` — o artefato central do sistema, o arquivo que transforma informação efêmera em contexto consultável, e que o Copilot vai saber ler sem que você explique nada.


