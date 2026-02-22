---
title: 08 - Movimentos Rápidos
sidebar_position: 8
description: Criação de Prompt Files para automatizar pedidos recorrentes via slash command.
---

> *"Movimentos rápidos pra situações recorrentes. Eu invoco com um gesto e a Força executa."*

**Duração estimada:** ~35 min

## Vídeo introdutório

<video controls width="100%" preload="metadata">
	<source src="/copilot-na-pratica/videos/08-movimentos-rapidos.mp4" type="video/mp4" />
	Seu navegador não suporta vídeo HTML5.
</video>

## Pré-requisitos obrigatórios

Antes desta aula, você deve ter configurado:
- ✅ Holocron Principal (`.github/copilot-instructions.md`)
- ✅ Pelo menos um Holocron de território (ex: `api.instructions.md`)

Os Prompt Files que você criar vão **herdar** essas instruções automaticamente.

## O Problema: Repetir os Mesmos Pedidos Toda Semana

Analise estes pedidos reais que você provavelmente já fez dezenas de vezes:

```
"Crie endpoint FastAPI para cadastro de produtos com schema Pydantic e testes"
"Revise este código e aponte riscos de segurança e manutenção"
"Gere testes unitários para este serviço cobrindo caso feliz e erros"
"Documente esta função com propósito, parâmetros e exemplos"
"Refatore este trecho reduzindo complexidade ciclomática"
```

Cada vez que você digita isso:
- ❌ Perde 30-60 segundos digitando
- ❌ Pode esquecer parte do pedido ("esqueci de pedir os testes")
- ❌ Resultados inconsistentes (às vezes pede lib que você não usa)

**Prompt Files** (arquivos de prompt reutilizáveis) resolvem isso transformando esses pedidos repetitivos em **comandos de barra** (slash commands = atalhos que começam com `/`).

## 🎯 Como Funcionam Prompt Files

Quando você cria um Prompt File, este fluxo acontece:

```
Você cria: .github/prompts/create-endpoint.prompt.md
    ↓
VS Code detecta arquivos *.prompt.md
    ↓
Registra comando: /create-endpoint
    ↓
Você digita /create-endpoint no chat
    ↓
Copilot carrega o conteúdo do arquivo
    ↓
Executa como se você tivesse digitado manualmente
    ↓
Mas usa instruções padronizadas + variáveis dinâmicas
```

**Vantagens:**
- ⚡ Digite `/create-endpoint` ao invés de 3 linhas de texto
- 📋 Padronize pedidos (toda a equipe usa o mesmo comando)
- 🔄 Evolua prompts (melhore o arquivo, todos se beneficiam)
- 🎯 Combine com Holocrons (herda regras técnicas automaticamente)

## 📁 Estrutura de Pastas e Nomenclatura

Crie seus Prompt Files nesta estrutura:

```
.github/
  prompts/
    create-endpoint.prompt.md       ← Vira comando /create-endpoint
    code-review.prompt.md           ← Vira comando /code-review
    generate-tests.prompt.md        ← Vira comando /generate-tests
    document.prompt.md              ← Vira comando /document
    refactor.prompt.md              ← Vira comando /refactor
```

💡 **Regras de nomenclatura:**
- Nome do arquivo (sem `.prompt.md`) vira o comando `/nome`
- Use kebab-case: `my-command.prompt.md` → `/my-command`
- Seja descritivo: `create-api-endpoint.prompt.md` (bom) vs `novo.prompt.md` (ruim)
- Evite conflitos com comandos nativos (`/explain`, `/fix`, `/tests` já existem)

## 🧬 Anatomia de um Prompt File

Todo Prompt File tem duas partes: **frontmatter** (metadados de configuração) e **corpo** (instruções do prompt).

### Estrutura Completa

```markdown
---
description: "Breve descrição que aparece no autocomplete"
mode: "agent"
tools: ["#codebase", "#editFiles"]
---

[CORPO DO PROMPT]
Instruções detalhadas do que você quer que o Copilot faça.
Pode incluir:
- Listas de requisitos
- Variáveis dinâmicas {'${input:nome}'}
- Referências a padrões do projeto
- Critérios de qualidade
```

### Explicação dos Campos

**description** = texto curto (até 80 caracteres) que aparece quando você digita `/` no chat, ajudando a escolher o comando certo. Exemplo: `"Cria endpoint FastAPI com schema e testes"`

