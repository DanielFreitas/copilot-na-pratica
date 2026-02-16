---
title: 25 - A Batalha
sidebar_position: 25
description: Executar implementação orquestrando todos os recursos aprendidos.
---

**Duração estimada:** ~60 min

## Vídeo introdutório

<video controls width="100%" preload="metadata">
	<source src="/copilot-na-pratica/videos/25-a-batalha.mp4" type="video/mp4" />
	Seu navegador não suporta vídeo HTML5.
</video>

## O Problema Real: Implementar Sem Orquestração = Caos

Kássia tem:
- ✅ Briefing completo (contexto claro)
- ✅ Plano técnico (6 etapas definidas)

**Mas durante implementação:**

```
10:00 - Começa Etapa 1 (model)
         Esquece de consultar padrão do projeto

10:15 - Cria model diferente do padrão
         Tech Lead aponta em revisão (refazer)

10:30 - Etapa 2 (service)
         Não usa skill de validação (escreve manualmente)
         Testes falham (lógica errada)

11:00 - Etapa 3 (OneSignal)
         Não consulta Droid de documentação
         Usa endpoint errado da API

11:30 - Tudo funcionando, mas:
         - Código fora do padrão
         - Testes faltando cobertura
         - Sem rastreabilidade de decisões
```

**Resultado:** feature funciona, mas inconsistente com projeto.

---

**Com orquestração (agentes + prompts + skills + droids):**

```
10:00 - Etapa 1 (model)
         @architect consulta padrão
         Usa skill: python-model-generator
         Valida com Droid de DB schema
         → Model correto na primeira ✅

10:15 - Etapa 2 (service)
         Usa prompt: validate-business-rules.md
         Skill: python-unit-test-generator
         → Service + testes completos ✅

10:30 - Etapa 3 (OneSignal)
         Droid consulta docs do OneSignal
         Usa endpoint correto
         → Integração funciona ✅

10:45 - PR aberto:
         - Código aderente ao padrão
         - Testes completos
         - Decisões documentadas
```

**Diferença:** inconsistente vs padronizado + rastreável.

---

## O Que É "A Batalha" (Versão Prática)

**A Batalha:** fase de execução onde você **implementa o plano** usando **todas as ferramentas** de forma coordenada.

**Não é:**
- ❌ Codar do zero sem consultar contexto
- ❌ Usar só Copilot inline (autocomplete)
- ❌ "Vou perguntar pro Chat quando travar"

**É:**
- ✅ Alternar agentes conforme fase (@architect → default → @security)
- ✅ Invocar prompts para tarefas repetitivas
- ✅ Executar skills para automação complexa
- ✅ Consultar Droids para validar contexto externo
- ✅ Manter mudanças pequenas e revisáveis

---

## Missão: Implementar Sistema de Notificações

**Plano (6 etapas):**

1. Model + Migration
2. Service (sem OneSignal)
3. Cliente OneSignal
4. Integração Service + OneSignal
5. Endpoint
6. Testes E2E

**Vamos executar cada etapa mostrando quais ferramentas usar.**

---

## Etapa 1: Model + Migration (Architect + Skill)

### 1.1. Consultar Padrão de Model do Projeto

**Kássia no Chat:**

```
@architect 

Preciso criar model Notification.

Consulte padrões em .github/instructions/db-models.md
e mostre estrutura base.
```

**@architect responde:**

```python
# Padrão encontrado em db-models.md

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from models.base import Base

class Notification(Base):
    __tablename__ = "user_notifications"
    
    # Padrão do projeto: sempre id, created_at, updated_at
    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Campos específicos (adicionar conforme briefing)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    type = Column(String(50), nullable=False)  # like, comment, follow
    reference_id = Column(String(100), nullable=False)  # post_123, comment_456
    message = Column(String(500))
    sent_at = Column(DateTime(timezone=True))
    
    # Índices (conforme plano: user_id + created_at)
    __table_args__ = (
        Index('idx_user_notifications_lookup', 'user_id', 'created_at'),
    )
```

**Kássia valida:** ✅ aderente ao padrão do projeto.

---

### 1.2. Gerar Migration com Skill

