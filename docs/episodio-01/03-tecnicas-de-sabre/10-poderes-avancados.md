---
title: 10 - Poderes Avançados
sidebar_position: 10
description: Agent Skills com SKILL.md para execução especializada sob demanda.
---

> *"Skills não são golpes simples. São poderes completos — com tudo que o Jedi precisa pra executar."*

**Duração estimada:** ~40 min

## Vídeo introdutório

<video controls width="100%" preload="metadata">
	<source src="/copilot-na-pratica/videos/10-poderes-avancados.mp4" type="video/mp4" />
	Seu navegador não suporta vídeo HTML5.
</video>

## Pré-requisitos obrigatórios

Esta aula complementa **Prompt Files** (aula 08) e **Custom Agents** (aula 09). Entenda a hierarquia:

| Recurso | Propósito | Quando carrega |
|---------|-----------|----------------|
| **Holocron** | Regras globais do projeto | Sempre ativo |
| **Prompt File** | Comando para tarefa específica | Quando você executa `/comando` |
| **Custom Agent** | Perspectiva técnica especializada | Quando você menciona `@agent` |
| **Skill** | Pacote completo de capacidade com assets | **Sob demanda explícita** (você pede para usar) |

## O Problema: Automação Complexa Que Não Cabe em Um Prompt

Imagine estas tarefas recorrentes no seu time:

**Tarefa 1: Testing completo**
- Rodar testes
- Interpretar falhas (stack trace, log)
- Identificar causa raiz
- Sugerir correção priorizada

**Tarefa 2: API Scaffolding**
- Gerar router + schema + service + model
- Criar migrations do banco
- Gerar testes básicos
- Atualizar documentação da API

**Por que Prompt Files não bastam?**
- ❌ Precisam de **múltiplos passos coordenados** (executar comando → analisar saída → gerar código)
- ❌ Podem precisar de **scripts auxiliares** (executar pytest, parsear JSON, gerar migration)
- ❌ Precisam de **templates** (boilerplate de router, schema padrão)
- ❌ Lógica pode ser **complexa demais** para um único prompt

**Skills resolvem isso** empacotando TUDO que é necessário: instruções, scripts, templates, referências.

## 📦 O Que É Uma Skill

**Skill** (habilidade especializada) é um **pacote de capacidade reutilizável estruturado** em pasta própria com:

1. **SKILL.md** = manifesto que define objetivo, entradas, saídas e passos de execução
2. **Scripts (opcional)** = automações Python/Shell que a skill pode executar
3. **Templates (opcional)** = boilerplate de código reutilizável  
4. **Docs/Refs (opcional)** = documentação complementar ou exemplos

**Diferença crítica:**

```
Prompt File (/create-endpoint):
  → "Crie endpoint FastAPI"
  → Copilot gera código diretamente
  
Custom Agent (@architect):
  → Muda PERSPECTIVA do Copilot
  → Analisa como arquiteto analisaria

Skill (api-testing):
  → "Execute skill api-testing"
  → Copilot CARREGA o pacote completo
  → Executa pytest → analisa output → interpreta falhas → propõe correções
  → Pode usar scripts auxiliares da skill
```

**Skills são carregadas sob demanda** = não ficam ativas o tempo todo (evita sobrecarga de contexto). Você decide quando invocar.

## 📁 Estrutura de Pastas e Organização

Crie suas Skills nesta estrutura:

```
.github/
  skills/
    api-testing/                    ← Skill completa
      SKILL.md                      ← Man ifesto obrigatório
      scripts/
        run_tests.py                ← Script auxiliar
        parse_failures.py
      templates/
      docs/
        examples.md
    
    api-scaffolding/                ← Outra skill
      SKILL.md
      templates/
        router_template.py          ← Boilerplate FastAPI
        schema_template.py
        test_template.py
      scripts/
        generate_migration.py       ← Gera migration do banco
```

💡 **Convenções:**
- Nome da pasta = identificador da skill → `api-testing`, `api-scaffolding`
- `SKILL.md` é **obrigatório** (manifesto da skill)
- Subpastas (`scripts/`, `templates/`) são opcionais mas recomendadas para organização

## 🧬 Anatomia de um SKILL.md

O arquivo `SKILL.md` é o **manifesto** que define a skill:

