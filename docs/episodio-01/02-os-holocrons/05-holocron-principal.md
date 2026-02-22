---
title: 05 - Holocron Principal
sidebar_position: 5
description: Criação do arquivo de instruções principal do repositório para padronizar respostas.
---

> *"Eu parei de explicar tudo do zero toda vez. Agora a Força já sabe quem eu sou."*

**Duração estimada:** ~40 min

## Vídeo introdutório

<video controls width="100%" preload="metadata">
	<source src="/copilot-na-pratica/videos/05-holocron-principal.mp4" type="video/mp4" />
	Seu navegador não suporta vídeo HTML5.
</video>

## O Problema da Repetição

Você já percebeu que precisa explicar a mesma coisa em toda conversa nova com o Copilot?

**Cenário típico SEM instruções persistentes:**

```
Segunda-feira - Nova thread:
Você: "Crie endpoint de usuários"
Copilot: [Gera código em Flask]
Você: "Não, use FastAPI!"
Copilot: [Corrige para FastAPI]

Terça-feira - Nova thread:
Você: "Crie endpoint de produtos"  
Copilot: [Gera código em Flask DE NOVO]
Você: "Você esqueceu que uso FastAPI??" 😤
```

**Por que isso acontece:** Cada thread (conversa) começa do ZERO. O Copilot não "lembra" de conversas anteriores. Você gasta tempo repetindo contexto (stack, padrões, convenções) em cada interação.

**Custo da repetição:**
- 2-3 minutos por thread reexplicando stack
- Inconsistência (às vezes você esquece de mencionar algo)
- Frustração crescente

**Solução:** **Instruções persistentes** — regras que o Copilot lê AUTOMATICAMENTE em toda conversa, sem você precisar repetir.

---

## 🔍 Como Funcionam Instruções Persistentes

### O que acontece quando você tem `.github/copilot-instructions.md`:

1. **Você abre qualquer arquivo** do projeto
2. **Copilot detecta automaticamente** o arquivo `.github/copilot-instructions.md`
3. **Lê as instruções** antes de responder qualquer pergunta
4. **Aplica as regras** em TODAS as respostas dessa conversa

```
┌─────────────────────────────────────────────┐
│ Você pergunta: "Crie endpoint de produtos" │
└──────────────┬──────────────────────────────┘
               │
               ├─→ [1] Copilot lê .github/copilot-instructions.md
               │      "Stack: FastAPI, Python 3.13..."
               │
               ├─→ [2] Entende contexto do projeto automaticamente
               │
               └─→ [3] Gera código já em FastAPI
                      (sem você precisar mencionar!)
```

**Vantagem:** Você configura UMA VEZ, funciona para SEMPRE (até mudar o arquivo).

### Precedência de Instruções

Quando múltiplas fontes de instrução existem:

1. ✅ **Mais específico ganha:** Instruções por pasta (próxima lição) sobrescrevem globais
2. ⚠️ **.github/copilot-instructions.md:** Base global, aplicada em todo o projeto
3. ⏸️ **Prompt da conversa:** Você ainda pode sobrescrever tudo explicitamente

**Exemplo prático:**
- **copilot-instructions.md diz:** "Use pytest para testes"
- **Você pergunta:** "Crie teste usando unittest"
- **Resultado:** Copilot usa unittest (você sobrescreveu a instrução persistente)

---

## Arquivo Central do Templo

O **Holocron Principal** (nome temático para arquivo de instruções globais) fica em:

```
.github/copilot-instructions.md
```

**Por que nesse caminho específico?**
- `.github/` é pasta padrão do GitHub para configurações do repositório
- `copilot-instructions.md` é o nome que o Copilot procura automaticamente
- Funciona em qualquer branch (é versionado com o código)

💡 **Se o arquivo NÃO estiver nesse caminho exato:** O Copilot não vai encontrar. O nome e localização são fixos.

### Arquivo Alternativo: AGENTS.md

Opcionalmente, você pode usar:

```
AGENTS.md
```

(na raiz do projeto)

**Quando usar AGENTS.md em vez de copilot-instructions.md:**
- Quando você quer focar em comportamentos de agentes customizados
- Quando usa múltiplos LLMs e quer arquivo mais genérico
- Preferência do time por nome mais autodescritivo

**Recomendação:** Use `.github/copilot-instructions.md` (é o padrão oficial do Copilot).

---

## Ponto de Partida com `/init`

Em vez de escrever instrução do zero, use o comando **`/init`** para gerar um rascunho automático.

### Como usar:

1. Abra o Chat View (`Ctrl+Alt+I`)
2. Digite: `/init`
3. Copilot analisa seu projeto e gera rascunho de instruções
4. **Importante:** Revise e ajuste manualmente — o rascunho é ponto de partida, não versão final

**O que `/init` detecta automaticamente:**
- Linguagens de programação usadas (Python, JavaScript, etc.)
- Frameworks principais (FastAPI, React, Django)
- Estrutura de pastas (routers/, services/, tests/)
- Ferramentas de build e teste (pytest, npm, docker-compose)