**mode** = define **como** o Copilot vai processar o prompt. Opções:

| Mode | Comportamento | Quando usar |
|------|---------------|-------------|
| `agent` | Executa com autonomia, pode editar múltiplos arquivos, buscar contexto, tomar decisões | ✅ Tarefas complexas (criar endpoint, refatorar módulo) |
| `copilot` | Responde no chat mas não executa ações automaticamente | ⚠️ Revisões, análises, perguntas |
| `prompt` | Executa prompt simples sem autonomia extra | ⚠️ Geração de snippet único |

**Recomendação:** Use `mode: "agent"` na maioria dos prompts práticos (criação, refatoração, testes).

**tools** = lista de **recursos de contexto** que o prompt pode usar. Funciona como permissões:

| Tool | O que permite | Exemplo de uso |
|------|---------------|----------------|
| `#codebase` | Buscar exemplos no repositório inteiro | Encontrar padrão de rotas existente antes de criar nova |
| `#editFiles` | Modificar arquivos diretamente | Criar/editar `app/routes/produtos.py` |
| `#selection` | Acessar código selecionado no editor | Refatorar trecho específico |
| `#file` | Ler arquivo aberto atualmente | Documentar função no arquivo ativo |
| `#terminalSelection` | Ler saída do terminal selecionada | Analisar log de erro |

**Exemplo de combinação:**
```yaml
tools: ["#codebase", "#editFiles"]  
# ↑ Permite buscar exemplos E criar/modificar arquivos
```

## 🔧 Variáveis Dinâmicas: {'${input:...}'}

Use variáveis para tornar prompts reutilizáveis com entradas diferentes:

```markdown
Crie um endpoint FastAPI para ${input:featureName}.
```

Quando você executar `/create-endpoint`, o Copilot vai **perguntar** o valor de `featureName`:

```
Copilot: "Qual o valor de featureName?"
Você: "produtos"
Copilot: [executa com "Crie um endpoint FastAPI para produtos"]
```

**Sintaxe:**
- `${input:nomeVariavel}` → Copilot pergunta o valor
- Use nomes descritivos: `${input:entityName}`, `${input:routePrefix}`, `${input:moduleName}`

**Múltiplas variáveis:**
```markdown
Crie endpoint ${input:httpMethod} ${input:route} para ${input:feature}.
```

Copilot perguntará cada variável em sequência:
1. "Qual o valor de httpMethod?" → POST
2. "Qual o valor de route?" → /api/pedidos
3. "Qual o valor de feature?" → criação de pedido

## 🚀 Kit Inicial de Movimentos Rápidos

Crie estes 5 Prompt Files essenciais para começar:

### 1️⃣ create-endpoint.prompt.md

**Propósito:** Gerar endpoint FastAPI completo com padrão do projeto.

```markdown
---
description: "Cria endpoint FastAPI com schema, serviço e teste"
mode: "agent"
tools: ["#codebase", "#editFiles"]
---

# Objetivo
Crie um endpoint FastAPI completo para ${input:featureName}.

## Requisitos obrigatórios
1. Busque exemplos de endpoints existentes com #codebase
2. Siga o padrão de estrutura de pastas do projeto:
   - Router em `app/api/routes/`
   - Schema Pydantic em `app/schemas/`
   - Lógica de negócio em `app/services/` (não no router)
   - Modelos do banco em `app/models/`
3. Implemente validação de entrada no schema
4. Use HTTPException do FastAPI para erros
5. Retorne DTO de resposta consistente
6. Gere testes básicos em `tests/` cobrindo:
   - Caso feliz (200 OK)
   - Validação de campo obrigatório (400)
   - Erro de domínio esperado (404 ou 400)

## Critérios de qualidade
- ✅ Código deve compilar sem erros
- ✅ Testes devem passar (simulado, não precisa rodar agora)
- ✅ Seguir type hints em todas as funções
- ✅ Documentar com docstrings objetivas

## Entregáveis
Liste arquivos criados e próximos passos manuais (se houver).
```

**Como usar:**
1. Digite `/create-endpoint` no chat
2. Quando perguntado, responda featureName: `"cadastro de produtos"`
3. Copilot vai criar router + schema + service + tests

### 2️⃣ code-review.prompt.md

