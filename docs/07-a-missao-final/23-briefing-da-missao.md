---
title: 23 - Briefing da Missão
sidebar_position: 23
description: Preparação de contexto para implementar uma feature com consistência.
---

**Duração estimada:** ~30 min

## Vídeo introdutório

<video controls width="100%" preload="metadata">
	<source src="/copilot-na-pratica/videos/23-briefing-da-missao.mp4" type="video/mp4" />
	Seu navegador não suporta vídeo HTML5.
</video>

## O Problema Real: Implementar Sem Contexto = Retrabalho Certo

Kássia recebe tarefa: **"Implementar sistema de notificações"**.

**Sem briefing:**

```
Kássia abre VS Code → começa a codar

30 minutos depois:
- Criou endpoint POST /notifications
- Salvou em tabela "notifications"
- Retorna 200 OK
- Envia email via SendGrid

PR aberto → Tech Lead revisa:

❌ "Notificação deve ser push, não email"
❌ "Tabela deve se chamar user_notifications, não notifications"
❌ "Precisa validar se usuário aceitou receber notificações"
❌ "Retorne 201, não 200"
❌ "Faltou atualizar pergaminho de regras de negócio"

Resultado: 2h de trabalho perdidas, precisa refazer do zero
```

---

**Com briefing:**

```
Kássia ANTES de codar:

1. Lê Pergaminho de regras de negócio:
   - Notificações são push (OneSignal)
   - Tabela: user_notifications
   - Validar opt-in do usuário
   - Limite: 10 notificações/dia por usuário

2. Consulta padrão de API (api.md):
   - POST retorna 201 Created
   - Validação Pydantic obrigatória

3. Verifica arquivos afetados:
   - models/user.py (já tem campo notifications_enabled)
   - services/notification_service.py (não existe, vai criar)

4. Define critérios de teste:
   - Enviar notificação com opt-in = sucesso
   - Enviar com opt-in = false → erro 403
   - Enviar 11ª notificação do dia → erro 429

AGORA implementa (com contexto claro)

PR aberto → aprovado na primeira revisão ✅
```

**Diferença:** 2h perdidas vs 15min de briefing + implementação certa na primeira.

---

## O Que É Briefing (Versão Prática)

**Briefing:** alinhamento inicial de objetivos, restrições e critérios **antes** da execução.

**Não é:**
- ❌ Ler requisito superficialmente
- ❌ "Entendi, já sei o que fazer"
- ❌ Começar a codar e descobrir detalhes durante

**É:**
- ✅ Coletar TODAS as regras relevantes
- ✅ Validar ambiguidades ANTES de codar
- ✅ Fechar escopo (o que entra e o que NÃO entra)
- ✅ Definir critérios objetivos de sucesso

---

## Missão: Sistema de Notificações Push

**Requisito recebido (Product Owner):**

```
Como usuário, quero receber notificações push quando:
- Alguém curtir meu post
- Alguém comentar no meu post
- Alguém me seguir

Devo poder habilitar/desabilitar notificações nas configurações.
```

**Problema:** requisito superficial, cheio de ambiguidades.

---

## Checklist de Contexto Antes de Codar

### 1. Pergaminho de Regra Funcional

**Onde encontrar:** `.github/instructions/regras-negocio.md`

**O que procurar:**

```markdown
# Buscar no pergaminho:
- "notificações"
- "push"
- "opt-in"
- "limites"
```

**Exemplo de regra encontrada:**

```markdown
## Notificações Push

**Provedor:** OneSignal (não usar email)

**Opt-in obrigatório:**
- Usuário deve explicitamente habilitar em Configurações
- Default ao criar conta: `notifications_enabled = false`

**Limites:**
- Máximo 10 notificações/dia por usuário
- Se exceder: retornar erro 429 (Too Many Requests)
- Contador reseta à meia-noite UTC

**Tipos de notificação:**
- `like`: alguém curtiu post (prioridade: baixa)
- `comment`: alguém comentou post (prioridade: média)
- `follow`: alguém seguiu usuário (prioridade: média)

**Retenção:**
- Armazenar histórico em `user_notifications` (auditoria)
- Manter por 90 dias
```

