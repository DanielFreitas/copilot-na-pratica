---
title: 06 - Holocrons por Território
sidebar_position: 6
description: Instruções por caminho para API, testes e infraestrutura com aplicação automática.
---

> *"Um Holocron para a API, outro para testes e infra. A Força age diferente em cada território."*

**Duração estimada:** ~40 min

## Vídeo introdutório

<video controls width="100%" preload="metadata">
	<source src="/copilot-na-pratica/videos/06-holocrons-por-territorio.mp4" type="video/mp4" />
	Seu navegador não suporta vídeo HTML5.
</video>

## Pré-requisito obrigatório

Antes desta aula, você deve ter criado o **Holocron Principal** (`.github/copilot-instructions.md`) conforme a aula anterior. As instruções por território funcionam **em conjunto** com esse arquivo principal, não como substitutas.

## O Problema: Um Tamanho Não Serve Para Todos

Imagine este cenário real: seu Holocron Principal tem regras gerais do projeto (usar Python 3.13, seguir PEP 8, evitar libs externas). Mas você precisa que o Copilot:

- Na **API** → sugira FastAPI + Pydantic, use HTTPException, valide DTOs
- Nos **testes** → use pytest, crie fixtures, evite mocks complexos  
- Na **infra** → mantenha Docker Compose legível, não exponha secrets

Colocar tudo no Holocron Principal ficaria confuso. **Holocrons por território** (instruções específicas por caminho) resolvem isso criando regras que se ativam **automaticamente** conforme o arquivo que você está editando.

## 🗺️ Como Funciona a Detecção de Território

Quando você abre um arquivo, o Copilot verifica este fluxo:

```
Você abre: app/api/routes/pedidos.py
    ↓
Copilot detecta caminho: app/api/routes/pedidos.py
    ↓
Busca arquivos em .github/instructions/*.instructions.md
    ↓
Encontra api.instructions.md com "applyTo: app/**"
    ↓
COMBINAÇÃO! Carrega:
  1️⃣ Holocron Principal (.github/copilot-instructions.md)
  2️⃣ Holocron de Território (.github/instructions/api.instructions.md)
    ↓
Responde usando AMBOS os contextos
```

**applyTo** = campo que define o **padrão de caminho** (também chamado de "glob pattern") onde a instrução deve atuar. Exemplos de padrões:
- `app/**` → qualquer arquivo dentro da pasta `app/` (e subpastas)
- `tests/**` → qualquer arquivo dentro da pasta `tests/`
- `*.yml` → qualquer arquivo YAML na raiz
- `docker-compose*.yml` → arquivos como `docker-compose.yml`, `docker-compose.override.yml`

**frontmatter** = bloco de metadados no formato YAML que fica **no topo do arquivo Markdown**, delimitado por `---`. É usado para configurar como o Copilot deve processar aquele arquivo de instruções:

```markdown
---
applyTo: "app/**"        ← Campo que ativa a instrução
---
# Instruções para API     ← Conteúdo começa aqui
```

## Estrutura de Pastas e Nomes

Crie seus Holocrons por território em:

```
.github/
  instructions/
    api.instructions.md         ← Ativado em app/**
    testing.instructions.md     ← Ativado em tests/**
    infra.instructions.md       ← Ativado em arquivos de infra
```

💡 **Por que `.instructions.md`?** O Copilot detecta arquivos com esse sufixo automaticamente. Não use nomes como `regras-api.md` ou `docs-api.md` — eles não serão reconhecidos.

## Territórios Essenciais Para Começar

### 🎯 Território 1: API (Backend)

**Quando usar:** Você tem lógica de rotas, controllers, schemas Pydantic, serviços de domínio.

**Template pronto:**

