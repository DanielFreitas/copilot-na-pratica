---
title: 17 - Droids em Combate
sidebar_position: 17
description: Cenário end-to-end com múltiplos Droids para diagnóstico e proposta de mudança.
---

> *"O dia que eu usei três Droids ao mesmo tempo... até Yoda ficaria impressionado."*

**Duração estimada:** ~40 min

## Vídeo introdutório

<video controls width="100%" preload="metadata">
	<source src="/copilot-na-pratica/videos/17-droids-em-combate.mp4" type="video/mp4" />
	Seu navegador não suporta vídeo HTML5.
</video>

## O Problema Real: Múltiplas Fontes de Verdade

Kássia recebeu a tarefa: **"Implementar endpoint de reembolso automático para pagamentos falhados há mais de 7 dias"**.

**Sem Droids:**

```
Kássia: preciso criar endpoint de reembolso automático

Copilot: cria código genérico:
- Supõe nome de tabela "transactions"
- Supõe coluna "failed_at"
- Supõe estrutura de pastas "app/routes/"
- Supõe que usa Express.js

Kássia aplica → 4 erros:
1. Tabela se chama "payments", não "transactions"
2. Coluna é "payment_status", não tem campo "failed_at"
3. Estrutura é "api/v1/endpoints/", não "app/routes/"
4. Projeto usa FastAPI, não Express
```

Perda: **3 horas de iteração e ajuste**.

**Com Droids:**

```
Kássia: preciso criar endpoint de reembolso automático para pagamentos falhados há mais de 7 dias

Copilot orquestra 3 Droids:

1. Droid PostgreSQL → consulta schema da tabela payments
   Vê: id, user_id, amount, payment_status, created_at
   Identifica: coluna "payment_status" com valores ['pending', 'success', 'failed']

2. Droid Filesystem → verifica estrutura de endpoints
   Vê: api/v1/endpoints/payments.py com padrão FastAPI
   Identifica: usa APIRouter, Pydantic models, dependency injection

3. Droid GitHub → busca Pergaminho de domínio
   Lê: .github/instructions/regras-negocio.md
   Vê: "Reembolso: processar apenas status=failed + created_at < 7 dias"

Copilot gera código correto na primeira tentativa:
- FastAPI (framework do projeto)
- Tabela "payments" (nome real)
- Filtro: WHERE payment_status='failed' AND created_at < NOW() - INTERVAL '7 days'
- Estrutura: api/v1/endpoints/refunds.py (padrão existente)
```

**Economia:** implementação correta em 15 minutos (vs 3 horas).

---

## Cenário End-to-End Completo

**Definição de end-to-end:** fluxo que vai da entrada (requisito) até a saída validada (código funcionando), passando por múltiplas fontes de contexto.

### Fluxo de Trabalho com Droids

```
┌─────────────────────────────────────────────────────────────┐
│ 1. ENTRADA: Requisito de negócio                            │
│    "Implementar reembolso automático"                       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. COLETA DE CONTEXTO: Droids consultam fontes             │
│                                                              │
│    ┌──────────────┐    ┌──────────────┐    ┌────────────┐ │
│    │ Droid Git    │    │ Droid DB     │    │ Droid File │ │
│    │ (Pergaminho) │    │ (Schema Real)│    │ (Estrutura)│ │
│    └──────────────┘    └──────────────┘    └────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. SÍNTESE: Copilot combina evidências                     │
│    - Padrão arquitetural (FastAPI Router)                   │
│    - Schema validado (tabela payments)                      │
│    - Regra de negócio (>7 dias + status=failed)            │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. GERAÇÃO: Código aderente ao projeto                     │
│    api/v1/endpoints/refunds.py                              │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. VALIDAÇÃO: Desenvolvedor inspeciona antes de aplicar    │
│    - Schema está correto? ✅                                 │
│    - Regra de negócio atendida? ✅                           │
│    - Padrão do projeto seguido? ✅                           │
└─────────────────────────────────────────────────────────────┘
```

