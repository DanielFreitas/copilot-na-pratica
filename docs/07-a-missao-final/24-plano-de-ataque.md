---
title: 24 - Plano de Ataque
sidebar_position: 24
description: Transformar briefing em plano técnico executável com Architect agent.
---

**Duração estimada:** ~45 min

## Vídeo introdutório

<video controls width="100%" preload="metadata">
	<source src="/copilot-na-pratica/videos/24-plano-de-ataque.mp4" type="video/mp4" />
	Seu navegador não suporta vídeo HTML5.
</video>

## O Problema Real: Briefing ≠ Plano Técnico

Kássia terminou o briefing (Lição 23):
- ✅ Escopo fechado
- ✅ Regras explícitas
- ✅ Critérios de validação definidos

**Mas ainda falta responder:**

```
❓ Por onde começar? Endpoint, model ou service?
❓ Quantos arquivos criar?
❓ Qual a ordem de implementação?
❓ Como testar cada etapa isoladamente?
❓ Onde estão os riscos técnicos?
```

**Sem plano técnico:**

```
Kássia começa a codar sem sequência clara:

10min: Cria model Notification
20min: Tenta criar endpoint, mas precisa do service
30min: Cria service, mas precisa configurar OneSignal
40min: Configura OneSignal, volta pro endpoint
50min: Endpoint falha porque migration não foi criada
60min: Cria migration, volta pro model (precisa ajustar)

Resultado: 1h de vai-e-vem, código pela metade, nada funcionando ainda
```

---

**Com plano técnico:**

```
Kássia usa @architect para planejar:

Etapa 1: Criar model + migration (testável isoladamente)
Etapa 2: Criar service (mock OneSignal, testar lógica)
Etapa 3: Configurar OneSignal integration
Etapa 4: Criar endpoint (conecta tudo)
Etapa 5: Testes end-to-end

Resultado: 45min de implementação linear, cada etapa validada antes da próxima
```

**Diferença:** vai-e-vem vs fluxo linear e validável.

---

## O Que É Plano de Ataque (Versão Prática)

**Plano de ataque:** decomposição do briefing em **etapas pequenas, testáveis e sequenciais**.

**Não é:**
- ❌ Lista de arquivos a criar
- ❌ "Fazer model, fazer service, fazer endpoint"
- ❌ Escrever pseudocódigo detalhado

**É:**
- ✅ Ordem de implementação (1→2→3)
- ✅ Pontos de validação após cada etapa
- ✅ Identificação de riscos técnicos
- ✅ Critérios objetivos de aprovação de cada etapa

---

## Missão: Planejar Sistema de Notificações

**Entrada:** Briefing completo (Lição 23)

**Saída:** Plano com etapas claras e testáveis

---

## Usando Architect Agent para Planejar

### Como Funciona o @architect

**@architect:** agente especializado em decisões de arquitetura e planejamento técnico.

**Quando usar:**

- ✅ Planejar implementação de feature nova
- ✅ Decidir estrutura de camadas (model/service/endpoint)
- ✅ Avaliar impacto de mudança arquitetural
- ✅ Escolher padrão técnico (REST vs GraphQL, sync vs async)

**Quando NÃO usar:**

- ❌ Implementar código (use agente default ou específico)
- ❌ Debugar erro (use agente específico ou leia stacktrace)
- ❌ Escrever testes (deixe para fase de implementação)

---

### Diálogo com Architect: Planejamento Real

**Kássia no Chat:**

```
@architect 

Preciso planejar implementação do sistema de notificações.

BRIEFING:
- Enviar notificações push via OneSignal
- Validar opt-in do usuário (notifications_enabled = true)
- Validar limite de 10 notificações/dia
- Persistir em tabela user_notifications
- Tipos: like, comment, follow

ARQUIVOS EXISTENTES:
- models/user.py (tem campo notifications_enabled)
- services/email_service.py (ignorar, é email antigo)

PERGUNTA:
Qual a melhor ordem de implementação?
Quebre em etapas pequenas e testáveis.
```

---

**@architect responde:**