```markdown
---
name: "nome-da-skill"
description: "Breve descrição do propósito (80 chars)"
version: "1.0.0"
---

## Objetivo
Descrição detalhada do que a skill faz e quando usar.

## Entradas esperadas
Lista de informações que precisam ser fornecidas:
- entrada1: descrição e formato
- entrada2: descrição e formato

## Passos de execução
Sequência numerada de ações que a skill realiza:
1. [Passo 1 com detalhes]
2. [Passo 2 com detalhes]
3. [Passo N com detalhes]

## Saída esperada
Formato e conteúdo do resultado final:
- tipo de saída
- estrutura de dados
- ações recomendadas

## Dependências (opcional)
Ferramentas, bibliotecas ou configurações necessárias:
- pytest para testes
- SQLAlchemy para migrations

## Exemplos de uso (opcional)
Casos concretos demonstrando a skill em ação.
```

### Explicação dos Campos

**name** = identificador único da skill (usado para invocar). Use kebab-case: `api-testing`, `db-migration`

**description** = frase curta explicando propósito. Aparece quando você lista skills disponíveis.

**version** = versionamento semântico (1.0.0). Útil para rastrear evolução da skill.

**Objetivo** = seção expandida explicando:
- O que a skill automatiza
- Quando usar (vs fazer manualmente ou usar outro recurso)
- Valor que agrega ao fluxo de trabalho

**Entradas esperadas** = lista de dados que você precisa fornecer ao invocar a skill. Exemplos:
- `módulo alvo` (ex: `app.services.pedido`)
- `comando de teste` (ex: `pytest tests/test_pedidos.py`)
- `contexto de falha` (saída do terminal mostrando erro)

**Passos de execução** = sequência detalhada de ações. Similar a um script, mas em linguagem natural. O Copilot vai seguir essa sequência ao executar a skill.

**Saída esperada** = formato do resultado final. Exemplosexos:
- Resumo textual de falhas priorizadas
- Arquivos gerados (router.py, schema.py, test.py)
- Comandos para executar manualmente

## 🚀 Skills Essenciais Para Começar

Vamos criar 2 skills completas como template:

### Skill 1: api-testing (Executar e Interpretar Testes)

**Propósito:** Automatizar ciclo de execução de testes → análise de falhas → proposição de correções.

#### Estrutura de pastas:
```
.github/skills/api-testing/
├── SKILL.md
└── scripts/
    └── run_tests.py
```

#### SKILL.md completo:

~~~markdown
---
name: "api-testing"
description: "Executa testes e interpreta falhas com priorização"
version: "1.0.0"
---

## Objetivo
Automatizar execução de testes de API e transformar falhas técnicas em plano de ação objetivo.

Esta skill é útil quando:
- Você roda testes manualmente e vê múltiplas falhas confusas
- Precisa priorizar correções (qual falha corrigir primeiro?)
- Quer entender causa raiz (não apenas sintoma do erro)

## Entradas esperadas

### Obrigatórias:
- **módulo_alvo**: Módulo Python a testar (ex: `tests/api/test_pedidos.py` ou `tests/`)
- **comando_teste**: Comando pytest completo (ex: `pytest tests/ -v --tb=short`)

### Opcionais:
- **contexto_falha**: Se testes já foram rodados, cole a saída do terminal aqui para análise direta

## Passos de execução

### 1. Executar testes
Se `contexto_falha` não foi fornecido:
- Usar `scripts/run_tests.py` para executar `comando_teste`
- Capturar stdout/stderr completos
- Registrar exit code (0 = sucesso, != 0 = falhas)

Se `contexto_falha` foi fornecido:
- Pular execução, usar output fornecido

### 2. Parsear resultados
Extrair de cada falha:
- Nome do teste que falhou (`test_pedido_valido_deve_retornar_201`)
- Linha do assertion failed
- Mensagem de erro (expected vs actual)
- Stack trace relevante

### 3. Classificar falhas por tipo
Agrupar em categorias:
- **Assertion mismatch:** Valor esperado != obtido (ex: `assert status == 201` mas foi 400)
- **Exception raised:** Código lançou exceção inesperada
- **Timeout:** Teste excedeu tempo limite
- **Setup/Teardown:** Erro em fixture ou cleanup

