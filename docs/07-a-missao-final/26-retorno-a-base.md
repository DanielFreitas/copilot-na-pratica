---
title: 26 - Retorno à Base
sidebar_position: 26
description: Fechamento profissional com revisão, atualização de contexto e PR de qualidade.
---

**Duração estimada:** ~40 min

## Vídeo introdutório

<video controls width="100%" reload="metadata">
	<source src="/copilot-na-pratica/videos/26-retorno-a-base.mp4" type="video/mp4" />
	Seu navegador não suporta vídeo HTML5.
</video>

## O Problema Real: Feature Pronta ≠ Missão Completa

Kássia terminou implementação:
- ✅ Código funcionando
- ✅ Testes passando (100% cobertura)
- ✅ Commits organizados por etapa

**Mas esquece fechamento:**

```bash
# Kássia abre PR:

git push origin feature/notifications
gh pr create --title "feat: notificações" --body "Implementei notificações"

# Tech Lead revisa:

❌ "Faltou atualizar pergaminho de regras"
❌ "Código tem inconsistência (variável em português)"
❌ "PR não explica impacto técnico"
❌ "Documentação não foi atualizada"

# Resultado: PR voltou, precisa ajustar
```

**Com fechamento profissional:**

```bash
Kássia ANTES de abrir PR:

1. Auto-revisão com checklist (encontra 3 ajustes)
2. Atualiza Pergaminho de regras (nova regra de limite)
3. Atualiza Holocron de API (novo endpoint)
4. Cria PR profissional (contexto, impacto, evidências)

# PR aberto → aprovado em 1ª revisão ✅
```

**Diferença:** PR voltou para ajustes vs aprovado na primeira.

---

## O Que É "Retorno à Base" (Versão Prática)

**Retorno à Base:** fase de **fechamento profissional** onde você valida qualidade, atualiza contexto e documenta decisões **antes** de abrir PR.

**Não é:**
- ❌ "Feature funciona, vou abrir PR"
- ❌ Esperar tech lead apontar problemas
- ❌ Esquecer de atualizar documentação

**É:**
- ✅ Auto-revisão com checklist de qualidade
- ✅ Atualizar artefatos (Holocrons, Pergaminhos, Mapas)
- ✅ PR com contexto completo (não só "implementei X")
- ✅ Evidências de testes e validação
- ✅ Rastreabilidade de decisões

---

## Missão: Fechar Sistema de Notificações

**Status atual:**
- ✅ 6 etapas implementadas
- ✅ Testes E2E passando
- ✅ Commits organizados

**Pendente:**
- ⬜ Auto-revisão
- ⬜ Atualizar artefatos
- ⬜ Abrir PR profissional

---

## Auto-Revisão: Checklist de Qualidade

### Por Que Auto-Revisar Antes de Abrir PR

**Sem auto-revisão:**

```
Kássia abre PR → Tech Lead aponta 5 problemas → PR volta

Problemas encontrados:
- Variável "tipo_notificacao" (português, padrão é inglês)
- Faltou docstring em método privado
- Teste com assertion comentada (esqueceu de remover)
- Import não usado (cleanup faltando)
- Magic number "10" sem constante

Tempo perdido: 30min reviewers + 20min Kássia corrigindo
```

---

**Com auto-revisão:**

```
Kássia roda checklist ANTES de abrir PR → encontra os 5 problemas
Corrige em 15min
Abre PR limpo → aprovado na primeira
```

**Benefício:** economia de ~30min + reputação profissional.

---

### Checklist de Auto-Revisão (Usar Antes de PR)

#### 1. Clareza e Coesão

```
[ ] Nomes de variáveis/funções são descritivos?
    ✅ send_notification()
    ❌ send()

[ ] Código segue idioma da base de código (inglês ou português)?
    ✅ notification_type
    ❌ tipo_notificacao (se base é inglês)

[ ] Funções têm responsabilidade única?
    ✅ send_notification() → envia notificação
    ❌ send_notification() → envia + envia email + salva log (fazer 3 coisas)

[ ] Condicionais complexas foram extraídas para métodos nomeados?
    ✅ if self._user_has_optin_enabled(user):
    ❌ if user and user.notifications_enabled and not user.deleted:
```