```markdown
# Plano de Implementação: Sistema de Notificações Push

## Etapas Recomendadas (ordem de baixo para cima)

### Etapa 1: Infraestrutura de Dados
**O quê:** Model + Migration

**Arquivos:**
- `models/notification.py`
- `alembic/versions/004_add_user_notifications.py`

**Por quê primeiro:** 
- Sem tabela, nada mais funciona
- Testável isoladamente (migration up/down)

**Validação:**
```bash
alembic upgrade head
psql -c "\d user_notifications"  # Verifica schema
alembic downgrade -1
```

---

### Etapa 2: Lógica de Negócio (sem integração externa)
**O quê:** Service com regras de validação

**Arquivos:**
- `services/notification_service.py`

**Implementar (nesta ordem):**
1. Validar opt-in
2. Validar limite 10/dia
3. Validar tipo de notificação
4. Persistir em user_notifications
5. **NÃO integrar OneSignal ainda** (deixar TODO)

**Por quê separar:**
- Testa regras de negócio sem depender de API externa
- Mock fácil

**Validação:**
```python
def test_notification_service_validates_optin():
    user = User(notifications_enabled=False)
    with pytest.raises(NotificationsDisabledException):
        service.send_notification(user, "like", "post_123")
```

---

### Etapa 3: Integração OneSignal
**O quê:** Cliente OneSignal

**Arquivos:**
- `integrations/onesignal_client.py`

**Implementar:**
- Send push via OneSignal REST API
- Tratamento de erro (retry, timeout)
- Fallback logging se API falhar

**Por quê separar:**
- Isolável (testar com mock server)
- Reutilizável (outros serviços podem usar)

**Validação:**
```python
@mock.patch('requests.post')
def test_onesignal_client_sends_push(mock_post):
    mock_post.return_value.status_code = 200
    client.send_push(user_id="123", message="Test")
    assert mock_post.called
```

---

### Etapa 4: Conectar Service + OneSignal
**O quê:** Integrar o TODO deixado na Etapa 2

**Modificar:**
- `services/notification_service.py` (adicionar chamada real ao OneSignal)

**Validação:**
```python
def test_notification_service_sends_to_onesignal(mocker):
    mocker.patch('integrations.onesignal_client.send_push')
    service.send_notification(user, "like", "post_123")
    onesignal_client.send_push.assert_called_once()
```

---

### Etapa 5: API Endpoint
**O quê:** Endpoint REST

**Arquivos:**
- `api/v1/endpoints/notifications.py`
- `api/v1/router.py` (registrar endpoint)

**Implementar:**
- POST /notifications
- Validação Pydantic (NotificationCreate schema)
- Retornar 201 Created

**Validação:**
```python
def test_post_notification_success(client):
    response = client.post("/api/v1/notifications", json={
        "user_id": 123,
        "type": "like",
        "reference_id": "post_456"
    })
    assert response.status_code == 201
```

---

### Etapa 6: Testes End-to-End
**O quê:** Testes integrados completos

**Cobrir:**
- Fluxo completo (endpoint → service → OneSignal → DB)
- Validação de regras (opt-in, limite)
- Casos de erro (429, 403, 400)

**Validação:**
```bash
pytest tests/integration/test_notifications_e2e.py -v
```

---

## Resumo do Plano

| Etapa | O Quê                  | Testável Isoladamente? | Tempo Est. |
|-------|------------------------|------------------------|------------|
| 1     | Model + Migration      | ✅ Sim                  | 15min      |
| 2     | Service (sem OneSignal)| ✅ Sim                  | 30min      |
| 3     | Cliente OneSignal      | ✅ Sim (mock server)    | 20min      |
| 4     | Integrar Service+Client| ✅ Sim (mock client)    | 10min      |
| 5     | Endpoint               | ✅ Sim (mock service)   | 25min      |
| 6     | Testes E2E             | ✅ Sim                  | 30min      |

**Total estimado:** ~2h15min

---

## Riscos Técnicos Identificados

### Risco 1: OneSignal API Rate Limit
**Probabilidade:** Média  
**Impacto:** Alto (feature fica indisponível)

**Mitigação:**
- Implementar retry com exponential backoff
- Fallback: logar erro + salvar notificação como "pending"
- Alertar DevOps se taxa de erro > 5%

**Código de mitigação:**
```python
@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
def send_to_onesignal(user_id, message):
    try:
        response = requests.post(ONESIGNAL_API, json={...}, timeout=5)
        response.raise_for_status()
    except requests.RequestException as e:
        logger.error(f"OneSignal failed: {e}")
        # Salvar como pending para retry posterior
        save_pending_notification(user_id, message)
        raise