### 4. Identificar causa raiz
Para cada falha, hipotetizar:
- Problema na implementação? (lógica errada)
- Problema no teste? (assertion incorreta, fixture ruim)
- Problema de ambiente? (banco não inicializado, dependência faltando)

### 5. Priorizar correções
Ordenar falhas por impacto:
- 🔴 **Crítico:** Funcionalidade essencial broke (ex: autenticação, pagamento)
- 🟡 **Alto:** Feature importante mas não bloqueante
- 🔵 **Baixo:** Edge case ou teste flaky

### 6. Propor plano de correção
Para cada categoria:
- Lista de falhas naquele grupo
- Causa raiz hipotética
- Sugestão de correção específica (code snippet quando possível)
- Ordem recomendada de correção

## Saída esperada

```markdown
## Resumo de Execução
- Total de testes: X
- Passou: Y
- Falhou: Z
- Skipped: W

## Falhas por Categoria

### 🔴 Crítico (N falhas)

#### test_autenticacao_token_invalido
**Erro:** AssertionError: assert 200 == 401
**Causa provável:** Validação de token não está sendo executada
**Correção sugerida:**
```python
# Em app/api/dependencies.py
def verify_token(token: str):
    if not token or not validate_jwt(token):
        raise HTTPException(401, "Token inválido")
```

[...mais falhas críticas...]

### 🟡 Alto (N falhas)
[...]

### 🔵 Baixo (N falhas)
[...]

## Ordem de Correção Recomendada
1. Corrigir todos 🔴 (bloqueiadores)
2. Corrigir 🟡 de features em release atual
3. Criar issues para 🔵 (backlog)
```

## Dependências
- `pytest` instalado no ambiente
- `pytest-json-report` (opcional, para output estruturado)
- Acesso ao código-fonte do projeto (para sugerir correções)
~~~
## Exemplos de uso

### Exemplo 1: Executar testes de módulo específico
```
Você: "Use a skill api-testing para o módulo tests/api/test_pedidos.py com comando pytest tests/api/test_pedidos.py -v"

Copilot carrega api-testing → executa pytest → analisa falhas → retorna plano priorizado
```

### Exemplo 2: Analisar output de testes já executados
~~~
Você: "Use a skill api-testing para analisar esta falha:"
[cola output do terminal]

Copilot carrega api-testing → pula execução → analisa output fornecido → propõe correções
~~~

#### scripts/run_tests.py (opcional mas útil):

~~~python
#!/usr/bin/env python3
"""Script auxiliar para executar testes e capturar output estruturado."""
import subprocess
import sys
import json

def run_tests(test_path: str, extra_args: list = None) -> dict:
    """
    Executa pytest e retorna resultados estruturados.
    
    Args:
        test_path: Caminho para testes (arquivo ou pasta)
        extra_args: Argumentos adicionais do pytest
    
    Returns:
        Dict com exit_code, stdout, stderr, e JSON report (se disponível)
    """
    args = extra_args or []
    cmd = ["pytest", test_path, "--json-report", "--json-report-file=.pytest_report.json"] + args
    
    result = subprocess.run(cmd, capture_output=True, text=True)
    
    # Tentar carregar JSON report
    report = None
    try:
        with open(".pytest_report.json") as f:
            report = json.load(f)
    except FileNotFoundError:
        pass
    
    return {
        "exit_code": result.returncode,
        "stdout": result.stdout,
        "stderr": result.stderr,
        "json_report": report
    }

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python run_tests.py <test_path> [extra_args...]")
        sys.exit(1)
    
    test_path = sys.argv[1]
    extra_args = sys.argv[2:]
    
    results = run_tests(test_path, extra_args)
    print(json.dumps(results, indent=2))
~~~

### Skill 2: api-scaffolding (Gerar Boilerplate FastAPI)

**Propósito:** Gerar estrutura completa de endpoint com padrão do time.

#### Estrutura de pastas:
```
.github/skills/api-scaffolding/
├── SKILL.md
└── templates/
    ├── router_template.py
    ├── schema_template.py
    ├── service_template.py
    └── test_template.py
```

#### SKILL.md completo:

~~~markdown
---
name: "api-scaffolding"
description: "Gera estrutura completa de endpoint FastAPI no padrão do time"
version: "1.0.0"
---

## Objetivo
Criar boilerplate de endpoint FastAPI completo (router + schema + service + tests) seguindo convenções do projeto.