---

#### 2. Aderência a Padrões

```
[ ] Todos métodos públicos têm docstrings?
    Formato: """Descrição.\n\nArgs:\n    ...\n\nReturns:\n    ...\n\nRaises:\n    ..."""

[ ] Type hints em todos parâmetros e retornos?
    ✅ def send(user_id: int) -> Notification:
    ❌ def send(user_id):

[ ] Imports organizados (padrão: stdlib → third-party → local)?
    ✅ import os
        import requests
        from models.user import User
    
    ❌ from models.user import User
        import os
        import requests

[ ] Constantes extraídas (sem magic numbers)?
    ✅ DAILY_LIMIT = 10
        if count >= DAILY_LIMIT:
    
    ❌ if count >= 10:
```

---

#### 3. Cobertura de Testes

```
[ ] Cobertura mínima atingida (ex: 80%)?
    pytest --cov=services --cov-report=term-missing

[ ] Testes cobrem:
    [ ] Caminho feliz (sucesso)
    [ ] Validações de entrada (tipo inválido)
    [ ] Regras de negócio (opt-in, limite)
    [ ] Casos de borda (exatamente 10 notificações)
    [ ] Erros externos (OneSignal API down)

[ ] Nomes de teste são descritivos?
    ✅ test_send_notification_raises_exception_when_optin_disabled
    ❌ test_send_2
```

---

#### 4. Limpeza e Manutenibilidade

```
[ ] Código comentado foi removido?
    ❌ # notification.sent_at = datetime.now()  # OLD
    ✅ (removido completamente)

[ ] TODOs foram resolvidos ou documentados?
    ❌ # TODO: implementar retry
    ✅ # TODO(bruno, 2026-02-20): implementar retry após spike OneSignal (#456)

[ ] Logs sensíveis foram removidos?
    ❌ logger.debug(f"API Key: {api_key}")
    ✅ logger.debug(f"Calling OneSignal API")

[ ] Imports não usados foram removidos?
    pytest --pylint (ou ruff check)
```

---

### Usando Agente Reviewer (Se Disponível)

**Kássia no Chat:**

```
@reviewer

Revise código de services/notification_service.py

Checklist:
- Clareza de nomes
- Docstrings completas
- Type hints
- Tratamento de erros
- Consistência com padrão do projeto
```

**@reviewer responde:**

```markdown
## Revisão: services/notification_service.py

### ✅ Pontos Fortes
- Docstrings completas e claras
- Validações bem estruturadas
- Exceções customizadas apropriadas

### ⚠️ Sugestões

**1. Magic number (linha 15)**
```python
# Antes:
if count >= 10:

# Sugestão:
DAILY_LIMIT = 10
if count >= DAILY_LIMIT:
```

**2. Method privado sem docstring (linha 45)**
```python
# Antes:
def _get_player_id(self, user_id):
    ...

# Sugestão (adicionar docstring):
def _get_player_id(self, user_id: int) -> str:
    """Busca player_id do OneSignal associado ao usuário."""
    ...
```

**3. Logging poderia incluir mais contexto (linha 67)**
```python
# Antes:
logger.error("Failed to send push")

# Sugestão:
logger.error("Failed to send push", extra={
    "user_id": user_id,
    "notification_id": notification.id,
    "error": str(e)
})
```

---

**Kássia corrige sugestões antes de abrir PR.**

---

## Atualizar Artefatos de Contexto

### Quando Atualizar Cada Artefato

| Artefato                         | Quando Atualizar                                          |
|----------------------------------|-----------------------------------------------------------|
| **Pergaminho de Regras**         | Nova regra de negócio foi adicionada ou mudada           |
| **Holocron de API**              | Novo endpoint criado ou contrato de API mudou            |
| **Holocron de Database**         | Nova tabela, campo ou migration significativa            |
| **Mapa de Batalha (Sequence)**   | Fluxo arquitetural mudou (nova integração externa)       |
| **Skills (.github/prompts/)**    | Novo padrão repetitivo surgiu (criar prompt/skill)       |
| **README.md**                    | Novo setup necessário (variável de ambiente, dependência)|

---

### Exemplo 1: Atualizar Pergaminho de Regras

**Antes da feature:**

```markdown
# .github/instructions/regras-negocio.md

