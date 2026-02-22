---
title: 16 - Ativando Droids
sidebar_position: 16
description: Configuração prática de MCP no workspace e validação de tool funcional.
---

> *"Ativar um Droid é mais fácil do que eu imaginava. O difícil é escolher qual ativar primeiro."*

**Duração estimada:** ~35 min

## Vídeo introdutório

<video controls width="100%" preload="metadata">
	<source src="/copilot-na-pratica/videos/16-ativando-droids.mp4" type="video/mp4" />
	Seu navegador não suporta vídeo HTML5.
</video>

## O Problema Real: Repetir Contexto Manualmente

Kássia está trabalhando no módulo de pagamentos:

**Sem Droid PostgreSQL:**

```
Kássia: preciso consultar transações pendentes

Copilot: pode usar esta query:
SELECT * FROM transactions WHERE status = 'pending';

Kássia: a coluna se chama payment_status, não status

Copilot: desculpe, use:
SELECT * FROM transactions WHERE payment_status = 'pending';

Kássia: a tabela se chama payments, não transactions

Copilot: ok, corrijo:
SELECT * FROM payments WHERE payment_status = 'pending';
```

Perda: **3 iterações** para algo que o Droid vê em 1 consulta.

**Com Droid PostgreSQL:**

```
Kássia: preciso consultar transações pendentes

Copilot:
1. consulta schema via Droid → vê tabela "payments" com coluna "payment_status"
2. gera query correta na primeira vez:

SELECT * FROM payments WHERE payment_status = 'pending';
```

**Economia:** 0 iterações perdidas.

---

## Onde Configurar: O Arquivo mcp.json

A configuração de Droids no workspace fica em:

```
.vscode/mcp.json
```

**Por que nesse local?**

- `.vscode/` = configurações específicas do workspace
- `mcp.json` = lista de servidores MCP disponíveis para o Copilot
- Versionável no Git → todo o time usa os mesmos Droids

**Estrutura básica:**

```json
{
  "$schema": "https://raw.githubusercontent.com/microsoft/vscode/main/extensions/mcp/schemas/mcp.schema.json",
  "servers": {
    "nome-do-droid": {
      "type": "stdio",
      "command": "comando-para-executar",
      "args": ["argumentos"],
      "enabled": true
    }
  }
}
```

---

## Anatomia Completa do mcp.json

### Campo `$schema`

```json
{
  "$schema": "https://raw.githubusercontent.com/microsoft/vscode/main/extensions/mcp/schemas/mcp.schema.json"
}
```

**O que faz:** habilita autocomplete e validação no VS Code ao editar o arquivo.

**É obrigatório?** Não, mas **altamente recomendado** (evita erros de digitação).

---

### Campo `servers`

```json
{
  "servers": {
    "postgres": { ... },
    "redis": { ... },
    "github": { ... }
  }
}
```

**O que faz:** define todos os Droids disponíveis no workspace.

**Chave** (`"postgres"`, `"redis"`): nome arbitrário que você escolhe (use snake_case ou kebab-case).

---

### Propriedades de cada Servidor

#### `type`

```json
"type": "stdio"
```

**O que significa:**
- `stdio` = standard input/output (comunicação via terminal)
- VS Code inicia o servidor como processo filho
- Conversa via JSON enviado para stdin/stdout

**Existem outros tipos?** Sim (como `sse` = server-sent events), mas `stdio` é o padrão.

---

#### `command`

```json
"command": "npx"
```

**O que faz:** comando que inicia o servidor MCP.

**Opções comuns:**

| Comando       | Quando Usar                                       |
|---------------|---------------------------------------------------|
| `npx`         | Servidor Node.js instalável via npm               |
| `node`        | Servidor Node.js local (arquivo no projeto)       |
| `python`      | Servidor Python (script `.py` local)              |
| `uvx`         | Servidor Python via pipx (tool runner)            |

---

#### `args`

```json
"args": [
  "-y",
  "@modelcontextprotocol/server-postgres",
  "postgresql://user:pass@localhost/db"
]
```