```

---

### Risco 2: Contador de Limite Não Reseta à Meia-Noite UTC
**Probabilidade:** Alta (timezone é complicado)  
**Impacto:** Médio (usuários bloqueados indevidamente)

**Mitigação:**
- Usar `datetime.utcnow()` explicitamente
- Adicionar teste específico de timezone
- Query deve filtrar por data UTC:

```python
def count_notifications_today(user_id):
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    return db.query(Notification).filter(
        Notification.user_id == user_id,
        Notification.created_at >= today_start
    ).count()
```

**Teste de validação:**
```python
def test_limit_resets_at_midnight_utc():
    # Enviar 10 notificações às 23:59 UTC
    send_10_notifications(user_id=123, time="2026-02-16T23:59:00Z")
    
    # Tentar enviar 11ª → deve falhar
    with pytest.raises(LimitExceededException):
        send_notification(user_id=123, time="2026-02-16T23:59:30Z")
    
    # Avançar para 00:00 UTC do dia seguinte
    # Tentar enviar → deve funcionar (contador resetou)
    send_notification(user_id=123, time="2026-02-17T00:00:01Z")  # ✅ Sucesso
```

---

### Risco 3: Performance com 1M+ Notificações
**Probabilidade:** Média (se app crescer)  
**Impacto:** Alto (query lenta = API lenta)

**Mitigação:**
- Criar índice composto:

```sql
CREATE INDEX idx_user_notifications_lookup 
ON user_notifications(user_id, created_at DESC);
```

- Adicionar em migration:

```python
def upgrade():
    op.create_index(
        'idx_user_notifications_lookup',
        'user_notifications',
        ['user_id', 'created_at'],
        postgresql_ops={'created_at': 'DESC'}
    )
```

**Teste de performance:**
```python
def test_query_performance_with_1m_records():
    # Inserir 1M de notificações
    bulk_insert_notifications(count=1_000_000)
    
    # Contar notificações de hoje para user_id=123
    start = time.time()
    count = count_notifications_today(user_id=123)
    elapsed = time.time() - start
    
    assert elapsed < 0.1  # Query deve demorar <100ms
```

---

## Mapa de Batalha: Sequence Diagram

**Mapa de Batalha:** diagrama de sequência mostrando fluxo completo.

**Por que criar:**
- ✅ Visualiza interação entre componentes
- ✅ Identifica pontos de falha
- ✅ Documenta decisões arquiteturais
- ✅ Facilita revisão de código

---

### Criando Sequence Diagram com Copilot

**Kássia no Chat:**

```
@architect 

Crie um sequence diagram em formato WebSequenceDiagrams 
para o fluxo:

POST /notifications → validate rules → send to OneSignal → persist DB

Incluir:
- Cliente (frontend)
- Endpoint (FastAPI)
- NotificationService
- OneSignalClient
- Database

Mostrar caso de sucesso E caso de erro (opt-in desabilitado)
```

---

**@architect gera:**

```wsd
title Sistema de Notificações Push

# Caso de Sucesso
Cliente->+Endpoint: POST /notifications {user_id, type, ref_id}
Endpoint->+NotificationService: send_notification(user_id, type, ref_id)

NotificationService->+Database: SELECT notifications_enabled FROM users WHERE id=user_id
Database-->-NotificationService: notifications_enabled=true ✅

NotificationService->NotificationService: Validar opt-in ✅
NotificationService->+Database: SELECT COUNT(*) FROM user_notifications WHERE user_id=X AND created_at>today
Database-->-NotificationService: count=5 (< 10) ✅

NotificationService->NotificationService: Validar limite ✅

NotificationService->+OneSignalClient: send_push(user_id, message)
OneSignalClient->OneSignal API: POST /notifications
OneSignal API-->OneSignalClient: 200 OK
OneSignalClient-->-NotificationService: success ✅

NotificationService->+Database: INSERT INTO user_notifications (user_id, type, ref_id, sent_at)
Database-->-NotificationService: notification_id=789

NotificationService-->-Endpoint: NotificationResponse(id=789, status="sent")
Endpoint-->-Cliente: 201 Created

---

# Caso de Erro: Opt-in Desabilitado
Cliente->+Endpoint: POST /notifications {user_id, type, ref_id}
Endpoint->+NotificationService: send_notification(user_id, type, ref_id)

NotificationService->+Database: SELECT notifications_enabled FROM users WHERE id=user_id
Database-->-NotificationService: notifications_enabled=false ❌

NotificationService->NotificationService: Validar opt-in ❌