## Notificações

_(seção não existia)_
```

---

**Após implementação:**

```markdown
# .github/instructions/regras-negocio.md

## Notificações Push

**Provedor:** OneSignal

**Opt-in obrigatório:**
- Usuário deve explicitamente habilitar em Configurações
- Default ao criar conta: `notifications_enabled = false`
- Endpoint: PATCH /users/{id}/settings

**Limites:**
- Máximo 10 notificações/dia por usuário
- Se exceder: retornar erro 429 (Too Many Requests)
- Contador reseta à meia-noite UTC
- Query: `SELECT COUNT(*) WHERE user_id = X AND created_at >= today_utc_start`

**Tipos de notificação:**
- `like`: alguém curtiu post (prioridade: baixa)
- `comment`: alguém comentou post (prioridade: média)
- `follow`: alguém seguiu usuário (prioridade: média)

**Retenção:**
- Armazenar histórico em `user_notifications` (auditoria)
- Manter por 90 dias
- Cleanup automático via cronjob (todo domingo 03:00 UTC)

**Variáveis de Ambiente:**
- `ONESIGNAL_API_KEY`: API key do OneSignal (obrigatório)
- `ONESIGNAL_APP_ID`: App ID do OneSignal (obrigatório)

**Validações:**
1. Usuário existe (`users.id`)
2. Opt-in habilitado (`users.notifications_enabled = true`)
3. Tipo válido (`like`, `comment`, `follow`)
4. Limite não excedido (<10/dia)

**Códigos de Erro:**
- `NOTIFICATIONS_DISABLED` (403): Opt-in desabilitado
- `NOTIFICATION_LIMIT_EXCEEDED` (429): Excedeu 10/dia
- `INVALID_NOTIFICATION_TYPE` (400): Tipo inválido
- `USER_NOT_FOUND` (404): Usuário não existe
```

**Commit separado:**

```bash
git add .github/instructions/regras-negocio.md
git commit -m "docs: adiciona regras de notificações push no pergaminho"
```

---

### Exemplo 2: Atualizar Holocron de API

**Antes:**

```markdown
# .github/instructions/api.md

## Endpoints Disponíveis

### Users
- GET /users/{id}
- PATCH /users/{id}
- DELETE /users/{id}

### Posts
- GET /posts
- POST /posts
- DELETE /posts/{id}
```

---

**Após implementação:**

```markdown
# .github/instructions/api.md

## Endpoints Disponíveis

### Users
- GET /users/{id}
- PATCH /users/{id}
- DELETE /users/{id}

### Posts
- GET /posts
- POST /posts
- DELETE /posts/{id}

### Notifications *(novo)*
- POST /notifications

**POST /notifications**
```json
Request Body:
{
  "user_id": 123,
  "type": "like|comment|follow",
  "reference_id": "post_456"
}

Response 201:
{
  "id": 789,
  "user_id": 123,
  "type": "like",
  "created_at": "2026-02-16T14:30:00Z",
  "sent_at": "2026-02-16T14:30:01Z"
}

Erros:
- 400: Tipo inválido (INVALID_NOTIFICATION_TYPE)
- 403: Opt-in desabilitado (NOTIFICATIONS_DISABLED)
- 404: Usuário não encontrado (USER_NOT_FOUND)
- 429: Limite excedido (NOTIFICATION_LIMIT_EXCEEDED)
```
```

**Commit separado:**

```bash
git add .github/instructions/api.md
git commit -m "docs: adiciona endpoint POST /notifications no Holocron de API"
```

---

### Exemplo 3: Atualizar README.md (Variáveis de Ambiente)

**Antes:**

```markdown
# README.md

## Variáveis de Ambiente

```bash
export DATABASE_URL="postgresql://..."
export SECRET_KEY="..."
```
```

---

**Após implementação:**

```markdown
# README.md

## Variáveis de Ambiente