**Ambiguidades resolvidas:**

| Ambiguidade Original                | Resposta no Pergaminho                |
|-------------------------------------|---------------------------------------|
| Notificação = push ou email?        | Push (OneSignal), não email           |
| Usuário recebe por default?         | Não, precisa habilitar                |
| Tem limite de notificações?         | Sim, 10/dia                           |
| Onde salvar histórico?              | Tabela `user_notifications`           |

---

### 2. Arquivos de Domínio Afetados

**Listar arquivos relacionados:**

```bash
# Buscar arquivos que mencionam "notification"
grep -r "notification" --include="*.py" .

# Resultado:
models/user.py:32:    notifications_enabled: bool = False
services/email_service.py:15:    # OLD: send_notification via email
```

**Análise:**

| Arquivo                  | O Que Já Existe                           | O Que Precisa Mudar               |
|--------------------------|-------------------------------------------|-----------------------------------|
| `models/user.py`         | Campo `notifications_enabled` (boolean)   | ✅ Já pronto, só usar              |
| `services/email_service.py` | Método antigo `send_notification` (email) | ⚠️ NÃO usar, criar novo serviço    |

**Conclusão:** precisa criar:
- `models/notification.py` (nova tabela `user_notifications`)
- `services/push_notification_service.py` (integração OneSignal)
- `api/v1/endpoints/notifications.py` (endpoint POST)

---

### 3. Diff de Mudanças Relacionadas

**Verificar PRs recentes sobre notificações:**

```bash
# Buscar PRs mergeados recentemente
git log --oneline --grep="notification" --since="1 month ago"

# Resultado:
a3f8c2d feat: adiciona campo notifications_enabled no User (#234)
```

**Ler diff do PR relevante:**

```bash
git show a3f8c2d
```

```python
# models/user.py (diff)
class User(Base):
    __tablename__ = "users"
    
    id: int
    name: str
    email: str
+   notifications_enabled: bool = False  # Novo campo adicionado
```

**Insight:** infraestrutura de opt-in já existe, não precisa criar.

---

### 4. Padrão de Erro e Validação do Projeto

**Onde encontrar:** `.github/instructions/api.md`

**Padrão de erros:**

```python
# Estrutura de erro padrão do projeto
{
  "detail": "Mensagem descritiva do erro",
  "error_code": "NOTIFICATION_LIMIT_EXCEEDED",
  "timestamp": "2026-02-16T14:30:00Z"
}
```

**Status codes esperados:**

| Situação                              | Status Code | Error Code                  |
|---------------------------------------|-------------|-----------------------------|
| Sucesso ao enviar                     | 201         | -                           |
| Usuário não habilitou notificações    | 403         | NOTIFICATIONS_DISABLED      |
| Limite de 10/dia excedido             | 429         | NOTIFICATION_LIMIT_EXCEEDED |
| Tipo de notificação inválido          | 400         | INVALID_NOTIFICATION_TYPE   |
| Usuário não encontrado                | 404         | USER_NOT_FOUND              |

---

### 5. Critérios Mínimos de Teste

**Onde encontrar:** `.github/instructions/testing.md`

**Padrão de testes do projeto:**

```python
# Estrutura de teste esperada
def test_success_case():
    """Testa caminho feliz"""

def test_validation_error():
    """Testa validação de entrada"""

def test_business_rule():
    """Testa regra de negócio específica"""

def test_edge_case():
    """Testa caso limite"""
```

**Critérios mínimos para feature de notificações:**

- [ ] **Sucesso:** enviar notificação com opt-in habilitado
- [ ] **Validação:** rejeitar tipo de notificação inválido (ex: "spam")
- [ ] **Regra de negócio 1:** bloquear se `notifications_enabled = false`
- [ ] **Regra de negócio 2:** bloquear se já enviou 10 notificações hoje
- [ ] **Edge case:** contador reseta corretamente à meia-noite UTC

---

## Risco de Pular Briefing