**Exemplo de saída do `/init`:**
```markdown
# Instructions for GitHub Copilot

## Project Overview
Python project using FastAPI framework with PostgreSQL database.

## Tech Stack
- Python 3.11
- FastAPI
- PostgreSQL
- Docker

## Code Style
- Follow PEP 8
- Use type hints
- Docstrings for public functions
```

💡 **Após `/init`:**
- Copie o conteúdo gerado
- Cole em `.github/copilot-instructions.md`
- **Refine manualmente:** Adicione stack EXATA (Python 3.13, não 3.11), convenções específicas do time, idioma pt-BR

---

## Estrutura Recomendada do Holocron Principal

Todo Holocron Principal deve conter 4 seções essenciais:

### 1. Stack Fixa

Liste EXATAMENTE as tecnologias que o projeto usa:

```markdown
## Stack
- Python 3.13 (não sugerir <=3.12)
- FastAPI (não Flask, não Django)
- Docker Compose (ambiente local)
- Bancos: PostgreSQL, MongoDBe Redis
```

**Por que especificar versões:**
- Python 3.13 tem features que 3.12 não tem
- Evita sugestões de código incompatível
- FastAPI tem APIs diferentes de Flask/Django

---

### 2. Convenções de Código

Padrões que TODO código do projeto deve seguir:

```markdown
## Convenções
- Nomes de funções: snake_case em português (criar_usuario, não createUser)
- Nomes de classes: PascalCase (UsuarioService, não usuario_service)
- Docstrings: Google Style
- Type hints obrigatórios em funções públicas
- Tratamento de erro: HTTPException com detail padronizado
```

**Exemplo de impacto:**

SEM convenção definida:
```python
# Copilot pode gerar:
def CreateUser(data):  # ❌ PascalCase em função
    ...
```

COM convenção definida:
```python
# Copilot gera:
def criar_usuario(data: UsuarioCreate) -> Usuario:  # ✅ snake_case + type hints
    """Cria novo usuário no sistema."""
    ...
```

---

### 3. Organização do Projeto

Como o código está estruturado:

```markdown
## Organização
- `app/routers/`: Rotas HTTP (endpoints)
- `app/services/`: Lógica de negócio
- `app/models/`: Modelos de banco (SQLAlchemy/Pydantic)
- `app/schemas/`: Schemas Pydantic para validação
- `tests/`: Testes com pytest

Sempre separar router → service → repository.
Nunca colocar lógica de negócio nos routers.
```

**Por que isso importa:**
- Copilot vai criar arquivos nas pastas certas
- Vai seguir arquitetura em camadas automaticamente
- Evita misturar responsabilidades

---

### 4. Comportamento da IA

Como o Copilot deve responder:

```markdown
## Resposta da IA
- Idioma: português do Brasil (pt-BR)
- Tom: objetivo, sem introduções longas
- NÃO inventar requisitos que não foram mencionados
- NÃO sugerir bibliotecas fora da stack do projeto
- Sempre priorizar padrões já existentes no repositório
- Quando não houver contexto suficiente: perguntar em vez de assumir
```

**Exemplo de impacto:**

SEM instrução sobre idioma:
```
Copilot: "Create a new endpoint for user registration..."
```

COM instrução de idioma pt-BR:
```
Copilot: "Crie endpoint para cadastro de usuário..."
```

---

### Template Completo Pronto para Usar

Crie o arquivo `.github/copilot-instructions.md` com este conteúdo (ajuste para seu projeto):

```markdown
# Holocron Principal do Projeto

## Stack Fixa
- Python 3.13
- FastAPI (framework web)
- Docker Compose (orquestração local)
- PostgreSQL 15 (banco principal)
- Redis (cache)
- MongoDB (logs e eventos)

## Ferramentas de Desenvolvimento
- pytest (testes)
- black (formatação)
- ruff (linting)
- pydantic (validação)
- alembic (migrations)

## Convenções de Código

### Nomenclatura
- Funções e variáveis: `snake_case`
- Classes: `PascalCase`
- Constantes: `UPPER_SNAKE_CASE`
- Nomes em português para domínio de negócio
- Nomes técnicos em inglês (commit, deploy, handler)

### Padrões
- Type hints obrigatórios em funções públicas
- Docstrings Google Style para classes e funções públicas
- Tratamento de erro com `HTTPException` (FastAPI)
- Validação de entrada com Pydantic
- Logs estruturados (JSON)

## Organização do Projeto

### Estrutura de Pastas

app/
├── routers/       # Endpoints HTTP (rotas)
├── services/      # Lógica de negócio
├── repositories/  # Acesso a bancos de dados
├── models/        # Modelos ORM (SQLAlchemy)
├── schemas/       # Schemas Pydantic (validação)
└── core/          # Configurações, dependências

tests/
├── unit/          # Testes unitários
├── integration/   # Testes de integração
└── fixtures/      # Fixtures pytest reutilizáveis

### Arquitetura em Camadas
- Router → Service → Repository
- Router apenas roteia e valida entrada
- Service contém lógica de negócio
- Repository acessa banco de dados
- Nunca pular camadas

## Comportamento da IA

### Idioma e Tom
- Sempre responder em português do Brasil (pt-BR)
- Tom objetivo e direto
- Código comentado apenas quando lógica é complexa
- Docstrings em português

### Restrições
- NÃO sugerir bibliotecas fora da stack listada
- NÃO inventar requisitos não mencionados
- NÃO usar Flask, Django ou outros frameworks
- NÃO usar SQLite (apenas PostgreSQL/MongoDB/Redis)

### Prioridades
1. Seguir padrões já existentes no repositório
2. Buscar exemplos similares com #codebase
3. Perguntar quando contexto é insuficiente
4. Código deve ser pronto para produção (com testes)

## Testes
- Framework: pytest
- Cobertura mínima: 80%
- Todo endpoint precisa de teste
- Preferir fixtures a setup/teardown
- Mockar dependências externas (banco, APIs)
```