---

## Sequência de Operação Detalhada

### Passo 1: Ler Requisito no Pergaminho de Domínio

**Pergaminho:** `.github/instructions/regras-negocio.md`

```markdown
## Reembolsos

**Regra:** pagamento com `payment_status = 'failed'` há mais de 7 dias 
deve ser processado para reembolso automático.

**Validações:**
- Verificar se user_id tem conta ativa
- Reembolso máximo de R$ 5.000 por transação
- Registrar motivo do reembolso na tabela refund_logs

**Exceções:**
- Pagamentos fraudulentos (fraud_flag = true) não reembolsam
```

**O que Kássia faz:**

```
Kássia no Chat: leia o pergaminho de domínio sobre reembolsos

Copilot usa Droid GitHub/Filesystem → retorna conteúdo acima
```

---

### Passo 2: Consultar Estado do Banco via Droid de Dados

```
Kássia: mostre o schema completo da tabela payments

Copilot usa Droid PostgreSQL:
```

```sql
-- Resposta do Droid:
Table: payments
Columns:
  - id: bigint, primary key
  - user_id: bigint, foreign key → users(id)
  - amount: numeric(10,2)
  - payment_status: varchar(20)  -- valores: pending, success, failed
  - fraud_flag: boolean, default false
  - created_at: timestamp with time zone
  - updated_at: timestamp with time zone

Indexes:
  - idx_payment_status ON payment_status
  - idx_created_at ON created_at
```

**Evidências coletadas:**

- ✅ Coluna `payment_status` existe (não `status`)
- ✅ Coluna `fraud_flag` existe (exceção da regra)
- ✅ Coluna `created_at` existe (cálculo de 7 dias)

---

### Passo 3: Validar Estrutura do Projeto via Ferramentas de Workspace

```
Kássia: mostre como os outros endpoints estão estruturados

Copilot usa Droid Filesystem:
```

```python
# api/v1/endpoints/payments.py (arquivo existente)

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.database import get_db
from app.services.payment_service import PaymentService

router = APIRouter(prefix="/payments", tags=["Payments"])

class PaymentCreate(BaseModel):
    user_id: int
    amount: float

@router.post("/", response_model=PaymentResponse)
async def create_payment(
    payment: PaymentCreate,
    db = Depends(get_db),
    service: PaymentService = Depends()
):
    return await service.create(payment, db)
```

**Evidências coletadas:**

- ✅ Framework: FastAPI com APIRouter
- ✅ Estrutura: `api/v1/endpoints/*.py`
- ✅ Padrão: dependency injection com `Depends()`
- ✅ Models: Pydantic BaseModel

---

### Passo 4: Gerar Proposta de Alteração com Impacto Explícito

```
Kássia: agora crie o endpoint de reembolso automático seguindo as evidências coletadas

Copilot gera:
```

```python
# api/v1/endpoints/refunds.py

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from datetime import datetime, timedelta
from typing import List

from app.database import get_db
from app.models.payment import Payment
from app.models.refund_log import RefundLog
from sqlalchemy.orm import Session
from sqlalchemy import and_

router = APIRouter(prefix="/refunds", tags=["Refunds"])

class RefundResponse(BaseModel):
    payment_id: int
    user_id: int
    amount: float
    refunded_at: datetime

@router.post("/process-automatic", response_model=List[RefundResponse])
async def process_automatic_refunds(db: Session = Depends(get_db)):
    """
    Processa reembolsos automáticos para pagamentos com:
    - payment_status = 'failed'
    - created_at < 7 dias atrás
    - fraud_flag = false
    - amount <= 5000
    """
    
    # Cálculo de 7 dias atrás
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    
    # Query baseada no schema real consultado via Droid PostgreSQL
    eligible_payments = db.query(Payment).filter(
        and_(
            Payment.payment_status == 'failed',
            Payment.created_at < seven_days_ago,
            Payment.fraud_flag == False,
            Payment.amount <= 5000
        )
    ).all()
    
    refunds = []
    for payment in eligible_payments:
        # Atualiza status
        payment.payment_status = 'refunded'
        
        # Registra log (conforme regra do pergaminho)
        refund_log = RefundLog(
            payment_id=payment.id,
            reason="Automatic refund - failed > 7 days",
            refunded_at=datetime.utcnow()
        )
        db.add(refund_log)
        
        refunds.append(RefundResponse(
            payment_id=payment.id,
            user_id=payment.user_id,
            amount=float(payment.amount),
            refunded_at=refund_log.refunded_at
        ))
    
    db.commit()
    return refunds
```