### Consequências Mensuráveis

**Sem briefing adequado:**

| Problema                            | Impacto                             | Frequência |
|-------------------------------------|-------------------------------------|------------|
| Implementação errada (email vs push)| Refazer do zero (2h perdidas)       | 40%        |
| Não validar opt-in                  | Bug em produção (impacto no usuário)| 25%        |
| Não respeitar limites               | Spam de notificações (reclamações)  | 15%        |
| Schema de tabela errado             | Migration + correção de dados       | 20%        |

**Custo médio:** 3-5 horas de retrabalho por feature média.

---

**Com briefing completo:**

| Benefício                           | Impacto                             |
|-------------------------------------|-------------------------------------|
| Implementação certa na primeira     | 0 retrabalho                        |
| Regras validadas antes de codar     | 0 bugs de negócio                   |
| Escopo fechado                      | PR aprovado em 1ª revisão           |
| Testes definidos antecipadamente    | Cobertura completa desde o início   |

**Economia:** ~4h/feature em média.

---

## Saída Esperada do Briefing

**Template de documento de briefing:**

```markdown
# Briefing: Sistema de Notificações Push

**Data:** 2026-02-16  
**Responsável:** Kássia Oliveira  
**Revisor:** Bruno (Tech Lead)

---

## 1. Escopo Fechado

### O Que ENTRA Nesta Feature

- [ ] Endpoint POST /notifications para enviar notificação
- [ ] Integração com OneSignal (push provider)
- [ ] Validação de opt-in (`notifications_enabled`)
- [ ] Validação de limite (10 notificações/dia)
- [ ] Persistência em tabela `user_notifications`
- [ ] 3 tipos: like, comment, follow

### O Que NÃO ENTRA (fica para depois)

- ❌ Notificações por email (já descartado)
- ❌ Notificações agendadas (feature futura)
- ❌ Configuração granular (habilitar só "like", só "comment", etc.)
- ❌ Histórico de notificações no app (consulta fica para próximo sprint)

---

## 2. Regras Explícitas

### Regra 1: Opt-in Obrigatório

```
SE user.notifications_enabled = false
ENTÃO retornar 403 Forbidden
COM error_code = "NOTIFICATIONS_DISABLED"
```

### Regra 2: Limite de 10/dia

```
SE usuário já recebeu 10 notificações hoje
ENTÃO retornar 429 Too Many Requests
COM error_code = "NOTIFICATION_LIMIT_EXCEEDED"
```

### Regra 3: Tipos Válidos

```
Tipos aceitos: ["like", "comment", "follow"]

SE tipo não está na lista
ENTÃO retornar 400 Bad Request
COM error_code = "INVALID_NOTIFICATION_TYPE"
```

---

## 3. Pontos de Validação Definidos

### Validação Técnica

- [ ] Endpoint criado em `api/v1/endpoints/notifications.py`
- [ ] Service criado: `services/push_notification_service.py`
- [ ] Model criado: `models/notification.py`
- [ ] Migration criada para tabela `user_notifications`

### Validação Funcional

- [ ] Enviar notificação com opt-in ativado → sucesso 201
- [ ] Enviar com opt-in desativado → erro 403
- [ ] Enviar 11ª notificação → erro 429
- [ ] Tipo inválido → erro 400

### Validação de Padrão

- [ ] Usa Pydantic models (padrão FastAPI)
- [ ] Status codes corretos (201/400/403/429)
- [ ] Error codes padronizados
- [ ] Testes cobrem 4 cenários mínimos

---

## 4. Arquivos Afetados

| Arquivo                                  | Ação         |
|------------------------------------------|--------------|
| `models/notification.py`                 | CRIAR        |
| `services/push_notification_service.py`  | CRIAR        |
| `api/v1/endpoints/notifications.py`      | CRIAR        |
| `alembic/versions/004_notifications.py`  | CRIAR        |
| `tests/test_notifications.py`            | CRIAR        |
| `.github/instructions/regras-negocio.md` | ATUALIZAR    |

---

## 5. Riscos Identificados

| Risco                                  | Probabilidade | Impacto | Mitigação                          |
|----------------------------------------|---------------|---------|-------------------------------------|
| OneSignal API down                     | Baixa         | Alto    | Implementar retry + fallback log    |
| Contador de limite não reseta UTC      | Média         | Médio   | Testar especificamente timezone UTC |
| Performance com 1M+ users              | Média         | Alto    | Índice em `user_id, created_at`     |

---

## 6. Critérios de Aceite

### Mínimo para Aprovar PR

- [ ] Código aderente ao padrão (FastAPI + Pydantic)
- [ ] 4 testes implementados e passando
- [ ] Pergaminho de regras atualizado
- [ ] Migration testada (up + down)
- [ ] Documentação inline (docstrings)

---

**Aprovação:**

- [ ] Dev (Kássia): ___________  
- [ ] Tech Lead (Bruno): ___________  
- [ ] PO (Ana): ___________
```