**Kássia no terminal:**

```bash
# Skill: alembic-migration-generator (criado em Lição 18)
python -m skills.alembic_migration_generator \
  --model models.notification \
  --name add_user_notifications_table
```

**Skill gera:**

```python
# alembic/versions/004_add_user_notifications_table.py

def upgrade():
    op.create_table(
        'user_notifications',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('type', sa.String(length=50), nullable=False),
        sa.Column('reference_id', sa.String(length=100), nullable=False),
        sa.Column('message', sa.String(length=500), nullable=True),
        sa.Column('sent_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_user_notifications_lookup', 'user_notifications', ['user_id', 'created_at'])

def downgrade():
    op.drop_index('idx_user_notifications_lookup', table_name='user_notifications')
    op.drop_table('user_notifications')
```

---

### 1.3. Validar com Droid de Database Schema

**Kássia no Chat (usando Droid PostgreSQL):**

```
Consulte schema do banco via Droid PostgreSQL.

Tabela users tem campo id (integer)?
Tabela users tem índice em id?

(valida se FK user_id -> users.id é válida)
```

**Droid PostgreSQL responde:**

```sql
-- Schema atual da tabela users
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    notifications_enabled BOOLEAN DEFAULT FALSE,
    ...
);
```

**Kássia valida:** ✅ FK para users.id é válida.

---

### 1.4. Rodar Migration

```bash
# Subir migration
alembic upgrade head

# Validar schema criado
psql -U postgres -d app_db -c "\d user_notifications"

# Output esperado:
#   Table "public.user_notifications"
#   Column       | Type          | Modifiers
# ---------------+---------------+-----------
#   id           | integer       | not null
#   user_id      | integer       | not null
#   type         | varchar(50)   | not null
#   ...
```

**Etapa 1 completa:** ✅ model + migration validados.

---

## Etapa 2: Service (Prompt + Skill + Droid)

### 2.1. Criar Service com Prompt Reutilizável

**Kássia usa prompt:** `.github/prompts/create-service.md`

**Conteúdo do prompt:**

```markdown
# Prompt: Criar Service

Crie service seguindo padrão do projeto:

1. Classe em `services/{nome}_service.py`
2. Injetar dependências via construtor
3. Métodos públicos com docstrings
4. Regras de negócio validadas antes de persistir
5. Levantar exceções customizadas (domain/exceptions.py)
6. Logar eventos importantes

## Exemplo de estrutura:

```python
from domain.exceptions import BusinessRuleException

class {Nome}Service:
    def __init__(self, db_session, logger):
        self.db = db_session
        self.logger = logger
    
    def execute_action(self, ...):
        """Docstring descritiva."""
        # Validar regras
        if not self._is_valid(...):
            raise BusinessRuleException("Motivo")
        
        # Persistir
        result = self.db.add(...)
        self.logger.info("Ação executada", extra={...})
        return result
```

**Kássia aplica prompt:**

```
Aplique prompt create-service.md para criar NotificationService.

Validações:
- Opt-in obrigatório (notifications_enabled = true)
- Limite de 10 notificações/dia
- Tipo válido (like, comment, follow)

Método principal: send_notification(user_id, type, reference_id)
```

**Copilot gera (aderente ao prompt):**

```python
# services/notification_service.py

from datetime import datetime, timezone
from domain.exceptions import (
    NotificationsDisabledException,
    NotificationLimitExceededException,
    InvalidNotificationTypeException
)
from models.notification import Notification
from models.user import User