**O que faz:** lista de argumentos passados para o comando.

**No exemplo acima:**
- `-y`: auto-confirma instalação (npx)
- `@modelcontextprotocol/server-postgres`: pacote npm do servidor
- `postgresql://user:pass@localhost/db`: string de conexão

---

#### `enabled`

```json
"enabled": true
```

**O que faz:** liga/desliga o Droid sem remover a configuração.

**Quando usar `false`:**
- Testar temporariamente sem um Droid
- Manter configuração mas só habilitar em staging/produção

---

### Exemplo Completo Comentado

```json
{
  "$schema": "https://raw.githubusercontent.com/microsoft/vscode/main/extensions/mcp/schemas/mcp.schema.json",
  
  "servers": {
    
    // Droid 1: PostgreSQL (banco relacional)
    "postgres-producao": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-postgres",
        "postgresql://copilot_ro:senha@localhost:5432/producao"
      ],
      "enabled": true
    },
    
    // Droid 2: Filesystem (arquivos locais)
    "filesystem-projeto": {
      "type": "stdio",
      "command": "node",
      "args": ["./tools/filesystem-mcp.js"],
      "enabled": true
    },
    
    // Droid 3: GitHub (desabilitado temporariamente)
    "github-api": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-github",
        "--token", "ghp_SEU_TOKEN_AQUI"
      ],
      "enabled": false
    }
  }
}
```

---

## Formas de Ativar Droids

### Via Gallery/Registro (Futuro)

No futuro, haverá um marketplace de Droids dentro do VS Code:

```
1. Abrir Copilot → View → MCP Gallery
2. Buscar "PostgreSQL"
3. Clicar "Install"
4. Preencher string de conexão
5. Salvar → reiniciar VS Code
```

**Status atual:** a maioria das configurações ainda é manual (edição do `mcp.json`).

---

### Via Edição Manual (Método Atual)

**Passos:**

1. Crie o arquivo `.vscode/mcp.json` na raiz do workspace
2. Cole a configuração do servidor
3. Ajuste credenciais/paths
4. Salve o arquivo
5. **Reinicie o VS Code** (importante!)

---

## Droids Prontos para Nossa Stack

### 1. Droid PostgreSQL

**O que faz:** consulta schema, executa queries, valida dados.

```json
{
  "servers": {
    "postgres": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-postgres",
        "postgresql://user:pass@localhost:5432/database"
      ],
      "enabled": true
    }
  }
}
```

**Antes de usar:**

1. Crie usuário read-only no banco:
   ```sql
   CREATE USER copilot_reader WITH PASSWORD 'senha_segura';
   GRANT CONNECT ON DATABASE producao TO copilot_reader;
   GRANT SELECT ON ALL TABLES IN SCHEMA public TO copilot_reader;
   ```

2. Substitua `user:pass` por `copilot_reader:senha_segura`

---

### 2. Droid MongoDB

**O que faz:** consulta coleções, documentos, índices.

```json
{
  "servers": {
    "mongodb": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-mongodb",
        "mongodb://user:pass@localhost:27017/database"
      ],
      "enabled": true
    }
  }
}
```

**Cuidado com permissões:**

```javascript
// Criar usuário read no MongoDB
use admin
db.createUser({
  user: "copilot_reader",
  pwd: "senha_segura",
  roles: [{ role: "read", db: "producao" }]
})
```

---

### 3. Droid Redis

**O que faz:** consulta chaves, TTL, estruturas de dados.

Um servidor MCP oficial para Redis ainda está em desenvolvimento. Alternativa:

```json
{
  "servers": {
    "redis-reader": {
      "type": "stdio",
      "command": "node",
      "args": ["./tools/redis-mcp-server.js"],
      "enabled": true
    }
  }
}
```

Onde `redis-mcp-server.js` é um servidor custom (aula 18 ensina como criar).

---

### 4. Droid Filesystem

**O que faz:** lê arquivos, lista diretórios, busca conteúdo.

```json
{
  "servers": {
    "filesystem": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/caminho/absoluto/projeto"
      ],
      "enabled": true
    }
  }
}
```