**Propósito:** Revisão técnica focada em risco e padrão.

```markdown
---
description: "Revisa código focando em risco, segurança e padrão"
mode: "agent"
tools: ["#selection", "#codebase"]
---

# Objetivo
Revisar o código selecionado com análise técnica rigorosa.

## Checklist de revisão
Para o trecho selecionado, analise:

### 1. Riscos funcionais
- Há condições de corrida (race conditions)?
- Validações faltantes que permitem dados inválidos?
- Tratamento de exceção inadequado?

### 2. Riscos de segurança
- Exposição de dados sensíveis em logs ou respostas?
- SQL injection ou command injection possível?
- Validação de autorização faltando?

### 3. Riscos de manutenção
- Complexidade ciclomática alta (muitos ifs aninhados)?
- Dependências hardcoded (URLs, credenciais)?
- Falta de testes para comportamento crítico?

### 4. Divergências de padrão
Compare com #codebase:
- Estrutura de pastas inconsistente?
- Nomenclatura diferente do resto do projeto?
- Stack ou biblioteca fora do padrão?

## Formato de saída
Para cada problema encontrado:
- 🔴 **Crítico** (bloqueia merge)
- 🟡 **Atenção** (corrigir antes de produção)
- 🔵 **Melhoria** (nice-to-have)

Inclua snippet de correção quando possível.
```

**Como usar:**
1. Selecione trecho de código no editor
2. Digite `/code-review` no chat
3. Copilot analisa usando a checklist

### 3️⃣ generate-tests.prompt.md

**Propósito:** Gerar testes com cobertura específica.

```markdown
---
description: "Gera testes unitários com cobertura específica"
mode: "agent"
tools: ["#codebase", "#file", "#editFiles"]
---

# Objetivo
Gerar testes para ${input:moduleName} com cobertura definida.

## Contexto
- Framework: pytest (obrigatório)
- Estilo: AAA (Arrange/Act/Assert)
- Localização: `tests/` (espelhando estrutura de `app/`)

## Cobertura obrigatória
Crie testes para:

### 1. Caso feliz (happy path)
- Entrada válida → saída esperada
- Status 200/201 para APIs
- Assert em todos os campos importantes do retorno

### 2. Validação de campos obrigatórios
- Teste para CADA campo obrigatório faltando
- Verificar status 400 e mensagem de erro descritiva
- Exemplo: se API exige `customer_id` e `items`, criar 2 testes

### 3. Erro esperado de domínio
- Cliente não encontrado → 404
- Permissão negada → 403
- Recurso duplicado → 409
- Limite excedido → 400

### 4. Edge cases documentados
Verifique se há Pergaminhos (docs/business-rules/) sobre este módulo.
Se houver edge cases documentados, crie testes para cada um.

## Padrão de nomenclatura
```python
def test_<cenario>_<resultado_esperado>():
    """Descrição legível do teste"""
```

Exemplos:
- `test_pedido_valido_deve_retornar_201`
- `test_pedido_sem_items_deve_retornar_400`
- `test_cliente_inexistente_deve_retornar_404`

## Fixtures reutilizáveis
Se o teste precisar de dados fake (cliente, produto, etc):
1. Verifique se já existe fixture em `tests/conftest.py`
2. Se não existir, crie fixture reutilizável
3. Use `factory_boy` ou `faker` para dados sintéticos

## Critério de sucesso
- ✅ Pelo menos 1 teste para caso feliz
- ✅ Pelo menos 1 teste por validação de campo
- ✅ Pelo menos 1 teste por tipo de erro esperado
- ✅ Nomenclatura descritiva
- ✅ Assertions específicas (não genéricas como `assert result`)
```

**Como usar:**
1. Abra o arquivo que quer testar (ex: `app/services/pedido.py`)
2. Digite `/generate-tests`
3. Quando perguntado moduleName: `"pedido"`
4. Copilot cria `tests/services/test_pedido.py` completo

### 4️⃣ document.prompt.md

**Propósito:** Documentar código de forma consistente.