class NotificationService:
    VALID_TYPES = ["like", "comment", "follow"]
    DAILY_LIMIT = 10
    
    def __init__(self, db_session, logger):
        self.db = db_session
        self.logger = logger
    
    def send_notification(self, user_id: int, type: str, reference_id: str) -> Notification:
        """
        Envia notificação push para usuário.
        
        Validações:
        - Usuário deve ter notifications_enabled = True
        - Limite de 10 notificações/dia não deve ser excedido
        - Tipo deve ser válido (like, comment, follow)
        
        Args:
            user_id: ID do usuário destinatário
            type: Tipo de notificação (like, comment, follow)
            reference_id: ID do recurso relacionado (post_123, etc)
        
        Returns:
            Notification: Objeto de notificação criado
        
        Raises:
            NotificationsDisabledException: Se opt-in desabilitado
            NotificationLimitExceededException: Se excedeu 10/dia
            InvalidNotificationTypeException: Se tipo inválido
        """
        # Validação 1: Opt-in
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user or not user.notifications_enabled:
            self.logger.warning(f"Opt-in disabled for user {user_id}")
            raise NotificationsDisabledException(f"User {user_id} has notifications disabled")
        
        # Validação 2: Tipo válido
        if type not in self.VALID_TYPES:
            self.logger.warning(f"Invalid notification type: {type}")
            raise InvalidNotificationTypeException(f"Type must be one of {self.VALID_TYPES}")
        
        # Validação 3: Limite diário
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        count_today = self.db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.created_at >= today_start
        ).count()
        
        if count_today >= self.DAILY_LIMIT:
            self.logger.warning(f"Daily limit exceeded for user {user_id}")
            raise NotificationLimitExceededException(f"User {user_id} exceeded {self.DAILY_LIMIT} notifications/day")
        
        # Persistir (OneSignal integração vem depois)
        notification = Notification(
            user_id=user_id,
            type=type,
            reference_id=reference_id,
            message=self._build_message(type, reference_id),  # TODO: implementar
            sent_at=None  # TODO: preencher após enviar para OneSignal
        )
        
        self.db.add(notification)
        self.db.commit()
        
        self.logger.info(f"Notification created", extra={
            "user_id": user_id,
            "type": type,
            "notification_id": notification.id
        })
        
        return notification
    
    def _build_message(self, type, reference_id):
        """Constrói mensagem amigável baseada no tipo."""
        messages = {
            "like": f"Someone liked your post {reference_id}",
            "comment": f"Someone commented on your post {reference_id}",
            "follow": f"Someone started following you"
        }
        return messages.get(type, "New notification")
```

**Kássia valida:** ✅ aderente ao padrão (docstrings, exceções customizadas, logging).

---

### 2.2. Gerar Testes com Skill

**Kássia usa skill:** `python-unit-test-generator`

```bash
python -m skills.python_unit_test_generator \
  --source services/notification_service.py \
  --test-file tests/test_notification_service.py
```

**Skill gera testes cobrindo:**

```python
# tests/test_notification_service.py

import pytest
from datetime import datetime, timezone
from services.notification_service import NotificationService
from domain.exceptions import (
    NotificationsDisabledException,
    NotificationLimitExceededException,
    InvalidNotificationTypeException
)

class TestNotificationService:
    
    def test_send_notification_success(self, db_session, mock_logger):
        """Testa envio com opt-in habilitado."""
        # Arrange
        user = User(id=1, notifications_enabled=True)
        db_session.add(user)
        db_session.commit()
        
        service = NotificationService(db_session, mock_logger)
        
        # Act
        notification = service.send_notification(user_id=1, type="like", reference_id="post_123")
        
        # Assert
        assert notification.id is not None
        assert notification.user_id == 1
        assert notification.type == "like"
        assert notification.reference_id == "post_123"
    
    def test_send_notification_opt_in_disabled(self, db_session, mock_logger):
        """Testa bloqueio quando opt-in desabilitado."""
        # Arrange
        user = User(id=1, notifications_enabled=False)
        db_session.add(user)
        db_session.commit()
        
        service = NotificationService(db_session, mock_logger)
        
        # Act & Assert
        with pytest.raises(NotificationsDisabledException):
            service.send_notification(user_id=1, type="like", reference_id="post_123")
    
    def test_send_notification_invalid_type(self, db_session, mock_logger):
        """Testa rejeição de tipo inválido."""
        # Arrange
        user = User(id=1, notifications_enabled=True)
        db_session.add(user)
        db_session.commit()
        
        service = NotificationService(db_session, mock_logger)
        
        # Act & Assert
        with pytest.raises(InvalidNotificationTypeException):
            service.send_notification(user_id=1, type="spam", reference_id="post_123")
    
    def test_send_notification_daily_limit_exceeded(self, db_session, mock_logger):
        """Testa bloqueio ao exceder 10 notificações/dia."""
        # Arrange
        user = User(id=1, notifications_enabled=True)
        db_session.add(user)
        
        # Criar 10 notificações hoje
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        for i in range(10):
            notif = Notification(user_id=1, type="like", reference_id=f"post_{i}", created_at=today_start)
            db_session.add(notif)
        db_session.commit()
        
        service = NotificationService(db_session, mock_logger)
        
        # Act & Assert
        with pytest.raises(NotificationLimitExceededException):
            service.send_notification(user_id=1, type="like", reference_id="post_999")