NotificationService-->-Endpoint: raise NotificationsDisabledException
Endpoint-->-Cliente: 403 Forbidden {error_code: "NOTIFICATIONS_DISABLED"}
```

---

### Salvando Mapa de Batalha

```bash
# Criar arquivo
cat > static/diagramas/fluxo-notificacoes.wsd <<EOF
[COLAR CONTEÚDO DO DIAGRAM ACIMA]
EOF

# Gerar imagem via websequencediagrams.com
# OU usar extensão VS Code: "WebSequenceDiagram"
```

**Resultado visual:**

<!-- ![Sequence Diagram Notificações](/copilot-na-pratica/diagramas/fluxo-notificacoes.png) -->

_(Diagrama seria gerado via websequencediagrams.com ou ferramenta similar)_

---

## Critérios de Aceitação do Plano

**Plano está aprovado quando atende:**

### 1. Testabilidade de Cada Etapa

```
❓ Posso testar Etapa 2 sem Etapa 3 estar pronta?

✅ Sim → plano bom
❌ Não → etapas estão acopladas, quebrar mais
```

**Exemplo ruim (acoplado):**

```
Etapa 1: Criar endpoint + service + OneSignal integration
         └─► NÃO testável isoladamente (tudo junto)
```

**Exemplo bom (desacoplado):**

```
Etapa 1: Service (mock OneSignal)      → testável ✅
Etapa 2: OneSignal client isolado      → testável ✅
Etapa 3: Integrar service + client     → testável ✅
```

---

### 2. Ordem Justificada

```
❓ Por que Etapa X vem antes de Etapa Y?

✅ "Etapa Y depende de X" → ordem clara
❌ "Tanto faz" → falta dependência explícita
```

**Exemplo de dependência clara:**

```
Etapa 1: Model + Migration
         └─► ANTES de Etapa 2 (service precisa da tabela)

Etapa 2: Service (sem OneSignal)
         └─► ANTES de Etapa 3 (validar lógica antes de integrar)

Etapa 3: OneSignal Client
         └─► ANTES de Etapa 4 (service precisa do client)
```

---

### 3. Riscos Identificados e Mitigados

```
❓ O que pode dar errado em cada etapa?

✅ Listado e mitigado
❌ "Não sei" → falta análise de risco
```

**Exemplo de risco mitigado:**

| Etapa | Risco                        | Mitigação                |
|-------|------------------------------|--------------------------|
| 3     | OneSignal API rate limit     | Retry + fallback logging |
| 2     | Timezone errado em contador  | Forçar UTC + teste       |

---

### 4. Estimativa de Tempo Realista

```
❓ Feature média leva 2h15min?

✅ Razoável para feature pequena-média
❌ "5 minutos" → subestimado
❌ "2 semanas" → escopo grande demais
```

**Regra prática:**

- Feature pequena: 1-3h
- Feature média: 3-6h
- Feature grande: >6h (quebrar em features menores)

---

### 5. Sequence Diagram Criado

```
❓ Existe diagrama mostrando fluxo?

✅ Sim, salvo em static/diagramas/
❌ Não → criar antes de implementar
```

---

## Exemplo Completo: Plano Aprovado

### Template de Documento de Plano

```markdown
# Plano de Ataque: Sistema de Notificações Push

**Data:** 2026-02-16  
**Responsável:** Kássia Oliveira  
**Revisor:** Bruno (Tech Lead)  
**Baseado em:** Briefing de 2026-02-16 (commit: a3f8c2d)

---

## Etapas de Implementação

### Etapa 1: Infraestrutura de Dados
- **Arquivos:** `models/notification.py`, `alembic/versions/004_*.py`
- **Tempo:** 15min
- **Validação:** `alembic upgrade head && psql -c "\d user_notifications"`
- **Depende de:** -
- **Requerido por:** Etapa 2

### Etapa 2: Lógica de Negócio
- **Arquivos:** `services/notification_service.py`
- **Tempo:** 30min
- **Validação:** `pytest tests/test_notification_service.py -v`
- **Depende de:** Etapa 1
- **Requerido por:** Etapa 4

### Etapa 3: Cliente OneSignal
- **Arquivos:** `integrations/onesignal_client.py`
- **Tempo:** 20min
- **Validação:** `pytest tests/test_onesignal_client.py -v`
- **Depende de:** -
- **Requerido por:** Etapa 4

### Etapa 4: Integração Service + OneSignal
- **Arquivos:** `services/notification_service.py` (modificar)
- **Tempo:** 10min
- **Validação:** `pytest tests/test_notification_service_integration.py -v`
- **Depende de:** Etapa 2, Etapa 3
- **Requerido por:** Etapa 5