---

## Exemplo Completo: Briefing Passo-a-Passo

### Passo 1: Receber Requisito

```
PO (Ana): "Kássia, preciso que você implemente notificações push. 
Usuários devem receber quando alguém curtir ou comentar seus posts."
```

---

### Passo 2: Ler Pergaminho de Regras

```
Kássia abre: .github/instructions/regras-negocio.md

Busca por: "notificações"

Encontra seção completa com:
- Provedor (OneSignal)
- Opt-in obrigatório
- Limites (10/dia)
- Tipos válidos
```

**Kássia anota no briefing:** provedor, limites, opt-in.

---

### Passo 3: Consultar Copilot com Holocrons

```
Kássia no Chat:

"Preciso implementar notificações push. 
Consulte regras-negocio.md e me diga:
1. Qual provedor usar?
2. Tem algum limite de envio?
3. Precisa validar opt-in?"

Copilot (lê Holocron):
"1. OneSignal (não email)
2. Sim, máximo 10 notificações/dia por usuário
3. Sim, verificar campo notifications_enabled no User"
```

**Kássia valida:** contexto está correto.

---

### Passo 4: Mapear Arquivos Afetados

```bash
grep -r "notification" --include="*.py" .

# Vê que models/user.py já tem campo notifications_enabled
# Vê que não existe serviço de push ainda
```

**Kássia anota:** precisa criar service novo, model novo, endpoint novo.

---

### Passo 5: Definir Escopo (O Que Entra/Não Entra)

```
Kássia pergunta para PO:

"Ana, notificações por email entram nesta feature?"

Ana: "Não, só push por enquanto."

"E configuração granular (habilitar só likes, mas não comments)?"

Ana: "Não, fica para v2. Por enquanto é tudo ou nada."
```

**Kássia anota no briefing:** email NÃO entra, configuração granular NÃO entra.

---

### Passo 6: Definir Critérios de Teste

```
Kássia consulta: .github/instructions/testing.md

Vê padrão de 4 tipos de teste:
- Sucesso
- Validação
- Regra de negócio
- Edge case
```

**Kássia define testes mínimos:**

1. Sucesso: enviar com opt-in ativo
2. Validação: tipo inválido → 400
3. Regra: opt-in desativado → 403
4. Regra: limite excedido → 429

---

### Passo 7: Validar Briefing com Tech Lead

```
Kássia compartilha documento de briefing com Bruno

Bruno revisa:
✅ Escopo está claro
✅ Regras estão explícitas
✅ Critérios de teste cobrem casos críticos
⚠️ Sugestão: adicionar índice em user_id + created_at para performance

Kássia ajusta briefing → aprovado
```

---

### Passo 8: Commitar Briefing

```bash
git add docs/briefings/notification-system-briefing.md
git commit -m "docs: adiciona briefing de sistema de notificações"
git push
```

**Briefing versionado = auditável.**

---

## Troubleshooting

### 💡 Problema: Briefing demora muito (>1h)

**Sintoma:** tentativa de cobrir TODOS os detalhes antes de começar.

**Solução:**

**Briefing não é especificação completa.** É coleta de contexto crítico.