```

**Rodar testes:**

```bash
pytest tests/test_notification_service.py -v

# Output:
# test_send_notification_success PASSED
# test_send_notification_opt_in_disabled PASSED
# test_send_notification_invalid_type PASSED
# test_send_notification_daily_limit_exceeded PASSED
```

**Etapa 2 completa:** ✅ service + testes validados.

---

## Etapa 3: Cliente OneSignal (Droid + Testes)

### 3.1. Consultar Documentação via Droid

**Kássia no Chat:**

```
Use Droid de documentação externa.

Consulte docs do OneSignal REST API:
- Endpoint para enviar notificação
- Headers necessários (API Key)
- Estrutura do body (player_id, contents)
```

**Droid retorna:**

```
OneSignal Send Notification API:

POST https://onesignal.com/api/v1/notifications

Headers:
  Authorization: Basic {REST_API_KEY}
  Content-Type: application/json

Body:
{
  "app_id": "seu-app-id",
  "include_player_ids": ["player-id-do-usuario"],
  "contents": {"en": "Your notification message"}
}

Response 200:
{
  "id": "notification-id",
  "recipients": 1
}
```

**Kássia anota:** endpoint, headers, body esperado.

---

### 3.2. Criar Cliente OneSignal

**Kássia no Chat:**

```
Crie integrations/onesignal_client.py

Baseado na documentação:
- POST https://onesignal.com/api/v1/notifications
- Header Authorization com REST_API_KEY
- Body com app_id, include_player_ids, contents

Adicionar:
- Tratamento de timeout (5s)
- Retry com exponential backoff (3 tentativas)
- Logging de sucesso/erro
```

**Copilot gera:**

```python
# integrations/onesignal_client.py

import requests
from tenacity import retry, stop_after_attempt, wait_exponential
import logging

logger = logging.getLogger(__name__)

class OneSignalClient:
    def __init__(self, api_key: str, app_id: str):
        self.api_key = api_key
        self.app_id = app_id
        self.base_url = "https://onesignal.com/api/v1"
    
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10)
    )
    def send_push(self, player_id: str, message: str) -> dict:
        """
        Envia notificação push via OneSignal.
        
        Args:
            player_id: ID do player no OneSignal
            message: Mensagem da notificação
        
        Returns:
            dict: Resposta da API (id, recipients)
        
        Raises:
            requests.RequestException: Se falha após 3 tentativas
        """
        url = f"{self.base_url}/notifications"
        headers = {
            "Authorization": f"Basic {self.api_key}",
            "Content-Type": "application/json"
        }
        body = {
            "app_id": self.app_id,
            "include_player_ids": [player_id],
            "contents": {"en": message}
        }
        
        try:
            response = requests.post(url, json=body, headers=headers, timeout=5)
            response.raise_for_status()
            
            data = response.json()
            logger.info(f"Push sent successfully", extra={
                "player_id": player_id,
                "notification_id": data.get("id")
            })
            return data
        
        except requests.RequestException as e:
            logger.error(f"Failed to send push", extra={
                "player_id": player_id,
                "error": str(e)
            })
            raise
```

---

### 3.3. Testar Cliente com Mock

```python
# tests/test_onesignal_client.py

import pytest
from unittest.mock import Mock, patch
from integrations.onesignal_client import OneSignalClient