```bash
export DATABASE_URL="postgresql://..."
export SECRET_KEY="..."

# Notificações Push (OneSignal)
export ONESIGNAL_API_KEY="your-api-key"       # Obrigatório para enviar notificações
export ONESIGNAL_APP_ID="your-app-id"         # Obrigatório para enviar notificações
```

**Onde encontrar:**
- API Key: OneSignal Dashboard → Settings → Keys & IDs → REST API Key
- App ID: OneSignal Dashboard → Settings → Keys & IDs → OneSignal App ID
```

**Commit separado:**

```bash
git add README.md
git commit -m "docs: adiciona variáveis de ambiente do OneSignal no README"
```

---

## Abrir PR Profissional

### Template de PR (Estrutura Mínima)

```markdown
# feat: implementa sistema de notificações push

## Contexto

Implementa sistema de notificações push via OneSignal conforme requisito #234.

Usuários podem receber notificações quando:
- Alguém curtir seu post (tipo: `like`)
- Alguém comentar seu post (tipo: `comment`)
- Alguém seguir o usuário (tipo: `follow`)

**Briefing:** docs/briefings/notification-system-briefing.md  
**Plano técnico:** docs/planos/notification-system-plan.md  
**Sequence diagram:** static/diagramas/fluxo-notificacoes.wsd

---

## Impacto Técnico

### Novos Componentes

- **Model:** `models/notification.py`
  - Tabela `user_notifications`
  - Índice composto: `(user_id, created_at)`
  
- **Service:** `services/notification_service.py`
  - Validações: opt-in, limite, tipo
  - Integração com OneSignal
  
- **API:** `api/v1/endpoints/notifications.py`
  - Endpoint: `POST /notifications`
  - Status codes: 201, 400, 403, 404, 429

### Dependências Adicionadas

- `onesignal-sdk==1.2.0` (cliente OneSignal)
- `tenacity==8.2.3` (retry com exponential backoff)

### Variáveis de Ambiente Novas

- `ONESIGNAL_API_KEY` (obrigatório)
- `ONESIGNAL_APP_ID` (obrigatório)

---

## Evidências de Teste

### Unit Tests

```bash
pytest tests/test_notification_service.py -v

========== 8 passed in 2.34s ==========
```

**Cobertura:**

```bash
pytest --cov=services.notification_service --cov-report=term-missing

services/notification_service.py    150    3    98%
```

### Integration Tests

```bash
pytest tests/integration/test_notifications_e2e.py -v

========== 4 passed in 5.67s ==========
```

### Manual Testing

```bash
# Teste manual com Postman (sucesso)
POST http://localhost:8000/api/v1/notifications
{
  "user_id": 1,
  "type": "like",
  "reference_id": "post_123"
}

Response 201:
{
  "id": 789,
  "user_id": 1,
  "type": "like",
  "sent_at": "2026-02-16T14:30:01Z"
}
```

---

## Breaking Changes

**Nenhum.** Feature é aditiva (não modifica endpoints existentes).

---

## Artefatos Atualizados

- [x] Pergaminho de regras: `.github/instructions/regras-negocio.md`
- [x] Holocron de API: `.github/instructions/api.md`
- [x] README: setup de variáveis de ambiente

---

## Checklist de Qualidade

- [x] Código aderente ao padrão do projeto
- [x] Docstrings completas (métodos públicos)
- [x] Type hints em parâmetros e retornos
- [x] Testes cobrindo 4 cenários (sucesso, validações, regras, edge cases)
- [x] Migration testada (up + down)
- [x] Auto-revisão realizada (checklist de clareza, padrões, testes, limpeza)
- [x] Contexto atualizado (Pergaminho, Holocron, README)

---

## Revisores Sugeridos

- @bruno (Tech Lead - aprovação obrigatória)
- @ana (PO - validação funcional)
- @carlos (Segurança - review de API keys e variáveis de ambiente)

---

**Estimativa de impacto:** baixo risco (feature isolada, testes completos).
```

---

### Comandos para Abrir PR

```bash
# Push da branch
git push origin feature/notifications

# Criar PR via GitHub CLI
gh pr create \
  --title "feat: implementa sistema de notificações push" \
  --body-file .github/pull_request_template.md \
  --assignee kassia \
  --reviewer bruno,ana,carlos \
  --label feature,needs-review