**Impacto explícito:**

| Componente             | Ação                                          |
|------------------------|-----------------------------------------------|
| Tabela `payments`      | UPDATE payment_status WHERE conditions        |
| Tabela `refund_logs`   | INSERT novo registro (auditoria)              |
| API                    | Novo endpoint POST /refunds/process-automatic |
| Dependências           | Usa SQLAlchemy (padrão do projeto)            |

---

### Passo 5: Revisar Resultado Antes de Aplicar

**Checklist de revisão:**

- [ ] **Schema correto?**
  - ✅ Usa `payment_status` (não `status`)
  - ✅ Usa `fraud_flag` (exceção presente)
  - ✅ Usa `created_at` (cálculo de tempo)

- [ ] **Regra de negócio atendida?**
  - ✅ Filtro: `payment_status = 'failed'`
  - ✅ Filtro: `created_at < 7 dias`
  - ✅ Filtro: `fraud_flag = false`
  - ✅ Filtro: `amount <= 5000`

- [ ] **Padrão do projeto seguido?**
  - ✅ FastAPI Router (não Express/Flask)
  - ✅ Estrutura `api/v1/endpoints/`
  - ✅ Dependency injection `Depends(get_db)`
  - ✅ Pydantic models para response

- [ ] **Auditoria presente?**
  - ✅ Registra em `refund_logs` (rastreabilidade)

**Resultado:** código pronto para aplicar, sem iterações.

---

## Boas Práticas ao Usar Múltiplos Droids

### ✅ Nunca Aplicar Alteração Grande Sem Inspeção

**Regra:** se mudança afeta >3 arquivos ou >100 linhas, **sempre revisar antes**.

**Como revisar:**

1. Copilot gera código → você **não salva ainda**
2. Lê o código gerado procurando:
   - Schema incorreto?
   - Faltou validação?
   - Vai quebrar algo existente?
3. Se aprovado → salva e testa
4. Se rejeitado → pede ajuste específico: "adicione validação de user_id ativo"

---

### ✅ Manter Mudanças Pequenas e Verificáveis

**Anti-padrão:**

```
Kássia: crie sistema completo de reembolsos com endpoints, jobs, notificações e auditoria
```

Problema: gera código gigante difícil de validar.

**Padrão correto:**

```
Iteração 1: crie apenas endpoint de consulta de reembolsos elegíveis (read-only)
Iteração 2: adicione endpoint de processamento (um por vez)
Iteração 3: adicione job agendado (depois de validar processamento)
Iteração 4: adicione notificações (depois de tudo funcionar)
```

**Vantagem:** cada etapa é validável independentemente.

---

### ✅ Registrar Decisões no Próprio Repositório

**Situação:** Droid gerou código que funciona, mas você ajustou manualmente algo.

**Boas práticas:**

1. **Commit descritivo:**
   ```bash
   git commit -m "feat: adiciona endpoint de reembolso automático

   - Usa schema real da tabela payments (consultado via Droid PostgreSQL)
   - Segue padrão FastAPI do projeto (Droid Filesystem)
   - Implementa regra de negócio do pergaminho (fraud_flag=false, amount<=5000)
   - Ajuste manual: adiciona índice em payment_status para performance"
   ```