Esta skill é útil quando:
- Você precisa criar novo endpoint REST
- Quer garantir consistência com padrões do time
- Não quer copiar/colar código de outros endpoints e adaptar manualmente

## Entradas esperadas

### Obrigatórias:
- **feature_name**: Nome da feature (ex: `"produtos"`, `"notificações"`)
- **http_method**: Método HTTP (`GET`, `POST`, `PUT`, `DELETE`)
- **route_path**: Caminho da rota (ex: `"/api/produtos"`, `"/api/produtos/\{id\}"`)

### Opcionais:
- **schema_fields**: Campos do schema Pydantic se diferentes do padrão
- **include_tests**: Boolean (default: true) - gerar testes ou não

## Passos de execução

### 1. Normalizar inputs
- Converter `feature_name` para snake_case (`minha_feature`)
- Extrair entity name singular (produtos → produto)
- Determinar tipo de operação (CREATE/READ/UPDATE/DELETE) baseado em method + path

### 2. Gerar schema Pydantic
Usar `templates/schema_template.py` para criar:
- `{Entity}Create` (para POST)
- `{Entity}Update` (para PUT/PATCH)
- `{Entity}Response` (para retornos)

Aplicar validações padrão:
- Campos obrigatórios com `Field(...)`
- Validações de tipo (EmailStr, UUID, etc.)
- Limites (min/max para numéricos, min_length/max_length para strings)

### 3. Gerar router FastAPI
Usar `templates/router_template.py` para criar:
- Definição de APIRouter
- Decorador com method + path corretos
- Injeção de dependências (DB session se aplicável)
- Chamada ao service layer
- Tratamento de erros com HTTPException

### 4. Gerar service layer
Usar `templates/service_template.py` para criar:
- Função de serviço com lógica de negócio placeholder
- Validações de domínio
- Interação com repositório/ORM

### 5. Gerar testes (se include_tests=true)
Usar `templates/test_template.py` para criar:
- Fixtures necessárias (cliente HTTP, dados fake)
- Teste de caso feliz (happy path)
- Teste de validação de campo obrigatório
- Teste de erro de domínio (404, 400, etc.)

### 6. Inserir em estrutura de pastas
Criar arquivos em:
- `app/api/routes/{feature_name}.py` (router)
- `app/schemas/{feature_name}.py` (schemas)
- `app/services/{feature_name}.py` (service)
- `tests/api/test_{feature_name}.py` (testes)

### 7. Listar próximos passos manuais
Gerar checklist:
- [ ] Implementar lógica de negócio real em service
- [ ] Conectar ao modelo do banco (ORM)
- [ ] Ajustar validações de schema conforme regras de negócio
- [ ] Adicionar autenticação/autorização se necessário
- [ ] Rodar testes e verificar que passam

## Saída esperada

```markdown
## Arquivos Gerados

### 1. app/api/routes/produtos.py
```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.schemas.produtos import ProdutoCreate, ProdutoResponse
from app.services.produtos import create_produto
from app.api.dependencies import get_db

router = APIRouter(prefix="/api/produtos", tags=["produtos"])

@router.post("/", response_model=ProdutoResponse, status_code=status.HTTP_201_CREATED)
def create_produto_endpoint(
    produto: ProdutoCreate,
    db: Session = Depends(get_db)
):
    """Cria novo produto."""
    try:
        result = create_produto(db, produto)
        return result
    except ValueError as e:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=str(e))
```

### 2. app/schemas/produtos.py
[schema code]

### 3. app/services/produtos.py
[service code]

### 4. tests/api/test_produtos.py
[test code]

## Próximos Passos Manuais
- [ ] Implementar lógica real em `create_produto` service
- [ ] Conectar ao modelo `Produto` do ORM
- [ ] Ajustar validações no `ProdutoCreate` schema
- [ ] Rodar testes: `pytest tests/api/test_produtos.py -v`
- [ ] Registrar router em `app/main.py`: `app.include_router(produtos.router)`
```

## Dependências
- FastAPI instalado
- Pydantic para schemas
- SQLAlchemy (se usando ORM)
- pytest para testes

