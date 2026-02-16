---
title: 03 - Primeira Missão
sidebar_position: 3
description: Como transformar um pedido vago em instrução executável para o Copilot.
---

> *"Minha primeira missão com a Força foi um desastre. Eu pedi ajuda e recebi estática."*

**Duração estimada:** ~35 min

## Vídeo introdutório

<video controls width="100%" preload="metadata">
	<source src="/copilot-na-pratica/videos/03-primeira-missao.mp4" type="video/mp4" />
	Seu navegador não suporta vídeo HTML5.
</video>

Kássia começou com uma pergunta vaga e recebeu uma **resposta genérica** — código que funciona em teoria, mas não se encaixa no projeto real. O Copilot tentou ajudar, mas faltava **contexto técnico** (informações sobre stack, arquitetura e restrições do projeto).

## Por Que Virou Estática

Quando você não fornece informação suficiente, a IA precisa fazer suposições. E essas suposições geralmente estão erradas:

- **Assume arquitetura diferente:** Propõe Flask quando seu projeto usa FastAPI
- **Inventa detalhes ausentes:** Cria estrutura de pastas que não existe no projeto
- **Sugere solução fora da stack:** Usa SQLite quando você precisa PostgreSQL

**Exemplo real:**

```
Você (vago): "Como faço autenticação?"

Copilot (genérico): "Use JWT com biblioteca PyJWT:
import jwt
def criar_token(user_id):
    return jwt.encode({'user_id': user_id}, 'secret', algorithm='HS256')
```

**Problemas com essa resposta:**
- Não sabe que você usa FastAPI (há bibliotecas específicas melhores)
- Não sabe que seu projeto já tem `SECRET_KEY` em variável de ambiente
- Não sabe que você precisa integrar com PostgreSQL para verificar usuário
- Código funciona isolado mas não se integra ao resto do projeto

💡 **Por que isso acontece:** O Copilot não conhece seu projeto sem que você forneça contexto. Imagine explicar algo para alguém vendado — você precisa descrever o cenário completo.

## A Mesma Demanda em 3 Níveis

Vamos ver como a qualidade da resposta melhora conforme você adiciona mais contexto:

### V1 — Vaga (❌ Não use)
```
"Como faço uma API de validação?"
```

**Resposta que você recebe:**
```python
# Código genérico, não integra com seu projeto
from flask import Flask  # ← Flask? Você usa FastAPI!
app = Flask(__name__)

@app.route('/validate', methods=['POST'])
def validate():
    # Estrutura que não combina com seu projeto
    return {'status': 'ok'}
```

**Problemas:**
- Framework errado (Flask vs FastAPI)
- Estrutura de pastas não combina com o projeto
- Validação inexistente (apenas placeholder)

---

### V2 — Com Contexto Técnico (⚠️ Melhor, mas incompleto)
```
"No projeto com FastAPI, Python 3.13 e Docker local, preciso validar CPF e e-mail 
antes de persistir no PostgreSQL. Como estruturar endpoint e schema?"
```

**Resposta que você recebe:**
```python
from fastapi import APIRouter
from pydantic import BaseModel, EmailStr

router = APIRouter()

class ClienteValidacao(BaseModel):
    cpf: str
    email: EmailStr

@router.post("/clientes/validacao")
def validar_cliente(dados: ClienteValidacao):
    # Valida formato básico
    return {"valido": True}
```

**Melhor, mas ainda falta:**
- Qual rota HTTP exata? (`/api/clientes/validacao`? `/validate/clientes`?)
- O que retornar em caso de erro? (código HTTP 422? 400?)
- Qual estrutura de pastas? (onde vai o router, onde vai o schema?)
- Precisa de teste? (qual tipo?)

---

### V3 — Contexto + Regra + Formato (✅ Use este padrão)
```
"Crie endpoint `POST /clientes/validacao` em FastAPI. 

Regras:
- CPF obrigatório (validar formato brasileiro)
- E-mail único (checar se já existe no PostgreSQL)
- Retornar HTTP 422 com payload padronizado em erro de validação

Entregar:
- router (arquivo de rotas HTTP)
- schema Pydantic (modelo de validação de dados)
- serviço (camada com lógica de validação)
- teste cobrindo caso feliz (dados válidos) e inválido (dados com erro)
```

💡 **Entendendo os termos técnicos:**
- **Router:** Arquivo que define as rotas HTTP da API (ex: `POST /clientes`, `GET /produtos`)
- **Schema Pydantic:** Modelo de dados que valida automaticamente formato de entrada/saída
- **Serviço:** Camada com a lógica de negócio (validações, cálculos, regras), separada das rotas
- **Teste caso feliz:** Testa quando tudo funciona corretamente (dados válidos)
- **Teste caso inválido:** Testa quando há erros (dados incorretos, CPF inválido)