```markdown
---
applyTo: "app/**"
---

# Instruções de API

## Stack obrigatória
- FastAPI para rotas e dependency injection
- Pydantic para validação de DTOs (Data Transfer Objects = objetos que carregam dados entre camadas)
- SQLAlchemy para ORM (Object-Relational Mapping = mapeamento entre objetos Python e tabelas SQL)

## Estrutura de código
- Rotas em `app/api/routes/`
- Schemas em `app/schemas/`
- Serviços de domínio em `app/services/`
- Modelos do banco em `app/models/`

## Padrão de validação
1. Validar entrada no schema Pydantic
2. Processar no serviço
3. Retornar DTO de resposta

## Tratamento de erros
- Use `HTTPException` do FastAPI
- Status codes consistentes: 400 (bad request), 404 (not found), 500 (server error)
- Payload de erro: `{"detail": "mensagem descritiva"}`

## Regras de segurança
- Nunca logar dados sensíveis (senhas, tokens, CPF)
- Validar tamanho de payloads (máximo 10MB)
- Sanitizar strings de usuário antes de queries

## O que NÃO sugerir
- Bibliotecas fora da requirements.txt
- Lógica de negócio nos controllers (use services)
- Raw SQL (use ORM)
```

**Exemplo de uso prático:**

Você está no arquivo `app/api/routes/pedidos.py` e pede:

> *"Crie endpoint POST /pedidos que aceita customer_id e items[]"*

O Copilot vai:
✅ Usar FastAPI router  
✅ Criar schema Pydantic para validação  
✅ Retornar HTTPException se dados inválidos  
✅ Seguir estrutura de pastas documentada  

### 🧪 Território 2: Testes

**Quando usar:** Você tem testes unitários, de integração ou E2E que precisam seguir padrões de cobertura e fixtures.

**Template pronto:**

```markdown
---
applyTo: "tests/**"
---

# Instruções de Teste

## Framework obrigatório
- pytest (não use unittest)
- pytest-asyncio para testes async
- factory_boy para dados fake
- faker para geração de strings

## Estrutura de um bom teste
1. **Arrange:** preparar dados e mocks (setup inicial)
2. **Act:** executar a função testada
3. **Assert:** verificar resultado esperado

## Padrão de nomenclatura
- Arquivos: `test_*.py` ou `*_test.py`
- Funções: `test_<cenario>_<resultado_esperado>`
- Exemplo: `test_pedido_sem_items_deve_retornar_400`

## Cobertura obrigatória
- ✅ Caso feliz (happy path = fluxo sem erros)
- ✅ Validação de campos obrigatórios
- ✅ Erro esperado (ex: cliente inexistente)
- ❌ Não testar bibliotecas externas (FastAPI, SQLAlchemy já são testadas)

## Fixtures reutilizáveis
- Criar fixtures em `tests/conftest.py`
- Preferir `@pytest.fixture(scope="function")` para isolamento
- Use `autouse=True` apenas para setup de banco/logs

## O que evitar
- Testes que dependem da ordem de execução
- Mocks excessivos (prefira testar integração real quando possível)
- Assertions genéricas (`assert result is not None` não testa nada útil)
```

**Exemplo de uso prático:**

Você está no arquivo `tests/test_pedidos.py` e pede:

> *"Crie teste para POST /pedidos com items vazios"*

O Copilot vai:
✅ Usar pytest e estrutura AAA (Arrange/Act/Assert)  
✅ Criar fixture para cliente válido  
✅ Verificar status 400 e mensagem de erro específica  
✅ Nomear teste descritivamente: `test_pedido_items_vazios_deve_retornar_400`

### 🐳 Território 3: Infraestrutura

**Quando usar:** Você mexe em docker-compose.yml, .env.example, scripts de deploy, arquivos de CI/CD.

**Template pronto:**

```markdown
---
applyTo: "docker-compose*.yml,.env.example,.github/workflows/**,.vscode/**"
---

# Instruções de Infraestrutura

## Arquivos de ambiente (.env)
- Nunca versionar `.env` com valores reais
- Manter `.env.example` atualizado com TODAS as variáveis necessárias
- Usar valores placeholder: `DATABASE_URL=postgresql://user:pass@localhost/db`
- Documentar variáveis obrigatórias vs opcionais