class TestOneSignalClient:
    
    @patch('requests.post')
    def test_send_push_success(self, mock_post):
        """Testa envio bem-sucedido."""
        # Arrange
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"id": "notif-123", "recipients": 1}
        mock_post.return_value = mock_response
        
        client = OneSignalClient(api_key="test-key", app_id="test-app")
        
        # Act
        result = client.send_push(player_id="player-456", message="Test message")
        
        # Assert
        assert result["id"] == "notif-123"
        assert result["recipients"] == 1
        mock_post.assert_called_once()
    
    @patch('requests.post')
    def test_send_push_retries_on_failure(self, mock_post):
        """Testa retry após falha temporária."""
        # Arrange: falha 2x, sucesso na 3ª
        mock_post.side_effect = [
            requests.RequestException("Timeout"),
            requests.RequestException("Timeout"),
            Mock(status_code=200, json=lambda: {"id": "notif-789"})
        ]
        
        client = OneSignalClient(api_key="test-key", app_id="test-app")
        
        # Act
        result = client.send_push(player_id="player-456", message="Test")
        
        # Assert
        assert result["id"] == "notif-789"
        assert mock_post.call_count == 3  # 2 falhas + 1 sucesso
```

**Etapa 3 completa:** ✅ cliente OneSignal + testes validados.

---

## Etapa 4: Integrar Service + OneSignal (Refactor + Teste)

### 4.1. Atualizar Service para Usar Cliente

**Kássia modifica `notification_service.py`:**

```python
# services/notification_service.py (adicionar)

from integrations.onesignal_client import OneSignalClient

class NotificationService:
    def __init__(self, db_session, logger, onesignal_client: OneSignalClient):
        self.db = db_session
        self.logger = logger
        self.onesignal = onesignal_client  # Novo
    
    def send_notification(self, user_id: int, type: str, reference_id: str) -> Notification:
        # ... validações existentes ...
        
        # Persistir ANTES de enviar (para ter notification.id)
        notification = Notification(...)
        self.db.add(notification)
        self.db.commit()
        
        # Enviar para OneSignal (NOVO)
        try:
            player_id = self._get_player_id(user_id)  # Buscar player_id do usuário
            onesignal_response = self.onesignal.send_push(
                player_id=player_id,
                message=notification.message
            )
            
            # Atualizar sent_at após sucesso
            notification.sent_at = datetime.utcnow()
            self.db.commit()
            
            self.logger.info(f"Push sent", extra={
                "notification_id": notification.id,
                "onesignal_id": onesignal_response["id"]
            })
        
        except Exception as e:
            self.logger.error(f"Failed to send push", extra={
                "notification_id": notification.id,
                "error": str(e)
            })
            # Notificação fica com sent_at = NULL (pode retentar depois)
        
        return notification
```

---

### 4.2. Testar Integração

```python
# tests/test_notification_service_integration.py

from unittest.mock import Mock

def test_notification_service_sends_to_onesignal(db_session, mock_logger):
    """Testa que service chama OneSignal ao enviar notificação."""
    # Arrange
    user = User(id=1, notifications_enabled=True, player_id="player-123")
    db_session.add(user)
    db_session.commit()
    
    mock_onesignal = Mock()
    mock_onesignal.send_push.return_value = {"id": "notif-onesignal-456"}
    
    service = NotificationService(db_session, mock_logger, mock_onesignal)
    
    # Act
    notification = service.send_notification(user_id=1, type="like", reference_id="post_123")
    
    # Assert
    mock_onesignal.send_push.assert_called_once_with(
        player_id="player-123",
        message="Someone liked your post post_123"
    )
    assert notification.sent_at is not None  # Preenchido após sucesso
```

**Etapa 4 completa:** ✅ integração validada.

---

## Etapa 5: Endpoint (Padrão FastAPI + Agent)

### 5.1. Criar Schemas Pydantic

```
Crie schemas Pydantic para:

1. NotificationCreate (request body)
   - user_id: int
   - type: str
   - reference_id: str

2. NotificationResponse (response)
   - id: int
   - user_id: int
   - type: str
   - created_at: datetime
   - sent_at: datetime | None
```

**Copilot gera:**

```python
# api/v1/schemas/notification.py