**Resposta que você recebe:**
```python
# app/routers/clientes.py
from fastapi import APIRouter, HTTPException, status
from app.schemas.cliente import ClienteValidacao
from app.services.cliente_service import ClienteService

router = APIRouter(prefix="/clientes", tags=["clientes"])

@router.post("/validacao", status_code=200)
async def validar_cliente(dados: ClienteValidacao):
    service = ClienteService()
    
    if not service.validar_cpf(dados.cpf):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="CPF inválido"
        )
    
    if await service.email_existe(dados.email):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="E-mail já cadastrado"
        )
    
    return {"valido": True, "mensagem": "Cliente válido"}

# app/schemas/cliente.py
from pydantic import BaseModel, EmailStr, field_validator

class ClienteValidacao(BaseModel):
    cpf: str
    email: EmailStr
    
    @field_validator('cpf')
    def validar_formato_cpf(cls, v):
        # Remove caracteres não numéricos
        cpf_numeros = ''.join(filter(str.isdigit, v))
        if len(cpf_numeros) != 11:
            raise ValueError('CPF deve ter 11 dígitos')
        return cpf_numeros

# app/services/cliente_service.py
class ClienteService:
    def validar_cpf(self, cpf: str) -> bool:
        # Lógica de validação de CPF com dígitos verificadores
        ...
    
    async def email_existe(self, email: str) -> bool:
        # Consulta PostgreSQL para verificar se email já existe
        ...

# tests/test_clientes.py
import pytest
from fastapi.testclient import TestClient

def test_validacao_cliente_valido(client: TestClient):
    """Teste caso feliz: dados válidos"""
    response = client.post("/clientes/validacao", json={
        "cpf": "123.456.789-00",
        "email": "novo@exemplo.com"
    })
    assert response.status_code == 200
    assert response.json()["valido"] is True

def test_validacao_cpf_invalido(client: TestClient):
    """Teste caso inválido: CPF com formato errado"""
    response = client.post("/clientes/validacao", json={
        "cpf": "123",  # CPF incompleto
        "email": "teste@exemplo.com"
    })
    assert response.status_code == 422
    assert "CPF" in response.json()["detail"]

def test_validacao_email_duplicado(client: TestClient):
    """Teste caso inválido: email já existe"""
    response = client.post("/clientes/validacao", json={
        "cpf": "123.456.789-00",
        "email": "existente@exemplo.com"  # Email já cadastrado
    })
    assert response.status_code == 422
    assert "já cadastrado" in response.json()["detail"]
```

**Agora sim! A resposta:**
- ✅ Usa FastAPI corretamente
- ✅ Estrutura em router/schema/service (arquitetura do projeto)
- ✅ Retorna HTTP 422 em erros de validação
- ✅ Inclui testes para casos felizes e inválidos
- ✅ Código pronto para integrar no projeto

## 🔍 Anatomia de um Bom Pedido

Todo **prompt executável** (instrução clara que gera código útil) deve conter 4 elementos:

### 1. Contexto Técnico
Informações sobre a stack e arquitetura do projeto:

**O que incluir:**
- **Linguagem e versão:** Python 3.13, TypeScript 5.0
- **Framework principal:** FastAPI, Django, React, Next.js
- **Banco de dados:** PostgreSQL, MongoDB, Redis
- **Ambiente de execução:** Docker local, Kubernetes, AWS Lambda
- **Arquitetura:** Padrões que o projeto usa (REST, GraphQL, router/service/repository)

**Exemplo:**
```
"Projeto FastAPI com Python 3.13, PostgreSQL 15, rodando em Docker local. 
Arquitetura organizada em: routers (rotas HTTP), services (lógica de negócio), 
repositories (acesso ao banco)."
```

---

### 2. Ação Concreta
O que você quer que seja criado ou modificado:

**Seja específico:**
- ❌ "Preciso de autenticação"
- ✅ "Crie endpoint `POST /auth/login` que recebe email/senha e retorna JWT"

**Inclua:**
- Verbo de ação (criar, modificar, refatorar, adicionar)
- Componente específico (endpoint, função, classe)
- Localização (qual arquivo, se aplicável)

---

### 3. Restrições
Regras e limites que a solução DEVE respeitar:

**Tipos de restrições:**
- **Validações:** "CPF obrigatório", "Email único"
- **Comportamento:** "Retornar HTTP 404 se não encontrar"
- **Segurança:** "Não expor senha em logs", "Sanitizar SQL"
- **Performance:** "Cachear resultado por 5 minutos"
- **Padrões do time:** "Usar docstrings Google Style", "Seguir PEP 8"