## Docker Compose
- Nomear serviços de forma descritiva: `postgres`, `redis`, `app`
- Usar `depends_on` para expressar dependências entre serviços
- Expor apenas portas necessárias (não exponha bancos em produção)
- Usar volumes nomeados para persistência: `postgres_data:/var/lib/postgresql/data`

## Estrutura de serviços
```yaml
services:
  app:
    build: .
    ports: ["8000:8000"]
    depends_on: [postgres, redis]
    env_file: .env
    
  postgres:
    image: postgres:16-alpine
    volumes: ["postgres_data:/var/lib/postgresql/data"]
    environment:
      POSTGRES_PASSWORD: ${DB_PASSWORD}
```

## Segurança
- Não expor secrets em arquivos versionados
- Usar `${VARIAVEL}` para ler de .env
- Rodar serviços sem privilege escalation quando possível
- Logs não devem conter credenciais

## Compatibilidade local
- Manter setup funcional em Docker local (não só na nuvem)
- Documentar comandos de inicialização no README
- Testar `docker-compose up` em máquina limpa antes de commit
```

**Exemplo de uso prático:**

Você está no arquivo `docker-compose.yml` e pede:

> *"Adicione serviço MongoDB com persistência"*

O Copilot vai:
✅ Nomear serviço `mongodb` (não `db` genérico)  
✅ Usar volume nomeado `mongo_data`  
✅ Ler senha de `${MONGO_PASSWORD}` (não hardcoded)  
✅ Adicionar `depends_on` em serviços que usam MongoDB

## 🔀 Ordem de Precedência: Global + Território

Quando você edita um arquivo que tem Holocron de território, o Copilot **combina** as duas fontes:

| Fonte | Escopo | Exemplo de Regra |
|-------|--------|------------------|
| **Holocron Principal** | Todo o projeto | "Use Python 3.13", "Siga PEP 8" |
| **Holocron de Território** | Caminho específico | "Na API use FastAPI", "Em testes use pytest" |

**Regras de conflito:**
- Se **não houver conflito** → aplica ambas as regras
- Se **houver conflito** → **território vence** (é mais específico)

**Exemplo de conflito resolvido:**

```markdown
# .github/copilot-instructions.md (Global)
- Use type hints em todas as funções

