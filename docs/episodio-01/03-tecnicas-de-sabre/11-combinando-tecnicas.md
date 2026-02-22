---
title: 11 - Combinando Técnicas
sidebar_position: 11
description: Orquestração prática de instruções, agentes, prompts e skills no mesmo fluxo.
---

> *"Um Jedi de verdade não usa uma técnica por vez. Ele combina tudo num único golpe."*

**Duração estimada:** ~40 min

## Vídeo introdutório

<video controls width="100%" preload="metadata">
	<source src="/copilot-na-pratica/videos/11-combinando-tecnicas.mp4" type="video/mp4" />
	Seu navegador não suporta vídeo HTML5.
</video>

## Pré-requisitos obrigatórios

Você PRECISA ter completado as aulas anteriores deste módulo:
- ✅ Aula 08: Prompt Files (comandos reutilizáveis)
- ✅ Aula 09: Custom Agents (personas técnicas)
- ✅ Aula 10: Skills (automação complexa)

Esta aula mostra como ORQUESTRAR todos recursos juntos em fluxos reais.

## O Problema: Usar Recursos Isolados É Ineficiente

Imagine entregar uma feature real com apenas um recurso:

| Usando apenas | O que acontece | Resultado |
|---------------|----------------|-----------|
| **Só Prompt Files** | Você executa `/create-endpoint`, depois `/generate-tests`, depois `/document` separadamente | ⚠️ Funciona mas fragmentado, sem visão arquitetural |
| **Só Custom Agents** | `@architect` planeja, depois você implementa manualmente tudo | ⚠️ Bom plano mas execução lenta e manual |
| **Só Skills** | Executa skill complexa mas sem validação de qualidade ou arquitetura | ⚠️ Código gerado mas possivelmente  com problemas de padrão |

**Combinação orquestrada** resolvee isso criando um **fluxo previsível** onde cada recurso age no momento certo:

```
Fase 1 (Planejamento)   → Custom Agent (@architect)
Fase 2 (Implementação)  → Skill ou Prompt Files
Fase 3 (Validação)      → Custom Agent (@reviewer, @security)
Fase 4 (Testes)         → Skill (api-testing)
Fase 5 (Documentação)   → Prompt File (/document)
```

Tudo isso com **Holocrons ativos** (contexto global) o tempo todo.

## 🎭 Hierarquia de Recursos: Ordem de Precedência

Quando você combina múltiplos recursos, entenda a hierarquia:

```
┌─────────────────────────────────────────────┐
│ HOLOCRON PRINCIPAL                          │ ← SEMPRE ativo (base)
│ (.github/copilot-instructions.md)          │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ HOLOCRON DE TERRITÓRIO                      │ ← Ativo conforme arquivo atual
│ (.github/instructions/api.instructions.md) │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ CUSTOM AGENT (@architect, @dba, etc)       │ ← Muda perspectiva da conversa
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ PROMPT FILE (/create-endpoint, etc)        │ ← Executa tarefa específica
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ SKILL (api-scaffolding, api-testing)       │ ← Automação complexa sob demanda
└─────────────────────────────────────────────┘
```

**Regras de precedência:**

1. **Holocrons** (global + território) estão SEMPRE ativos como fundação
2. **Custom Agent** modifica lente de análise mas respeita Holocrons
3. **Prompt File** executa tarefa seguindo Holocrons + Agent (se ativo)
4. **Skill** roda automação complexa seguindo TODA a pilha acima

**Exemplo de conflito resolvido:**

```markdown
# Holocron Principal diz:
"Use Python 3.13, FastAPI, PostgreSQL"

# Agent @architect diz:
"Quebre features em fases incrementais"

# Prompt File /create-endpoint diz:
"Crie router + schema + service + tests"

# RESULTADO COMBINADO:
O endpoint criado usa:
- ✅ Python 3.13 + FastAPI (holocron)
- ✅ PostgreSQL para persistência (holocron)
- ✅ Estrutura em fases testáveis (agent)
- ✅ Todos arquivos necessários (prompt file)
```

## 🎬 Fluxo Completo: Feature do Briefing ao Deploy