from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class NotificationCreate(BaseModel):
    user_id: int = Field(..., gt=0, description="ID do usuário destinatário")
    type: str = Field(..., description="Tipo de notificação (like, comment, follow)")
    reference_id: str = Field(..., min_length=1, description="ID do recurso relacionado")

class NotificationResponse(BaseModel):
    id: int
    user_id: int
    type: str
    created_at: datetime
    sent_at: Optional[datetime]
    
    class Config:
        orm_mode = True
```

---

### 5.2. Criar Endpoint

```
Crie endpoint POST /api/v1/notifications

Usando:
- FastAPI com dependency injection
- NotificationService
- Schemas Pydantic
- Status code 201 Created
- Tratamento de exceções customizadas:
  - NotificationsDisabledException → 403
  - NotificationLimitExceededException → 429
  - InvalidNotificationTypeException → 400
```

**Copilot gera:**

```python
# api/v1/endpoints/notifications.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from api.v1.schemas.notification import NotificationCreate, NotificationResponse
from services.notification_service import NotificationService
from domain.exceptions import (
    NotificationsDisabledException,
    NotificationLimitExceededException,
    InvalidNotificationTypeException
)
from api.deps import get_db, get_notification_service

router = APIRouter()

@router.post("/notifications", response_model=NotificationResponse, status_code=status.HTTP_201_CREATED)
def create_notification(
    payload: NotificationCreate,
    service: NotificationService = Depends(get_notification_service)
):
    """
    Envia notificação push para usuário.
    
    - **user_id**: ID do usuário destinatário
    - **type**: Tipo de notificação (like, comment, follow)
    - **reference_id**: ID do recurso relacionado
    
    Returns:
        NotificationResponse: Notificação criada
    
    Raises:
        403: Usuário não habilitou notificações
        429: Limite de 10 notificações/dia excedido
        400: Tipo de notificação inválido
    """
    try:
        notification = service.send_notification(
            user_id=payload.user_id,
            type=payload.type,
            reference_id=payload.reference_id
        )
        return notification
    
    except NotificationsDisabledException as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "message": str(e),
                "error_code": "NOTIFICATIONS_DISABLED"
            }
        )
    
    except NotificationLimitExceededException as e:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={
                "message": str(e),
                "error_code": "NOTIFICATION_LIMIT_EXCEEDED"
            }
        )
    
    except InvalidNotificationTypeException as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "message": str(e),
                "error_code": "INVALID_NOTIFICATION_TYPE"
            }
        )
```

---

### 5.3. Registrar Endpoint no Router

```python
# api/v1/router.py

from api.v1.endpoints import notifications

api_router = APIRouter()
api_router.include_router(notifications.router, tags=["notifications"])
```

---

### 5.4. Testar Endpoint

```python
# tests/test_notifications_api.py

from fastapi.testclient import TestClient

def test_post_notification_success(client: TestClient, db_session):
    """Testa criação de notificação com sucesso."""
    # Arrange
    user = User(id=1, notifications_enabled=True, player_id="player-123")
    db_session.add(user)
    db_session.commit()
    
    # Act
    response = client.post("/api/v1/notifications", json={
        "user_id": 1,
        "type": "like",
        "reference_id": "post_456"
    })
    
    # Assert
    assert response.status_code == 201
    data = response.json()
    assert data["user_id"] == 1
    assert data["type"] == "like"
    assert data["sent_at"] is not None

def test_post_notification_opt_in_disabled(client: TestClient, db_session):
    """Testa erro ao enviar para usuário com opt-in desabilitado."""
    # Arrange
    user = User(id=1, notifications_enabled=False)
    db_session.add(user)
    db_session.commit()
    
    # Act
    response = client.post("/api/v1/notifications", json={
        "user_id": 1,
        "type": "like",
        "reference_id": "post_456"
    })
    
    # Assert
    assert response.status_code == 403
    assert response.json()["detail"]["error_code"] == "NOTIFICATIONS_DISABLED"
```

**Etapa 5 completa:** ✅ endpoint + testes validados.

---

## Etapa 6: Testes End-to-End (Cobrir Fluxo Completo)

```python
# tests/integration/test_notifications_e2e.py