**Segurança:** limite ao diretório do projeto (não `/` ou `C:\`).

---

### 5. Droid GitHub

**O que faz:** consulta PRs, issues, branches, commits.

```json
{
  "servers": {
    "github": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-github",
        "--owner", "seu-usuario",
        "--repo", "seu-repositorio",
        "--token", "ghp_TOKEN_AQUI"
      ],
      "enabled": true
    }
  }
}
```

**Obter token:**
1. GitHub → Settings → Developer Settings → Personal Access Tokens
2. Generate New Token (classic)
3. Permissões: `repo` (acesso a repositórios privados) ou `public_repo` (só públicos)

---

## Fluxo Completo de Validação

**Objetivo:** garantir que o Droid está funcional antes de confiar em produção.

### Passo 1: Configurar um Servidor MCP

Escolha o Droid mais útil para o projeto (exemplo: PostgreSQL).

Crie `.vscode/mcp.json`:

```json
{
  "$schema": "https://raw.githubusercontent.com/microsoft/vscode/main/extensions/mcp/schemas/mcp.schema.json",
  "servers": {
    "postgres": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-postgres",
        "postgresql://copilot_reader:senha@localhost:5432/producao"
      ],
      "enabled": true
    }
  }
}
```

---

### Passo 2: Habilitar no Workspace

1. Salve o arquivo `mcp.json`
2. **Reinicie o VS Code** (feche completamente, não apenas reload window)

---

### Passo 3: Invocar uma Tool no Chat

Abra o Copilot Chat e teste:

```
Você: lista todas as tabelas do banco

Copilot deve:
1. detectar que precisa consultar banco
2. invocar Droid PostgreSQL
3. retornar:
   users
   payments
   transactions
   sessions
```

Se funcionou: **validação bem-sucedida** ✅

---

### Passo 4: Verificar Retorno Coerente

Teste consulta específica:

```
Você: mostra o schema completo da tabela payments

Copilot deve retornar algo como:

Tabela: payments
Colunas:
- id: integer (PK)
- user_id: integer (FK → users)
- amount: decimal(10,2)
- status: varchar(20)
- created_at: timestamp
```

**Se retornou dados reais do banco:** Droid está funcional.

**Se retornou resposta genérica:** algo não conectou (ver troubleshooting abaixo).

---

### Passo 5: Ajustar Permissões se Necessário

Se o Droid tentou executar operação bloqueada:

```
Você: deleta transações antigas

Copilot tenta executar DELETE → erro:
"permission denied for table transactions"
```

**Comportamento esperado:** usuário `copilot_reader` só tem SELECT.

**Ação:** confirmar que permissões estão corretas (read-only).

---

## Critérios de Sucesso

Seu Droid está validado se:

- [ ] **Configuração versionada:** `.vscode/mcp.json` commitado no Git
- [ ] **Tool executando sem erro:** Copilot usa o Droid ao fazer pergunta relevante
- [ ] **Resultado útil:** resposta contém dados reais do ambiente (não genérico)
- [ ] **Permissões corretas:** operações de escrita bloqueadas (se read-only)
- [ ] **Documentação interna:** time sabe quais Droids estão ativos e como usar

---

## Quando Usar Múltiplos Droids

**Cenário 1: Stack heterogênea**

Projeto usa PostgreSQL (dados transacionais), MongoDB (logs), Redis (cache):

```json
{
  "servers": {
    "postgres": { ... },
    "mongodb": { ... },
    "redis": { ... }
  }
}
```

Copilot escolhe automaticamente qual usar baseado no contexto da conversa.

---

**Cenário 2: Ambientes separados**

```json
{
  "servers": {
    "postgres-dev": {
      "args": ["...", "postgresql://...@localhost/dev"],
      "enabled": true
    },
    "postgres-staging": {
      "args": ["...", "postgresql://...@staging.com/staging"],
      "enabled": false
    }
  }
}
```

**Uso:** habilite um de cada vez (nunca os dois simultaneamente para evitar confusão).

---

## Troubleshooting

### 💡 Problema: "command not found: npx"

**Sintoma:**

```
Error: spawn npx ENOENT
```

**Causa:** Node.js não está instalado ou não está no PATH.

**Solução:**

```powershell
# Verificar instalação
node --version
npm --version