💡 **Após criar o arquivo:**
1. Commit no repositório (`git add .github/copilot-instructions.md`)
2. Abra nova thread no chat
3. Faça uma pergunta genérica e veja se a resposta já vem configurada

---

## O Que NÃO Colocar no Holocron Principal

### ❌ Regras de Negócio Específicas

**Errado:**
```markdown
- CPF deve ser validado com dígitos verificadores
- Desconto máximo é 20%
- Cliente só pode fazer 3 pedidos por dia
```

**Por quê:** Regras de negócio mudam frequentemente e são específicas de domínio. Elas vão em **Pergaminhos de Domínio** (próxima lição).

**Onde colocar:** `docs/business-rules/` (arquivos Markdown específicos por regra).

---

### ❌ Informação Volátil

**Informação volátil** = temporária, muda frequentemente:

**Exemplos:**
```markdown
- Sprint atual: implementar autenticação OAuth
- Deadline: 15/03/2024
- Feature flags ativas: [novo-checkout, modo-dark]
- Bug conhecido: redis cai às 3h da manhã
```

**Por quê:** Copilot vai usar essa informação mesmo depois que não for mais verdade.

**Onde colocar:**
- Deadlines: Jira/Linear/ferramentas de gestão
- Feature flags: Arquivo de configuração separado (não instrução)
- Bugs: Issues do GitHub

**Como identificar informação volátil:** Pergunte "isso ainda será verdade daqui 3 meses?" Se não, não coloque no Holocron.

---

### ❌ Informações Sensíveis

**Nunca coloque:**
- Senhas, tokens, chaves API
- URLs de produção com credenciais
- Nomes de clientes reais
- Dados pessoais (LGPD/GDPR)

**Por quê:** O arquivo é versionado e pode ser exposto. Use variáveis de ambiente (`.env`).

---

## Validação Prática

Depois de criar `.github/copilot-instructions.md`, teste se está funcionando:

### Teste 1: Stack Correta

1. Abra Chat View (`Ctrl+Alt+I`)
2. Inicie nova thread (botão ➕)
3. Pergunte algo genérico: **"Como criar endpoint para listar produtos?"**
4. Verifique a resposta:
   - ✅ Usa FastAPI (não Flask/Django)?
   - ✅ Está em português?
   - ✅ Segue estrutura router/service que você definiu?

💡 **Se não funcionar:**
- Arquivo está exatamente em `.github/copilot-instructions.md`?
- Você reiniciou a thread depois de criar o arquivo?
- Extensão do Copilot está atualizada?

---

### Teste 2: Convenções Aplicadas

1. Peça: **"Crie função para validar CPF"**
2. Verifique:
   - ✅ Nome em snake_case (`validar_cpf`, não `validarCPF`)?
   - ✅ Tem type hints if você pediu?
   - ✅ Docstring no estilo Google?

---

### Teste 3: Idioma Consistente

1. Faça 3 perguntas diferentes em threads separadas
2. Todas as respostas devem vir em pt-BR (se você configurou assim)
3. Se alguma vier em inglês, revise a seção "Comportamento da IA" do arquivo

---

## Manutenção do Holocron

**Quando atualizar `.github/copilot-instructions.md`:**

- ✅ Time adota nova ferramenta (ex: adiciona Celery para filas)
- ✅ Muda padrão de código (ex: de snake_case para camelCase)
- ✅ Atualiza versão de linguagem (Python 3.13 → 3.14)
- ✅ Alguém novo no time precisa de clareza sobre padrões

**Como atualizar:**
1. Edite o arquivo
2. Commit com mensagem clara: `docs: atualiza stack com Celery`
3. Avise o time (PR ou mensagem)
4. Todos devem reiniciar VS Code ou threads antigas

**Frequência típica:** 1-2 atualizações por mês em projetos ativos.

---

:::tip 🏆 Treinamento Jedi Completo
Você criou o Holocron Principal (`.github/copilot-instructions.md`) e eliminou o retrabalho de repetir contexto em toda conversa. O Copilot agora "conhece" seu projeto automaticamente, gerando código consistente com sua stack e padrões desde a primeira interação.
:::