def test_notification_flow_end_to_end(client, db_session, mock_onesignal):
    """Testa fluxo completo: API → Service → OneSignal → DB."""
    # Arrange
    user = User(id=1, notifications_enabled=True, player_id="player-123")
    db_session.add(user)
    db_session.commit()
    
    mock_onesignal.send_push.return_value = {"id": "onesignal-notif-789"}
    
    # Act
    response = client.post("/api/v1/notifications", json={
        "user_id": 1,
        "type": "like",
        "reference_id": "post_999"
    })
    
    # Assert API
    assert response.status_code == 201
    data = response.json()
    
    # Assert DB
    notification_db = db_session.query(Notification).filter(Notification.id == data["id"]).first()
    assert notification_db is not None
    assert notification_db.sent_at is not None  # Enviado com sucesso
    
    # Assert OneSignal
    mock_onesignal.send_push.assert_called_once_with(
        player_id="player-123",
        message="Someone liked your post post_999"
    )
```

**Etapa 6 completa:** ✅ testes E2E validados.

---

## Alternância de Agentes Durante Batalha

### Quando Trocar de Agente

| Fase da Implementação | Agente Recomendado | Por Quê |
|-----------------------|--------------------|---------|
| Decidir estrutura de camadas | @architect | Decisões arquiteturais |
| Implementar model/service | @default ou @workspace | Código aderente ao padrão do projeto |
| Revisar segurança (API keys) | @security | Validação de exposição de credenciais |
| Debugar erro específico | @default + logs | Contexto local do erro |
| Revisar código final | @reviewer (se houver) | Checklist de qualidade |

---

### Exemplo de Alternância

**Fase 1: Decisão arquitetural**

```
@architect 

Devo criar service síncrono ou assíncrono para notificações?
Considere:
- Latência esperada: <200ms
- Volume: 10k notificações/dia
```

**@architect responde:** síncrono é suficiente (volume baixo).

---

**Fase 2: Implementação**

```
(sem mencionar agente específico, usa default)

Implemente NotificationService conforme plano da Etapa 2.
```

---

**Fase 3: Revisão de segurança**

```
@security 

Revise integrations/onesignal_client.py

API key está exposta? Deve vir de variável de ambiente?
```

**@security responde:** sim, mover para `os.getenv("ONESIGNAL_API_KEY")`.

---

## Regra de Ouro: Mudanças Pequenas e Revisáveis

**Problema:** commits gigantes (500+ linhas).

```
git commit -m "feat: implementa notificações"

Arquivos modificados:
- models/notification.py (novo, 50 linhas)
- services/notification_service.py (novo, 150 linhas)
- integrations/onesignal_client.py (novo, 80 linhas)
- api/v1/endpoints/notifications.py (novo, 100 linhas)
- tests/test_notification_service.py (novo, 200 linhas)
- ... (15 arquivos modificados)

Total: 800+ linhas em 1 commit
```

**Risco:** difícil revisar, difícil reverter se erro.

---

**Solução:** commits por etapa.

```bash
# Etapa 1: Model + Migration
git add models/notification.py alembic/versions/004_*.py
git commit -m "feat: adiciona model Notification e migration"

# Etapa 2: Service (sem OneSignal)
git add services/notification_service.py tests/test_notification_service.py
git commit -m "feat: implementa NotificationService com validações"

# Etapa 3: Cliente OneSignal
git add integrations/onesignal_client.py tests/test_onesignal_client.py
git commit -m "feat: adiciona cliente OneSignal com retry"

# Etapa 4: Integração
git add services/notification_service.py tests/test_notification_service_integration.py
git commit -m "feat: integra NotificationService com OneSignal"

# Etapa 5: Endpoint
git add api/v1/endpoints/notifications.py tests/test_notifications_api.py
git commit -m "feat: adiciona endpoint POST /notifications"

# Etapa 6: Testes E2E
git add tests/integration/test_notifications_e2e.py
git commit -m "test: adiciona testes E2E de notificações"
```

**Benefício:** cada commit é revisável, revertível e rastreável.

---

## Troubleshooting

### 💡 Problema: Copilot sugere código fora do padrão

**Sintoma:**

```python
# Copilot sugere (fora do padrão):
def send_notification(user_id, type, ref_id):
    # Sem docstring
    # Sem tratamento de exceção
    db.add(notification)