```markdown
---
description: "Gera documentação técnica objetiva e completa"
mode: "agent"
tools: ["#file", "#codebase"]
---

# Objetivo
Documentar ${input:target} com formato padrão do projeto.

## Formato de documentação

### Para funções/métodos:
```python
def funcao(param1: tipo, param2: tipo) -> tipo_retorno:
    """
    [Verbo no infinitivo] + o que a função faz.
    
    Args:
        param1: Descrição breve do propósito
        param2: Descrição breve do propósito
        
    Returns:
        Descrição do tipo e estrutura retornada
        
    Raises:
        TipoErro: Quando essa exceção acontece
        
    Example:
        >>> funcao(val1, val2)
        resultado_esperado
    """
```

### Para classes:
```python
class MinhaClasse:
    """
    [Substantivo] que representa [conceito do domínio].
    
    Esta classe é responsável por [responsabilidade principal].
    
    Attributes:
        attr1: Descrição do atributo
        attr2: Descrição do atributo
        
    Example:
        >>> obj = MinhaClasse(param)
        >>> obj.metodo()
        resultado
    """
```

### Para módulos (docstring no topo do arquivo):
```python
"""
[Nome do Módulo em Title Case]

Descrição: [O que este módulo faz no contexto do sistema]

Responsabilidades:
- Responsabilidade 1
- Responsabilidade 2

Dependências:
- Módulo X para Y
- Módulo Z para W
"""
```

## Análise de contexto
1. Use #file para entender o código atual
2. Use #codebase para manter consistência com docs existentes
3. Se houver Pergaminhos relacionados (docs/business-rules/), referencie

## Critérios de qualidade
- ✅ Primeira frase sempre no formato [Verbo] + [o que faz]
- ✅ Exemplos práticos quando função é complexa
- ✅ Documentar exceções possíveis
- ✅ Evitar redundância (não repetir o que o nome da função já diz)

## O que NÃO fazer
- ❌ Documentar o óbvio: `def get_user(id): """Get user"""` (redundante)
- ❌ Descrever implementação interna (descrever O QUE faz, não COMO)
- ❌ Copiar docstring de biblioteca externa (explique no contexto do seu sistema)
```

**Como usar:**
1. Abra arquivo que precisa documentar
2. Digite `/document`
3. Quando perguntado target: `"classe PedidoService"` ou `"função calcular_frete"`

### 5️⃣ refactor.prompt.md

**Propósito:** Refatorar mantendo comportamento.

```markdown
---
description: "Refatora código mantendo comportamento e padrão"
mode: "agent"
tools: ["#selection", "#codebase", "#editFiles"]
---

# Objetivo
Refatorar o trecho selecionado melhorando legibilidade e manutenibilidade SEM alterar comportamento.

## Princípios de refatoração

### 1. Reduzir complexidade ciclomática
- **Problema:** Muitos `if`/`elif`/`else` aninhados
- **Solução:** Early returns, guard clauses, dicionário de estratégias

### 2. Extrair funções
- **Problema:** Função com múltiplas responsabilidades
- **Solução:** Quebrar em funções menores com nome descritivo

### 3. Remover duplicação
- **Problema:** Mesmo código repetido em vários lugares
- **Solução:** Extrair para função reutilizável

### 4. Melhorar nomenclatura
- **Problema:** Variáveis genéricas (`data`, `result`, `x`)
- **Solução:** Nomes descritivos do domínio (`pedido`, `subtotal`, `cliente_ativo`)

### 5. Manter padrões do projeto
- Use #codebase para conferir padrões existentes
- Não introduza novos padrões durante refatoração

## Checklist de segurança
Antes de aplicar refatoração, verifique:
- ✅ Comportamento IDÊNTICO (mesma entrada = mesma saída)
- ✅ Exceções lançadas permanecem as mesmas
- ✅ Efeitos colaterais (I/O, banco) inalterados
- ✅ Performance similar (não introduzir gargalo)

## Formato de entrega
1. Código refatorado completo
2. Explicação breve de cada mudança
3. Sugestão de testes adicionais (se aplicável)

## Exemplo de transformação

**Antes:**
```python
def processar(data):
    if data is not None:
        if "id" in data:
            if data["id"] > 0:
                return salvar(data)
            else:
                raise ValueError("ID inválido")
        else:
            raise ValueError("ID ausente")
    else:
        raise ValueError("Dados vazios")
```

**Depois:**
```python
def processar(data: dict) -> None:
    """Processa pedido validando ID antes de salvar."""
    if data is None:
        raise ValueError("Dados vazios")
    if "id" not in data:
        raise ValueError("ID ausente")
    if data["id"] <= 0:
        raise ValueError("ID inválido")
    
    return salvar(data)