## Templates incluídos
Esta skill usa os seguintes templates na pasta `templates/`:
- `router_template.py`: Estrutura básica de APIRouter
- `schema_template.py`: Schemas Pydantic com validações
- `service_template.py`: Funções de serviço com placeholder
- `test_template.py`: Testes básicos (happy path + validação + erro)
~~~

## Exemplos de uso

### Exemplo 1: Endpoint POST para criar produto
```
Você: "Use a skill api-scaffolding para criar endpoint POST /api/produtos para feature produtos"

Copilot carrega api-scaffolding → gera 4 arquivos → lista próximos passos
```

### Exemplo 2: Endpoint GET por ID
```
Você: "Use api-scaffolding para GET /api/produtos/\{id\} feature produtos"

Copilot adapta templates para operação READ → gera código específico
```

#### templates/router_template.py (exemplo):

~~~python
"""Template para geração de routers FastAPI."""

ROUTER_TEMPLATE = '''
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.schemas.{feature_snake} import {EntityPascal}Create, {EntityPascal}Response
from app.services.{feature_snake} import {operation_name}
from app.api.dependencies import get_db

router = APIRouter(prefix="{route_prefix}", tags=["{feature_snake}"])

@router.{http_method_lower}("{route_path}", response_model={EntityPascal}Response, status_code=status.HTTP_{status_code})
def {endpoint_name}(
    {params}
    db: Session = Depends(get_db)
):
    """{docstring}"""
    try:
        result = {operation_name}(db, {args})
        return result
    except ValueError as e:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=str(e))
    except KeyError as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail=str(e))
'''

def generate_router(feature_name: str, http_method: str, route_path: str) -> str:
    """Gera código do router baseado nos inputs."""
    # Implementação que substitui placeholders do template
    pass
~~~

## 🎯 Como Invocar Uma Skill

Skills são **ativadas explicitamente** na conversa:

```
# Sintaxe:
"Use a skill [nome-da-skill] para [tarefa]"

# Exemplos:
"Use a skill api-testing para o módulo tests/api/test_pedidos.py"
"Use a skill api-scaffolding para criar POST /api/produtos"
"Use skill api-testing para analisar estas falhas de teste: [cola output]"
```

**O Copilot vai:**
1. Carregar o `SKILL.md` correspondente
2. Ler passos de execução
3. Executar sequência definida
4. Usar scripts/templates incluídos na pasta da skill
5. Retornar saída conforme especificado no manifesto

## 📊 Skill vs Prompt File vs Agent: Quando Usar O Quê?

Use esta tabela de decisão:

| Situação | Recurso Recomendado | Por quê |
|----------|---------------------|---------|
| Criar endpoint simples | Prompt File (`/create-endpoint`) | Tarefa direta, sem assets auxiliares |
| Criar CRUD completo com testes + docs | **Skill (`api-scaffolding`)** | Múltiplos arquivos, templates necessários |
| Revisar código sob perspectiva de segurança | Agent (`@security`) | Mudança de perspectiva, não execução |
| Executar testes + analisar falhas + propor correções | **Skill (`api-testing`)** | Sequência complexa com script auxiliar |
| Refatorar função específica | Prompt_File (`/refactor`) | Tarefa direta, contexto simples |
| Planejar arquitetura de feature | Agent (`@architect`) | Análise estratégica, não execução |
| Gerar migration de banco | **Skill (`db-migration`)** | Script complexo, validação de schema |

**Regra prática:**  
- Tarefa simples → **Prompt File**
- Perspectiva técnica → **Agent**
- Automação complexa multi-step → **Skill**

## 💡 Troubleshooting Comum

### Problema: Skill não é encontrada quando menciono

**Diagnóstico:**
Liste skills disponíveis: "Quais skills estão disponíveis?"

**Soluções:**
- ✅ Confirme pasta `.github/skills/{nome-skill}/`
- ✅ Confirme `SKILL.md` presente na pasta
- ✅ Frontmatter válido (name, description obrigatórios)
- ✅ Recarregue VS Code

### Problema: Skill carrega mas não executa scripts auxiliares

**Sintomas:** Copilot lê o SKILL.md mas não usa `scripts/run_tests.py`.

**Causa:** Scripts precisam ser **referenciados explicitamente** nos "Passos de execução".

**Solução:** No SKILL.md, mencione o script:
```markdown
## Passos de execução
1. Executar testes usando `scripts/run_tests.py` com comando fornecido
2. Parsear JSON output do script
```