Vamos implementar a feature **"Sistema de Notificações Push"** usando TODAS as técnicas:

### 📋 Contexto do Projeto
- Stack: Python 3.13, FastAPI, PostgreSQL, Redis, Docker
- Holocrons configurados:
  - Principal: regras gerais do projeto
  - api.instructions.md: padrões de API
  - testing.instructions.md: padrões de teste
- Prompt Files criados: `/create-endpoint`, `/generate-tests`, `/document`
- Agents criados: `@architect`, `@reviewer`, `@dba`, `@security`
- Skills criadas: `api-scaffolding`, `api-testing`

---

### 🔵 FASE 1: Planejamento Arquitetural (@architect)

**Você pergunta:**
```
@architect Preciso implementar sistema de notificações push. 
Requisitos:
- Usuário pode se inscrever/desinscrever de notificações
- Envio de notificação por evento (pedido criado, status changed)
- Suporte a múltiplos canais (email, SMS, push app)
- Histórico de notificações enviadas

Como arquitetar isso?
```

**@architect responde:**

```markdown
## Análise da Demanda

Sistema de notificações assíncrono com suporte a múltiplos canais e rastreamento.

## Componentes Afetados
- **API REST:** Endpoints de inscrição e consulta
- **Worker assíncrono:** Processamento de fila de notificações
- **Integrações externas:** SendGrid (email), Twilio (SMS), Firebase (push)
- **Banco de dados:** Tabelas de inscrições e histórico

## Plano Técnico

### Fase 1: Modelagem e API de inscrição (2-3 dias)
**Mudanças:**
- Criar tabela `notification_subscriptions` (user_id, channel, enabled)
- Criar tabela `notification_history` (subscription_id, event_type, status, sent_at)
- Endpoint POST /api/notifications/subscriptions
- Endpoint GET /api/notifications/subscriptions (lista inscrições do user)
- Endpoint DELETE /api/notifications/subscriptions/{id}

**Testes:**
- ✅ User cria inscrição com canal válido
- ✅ User não pode criar inscrição duplicada
- ✅ User só vê suas próprias inscrições

**Risco:** 🔵 dependencies de libs externas (SendGrid, Twilio) - mitiga com interfaces

### Fase 2: Fila e Worker (3-4 dias)
**Mudanças:**
- Configurar Redis como message broker
- Criar worker Celery para processar notificações
- Task para envio assíncrono
- Retry logic para falhas temporárias

**Testes:**
- ✅ Notificação entra na fila
- ✅ Worker processa e marca como enviada
- ✅ Retry em falha temporária (3x)

**Risco:** 🟡 Worker precisa rodar separado do app (Docker compose)

### Fase 3: Integrações com canais (2 dias)
**Mudanças:**
- Adapter para SendGrid (email)
- Adapter para Twilio (SMS)
- Adapter para Firebase (push)
- Factory pattern para escolher adapter

**Testes:**
- ✅ SendGrid adapter envia email
- ✅ Twilio adapter envia SMS
- ✅ Factory escolhe adapter correto por channel

**Risco:** 🔴 Credenciais de APIs externas - usar secrets manager

### Fase 4: Triggers de eventos (1-2 dias)
**Mudanças:**
- Hook em pedido_criado → enfileira notificação
- Hook em pedido_status_changed → enfileira notificação
- Filtro de inscrições ativas

**Testes:**
- ✅ Pedido criado gera notificação para inscritos
- ✅ Pedido cancelado NÃO gera notificação (regra de negócio)

**Risco:** 🔵 Performance se muitos inscritos - implementar batch

## Trade-offs Principais

| Decisão | Vantagens | Desvantagens | Recomendação |
|---------|-----------|--------------|--------------|
| Redis + Celery | Assíncrono, escalável | Complexidade adicional (worker) | ✅ Implementar (evita timeout em requests) |
| Adapter pattern | Fácil adicionar canais | Mais arquivos/classes | ✅ Implementar (extensibilidade vale) |
| Histórico completo | Auditoria e debug | Crescimento de dados | ✅ Implementar + política de retenção (90 dias) |

## Checklist de Validação
- [ ] Inscrições persistidas corretamente
- [ ] Notificações são assíncronas (não bloqueiam request)
- [ ] Retry logic funciona
- [ ] Histórico rastreável
- [ ] Secrets não expostos
```