**Por que isso importa:** Restrições evitam que o Copilot escolha o caminho mais simples quando você precisa do caminho mais seguro/performático/padronizado.

---

### 4. Formato de Saída
Quais arquivos e componentes você espera receber:

**Seja explícito sobre:**
- **Arquivos a criar/modificar:** "Criar arquivo `app/routers/produtos.py`"
- **Componentes necessários:** "Incluir router, schema, service e testes"
- **Extensões:** "Gerar testes pytest", "Criar migration Alembic"

**Exemplo completo:**
```
"Entregar:
1. Router em app/routers/produtos.py
2. Schema Pydantic em app/schemas/produto.py
3. Service em app/services/produto_service.py
4. Testes pytest cobrindo happy path e edge cases"
```

---

## Comparação Visual: O Que Muda

| Elemento | Sem ele | Com ele |
|----------|---------|---------|
| **Contexto Técnico** | Código em Flask (framework errado) | Código em FastAPI (seu framework) |
| **Ação Concreta** | Função genérica `validate()` | Endpoint `POST /clientes/validacao` específico |
| **Restrições** | Validação mínima que falha com dados reais | Validação completa com regras de negócio |
| **Formato de Saída** | Só o código do endpoint | Router + Schema + Service + Testes |

## Anti-Padrões a Evitar

### ❌ "Faz aí"
```
"Cria uma API de usuários aí"
```
**Problema:** Zero contexto. Resposta será genérica e inutilizável.

---

### ❌ Ambiguidade
```
"Preciso melhorar a segurança"
```
**Problema:** "Melhorar segurança" como? Adicionar autenticação? Sanitizar SQL? Criptografar dados? Seja específico.

---

### ❌ Assumir que o Copilot "sabe"
```
"Cria o endpoint igual ao outro que fizemos ontem"
```
**Problema:** O Copilot não tem memória entre sessões. Você precisa referenciar explicitamente com `#file:caminho/do/arquivo.py`.

💡 **Se o Copilot gerar código genérico:** Não é falha da ferramenta — é falta de contexto. Reescreva o prompt incluindo os 4 elementos (contexto, ação, restrições, formato).

---

## Exercício Prático

Escolha uma **task real** do seu backlog (ou use este exemplo: "Criar API para cadastrar produtos").

### Passo 1: Versão Vaga
Escreva o pedido da forma mais simples possível:
```
Exemplo: "Como criar API de produtos?"
```

Envie ao Copilot e observe a resposta. Provavelmente será genérica.

---

### Passo 2: Versão com Contexto Técnico
Adicione informações do seu projeto:
```
Exemplo: "No projeto FastAPI com Python 3.13 e PostgreSQL, como criar 
API de produtos com validação de estoque?"
```

Envie e compare com a primeira resposta. Deve estar melhor, mas ainda incompleta.

---

### Passo 3: Versão Executável
Adicione todos os 4 elementos:
```
Exemplo:

Contexto:
Projeto FastAPI, Python 3.13, PostgreSQL 15, Docker local. 
Arquitetura: routers/services/repositories.

Ação:
Crie endpoint POST /produtos que cadastra produtos no PostgreSQL.

Restrições:
- Nome obrigatório (mínimo 3 caracteres)
- Preço > 0
- Estoque >= 0
- Retornar HTTP 201 em sucesso, 422 em validação inválida

Formato:
Entregar router, schema Pydantic, service, repository e testes pytest (caso feliz + inválidos).
```

Envie e compare as 3 respostas.

---

### Compare os Resultados

| Critério | V1 (vaga) | V2 (com contexto) | V3 (executável) |
|----------|-----------|-------------------|-----------------|
| **Framework correto** | ❌ | ✅ | ✅ |
| **Estrutura do projeto** | ❌ | ⚠️ (parcial) | ✅ |
| **Validações de negócio** | ❌ | ⚠️ (básica) | ✅ (completa) |
| **Tratamento de erros** | ❌ | ❌ | ✅ |
| **Testes incluídos** | ❌ | ❌ | ✅ |
| **Pronto para usar** | ❌ | ❌ | ✅ |

**Conclusão esperada:** Quanto mais informação você fornece, menos retrabalho. Vale investir 2 minutos escrevendo um prompt detalhado para economizar 30 minutos ajustando código genérico.

:::tip 🏆 Treinamento Jedi Completo
Você aprendeu a transformar pedidos vagos em **instruções executáveis** usando 4 elementos essenciais: contexto técnico, ação concreta, restrições e formato de saída. Agora sabe escrever prompts que geram código pronto para integrar ao projeto.
:::