2. **Documentar no PR:**
   ```markdown
   ## Contexto
   Droids consultados:
   - PostgreSQL: validou schema de payments
   - Filesystem: identificou padrão FastAPI
   - GitHub: leu regra de reembolso no pergaminho
   
   ## Ajustes manuais
   - Adicionei índice em payment_status (query afeta 100k registros)
   ```

---

## Resultado Esperado: Evidência Técnica vs Suposição

### Antes (sem Droids): IA Opera por Suposição

| Aspecto                | Suposição do Copilot                 | Realidade do Projeto       | Conflito? |
|------------------------|--------------------------------------|----------------------------|-----------|
| Framework              | Express.js (supõe Node)              | FastAPI (Python)           | ❌         |
| Tabela                 | `transactions`                       | `payments`                 | ❌         |
| Coluna de status       | `status`                             | `payment_status`           | ❌         |
| Estrutura de pastas    | `app/routes/`                        | `api/v1/endpoints/`        | ❌         |

**Resultado:** 4 ajustes manuais necessários (perda de tempo).

---

### Depois (com Droids): IA Opera por Evidência

| Aspecto                | Evidência Coletada (Droid)                 | Código Gerado           | Conflito? |
|------------------------|--------------------------------------------|-------------------------|-----------|
| Framework              | FastAPI (visto em endpoints existentes)    | FastAPI                 | ✅         |
| Tabela                 | `payments` (consultado no PostgreSQL)      | `payments`              | ✅         |
| Coluna de status       | `payment_status` (schema real)             | `payment_status`        | ✅         |
| Estrutura de pastas    | `api/v1/endpoints/` (listado no workspace) | `api/v1/endpoints/`     | ✅         |

**Resultado:** código correto na primeira tentativa.

---

## Quando Usar 1 Droid vs Múltiplos Droids

| Cenário                                      | Droids Necessários             |
|----------------------------------------------|--------------------------------|
| Consulta simples de schema                   | 1 Droid (PostgreSQL apenas)    |
| Implementar endpoint seguindo padrão         | 2 Droids (DB + Filesystem)     |
| Feature completa com regra de negócio        | 3 Droids (DB + File + Git)     |
| Refatoração sem mudança de comportamento     | 1 Droid (Filesystem)           |
| Diagnóstico de bug em produção              | 3+ Droids (DB + Logs + GitHub) |

**Regra prática:**

> Se a tarefa envolve **decisão baseada em múltiplas fontes**, use múltiplos Droids.  
> Se é apenas **consulta pontual**, 1 Droid basta.

---

## Troubleshooting

### 💡 Problema: Copilot usa apenas 1 Droid, ignora os outros

**Sintoma:**

```
Kássia: cria endpoint seguindo padrão do projeto e usando schema real

Copilot usa Droid PostgreSQL → vê schema
MAS ignora Droid Filesystem → gera estrutura genérica
```

**Causa:** pergunta não deixa claro que precisa consultar estrutura de arquivos.

**Solução:**

```
Seja mais explícito:

"consulte o Droid PostgreSQL para schema da tabela payments
consulte o Droid Filesystem para ver estrutura de api/v1/endpoints
depois gere o endpoint seguindo ambos os padrões"
```

---

### 💡 Problema: Droids retornam informação conflitante

**Sintoma:**

```
Droid PostgreSQL → tabela se chama "payments"
Pergaminho (.github/instructions/) → menciona tabela "transactions"
```

**Causa:** documentação desatualizada (Holocron Morto — visto na Aula 14).

**Solução:**

1. **Priorize fonte operacional** (banco de dados real > documentação)
2. **Atualize o pergaminho:**
   ```markdown
   ## Correção
   A tabela atual se chama `payments`, não `transactions`.
   ```
3. **Commite atualização** para não confundir novamente

---

### 💡 Problema: Droid demora muito para responder

**Sintoma:** pergunta simples leva >30 segundos.

**Causas comuns:**

1. **Query pesada:** Droid PostgreSQL fazendo `SELECT * FROM huge_table`
   - Solução: adicione `LIMIT` ou filtre melhor