# .github/instructions/testing.instructions.md (Território)
- Em testes, type hints são opcionais (foco em legibilidade)
```

Resultado: arquivos de teste podem omitir type hints sem o Copilot reclamar.

## ⚡ Quando Criar Um Novo Território

Use esta tabela de decisão:

| Situação | Criar território separado? | Motivo |
|----------|---------------------------|--------|
| Regras de API vs testes | ✅ Sim | Stack diferente (FastAPI vs pytest) |
| Rotas de usuários vs pedidos | ❌ Não | Ambos são API, mesmas regras técnicas |
| Testes unitários vs E2E | ⚠️ Talvez | Se os padrões forem muito diferentes |
| Scripts Python vs notebooks | ✅ Sim | Contextos de uso completamente diferentes |
| Múltiplos microsserviços | ✅ Sim | Cada serviço pode ter stack própria |

**Regra de ouro:** Crie território quando as **regras técnicas** mudarem significativamente. Não crie por diferença de domínio de negócio (use Pergaminhos para isso, como verá na próxima aula).

## 🛠️ Validação Prática

### Teste 1: Verificar ativação automática

1. Crie `.github/instructions/api.instructions.md` com o template do Território 1
2. Abra um arquivo em `app/api/routes/`
3. Peça ao Copilot: *"Crie endpoint GET /health que retorna status ok"*
4. ✅ **Sucesso se:** A resposta usar `FastAPI`, `@router.get`, e estrutura de DTO

### Teste 2: Verificar isolamento entre territórios

1. Crie `.github/instructions/testing.instructions.md` com o template do Território 2
2. Abra um arquivo em `tests/`
3. Peça: *"Crie teste para o endpoint /health"*
4. ✅ **Sucesso se:** A resposta usar `pytest`, fixtures, e padrão AAA

### Teste 3: Verificar combinação com Holocron Principal

1. No Holocron Principal (`.github/copilot-instructions.md`), adicione: *"Sempre logar início de operações importantes"*
2. No arquivo `app/api/routes/pedidos.py`, peça: *"Crie endpoint POST /pedidos"*
3. ✅ **Sucesso se:** A resposta incluir `logger.info(...)` E seguir padrões FastAPI do território

## 💡 Troubleshooting Comum

### Problema: Instruções não são aplicadas

**Diagnóstico:**
- Abra o arquivo e peça ao Copilot: *"Que instruções você está usando agora?"*
- Ele deve listar arquivos `.instructions.md` ativos

**Soluções:**
- ✅ Confirme que o arquivo tem sufixo `.instructions.md` (não `.md` apenas)
- ✅ Verifique que o `applyTo` cobre o caminho do arquivo atual
  - Exemplo: `app/api/routes/pedidos.py` deve ser coberto por `app/**`
- ✅ Reabra o arquivo (VS Code pode não ter detectado a mudança)
- ✅ Reinicie VS Code se nada funcionar

### Problema: Glob pattern não cobre os arquivos esperados

**Sintomas:** Você criou `applyTo: "tests/*.py"` mas só funciona em `tests/test_file.py`, não em `tests/integration/test_db.py`.

**Solução:** Use `**` para incluir subpastas:
```markdown
---
applyTo: "tests/**/*.py"   ← Correto: cobre subpastas
---
```

**Padrões comuns:**
- `src/**` → tudo em src/ e subpastas
- `*.yml` → YAMLs na raiz apenas
- `**/*.yml` → YAMLs em qualquer lugar
- `{docker-compose.yml,.env.example}` → múltiplos arquivos específicos

### Problema: Instruções de um território "vazam" para outro

**Sintomas:** Você está editando um teste e o Copilot sugere HTTPException (regra da API).

**Causa:** Provavelmente há regra genérica em um território que deveria ser mais específico.

**Solução:**
```markdown
# ❌ Muito amplo
---
applyTo: "**/*.py"
---
Use FastAPI...  ← Vai afetar testes também!

# ✅ Específico
---
applyTo: "app/**/*.py"
---
Use FastAPI...  ← Só afeta API
```

## 📝 Exercício Prático Completo

**Cenário:** Você tem um projeto FastAPI com a seguinte estrutura:

```
meu-projeto/
  app/
    api/
      routes/
    services/
    models/
  tests/
    unit/
    integration/
  docker-compose.yml
```

**Tarefa:**

1. Crie três Holocrons de território usando os templates acima:
   - `api.instructions.md` (para `app/**`)
   - `testing.instructions.md` (para `tests/**`)
   - `infra.instructions.md` (para arquivos Docker)

2. Teste cada território:
   - Em `app/api/routes/produtos.py` → peça criação de endpoint POST
   - Em `tests/unit/test_produtos.py` → peça teste do endpoint
   - Em `docker-compose.yml` → peça adição de serviço Redis

3. Compare as respostas: elas devem seguir padrões diferentes conforme o território.

**Critério de sucesso:**
- ✅ API usa FastAPI, HTTPException, estrutura em camadas
- ✅ Teste usa pytest, fixtures, AAA pattern
- ✅ Infra usa volumes nomeados, lê variáveis de .env

## 🎯 Próxima Missão

Na próxima aula você aprenderá sobre **Pergaminhos do Domínio** — documentos versionados com regras de negócio que impedem o Copilot de inventar validações ou fluxos. Enquanto Holocrons controlam **como** o código é escrito (técnica), Pergaminhos controlam **o que** o sistema deve fazer (negócio).

:::tip 🏆 Treinamento Jedi Completo
Você configurou Holocrons por território e garantiu ativação automática de instruções conforme o caminho do arquivo. Agora seu Copilot age diferente em cada domínio técnico do projeto.
:::