**Decisão:** Você aprova o plano e decide começar pela Fase 1.

---

### 🟢 FASE 2: Implementação da API (Skill + Prompt File)

**Você executa skill de scaffolding:**
```
Use a skill api-scaffolding para criar:
- POST /api/notifications/subscriptions (criar inscrição)
- GET /api/notifications/subscriptions (listar inscrições do user)
- DELETE /api/notifications/subscriptions/{id} (deletar inscrição)
```

**Skill api-scaffolding gera:**
```
✅ app/api/routes/notifications.py (router com 3 endpoints)
✅ app/schemas/notifications.py (SubscriptionCreate, SubscriptionResponse)
✅ app/services/notifications.py (create_subscription, list_subscriptions, delete_subscription)
✅ tests/api/test_notifications.py (testes básicos dos 3 endpoints)
```

**Você revisa os arquivos gerados e ajusta:**
- Adiciona validação de `channel` no schema (deve ser "email" | "sms" | "push")
- Implementa lógica real nos services (conectar ao ORM)
- Adiciona autorização (user só vê próprias inscrições)

**Você valida estrutura:**
```
/document app/services/notifications.py
```

Prompt File `/document` gera docstrings completas.

---

### 🟡 FASE 3: Validação de Qualidade (@reviewer + @security)

**Code Review com @reviewer:**
```
@reviewer Revise o código em app/api/routes/notifications.py
```

**@reviewer identifica:**
```markdown
### 🟡 Atenção: Falta tratamento de duplicação
**Localização:** POST /subscriptions linha 15
**Problema:** User pode criar múltiplas inscrições idênticas (same channel)
**Solução:** Adicionar constraint UNIQUE(user_id, channel) no banco e capturar IntegrityError:

```python
try:
    subscription = create_subscription(db, user_id, data)
except IntegrityError:
    raise HTTPException(409, "Inscrição já existe para este canal")
```

### 🔵 Melhoria: Nomenclatura
**Problema:** `data` é genérico
**Solução:** Renomear para `subscription_data` (mais descritivo)
```

**Você corrige os problemas apontados.**

**Security Review com @security:**
```
@security Revise security de app/api/routes/notifications.py
```

**@security identifica:**
```markdown
### 🔴 [OWASP-5] Broken Access Control
**Localização:** DELETE /subscriptions/{id}
**Problema:** Usuário pode deletar inscrição de outro user se souber o ID
**Exploração:**
```
DELETE /api/notifications/subscriptions/123  # ID de outro user
```

**Mitigação:**
```python
@router.delete("/{subscription_id}")
def delete_subscription(
    subscription_id: int,
    current_user: User = Depends(get_current_user),  # ← Inject auth
    db: Session = Depends(get_db)
):
    subscription = db.query(Subscription).get(subscription_id)
    if not subscription:
        raise HTTPException(404, "Inscrição não encontrada")
    
    # VERIFICAÇÃO CRÍTICA:
    if subscription.user_id != current_user.id:
        raise HTTPException(403, "Você não pode deletar inscrição de outro usuário")
    
    db.delete(subscription)
    db.commit()
```
```

**Você implementa a mitigação crítica.**

---

### 🔵 FASE 4: Validação de Banco de Dados (@dba)

**Você consulta DBA sobre modelagem:**
```
@dba Revise o schema de notification_subscriptions e notification_history.
Modelo SQLAlchemy:

```python
class NotificationSubscription(Base):
    __tablename__ = "notification_subscriptions"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    channel = Column(String(20))
    enabled = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
```
```