```

**Melhorias aplicadas:**
- Early returns (guard clauses)
- Type hints adicionados
- Níveis de indentação reduzidos (1 vs 4)
- Docstring adicionada
```

**Como usar:**
1. Selecione função ou trecho complexo
2. Digite `/refactor`
3. Copilot aplica técnicas de refatoração

## 🎬 Fluxo Completo: Do Zero ao Primeiro Prompt File

Vamos criar seu primeiro Prompt File passo a passo:

### Passo 1: Criar a pasta (se não existir)

```powershell
New-Item -ItemType Directory -Path "c:\git\copilot-na-pratica\.github\prompts" -Force
```

### Passo 2: Criar o arquivo

Crie `.github/prompts/hello-world.prompt.md`:

```markdown
---
description: "Primeiro prompt file de teste"
mode: "agent"
tools: []
---

Olá! Este é meu primeiro Prompt File.

Responda com:
1. Confirmação de que você leu este prompt
2. Localização deste arquivo no projeto
3. Sugestão de próximo prompt útil para criar
```

### Passo 3: Recarregar VS Code

Após criar o arquivo:
1. Abra Command Palette (`Ctrl+Shift+P`)
2. Digite "Reload Window"
3. Ou feche e reabra o VS Code

### Passo 4: Testar o comando

1. Abra o chat do Copilot
2. Digite `/` e veja se aparece `/hello-world` na lista
3. Execute `/hello-world`
4. ✅ **Sucesso se:** Copilot responde seguindo as instruções do arquivo

### Passo 5: Evoluir para algo útil

Agora substitua o conteúdo por um dos templates acima (ex: `create-endpoint.prompt.md`).

## 💡 Troubleshooting Comum

### Problema: Comando /meu-prompt não aparece na lista

**Diagnóstico:**
Digite `/` no chat e veja se seu comando aparece.

**Soluções:**
1. ✅ **Confirme o caminho:** Arquivo DEVE estar em `.github/prompts/*.prompt.md` (não em outra pasta)
2. ✅ **Confirme a extensão:** Deve ser `.prompt.md` (não `.md` apenas ou `.txt`)
3. ✅ **Recarregue VS Code:** Command Palette → "Reload Window"
4. ✅ **Verifique frontmatter:** Deve ter `description` e `mode` válidos
5. ✅ **Verifique sintaxe YAML:** Use validador YAML se suspeitar de erro

### Problema: Comando existe mas não faz nada quando executado

**Sintomas:** Você executa `/meu-prompt` mas Copilot não responde ou dá erro genérico.

**Causa comum:** Erro no frontmatter (YAML inválido).

**Solução:**
```markdown
# ❌ ERRADO (faltou fechar aspas)
---
description: "Meu prompt
mode: agent
---

# ✅ CORRETO
---
description: "Meu prompt"
mode: "agent"
tools: []
---
```

Use um validador YAML online para conferir se o frontmatter está correto.

### Problema: Variável {'${input:...}'} não é perguntada

**Sintomas:** Prompt executa mas não pede valor da variável.

**Causa:** Nome de variável inválido ou sintaxe errada.

**Soluções:**
- ✅ Use sintaxe exata: `${input:nomeVariavel}` (não `$input`, não `{input}`)
- ✅ Nome da variável sem espaços: `${input:feature_name}` (não `${input:feature name}`)
- ✅ Se não funcionar, teste com placeholder: `Crie endpoint para NOME_FEATURE` e substitua manualmente

### Problema: Prompt ignora Holocrons do projeto

**Sintomas:** Código gerado não segue padrões documentados nos Holocrons.

**Causa:** Prompt muito genérico ou esqueceu de referenciar as instruções.

**Solução:**
Adicione no corpo do prompt:
```markdown
## Instruções do projeto
- Respeite TODAS as regras do Holocron Principal (.github/copilot-instructions.md)
- Siga padrões técnicos do território relevante
- Use #codebase para encontrar exemplos existentes antes de criar novo código
```

### Problema: Resultado inconsistente (às vezes bom, às vezes ruim)

**Causa:** Prompt vago ou sem critérios objetivos.