2. **Rede lenta:** Droid GitHub consultando repositório externo
   - Solução: use cache local (clone do repo)

3. **Servidor sobrecarregado:** banco em produção com carga alta
   - Solução: configure Droid para apontar réplica read-only

---

## Exercício Prático Completo

**Missão:** Implementar feature end-to-end usando múltiplos Droids.

### Cenário

Você precisa criar endpoint `GET /users/{id}/payment-history` que retorna:
- Nome do usuário
- Lista de pagamentos (últimos 10)
- Total pago (soma de `amount` onde `payment_status='success'`)

### Passos

**1. Consulte schema das tabelas**

```
Você: mostre schema das tabelas users e payments

Droid PostgreSQL responde com estrutura completa
```

**2. Valide relação entre tabelas**

```
Você: confirme se payments.user_id referencia users.id

Droid PostgreSQL: sim, FK existe
```

**3. Identifique padrão de endpoints existentes**

```
Você: mostre exemplo de endpoint GET em api/v1/endpoints/users.py

Droid Filesystem retorna código existente
```

**4. Gere código do endpoint**

```
Você: crie endpoint GET /users/{id}/payment-history seguindo:
- schema das tabelas (validado)
- padrão FastAPI existente (visto em users.py)
- retornar últimos 10 pagamentos + total pago

Copilot gera código completo
```

**5. Revise antes de aplicar**

Checklist:
- [ ] Schema correto (nomes de tabela e coluna)?
- [ ] Padrão FastAPI seguido?
- [ ] Query otimizada (usa índice, tem LIMIT)?
- [ ] Tratamento de erro (user_id inexistente)?

**6. Aplique e teste**

```bash
# Teste manual
curl http://localhost:8000/api/v1/users/123/payment-history

# Response esperado:
{
  "user_name": "Kássia Oliveira",
  "payments": [...],
  "total_paid": 15430.50
}
```

**Critério de sucesso:** código funciona na primeira aplicação sem ajustes.

---

## Comparação: Feature Simples vs Feature Complexa

| Feature                  | Droids Úteis                          | Por Quê                                  |
|--------------------------|---------------------------------------|------------------------------------------|
| Adicionar coluna no DB   | 1 (PostgreSQL)                        | Só precisa ver schema atual              |
| CRUD básico              | 2 (DB + Filesystem)                   | Schema + padrão de código                |
| Feature com regra negócio| 3 (DB + File + GitHub)                | Schema + padrão + regra do pergaminho    |
| Refatoração arquitetural | 2 (Filesystem + GitHub)               | Ver código + histórico de decisões       |
| Diagnóstico de bug       | 3+ (DB + File + GitHub + Logs se tiver)| Múltiplas evidências para root cause    |

---

## Recursos Externos

- [Padrão de orquestração de múltiplos Droids](https://modelcontextprotocol.io/docs/patterns/orchestration)
- [Debugging multi-MCP setups](https://github.com/modelcontextprotocol/inspector)

---

## Checklist de Validação

Você está pronto para a próxima aula se:

- [ ] Consegue descrever fluxo end-to-end: requisito → coleta de evidências → síntese → código
- [ ] Sabe quando usar 1 Droid vs múltiplos Droids (consulta pontual vs decisão complexa)
- [ ] Identifica 3 "evidências técnicas" coletadas por Droids em exemplo concreto
- [ ] Explica diferença entre "IA opera por suposição" vs "IA opera por evidência"
- [ ] Lista 2 boas práticas ao orquestrar múltiplos Droids (inspeção prévia, mudanças pequenas)
- [ ] Sabe resolver conflito quando dois Droids retornam informação divergente

:::tip 🏆 Treinamento Jedi Completo
Você executa fluxos com múltiplos Droids mantendo controle técnico, segurança e rastreabilidade da decisão. A IA deixa de operar por suposição e passa a operar por evidência técnica coletada em múltiplas fontes operacionais.
:::