# Se não instalado:
# Baixe de https://nodejs.org/ (versão LTS)
# Ou use gerenciador:
winget install OpenJS.NodeJS.LTS
```

---

### 💡 Problema: Droid não aparece na lista de servidores

**Sintoma:** Copilot não usa o Droid configurado.

**Diagnóstico:**

1. Abra VS Code → Output → selecione "MCP" no dropdown
2. Veja logs de inicialização

**Erros comuns:**

| Log                                  | Causa                         | Solução                      |
|--------------------------------------|-------------------------------|------------------------------|
| `failed to start server: timeout`    | Comando demora muito          | Verifique rede/dependências  |
| `server exited with code 1`          | Erro ao executar comando      | Veja stderr no log           |
| `invalid JSON in mcp.json`           | Sintaxe errada                | Valide JSON (jsonlint.com)   |

---

### 💡 Problema: Copilot usa resposta genérica, não consulta Droid

**Sintoma:**

```
Você: lista tabelas do banco

Copilot: "Você pode usar: SHOW TABLES;" (genérico, não usou Droid)
```

**Causa possível:**

1. **Droid não conectou:** veja logs (Output → MCP)
2. **Pergunta ambígua:** Copilot não entendeu que precisa consultar banco
3. **Permissão negada:** servidor tentou conectar e falhou

**Solução:**

1. Seja mais explícito:
   ```
   use o Droid PostgreSQL para listar as tabelas do banco producao
   ```

2. Verifique conectividade:
   ```bash
   psql postgresql://copilot_reader:senha@localhost:5432/producao -c "\dt"
   ```

   Se falhar manualmente, o Droid também falhará.

---

### 💡 Problema: "permission denied" ao consultar

**Sintoma:**

```
ERROR: permission denied for table users
```

**Causa:** usuário configurado no `mcp.json` não tem permissão.

**Solução:**

```sql
-- PostgreSQL: conceder SELECT em todas as tabelas
GRANT SELECT ON ALL TABLES IN SCHEMA public TO copilot_reader;

-- MongoDB: garantir que usuário tem role "read"
use admin
db.grantRolesToUser("copilot_reader", [{ role: "read", db: "producao" }])
```

---

### 💡 Problema: Droid funcionava, parou depois de atualizar VS Code

**Causa:** atualização de VS Code pode mudar API ou local de schema.

**Solução:**

1. Atualize servidores MCP:
   ```bash
   npm update -g @modelcontextprotocol/server-*
   ```

2. Verifique changelog do servidor no GitHub (pode ter breaking change)

3. Se necessário, fixe versão no `mcp.json`:
   ```json
   "args": ["-y", "@modelcontextprotocol/server-postgres@1.2.3", "..."]
   ```

---

## Configuração Avançada: Variáveis de Ambiente

Para não versionar credenciais no Git:

**1. Crie arquivo `.env` na raiz (adicione ao `.gitignore`)**

```bash
DB_USER=copilot_reader
DB_PASS=senha_segura
DB_HOST=localhost
DB_NAME=producao
```

**2. Use variáveis no `mcp.json`:**

```json
{
  "servers": {
    "postgres": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-postgres",
        "postgresql://${DB_USER}:${DB_PASS}@${DB_HOST}/${DB_NAME}"
      ],
      "enabled": true
    }
  }
}
```

**3. Carregue variáveis antes de iniciar VS Code:**

```powershell
# PowerShell
Get-Content .env | ForEach-Object {
  $name, $value = $_.Split('=')
  [Environment]::SetEnvironmentVariable($name, $value, 'User')
}