**@dba responde:**
```markdown
## Problemas Encontrados

### 🔴 Performance: Falta índice em foreign key
**Causa:** Query `SELECT * FROM notification_subscriptions WHERE user_id = ?` sem índice
**Impacto:** Full table scan com milhares de inscrições

**Índices necessários:**
```sql
CREATE INDEX ix_subscriptions_user_id ON notification_subscriptions(user_id);
CREATE UNIQUE INDEX ix_subscriptions_user_channel ON notification_subscriptions(user_id, channel) WHERE enabled = true;
```

### 🟡 Modelagem: Channel como string livre
**Problema:** `channel = Column(String(20))` permite valores arbitrários
**Risco:** Inserir "emial" (typo) ao invés de "email"

**Solução:** Use Enum PostgreSQL:
```python
from enum import Enum as PyEnum
class ChannelEnum(str, PyEnum):
    EMAIL = "email"
    SMS = "sms"
    PUSH = "push"

Channel = Column(Enum(ChannelEnum), nullable=False)
```

### 🔵 Otimização: Particionar notification_history
**Justificativa:** Tabela vai crescer rápido (milhares de notificações/dia)
**Recomendação:** Particionamento por mês:
```sql
CREATE TABLE notification_history (
    ...
    sent_at TIMESTAMP
) PARTITION BY RANGE (sent_at);

CREATE TABLE notification_history_2024_01 PARTITION OF notification_history
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
```
(Implementar depois, não bloqueia MVP)
```

**Você implementa índices e Enum (críticos), agenda particionamento para depois.**

---

### 🟢 FASE 5: Geração e Execução de Testes (Skill api-testing)

**Você roda testes:**
```powershell
pytest tests/api/test_notifications.py -v
```

**Resultado:** 2 testes falharam, 4 passaram.

**Você usa skill para analisar:**
```
Use a skill api-testing para analisar falhas em tests/api/test_notifications.py.
Output do pytest:

FAILED tests/api/test_notifications.py::test_delete_subscription_unauthorized
FAILED tests/api/test_notifications.py::test_duplicate_subscription
```

**Skill api-testing responde:**
```markdown
## Resumo de Execução
- Total: 6 testes
- Passou: 4
- Falhou: 2

## Falhas por Categoria

### 🔴 Crítico (1 falha)

#### test_delete_subscription_unauthorized
**Erro:** `AssertionError: assert 200 == 403`
**Causa provável:** Middleware de autorização não configurado, `get_current_user` não injetado no endpoint
**Localização:** tests/api/test_notifications.py:45

**Correção sugerida:**
```python
# Em app/main.py, registrar middleware de autenticação
from app.api.dependencies import JWTBearer

app.add_middleware(JWTBearer)

# Em app/api/routes/notifications.py
from app.api.dependencies import get_current_user

@router.delete("/{subscription_id}")
def delete_subscription(..., current_user: User = Depends(get_current_user)):
    ...
```

### 🟡 Alto (1 falha)

#### test_duplicate_subscription
**Erro:** `IntegrityError not raised`
**Causa provável:** Constraint UNIQUE não foi aplicada na migration do banco de testes
**Localização:** tests/api/test_notifications.py:67

**Correção sugerida:**
1. Verificar que migration tem constraint:
```sql
ALTER TABLE notification_subscriptions 
ADD CONSTRAINT uq_user_channel UNIQUE (user_id, channel);
```
2. Rodar migrations no banco de teste: `alembic upgrade head`
3. Reexecutar testes

## Ordem de Correção
1. 🔴 Configurar middleware de auth (bloqueador de segurança)
2. 🟡 Aplicar migration (validação de regra)
```

**Você corrige ambos problemas, reroda testes → 6/6 passando ✅**

---

### 🟢 FASE 6: Documentação (Prompt File /document)

**Você documenta o módulo completo:**
```
/document app/services/notifications.py
```

**Prompt File gera:**
```python
"""
Notification Services

Descrição: Serviços de criação e gerenciamento de inscrições de notificações push.

Responsabilidades:
- Criar inscrições respeitando constraint de unicidade (user + channel)
- Listar inscrições do usuário autenticado
- Deletar inscrições com validação de ownership

Dependências:
- app.models.notifications para ORM
- app.schemas.notifications para validação
"""

def create_subscription(db: Session, user_id: int, data: SubscriptionCreate) -> Subscription:
    """
    Cria nova inscrição de notificação para usuário.
    
    Args:
        db: Sessão do SQLAlchemy
        user_id: ID do usuário criando inscrição
        data: Dados validados da inscrição (channel, enabled)
        
    Returns:
        Subscription: Objeto de inscrição criado com ID
        
    Raises:
        IntegrityError: Se já existe inscrição do user naquele channel
        ValueError: Se channel inválido (não é email/sms/push)
        
    Example:
        >>> create_subscription(db, user_id=1, SubscriptionCreate(channel="email"))
        Subscription(id=123, user_id=1, channel="email")
    """
    # ... implementação ...
```