### Etapa 5: API Endpoint
- **Arquivos:** `api/v1/endpoints/notifications.py`
- **Tempo:** 25min
- **Validação:** `pytest tests/test_notifications_api.py -v`
- **Depende de:** Etapa 4
- **Requerido por:** Etapa 6

### Etapa 6: Testes End-to-End
- **Arquivos:** `tests/integration/test_notifications_e2e.py`
- **Tempo:** 30min
- **Validação:** `pytest tests/integration/ -v`
- **Depende de:** Todas anteriores
- **Requerido por:** -

---

## Riscos e Mitigações

| ID | Risco | Prob. | Impacto | Mitigação | Responsável |
|----|-------|-------|---------|-----------|-------------|
| R1 | OneSignal rate limit | Média | Alto | Retry + fallback logging | Kássia |
| R2 | Timezone incorreto | Alta | Médio | Forçar UTC + teste | Kássia |
| R3 | Performance 1M+ records | Média | Alto | Índice composto | Kássia |

---

## Sequence Diagram

📄 Arquivo: `static/diagramas/fluxo-notificacoes.wsd`

[Link para visualização](https://www.websequencediagrams.com/?lz=dGl0bGU...)

---

## Critérios de Aceite do Plano

- [x] Etapas são testáveis isoladamente
- [x] Ordem de implementação justificada (dependências claras)
- [x] Riscos identificados com mitigação
- [x] Estimativa de tempo realista (2h15min)
- [x] Sequence diagram criado e versionado
- [x] Revisado por tech lead

---

**Aprovação:**

- [x] Dev (Kássia): ✅ 2026-02-16  
- [x] Tech Lead (Bruno): ✅ 2026-02-16  
- [ ] PO (Ana): _(não precisa aprovar plano técnico)_

---

**Próximo passo:** Implementar Etapa 1 (Model + Migration)
```

---

## Troubleshooting

### 💡 Problema: @architect sugere ordem diferente da minha intuição

**Sintoma:**

```
Kássia acha: "Devo começar pelo endpoint"
@architect sugere: "Comece pelo model"
```

**Solução:**

**Pergunte o porquê:**

```
@architect 

Por que sugere começar pelo model em vez do endpoint?
```

**@architect explica:**

```
Endpoint depende do service
Service depende do model
Model não depende de ninguém

Logo: model → service → endpoint (ordem de dependência)

Benefício:
- Testa cada camada isoladamente
- Evita refazer endpoint se service mudar
```

**Moral:** ordem sugerida tem razão técnica, não é arbitrária.

---

### 💡 Problema: Plano tem 15 etapas (muito granular)

**Sintoma:**

```
Etapa 1: Criar arquivo models/notification.py
Etapa 2: Adicionar campo user_id
Etapa 3: Adicionar campo type
Etapa 4: Adicionar campo created_at
...
Etapa 15: Commitar model
```

**Solução:**

**Etapas devem ser funcionais, não arquivos/linhas.**

**Granularidade ideal:**

- ✅ "Criar model + migration" (30min)
- ❌ "Criar arquivo" (30 segundos)

**Regra prática:** etapa deve levar 15-45min.

Se leva &lt;15min → combinar com próxima  
Se leva &gt;45min → quebrar em subetapas

---

### 💡 Problema: Não sei estimar tempo

**Sintoma:**

```
Kássia: "Quanto tempo leva criar o service?"
Resposta: "Não faço ideia"
```

**Solução:**

**Use histórico de PRs:**

```bash
# Ver quanto tempo levou PR similar
git log --oneline --grep="service" --since="1 month ago"

# Ver tamanho de PRs de service (linhas modificadas)
git log --stat --grep="service" --since="1 month ago"

# Comparar com sua feature
```

**Estimativa inicial:**

- Service pequeno (~100 linhas): 30min
- Service médio (~300 linhas): 1h
- Service grande (~500+ linhas): 2h (quebrar em partes)

**Conforme faz mais features, estimativa melhora.**

---

### 💡 Problema: Plano muda durante implementação

**Sintoma:**

```
Plano: Etapa 3 é "Cliente OneSignal"

Durante implementação: descobre que precisa criar 
esquema Pydantic antes

Etapa 3 original fica bloqueada
```

**Solução:**

**Revisar plano sem culpa.**

```markdown
# Adicionar etapa descoberta

Etapa 2.5: Criar Pydantic schemas
- NotificationCreate
- NotificationResponse

Motivo: Etapa 3 precisa dos schemas para tipar requests

Tempo adicional: +15min
```

**Plano é vivo, não contrato imutável.**

---

## Comparação: Com vs Sem Plano

### Implementação Sem Plano

```
Kássia começa a codar direto:

09:00 - Cria model
09:15 - Cria migration (esquece índice)
09:20 - Cria service
09:45 - Service falha (OneSignal não configurado)
10:00 - Configura OneSignal
10:15 - Volta pro service (refatora para usar OneSignal)
10:30 - Cria endpoint
10:50 - Endpoint falha (Pydantic schema faltando)
11:00 - Cria schemas
11:10 - Volta pro endpoint (ajusta)
11:20 - Testa manualmente (falha por falta de índice)
11:30 - Volta pra migration (adiciona índice)
11:45 - Roda migration novamente
12:00 - Testa novamente (finalmente funciona)

Total: 3h de vai-e-vem
```

---

### Implementação Com Plano

```
Kássia usa plano do @architect:

09:00 - Etapa 1: Model + migration (com índice) → validado ✅
09:15 - Etapa 2: Service (mock OneSignal) → validado ✅
09:45 - Etapa 3: OneSignal client → validado ✅
10:05 - Etapa 4: Integração service+client → validado ✅
10:15 - Etapa 5: Schemas + endpoint → validado ✅
10:40 - Etapa 6: Testes E2E → validado ✅
11:10 - PR aberto (tudo funcionando)

Total: 2h10min linear
```

**Economia:** ~50min + menos frustração.

---

## Exercício Prático

**Missão:** Criar plano técnico para feature do seu projeto.

**Tempo estimado:** 45min

---

**Passo 1: Usar Briefing da Lição 23 (5min)**

Use briefing criado no exercício anterior.

---

**Passo 2: Pedir Plano ao @architect (10min)**

```
@architect 

Baseado no briefing abaixo, crie plano de implementação:

[COLAR BRIEFING AQUI]

Quebre em etapas pequenas (15-45min cada).
Identifique dependências.
Sugira ordem de implementação.
```

---

**Passo 3: Revisar Ordem Sugerida (10min)**

Para cada etapa, perguntar:
- [ ] É testável isoladamente?
- [ ] Tem dependências claras?
- [ ] Tempo estimado é realista?

Ajustar se necessário.

---

**Passo 4: Identificar Riscos (10min)**

Para cada etapa, perguntar:
- [ ] O que pode dar errado?
- [ ] Como mitigar?

Exemplo:
- Risco: Timezone errado
- Mitigação: Forçar UTC + teste específico

---

**Passo 5: Criar Sequence Diagram (10min)**

```
@architect 

Crie sequence diagram para o fluxo:

[DESCREVER FLUXO PRINCIPAL]

Formato: WebSequenceDiagrams
```

Salvar em `static/diagramas/nome-da-feature.wsd`.

---

**Critério de sucesso:**

- [ ] Plano tem 4-6 etapas (não muito granular, não muito grosso)
- [ ] Cada etapa tem validação objetiva
- [ ] Riscos identificados com mitigação
- [ ] Sequence diagram criado
- [ ] Tempo total estimado (somar todas etapas)
- [ ] Plano documentado em `docs/planos/nome-da-feature.md`

---

## Recursos Externos

- [WebSequenceDiagrams](https://www.websequencediagrams.com/)
- [C4 Model](https://c4model.com/) (diagramas arquiteturais)
- [ADR (Architecture Decision Records)](https://adr.github.io/)

---

## Checklist de Validação

Você está pronto para a próxima aula se:

- [ ] Sabe o que é plano de ataque (decomposição em etapas testáveis)
- [ ] Conhece @architect agent e quando usar
- [ ] Consegue pedir plano técnico para feature baseada em briefing
- [ ] Entende critérios de aprovação de plano (testabilidade, ordem, riscos)
- [ ] Sabe criar sequence diagram com WebSequenceDiagrams
- [ ] Identifica riscos técnicos e propõe mitigação
- [ ] Entende diferença entre implementação linear (com plano) vs vai-e-vem (sem plano)
- [ ] Sabe revisar plano durante implementação sem culpa

:::tip 🏆 Treinamento Jedi Completo
Você transforma briefing funcional em plano técnico executável, com etapas validáveis, riscos identificados e sequência clara de implementação. Elimina vai-e-vem e implementa de forma linear e previsível.
:::