code .
```

---

## Exemplo Completo: Configurar Droid PostgreSQL do Zero

**Cenário:** projeto FastAPI com PostgreSQL, precisa consultar schema durante desenvolvimento.

### Passo 1: Criar usuário read-only

```sql
-- Conecte como admin
psql postgresql://admin:admin@localhost:5432/producao

-- Crie usuário
CREATE USER copilot_reader WITH PASSWORD 'kX9#mP2@qL';

-- Permissões
GRANT CONNECT ON DATABASE producao TO copilot_reader;
GRANT USAGE ON SCHEMA public TO copilot_reader;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO copilot_reader;
GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO copilot_reader;

-- (Opcional) Garantir SELECT em tabelas futuras
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT SELECT ON TABLES TO copilot_reader;
```

---

### Passo 2: Criar `.vscode/mcp.json`

```json
{
  "$schema": "https://raw.githubusercontent.com/microsoft/vscode/main/extensions/mcp/schemas/mcp.schema.json",
  "servers": {
    "postgres-dev": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-postgres",
        "postgresql://copilot_reader:kX9#mP2@qL@localhost:5432/producao"
      ],
      "enabled": true
    }
  }
}
```

---

### Passo 3: Adicionar ao `.gitignore` (se tiver credenciais sensíveis)

```gitignore
# .gitignore
.vscode/mcp.json
```

**Alternativa:** versione `mcp.json` com variáveis de ambiente (método anterior).

---

### Passo 4: Reiniciar VS Code

```
Feche VS Code completamente → abra novamente no projeto
```

---

### Passo 5: Validar

No Copilot Chat:

```
Você: use o Droid PostgreSQL para mostrar o schema da tabela users

Copilot:
Tabela: users
- id: integer, primary key
- name: varchar(100)
- email: varchar(255), unique
- created_at: timestamp with time zone
```

✅ **Sucesso:** Droid funcionando.

---

## Exercício Prático

**Missão:** Configure 1 Droid útil para seu projeto.

1. **Escolha o Droid:**
   - Se tem banco PostgreSQL → configure Droid PostgreSQL
   - Se usa Git/GitHub intensivamente → configure Droid GitHub
   - Se quer ler arquivos de config → configure Droid Filesystem

2. **Crie usuário/token com permissões mínimas:**
   - PostgreSQL: `GRANT SELECT` apenas
   - GitHub: token com `public_repo` (ou `repo` se precisar de privados)
   - Filesystem: path restrito ao projeto

3. **Configure `.vscode/mcp.json`** seguindo exemplos acima

4. **Reinicie VS Code**

5. **Teste no Copilot Chat:**
   - PostgreSQL: "lista as tabelas do banco"
   - GitHub: "lista os últimos 5 commits"
   - Filesystem: "mostra conteúdo do arquivo .env.example"

6. **Versione configuração no Git** (ou use variáveis de ambiente se tiver secrets)

**Critério de sucesso:** Copilot retorna dados reais do ambiente, não resposta genérica.

---

## Recursos Externos

- [Repositório oficial de servidores MCP](https://github.com/modelcontextprotocol/servers)
- [Schema JSON do mcp.json](https://raw.githubusercontent.com/microsoft/vscode/main/extensions/mcp/schemas/mcp.schema.json)
- [MCP Inspector](https://github.com/modelcontextprotocol/inspector) — debug de servidores

---

## Checklist de Validação Completa

Você está pronto para a próxima aula se:

- [ ] Criou arquivo `.vscode/mcp.json` no workspace
- [ ] Configurou pelo menos 1 servidor MCP completo
- [ ] Testou invocação no Copilot Chat com resultado real
- [ ] Validou que permissões estão no mínimo necessário (read-only)
- [ ] Versionou configuração no Git (ou usa variáveis de ambiente)
- [ ] Sabe interpretar logs de erro (Output → MCP)
- [ ] Consegue diagnosticar "Droid não está sendo usado" vs "Droid não conectou"

:::tip 🏆 Treinamento Jedi Completo
Você ativou MCP no workspace e validou um Droid funcional em cenário prático de desenvolvimento. Agora a IA consulta dados reais do ambiente ao invés de supor.
:::
