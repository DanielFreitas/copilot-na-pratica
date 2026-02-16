# PLANO DEFINITIVO: Tornar as Lições Autoexplicativas

Problema identificado: **Lições usam termos técnicos sem explicá-los no momento da primeira aparição**. O glossário é um band-aid que força o leitor a interromper a leitura.

---

## 🔴 Prioridade Crítica

### 1. Explicar termos IN-CONTEXT quando aparecem pela primeira vez
**Justificativa:** 85-90% dos termos técnicos são usados no corpo sem explicação, forçando consulta ao glossário.

**Problema atual:**

[primeira-missao.md](docs/01-o-despertar-da-forca/03-primeira-missao.md#L36):
```markdown
Entregar: router, schema Pydantic, serviço e teste de caso feliz + inválido.
```
❌ Usa 4 termos arquiteturais sem explicar o que são.

[movimentos-rapidos.md](docs/03-tecnicas-de-sabre/08-movimentos-rapidos.md#L29):
```markdown
tools: ["#codebase", "#editFiles"]
```
❌ Símbolos aparecem em código sem explicar seu significado.

[ativando-droids.md](docs/05-os-droids/16-ativando-droids.md#L46):
```json
"type": "stdio"
```
❌ Termo técnico no JSON sem contexto.

**Padrão NOVO para primeira menção:**

```markdown
[termo técnico] ([breve explicação entre parênteses])

OU

Use [termo técnico] — que [explicação imediata em formato cláusula] — para [objetivo].
```

**Exemplos MELHORADOS:**

**Para [primeira-missao.md](docs/01-o-despertar-da-forca/03-primeira-missao.md#L36):**
```markdown
Entregar: 
- **router** (arquivo que define as rotas HTTP da API)
- **schema Pydantic** (modelo de dados que valida entrada/saída)
- **serviço** (camada de lógica de negócio)
- **teste** cobrindo caso feliz e inválido
```

**Para [movimentos-rapidos.md](docs/03-tecnicas-de-sabre/08-movimentos-rapidos.md#L27-30):**
```markdown
---
description: "Cria um endpoint FastAPI com schema e testes"
mode: "agent"
tools: ["#codebase", "#editFiles"]  
---

💡 **Sobre as ferramentas (tools):**
- `#codebase`: permite ao Copilot pesquisar semanticamente em todo o repositório para encontrar exemplos
- `#editFiles`: permite criar/modificar múltiplos arquivos automaticamente

Crie um endpoint FastAPI para ${input:featureName}.
```

**Para [ativando-droids.md](docs/05-os-droids/16-ativando-droids.md#L43-51):**
```json
{
  "$schema": "...",
  "servers": {
    "filesystem": {
      "type": "stdio",    // stdio = comunicação via entrada/saída padrão (mais simples para processos locais)
      "command": "node",  // comando para iniciar o servidor MCP
      "args": ["./tools/filesystem-mcp.js"],  // caminho do script do servidor
      "enabled": false    // desabilitado por padrão por segurança
    }
  }
}
```

**Padrão para exemplos de código:**
- Adicionar comentários inline explicando cada parte não-óbvia
- Para JSON: comentários `//` (mesmo que tecnicamente inválidos, são didáticos)
- Para YAML/Markdown: seção "💡 Entendendo cada parte" logo após o exemplo

**Aplicar em TODAS as 26 lições** revisando:
1. Identificar primeira aparição de cada termo técnico
2. Adicionar explicação inline imediatamente
3. Anotar exemplos de código com comentários explicativos

---

### Backend: FastAPI + Python 3.13
**FastAPI** é um framework Python para criar APIs REST. A arquitetura padrão usa:

- **Router** (roteador): Arquivo que define as rotas HTTP (ex: `GET /users`, `POST /products`)
  ```python
  @router.get("/produtos")  # Define a rota
  def listar_produtos():
      return servico.listar()
  ```

- **Schema Pydantic**: Modelo de dados que valida automaticamente entrada e saída
  ```python
  class Produto(BaseModel):
      nome: str          # Campo obrigatório
      preco: float       # Valida que é número
  ```

- **Serviço** (service layer): Camada com a lógica de negócio, separada das rotas
  ```python
  def criar_produto(dados):
      # validações, cálculos, regras de negócio
      return repositorio.salvar(dados)
  ```

Esta separação (router → serviço → banco) mantém o código organizado e testável.

### Dados: PostgreSQL + Redis + MongoDB
- **PostgreSQL**: Banco relacional principal (tabelas com relacionamentos)
- **Redis**: Cache em memória para dados temporários
- **MongoDB**: Banco de documentos para dados não-estruturados

### Infraestrutura: Docker
**Docker** empacota a aplicação com todas as dependências. 

- **"Docker local"**: Executar containers na sua máquina (não em servidor remoto)
- **docker-compose**: Orquestra múltiplos containers (API + Postgres + Redis)

### Conceitos de Arquivos

#### JSON (JavaScript Object Notation)
Formato de dados estruturados em texto:
```json
{
  "nome": "valor",           // string
  "numero": 42,              // número
  "ativo": true,             // booleano
  "tags": ["python", "api"], // array
  "config": {                // objeto aninhado
    "porta": 8000
  }
}
```

#### YAML (Yet Another Markup Language)
Alternativa ao JSON, mais legível:
```yaml
nome: valor
numero: 42
tags:
  - python
  - api
config:
  porta: 8000
```

#### Markdown
Formato de texto com formatação simples:
```markdown
# Título
**Negrito** e *itálico*
- Lista
- Com itens
```

**Frontmatter**: Metadados no topo de arquivos Markdown
```markdown
---
description: "Metadados aqui"
mode: "agent"
---

Conteúdo do arquivo começa aqui.
```
O bloco entre `---` é o frontmatter (YAML), o resto é o corpo.

### Conceitos de Arquitetura

#### Endpoint
Um "endereço" da API que responde a requisições HTTP:
```
POST /api/usuarios        ← Endpoint para criar usuário
GET /api/usuarios/123     ← Endpoint para buscar usuário 123
```

#### Payload
Dados enviados no corpo de uma requisição HTTP:
```json
// Payload de uma requisição POST
{
  "nome": "João",
  "email": "joao@exemplo.com"
}
```

#### Fixtures
Dados de teste predefinidos e reutilizáveis:
```python
@pytest.fixture
def cliente_teste():
    return {"nome": "Teste", "cpf": "000.000.000-00"}
```

#### Boilerplate
Código repetitivo e estrutural necessário em múltiplos lugares:
```python
# Boilerplate FastAPI
app = FastAPI()
app.add_middleware(CORSMiddleware, ...)
app.include_router(router)
```

### Conceitos de Caminho de Arquivos

#### Estrutura de diretórios
```
.github/              ← Configurações do repositório
  copilot-instructions.md
  prompts/
    criar-api.prompt.md
app/                  ← Código da aplicação
  routers/
  services/
tests/                ← Testes automatizados
```

#### Padrões Glob
Notação para selecionar múltiplos arquivos:
```
app/**/*.py           # Todos os .py dentro de app/ (qualquer profundidade)
tests/*.py            # Todos os .py diretamente em tests/ (não em subpastas)
docker-compose*.yml   # Arquivos que começam com docker-compose
```
- `*` = qualquer caracteres
- `**` = qualquer subpasta
- `/` = separador de pasta (funciona em Windows e Linux)

**💡 Entendendo cada elemento:**

| Campo | O que faz | Por que é importante |
|-------|-----------|---------------------|
| `description` | Texto exibido no menu ao digitar `/` | Ajuda a encontrar o comando certo |
| `mode: "agent"` | Copilot pode usar ferramentas automaticamente | Evita pedir permissão para cada busca |
| `tools` | Lista de ferramentas permitidas | Limita ações para segurança |
| `${input:X}` | Substitui por valor fornecido ao executar | Torna o prompt reutilizável |

**Quando você executa `/create-endpoint` e digita "produtos":**
1. `${input:featureName}` vira "produtos"
2. Copilot pesquisa exemplos com `#codebase`
3. Cria/edita arquivos com `#editFiles`
4. Respeita padrões encontrados nos exemplos
```

**Aplicar este padrão em:**
- Exemplos JSON (MCP configs)
- Exemplos YAML (frontmatter)
- Exemplos Markdown (prompts, agents, skills)
- Exemplos Python (se houver trechos de código)

**Formato:**
1. Mostrar exemplo completo com comentários inline
2. Adicionar tabela "Entendendo cada elemento" explicando campos
3. Adicionar seção "Quando você executa..." mostrando fluxo

---

### 4. Eliminar jargão cascade (usar termo A para definir termo B)
**Justificativa:** Definições circulares impedem compreensão. Ex: "Tool é função disponibilizada por servidor MCP" — mas o que é "servidor MCP"?

**Exemplos encontrados:**

[ativando-droids.md](docs/05-os-droids/16-ativando-droids.md#L92):
```markdown
- **Tool:** função disponibilizada por um servidor MCP.
```
❌ Usa "servidor MCP" para definir "tool" — circular.

[primeira-missao.md](docs/01-o-despertar-da-forca/03-primeira-missao.md#L61):
```markdown
- **Contexto técnico:** dados de arquitetura, linguagem, framework e ambiente.
```
❌ Usa 4 termos técnicos (arquitetura, framework, ambiente) sem defini-los.

**Regra para reescrever definições:**

1. **Definir antes de usar:** Sempre explique termo A antes de usá-lo na definição de termo B
2. **Usar linguagem simples primeiro:** Começar com explicação em português claro, depois termos técnicos
3. **Example-first:** Dar exemplo concreto antes da definição abstrata

**Exemplos REESCRITOS:**

**Para [ativando-droids.md](docs/05-os-droids/16-ativando-droids.md#L92):**
```markdown
Um **servidor MCP** é um programa separado do VS Code que conecta a sistemas externos (bancos de dados, APIs, arquivos). Ele disponibiliza **tools** (ferramentas) — funções que o Copilot pode invocar para buscar ou modificar dados.

**Exemplo:** O servidor MCP "filesystem" oferece a tool `list_files()` que permite ao Copilot listar arquivos do disco.
```

**Para [primeira-missao.md](docs/01-o-despertar-da-forca/03-primeira-missao.md#L61):**
```markdown
**Contexto técnico** inclui:
- **Linguagem e versão:** Python 3.13, JavaScript ES6, etc.
- **Framework:** FastAPI, React, Django — biblioteca principal que estrutura o código
- **Arquitetura:** Como o código está organizado (routers → services → repositories)
- **Ambiente:** Onde roda (Docker local, Kubernetes, AWS Lambda)

**Exemplo completo:** "Backend em FastAPI rodando em Docker local, usando arquitetura limpa com separação router/service/repository"
```

---

### 5. Reduzir drasticamente ou remover glossários
**Justificativa:** Se os termos estão bem explicados no corpo, glossários viram duplicação desnecessária.

**Decisão:**

**Remover glossários completamente**
- Assumir que corpo já explicou suficientemente

---

## 🟡 Alta Prioridade

### 6. Adicionar seção "Como Funciona" com fluxos visuais
**Justificativa:** Conceitos abstratos (contexto, carregamento, precedência) precisam de modelos visuais, use imagens .svg.


### 7. Adicionar troubleshooting integrado ao fluxo narrativo
**Justificativa:** Em vez de seção separada, integrar "pontos de atenção" onde problemas tipicamente acontecem.