---

## 📊 Resultado Final: Feature Entregue

Após 6 fases orquestradas, você tem:

✅ **Planejamento sólido** (architect agent)  
✅ **Código implementado** (api-scaffolding skill + ajustes manuais)  
✅ **Qualidade validada** (reviewer + security agents)  
✅ **Banco otimizado** (dba agent)  
✅ **Testes passando** (api-testing skill)  
✅ **Documentação completa** (/document prompt)  

**Tempo economizado:** ~40% comparado a fazer tudo manualmente  
**Qualidade:** Padronizada e revisada por múltiplas perspectivas  
**Rastreabilidade:** Cada decisão documentada no processo

---

## 🎯 Padrões de Orquestração Recomendados

### Padrão 1: Feature do Zero (Greenfield)
```
1. @architect → Plano técnico em fases
2. Skill api-scaffolding → Boilerplate inicial
3. Implementação manual → Lógica de negócio real
4. @reviewer + @security → Validação de qualidade
5. @dba → Otimização de queries
6. Skill api-testing → Validação automática
7. /document → Documentação final
```

**Quando usar:** Feature nova sem código existente  
**Tempo estimado:** 1-3 dias dependendo da complexidade

### Padrão 2: Refatoração de Legado (Brownfield)
```
1. @architect → Análise de impacto e plano de migração
2. /refactor → Reestruturação de código existente
3. @reviewer → Validação de que comportamento não mudou
4. Skill api-testing → Regressão completa
5. /document → Atualizar documentação
```

**Quando usar:** Melhorar código legado sem quebrar funcionalidade  
**Tempo estimado:** 2-5 dias dependendo do tamanho

### Padrão 3: Bug Fix Critical (Hotfix)
```
1. Skill api-testing → Reproduzir falha
2. @dba ou @security → Diagnosticar (se DB ou security issue)
3. Implementação manual → Correção mínima
4. @reviewer → Validação de não introduzir novos bugs
5. Skill api-testing → Validar fix + regressão
```

**Quando usar:** Bug em produção que precisa correção urgente  
**Tempo estimado:** 2-8 horas

### Padrão 4: Code Review de PR
```
1. @reviewer → Análise geral de qualidade
2. @security → Auditoria de vulnerabilidades
3. @dba → Validação de queries (se houver)
4. Skill api-testing → Validar que testes existem e passam
```

**Quando usar:** PR antes de merge para main  
**Tempo estimado:** 30-60 minutos

## ⚠️ Conflitos Entre Recursos e Como Resolver

### Conflito 1: Agent vs Holocron

**Cenário:**
- Holocron diz: "Use FastAPI para todas APIs"
- Agent @architect diz: "Para este microserviço específico, Flask é mais simples"

**Resolução:**  
Holocron vence (é política do projeto). Se precisa exceção, documente no Holocron:
```markdown
## Exceções à stack padrão
- Microserviço X usa Flask (decisão: 2024-01-15, motivo: legacy)
```

### Conflito 2: Prompt File vs Skill

**Cenário:**
- Prompt File `/create-endpoint` gera boilerplate simples
- Skill `api-scaffolding` gera estrutura complexa com migrations

**Resolução:**  
- Use Prompt File para casos simples (endpoint sem banco)
- Use Skill para casos complexos (endpoint + migrations + cache + fila)

**Regra:** Skill tem precedência quando invocada explicitamente (é mais específica).

### Conflito 3: Múltiplos Agents ativos

**Cenário:**
- Você pergunta: `@architect @security Revise este código`

**Resolução:**  
Copilot combina perspectivas:
- Architect analisa estrutura
- Security analisa vulnerabilidades
- Resposta integra ambas perspectivas