**Solução:** Adicione checklist de qualidade:
```markdown
## Critérios de aceitação
Antes de retornar resposta, verifique:
- [ ] Código compila sem erros
- [ ] Segue estrutura de pastas do projeto
- [ ] Inclui tratamento de erro adequado
- [ ] Tem testes básicos
- [ ] Documentação mínima presente
```

## 📊 Quando Usar Prompt Files vs Digitar Manualmente

Use esta tabela de decisão:

| Situação | Usar Prompt File | Digitar manualmente |
|----------|------------------|---------------------|
| Criar endpoint (mesma estrutura sempre) | ✅ `/create-endpoint` | ❌ |
| Revisar PR antes de merge | ✅ `/code-review` | ❌ |
| Gerar testes com padrão específico | ✅ `/generate-tests` | ❌ |
| Pergunta pontual ("como fazer X?") | ❌ | ✅ |
| Exploração/experimentação | ❌ | ✅ |
| Refatorar seguindo padrões do time | ✅ `/refactor` | ❌ |
| Gerar boilerplate (sempre igual) | ✅ Prompt File | ❌ |

**Regra prática:** Se você já digitou o mesmo pedido 3+ vezes, crie um Prompt File.

## 🎯 Exercício Prático Completo

**Cenário:** Seu time cria muitos endpoints de CRUD (Create, Read, Update, Delete) e sempre esquece de incluir paginação nos endpoints de listagem.

**Tarefa:**

1. **Crie** `.github/prompts/create-crud.prompt.md` com:
   - Geração dos 5 endpoints (POST, GET list, GET by ID, PUT, DELETE)
   - Paginação obrigatória no GET list (limit/offset)
   - Schema Pydantic para cada operação
   - Testes para cada endpoint
   - VARIÁVEL: `${input:entityName}` (ex: "produto", "cliente")

2. **Template sugerido:**
```markdown
---
description: "Cria CRUD completo com paginação para entidade"
mode: "agent"
tools: ["#codebase", "#editFiles"]
---

# Objetivo
Criar CRUD completo para ${input:entityName}.

## Endpoints obrigatórios
1. POST /${input:entityName} - criar
2. GET /${input:entityName} - listar com paginação (limit, offset)
3. GET /${input:entityName}/{id} - buscar por ID
4. PUT /${input:entityName}/{id} - atualizar
5. DELETE /${input:entityName}/{id} - deletar (soft delete se possível)

## Paginação obrigatória
Endpoint de listagem DEVE aceitar:
- `limit` (default: 20, máximo: 100)
- `offset` (default: 0)
- Retornar: `{items: [...], total: N, limit: X, offset: Y}`

## Schemas necessários
- `${input:entityName}Create` (para POST)
- `${input:entityName}Update` (para PUT)
- `${input:entityName}Response` (para retornos)
- `${input:entityName}List` (para GET list)

## Testes por endpoint
- POST: caso feliz (201) + validação (400)
- GET list: vazio (200) + com dados + paginação
- GET by ID: encontrado (200) + não encontrado (404)
- PUT: atualizado (200) + ID inexistente (404)
- DELETE: deletado (204) + ID inexistente (404)

## Estrutura de pastas
- Router: `app/api/routes/${input:entityName}.py`
- Schemas: `app/schemas/${input:entityName}.py`
- Service: `app/services/${input:entityName}.py`
- Testes: `tests/api/test_${input:entityName}.py`
```

3. **Teste:** Execute `/create-crud` com entityName: "produto"

4. **Valide:**
   - ✅ 5 endpoints criados
   - ✅ GET list tem paginação com limit/offset
   - ✅ Testes cobrem todos os cenários
   - ✅ Estrutura de pastas correta

**Critério de sucesso:**
- Código gerado funciona sem modificação manual (ou com mínimas)
- Próximo CRUD criado com `/create-crud` é mais rápido que fazer manualmente

## 🎯 Próxima Missão

Na próxima aula você aprenderá sobre **Formas de Combate** (Custom Agents) — personas técnicas especializadas como Architect, DBA, Reviewer. Enquanto Prompt Files são **comandos** ("faça X"), agents são **modos de pensar** ("analise como um arquiteto analisa").

:::tip 🏆 Treinamento Jedi Completo
Você domina Movimentos Rápidos (Prompt Files) e sabe criar comandos reutilizáveis que reduzem trabalho repetitivo e elevam consistência. Seu time agora pode compartilhar prompts padronizados em `.github/prompts/`.
:::