**Tempo ideal:**
- Feature pequena: 15-30min
- Feature média: 30-45min
- Feature grande: 1h (se passar, quebrar em features menores)

**Regra prática:** se briefing leva >1h, escopo está grande demais.

---

### 💡 Problema: Pergaminho não tem a regra

**Sintoma:**

```
Kássia busca "notificações" em regras-negocio.md → não encontra nada
```

**Solução:**

**1. Perguntar ao PO:**
```
"Ana, não achei regra de notificações documentada. 
Você sabe onde está ou preciso que você especifique?"
```

**2. PO especifica:**
```
Ana documenta regra durante reunião de alinhamento
```

**3. Atualizar Pergaminho:**
```
Kássia adiciona regra em regras-negocio.md
Commita ANTES de implementar
```

**Moral:** se regra não existe, **pare e documente** antes de codar.

---

### 💡 Problema: Escopo muda durante implementação

**Sintoma:**

```
Dia 1: Kássia implementa notificações push

Dia 2: PO pede: "adiciona notificações por email também"
```

**Solução:**

**Não adicionar escopo ad-hoc.**

```
Kássia: "Ana, briefing fechou escopo como 'só push'. 
Email seria feature separada. Posso fazer no próximo sprint?"

Ana: "Ok, vamos criar card separado"
```

**Regra:** escopo fechado no briefing = imutável durante implementação.

---

## Exercício Prático

**Missão:** Fazer briefing de feature real do seu projeto.

**Tempo estimado:** 30-45min

---

**Passo 1: Escolher Feature (5min)**

Escolha tarefa pequena-média:
- ✅ Criar endpoint REST
- ✅ Implementar validação
- ✅ Adicionar campo no banco
- ❌ Refatoração complexa (muito amplo)

---

**Passo 2: Ler Pergaminho (10min)**

```bash
# Buscar regras relacionadas
grep -r "palavra-chave" .github/instructions/regras-negocio.md
```

Anotar:
- Regras existentes
- Limites/validações
- Exceções

---

**Passo 3: Mapear Arquivos Afetados (10min)**

```bash
# Buscar arquivos relacionados
grep -r "palavra-chave" --include="*.py" .
```

Identificar:
- O que já existe (reusar)
- O que precisa criar
- O que precisa modificar

---

**Passo 4: Definir Escopo (10min)**

Preencher:

```
O Que ENTRA:
-
-
-

O Que NÃO ENTRA:
-
-
-
```

---

**Passo 5: Criar Documento de Briefing (5min)**

Use template da seção "Saída Esperada do Briefing".

Commitar em `docs/briefings/nome-da-feature.md`.

---

**Critério de sucesso:**

- [ ] Pergaminho consultado
- [ ] Arquivos afetados mapeados
- [ ] Escopo fechado (entra/não entra)
- [ ] Critérios de teste definidos (mínimo 3)
- [ ] Documento de briefing criado e versionado
- [ ] Validado com tech lead ou par

---

## Recursos Externos

- [Shape Up: Set Boundaries](https://basecamp.com/shapeup/1.1-chapter-02#set-boundaries)
- [Working Backwards (Amazon)](https://www.amazon.jobs/en/principles)

---

## Checklist de Validação

Você está pronto para a próxima aula se:

- [ ] Sabe o que é briefing (alinhamento inicial antes de codar, não durante)
- [ ] Conhece os 5 itens do checklist de contexto (Pergaminho, arquivos afetados, diff, padrão de erro, critérios de teste)
- [ ] Consegue fechar escopo (o que entra vs não entra)
- [ ] Sabe definir critérios objetivos de validação
- [ ] Entende risco de pular briefing (3-5h de retrabalho por feature)
- [ ] Consegue criar documento de briefing usando template
- [ ] Sabe quando parar e documentar regra antes de implementar

:::tip 🏆 Treinamento Jedi Completo
Você prepara contexto completo antes do combate, reduzindo ambiguidade e retrabalho na implementação. Escopo fechado, regras explícitas e pontos de validação definidos garantem implementação certa na primeira tentativa.
:::