**Cuidado:** Não misturar agents conflitantes (`@architect` + `@reviewer` pode gerar análise confusa). Use sequencialmente:
```
1. @architect planeja
2. [você implementa]
3. @reviewer valida
```

## 💡 Troubleshooting de Orquestração

### Problema: Muitos recursos ativos deixam resposta confusa

**Sintomas:** Copilot responde misturando planejamento + implementação + revisão numa única resposta.

**Causa:** Você perguntou genérico demais sem especificar papel.

**Solução:** Seja explícito sobre QUAL recurso quer ativar:
```
# ❌ Vago
"Me ajude a criar endpoint de notificações"

# ✅ Específico
"@architect Planeje arquitetura de sistema de notificações com 3 fases"
[aguarda plano]
"Use skill api-scaffolding para criar endpoints da Fase 1"
[aguarda implementação]
"@reviewer Revise código gerado"
```

### Problema: Skill ignora regras do Holocron

**Sintomas:** Skill gera código que não segue padrões do projeto.

**Causa:** SKILL.md não referencia Holocrons.

**Solução:** Adicione no SKILL.md:
```markdown
## Restrições
- SEMPRE respeitar instruções de .github/copilot-instructions.md
- SEMPRE respeitar território-specific instructions se aplicável
- Usar #codebase para buscar exemplos antes de gerar código
```

### Problema: Não sei qual recurso usar

**Decisão rápida:**
- Planejar / analisar / revisar → **Agent** (`@architect`, `@reviewer`, `@security`)
- Executar tarefa simples → **Prompt File** (`/create-endpoint`, `/refactor`)
- Executar automação multi-step → **Skill** (`api-scaffolding`, `api-testing`)
- Dúvida pontual → **Pergunta direta** (sem recursos especiais)

## 📝 Exercício Prático Final

**Missão Completa:** Implemente feature "Sistema de Avaliações de Produtos" usando TODA a orquetração:

### Requisitos
- Usuário pode avaliar produto (nota 1-5, comentário opcional)
- Uma avaliação por usuário por produto
- Cálculo de média de avaliações do produto
- Listagem de avaliações com paginação

### Tarefas

1. **Planejamento:** Use `@architect` para plano em 3 fases
2. **Implementação:** Use skill `api-scaffolding` para Fase 1 (endpoints)
3. **Validação DBA:** Use `@dba` para revisar schema e sugerir índices
4. **Validação Segurança:** Use `@security` para revisar autorização
5. **Testes:** Use skill `api-testing` para validar cobertura
6. **Code Review:** Use `@reviewer` antes de considerar pronto
7. **Documentação:** Use `/document` para docstrings finais

### Critério de Sucesso
- ✅ Plano arquitetural documentado (architect)
- ✅ Código implementado seguindo padrões (skill + holocrons)
- ✅ Índices de banco otimizados (dba)
- ✅ Zero vulnerabilidades críticas (security)
- ✅ Testes passando com cobertura adequada (api-testing)
- ✅ Code review sem problemas bloqueadores (reviewer)
- ✅ Documentação completa (document)

**Tempo estimado:** 4-6 horas (vs 2-3 dias manualmente)

---

## 🎯 Próxima Missão

Você completou o **Módulo 3: Técnicas de Sabre**! Agora domina:
- ✅ Prompt Files (comando reutilizáveis)
- ✅ Custom Agents (perspectivas técnicas)
- ✅ Skills (automação complexa)
- ✅ Orquestração (combinar tudo em fluxos previsíveis)

Na próxima missão (**Módulo 4: Aliados da Resistência**) você aprenderá:
- **Arquivos da Aliança:** Documentação como contexto consultável
- **Mapas de Batalha:** Diagramas e visualizações técnicas
- **Holocrons Vivos:** Documentação que evolui com o código

:::tip 🏆 Treinamento Jedi Completo — Módulo 3 Finalizado
Você domina a arte de combinar técnicas do Copilot em fluxos únicos, previsíveis e alinhados ao padrão do time. Agora você não usa apenas uma ferramenta por vez — orquestra TODAS de forma coordenada para máxima eficiência.
:::