### Problema: Templates não são utilizados

**Causa:** Templates precisam ser **lidos e aplicados nos passos**.

**Solução:** Nos passos de execução, instrua explicitamente:
```markdown
2. Gerar router usando `templates/router_template.py`:
   - Ler template
   - Substituir placeholders {{feature_name}}, {{http_method}}
   - Escrever em app/api/routes/{{feature_name}}.py
```

### Problema: Skill muito genérica, resultados inconsistentes

**Causa:** Passos de execução vagos ou sem detalhes.

**Solução:** Seja específico nos passos:
```markdown
# ❌ Vago
1. Analisar falhas
2. Propor correções

# ✅ Específico
1. Parsear output de pytest:
   - Extrair nome do teste from linha "FAILED tests/test_x.py::test_funcao"
   - Extrair assertion error from linha "AssertionError: ..."
   - Capturar stack trace até primeira linha de código do projeto
2. Classificar cada falha por categoria:
   - Assertion mismatch: expected != actual
   - Exception raised: código lançou erro inesperado
   - Setup failed: problema em fixture
3. Para cada falha, gerar correção:
   - Se assertion mismatch → identificar valor wrongdo e sugerir fix
   - Se exception → sugerir tratamento adequado
```

## 📝 Exercício Prático Completo

**Cenário:** Seu time frequentemente precisa gerar **migrations de banco** para novos modelos, mas sempre esqu ecem de:
- Criar índices nas foreign keys
- Adicionar constraints de validação
- Registrar migration no histórico

**Tarefa:** Crie a skill `db-migration`.

**Estrutura sugerida:**
```
.github/skills/db-migration/
├── SKILL.md
├── scripts/
│   └── generate_alembic_migration.py
└── templates/
    └── migration_template.py
```

**Template do SKILL.md:**
```markdown
---
name: "db-migration"
description: "Gera Alembic migration completa com índices e constraints"
version: "1.0.0"
---

## Objetivo
Gerar migration de banco (Alembic) a partir de mudanças em modelos SQLAlchemy,
incluindo automaticamente índices, constraints e validações.

## Entradas esperadas
- **model_name**: Nome do modelo (ex: `Produto`, `Pedido`)
- **changes**: Descrição das mudanças (ex: "adicionar campo preco decimal", "nova tabela categorias")

## Passos de execução
1. Analisar modelo SQLAlchemy identificado
2. Detectar foreign keys → adicionar índices automaticamente
3. Detectar campos com validação (NOT NULL, UNIQUE, CHECK) → incluir constraints
4. Usar `scripts/generate_alembic_migration.py` para gerar arquivo de migration
5. Validar sintaxe SQL gerada
6. Retornar:
   - Arquivo migration gerado
   - Comando para aplicar: `alembic upgrade head`
   - Comando para reverter: `alembic downgrade -1`

## Saída esperada
```python
# migrations/versions/xxx_add_produto_preco.py
def upgrade():
    op.add_column('produtos', sa.Column('preco', sa.Numeric(10, 2), nullable=False))
    op.create_index('ix_produtos_preco', 'produtos', ['preco'])  # ← Índice automático

def downgrade():
    op.drop_index('ix_produtos_preco')
    op.drop_column('produtos', 'preco')
```

[complete o resto conforme as skills de exemplo acima]
```

**Teste:** Use a skill com: "Use skill db-migration para adicionar campo estoque:int ao modelo Produto"

**Critério de sucesso:**
- ✅ Migration gerada com índice automático
- ✅ Constraint NOT NULL se campo obrigatório
- ✅ Funções upgrade/downgrade corretas

## 🎯 Próxima Missão

Na próxima aula (**Combinando Técnicas**) você aprenderá a **orquestrar** todos recursos juntos:
- Holocrons (contexto global)
- Prompt Files (comandos)
- Agents (perspectivas)
- Skills (automação complexa)

Verá fluxo completo: do briefing de feature até código em produção usando todos recursos de forma coordenada.

:::tip 🏆 Treinamento Jedi Completo
Você domina Poderes Avançados (Skills) e sabe criar pacotes de automação complexa com instruções, scripts e templates. Seu arsenal agora tem desde comandos simples até automações sofisticadas sob demanda.
:::