```

**Solução:**

**Reforçar padrão no prompt:**

```
Refatore send_notification seguindo padrão do projeto:

1. Docstring completa (Args, Returns, Raises)
2. Type hints em todos parâmetros
3. Validações antes de persistir
4. Exceções customizadas (domain/exceptions.py)
5. Logging de eventos importantes

Consulte .github/instructions/coding-standards.md
```

---

### 💡 Problema: Feature funciona mas testes falham

**Sintoma:**

```bash
pytest tests/test_notification_service.py

# FAILED: test_send_notification_daily_limit_exceeded
# AssertionError: NotificationLimitExceededException not raised
```

**Solução:**

**Debugar com logs:**

```python
def test_send_notification_daily_limit_exceeded(db_session, mock_logger):
    # Adicionar print para debug
    count = db_session.query(Notification).filter(...).count()
    print(f"DEBUG: count={count}, expected=10")
    
    with pytest.raises(NotificationLimitExceededException):
        service.send_notification(...)
```

**Identificar causa:** SQL query pode estar usando timezone errado.

**Correção:** forçar UTC em query.

---

### 💡 Problema: Muitos vai-e-vem entre etapas

**Sintoma:**

```
10:00 - Etapa 2 (service)
10:30 - Volta pra Etapa 1 (ajustar model)
11:00 - Volta pra Etapa 2
11:15 - Pula pra Etapa 5 (endpoint)
11:30 - Volta pra Etapa 2 (service incompleto)
```

**Solução:**

**Validar etapa antes de avançar:**

```bash
# Após Etapa 1 (model):
pytest tests/test_models.py -k "notification" -v
# ✅ Todos passam → AGORA avança pra Etapa 2

# Após Etapa 2 (service):
pytest tests/test_notification_service.py -v
# ✅ Todos passam → AGORA avança pra Etapa 3
```

**Regra:** só avança quando etapa atual está verde (testes passando).

---

## Exercício Prático

**Missão:** Implementar feature completa usando plano da Lição 24.

**Tempo estimado:** 2-3h (conforme complexidade)

---

**Critério de sucesso:**

- [ ] Implementou todas etapas do plano sequencialmente
- [ ] Usou agente adequado em cada fase (@architect, @security, etc.)
- [ ] Aplicou prompts reutilizáveis ao menos 2x
- [ ] Executou ao menos 1 skill (gerador de testes, migration, etc.)
- [ ] Consultou Droid ao menos 1x (DB schema, docs externas, etc.)
- [ ] Commits pequenos (1 por etapa, não 1 gigante)
- [ ] Todos os testes passando (unit + integration + E2E)
- [ ] Código aderente ao padrão do projeto

---

## Recursos Externos

- [Pytest Best Practices](https://docs.pytest.org/en/stable/goodpractices.html)
- [FastAPI Dependency Injection](https://fastapi.tiangolo.com/tutorial/dependencies/)
- [Tenacity (Retry Library)](https://tenacity.readthedocs.io/)

---

## Checklist de Validação

Você está pronto para a próxima aula se:

- [ ] Entende o que é "A Batalha" (execução orquestrada de todas ferramentas)
- [ ] Sabe alternar agentes conforme fase (@architect → default → @security)
- [ ] Consegue aplicar prompts reutilizáveis durante implementação
- [ ] Sabe executar skills para automação (testes, migrations, scaffolding)
- [ ] Consulta Droids para validar contexto externo (DB, APIs, docs)
- [ ] Mantém commits pequenos e revisáveis (1 por etapa)
- [ ] Valida cada etapa antes de avançar (testes passando = verde)
- [ ] Implementa feature completa aderente ao padrão do projeto

:::tip 🏆 Treinamento Jedi Completo
Você orquestra todos os recursos aprendidos (Agents, Prompts, Skills, Droids, Holocrons) em fluxo coordenado, implementando features com consistência, rastreabilidade e qualidade. Cada etapa é validada antes da próxima, eliminando vai-e-vem e mantendo mudanças pequenas e revisáveis.
:::