# OU via interface web do GitHub
# (preencher usando template acima)
```

---

## Checklist Final Antes de Merge

### Validações Automáticas (CI/CD)

```yaml
# .github/workflows/ci.yml (exemplo)

name: CI

on: [pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run tests
        run: pytest --cov --cov-fail-under=80
      
      - name: Lint
        run: ruff check .
      
      - name: Type check
        run: mypy services/
```

**PR só pode ser mergeado se:**

- [ ] ✅ Testes passando (CI verde)
- [ ] ✅ Cobertura mínima (80%)
- [ ] ✅ Lint sem erros
- [ ] ✅ Type check sem erros

---

### Validações Manuais (Reviewer)

**Reviewer (Bruno) valida:**

- [ ] ✅ Código aderente ao padrão do projeto
- [ ] ✅ Testes cobrem cenários críticos
- [ ] ✅ Contexto atualizado (Holocrons, Pergaminhos)
- [ ] ✅ PR tem contexto completo (não só "implementei X")
- [ ] ✅ Breaking changes documentadas (se houver)
- [ ] ✅ Variáveis de ambiente documentadas
- [ ] ✅ Migration testada (up + down)

---

## Easter Egg: Luke e os Testes

**História real do time:**

Luke (o cachorro do escritório) derrubou cabo de rede quando o time tentou fazer merge de PR sem rodar testes.

**Resultado:** deploy falhou, produção ficou instável por 10 minutos.

**Lição:** Luke aplicou justiça caninha.

**Desde então:** regra sagrada do time:

```
NUNCA fazer merge sem:
1. CI verde ✅
2. Testes locais passando ✅
3. Auto-revisão com checklist ✅

Luke está de olho. 🐕
```

---

## Comparação: PR Ruim vs PR Bom

### PR Ruim (Exemplo Real)

```markdown
# feat: notificações

implementei notificações

---

Arquivos modificados: 15
Linhas: +823, -12

Commits:
- implementa notificações
- fix
- fix 2
- ajuste
- corrige teste
```

**Problemas:**

- ❌ Sem contexto (por que foi feito?)
- ❌ Sem impacto técnico (o que mudou?)
- ❌ Sem evidências de teste
- ❌ Commits desorganizados ("fix", "fix 2")
- ❌ Sem documentação de variáveis de ambiente

**Resultado:** reviewer precisa deduzir tudo sozinho (demora 2x mais).

---

### PR Bom (Exemplo Real)

```markdown
# feat: implementa sistema de notificações push

## Contexto
[Explicação clara do requisito + links para briefing/plano]

## Impacto Técnico
[Novos componentes, dependências, variáveis de ambiente]

## Evidências de Teste
[Output de pytest, cobertura, testes manuais]

## Breaking Changes
[Nenhum OU lista clara]

## Artefatos Atualizados
[Pergaminho, Holocron, README]

## Checklist de Qualidade
[Todos itens validados]

---

Arquivos modificados: 15
Linhas: +823, -12

Commits (organizados por etapa):
- feat: adiciona model Notification e migration
- feat: implementa NotificationService com validações
- feat: adiciona cliente OneSignal com retry
- feat: integra NotificationService com OneSignal
- feat: adiciona endpoint POST /notifications
- test: adiciona testes E2E de notificações
- docs: atualiza Pergaminho e Holocron de API
```

**Benefícios:**

- ✅ Reviewer entende contexto imediatamente
- ✅ Impacto técnico é transparente
- ✅ Evidências de qualidade estão visíveis
- ✅ Commits contam história linear
- ✅ Artefatos de contexto foram atualizados

**Resultado:** aprovado em 20min (vs 1h+ do PR ruim).

---

## Troubleshooting

### 💡 Problema: CI falha mas localmente passa

**Sintoma:**

```
Local:
pytest → ✅ 100% passing

CI (GitHub Actions):
pytest → ❌ 3 failed
```

**Causas comuns:**

1. **Timezone diferente**

```python
# Local: America/Sao_Paulo
# CI: UTC

# Solução: forçar UTC explicitamente
datetime.utcnow()  # NÃO datetime.now()
```

2. **Dependência faltando em requirements.txt**

```bash
# Local: você instalou manualmente
pip install tenacity

# CI: não tem tenacity em requirements.txt

# Solução:
pip freeze > requirements.txt
git add requirements.txt
```

3. **Variável de ambiente não configurada no CI**

```yaml
# .github/workflows/ci.yml (adicionar)

jobs:
  test:
    env:
      ONESIGNAL_API_KEY: "test-key"
      ONESIGNAL_APP_ID: "test-app"
```

---

### 💡 Problema: Esqueci de atualizar Pergaminho

**Sintoma:**

```
PR já aberto → reviewer comenta:
"Cadê a atualização do Pergaminho?"
```

**Solução:**

**Adicionar commit no PR existente:**

```bash
# Atualizar Pergaminho
vim .github/instructions/regras-negocio.md

# Commitar
git add .github/instructions/regras-negocio.md
git commit -m "docs: adiciona regras de notificações no Pergaminho"

# Push (PR atualiza automaticamente)
git push origin feature/notifications
```

**Moral:** não tem problema adicionar commits após PR aberto.

---

### 💡 Problema: PR ficou grande demais (20+ arquivos)

**Sintoma:**

```
PR modificou:
- 15 arquivos de código
- 8 arquivos de teste
- 5 arquivos de documentação
- 3 migrations

Total: 31 arquivos, 1200+ linhas

Reviewer: "Este PR está muito grande, difícil revisar"
```

**Solução:**

**Quebrar em PRs menores (próximas features):**

- [ ] PR 1: Infraestrutura (model + migration)
- [ ] PR 2: Service + testes
- [ ] PR 3: Integração OneSignal
- [ ] PR 4: Endpoint + testes E2E
- [ ] PR 5: Documentação

**Para este PR atual:** se já está aberto, pedir para reviewer focar em partes críticas primeiro.

**Lição:** planejar PRs pequenos desde o início.

---

## Exercício Prático

**Missão:** Fazer fechamento completo da feature implementada na Lição 25.

**Tempo estimado:** 40min

---

**Critério de sucesso:**

- [ ] Realizou auto-revisão com checklist (clareza, padrões, testes, limpeza)
- [ ] Corrigiu ao menos 2 pontos identificados na auto-revisão
- [ ] Atualizou ao menos 2 artefatos (Pergaminho, Holocron, README, etc.)
- [ ] Commits de documentação separados de commits de código
- [ ] Abriu PR usando template profissional
- [ ] PR contém: contexto, impacto técnico, evidências de teste, artefatos atualizados
- [ ] CI passou (testes + lint + cobertura)
- [ ] PR foi aprovado (ou simulou aprovação se trabalhando sozinho)

---

## Recursos Externos

- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub PR Templates](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/creating-a-pull-request-template-for-your-repository)
- [Code Review Best Practices](https://google.github.io/eng-practices/review/)

---

## Checklist de Validação

Você está pronto para a próxima aula (Epílogo) se:

- [ ] Sabe o que é "Retorno à Base" (fechamento profissional com auto-revisão + atualização de contexto)
- [ ] Conhece checklist de auto-revisão (clareza, padrões, testes, limpeza)
- [ ] Entende quando atualizar cada artefato (Pergaminho, Holocron, Mapa, README)
- [ ] Sabe estruturar PR profissional (contexto, impacto, evidências, breaking changes)
- [ ] Diferencia PR ruim vs bom (contexto ausente vs completo)
- [ ] Identifica causas de CI falhando quando local passa (timezone, dependências, env vars)
- [ ] Consegue fazer fechamento completo antes de abrir PR (evita idas-e-vindas)
- [ ] Lembra da história do Luke (nunca merge sem testes 🐕)

:::tip 🏆 Treinamento Jedi Completo
Você fecha missões com excelência profissional: auto-revisão criteriosa, artefatos de contexto atualizados, PRs com rastreabilidade completa e evidências de qualidade. Elimina retrabalho, ganha reputação de código revisável e mantém base do projeto consistente para próximos Jedis.

Luke aprova. 🐕✅
:::
