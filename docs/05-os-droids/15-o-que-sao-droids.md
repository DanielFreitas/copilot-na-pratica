---
title: 15 - O que são Droids
sidebar_position: 15
description: Fundamentos de MCP e arquitetura de conexão entre VS Code, servidores e serviços.
---

> *"Droids não são inteligentes como um Jedi. Mas eles conectam você a sistemas que sozinho você não acessaria."*

**Duração estimada:** ~35 min

## Vídeo introdutório

<video controls width="100%" preload="metadata">
	<source src="/copilot-na-pratica/videos/15-o-que-sao-droids.mp4" type="video/mp4" />
	Seu navegador não suporta vídeo HTML5.
</video>

## O Problema Real: IA Cega ao Contexto Operacional

Você está conversando com o Copilot sobre implementar um endpoint de pagamento.

**Sem Droids:**

```
Você: preciso implementar endpoint POST /pagamentos

Copilot: vou criar com SQLite e retornar 200 OK
```

Problema: o Copilot **supõe** tecnologias porque não vê seu ambiente real.

**Com Droids:**

```
Você: preciso implementar endpoint POST /pagamentos

Copilot consulta:
- Droid PostgreSQL → vê schema payments existente com colunas status, amount, user_id
- Droid Filesystem → vê padrão FastAPI nos outros endpoints
- Droid Redis → vê que usa cache distribuído

Copilot: vou criar endpoint FastAPI com:
- PostgreSQL (tabela payments já existe)
- validação Pydantic alinhada ao schema
- cache Redis para consultas frequentes
- status codes 201/400/500 como os outros endpoints
```

**Diferença:** de suposição genérica para **decisão baseada em evidência técnica**.

---

## O que é MCP (Model Context Protocol)

**MCP** (Model Context Protocol) é um protocolo padronizado que permite conectar o Copilot a serviços e recursos externos ao VS Code — bancos de dados, APIs internas, sistemas de arquivos, plataformas de repositório.

**Por que "protocolo"?** Porque define regras de comunicação entre três componentes:

```
┌────────────┐         ┌────────────┐         ┌────────────┐
│  VS Code   │ ◄─────► │ MCP Server │ ◄─────► │  Serviço   │
│  (Cliente) │   JSON  │  (Ponte)   │  Nativo │ (PostgreSQL│
│            │   RPC   │            │         │  GitHub    │
│            │         │            │         │  Redis)    │
└────────────┘         └────────────┘         └────────────┘
```

1. **Cliente (VS Code)**: conversa com o usuário e chama o MCP quando precisa de dados externos
2. **MCP Server**: traduz pedidos do Cliente em comandos específicos do Serviço  
3. **Serviço**: sistema real (banco de dados, API, sistema de arquivos)

---

## Como Funciona na Prática

**1. Configuração inicial**

Você cria o arquivo `.vscode/mcp.json` no workspace:

```json
{
  "servers": {
    "postgres": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres", 
               "postgresql://user:pass@localhost/db"]
    }
  }
}
```

**2. Reinicia o VS Code** para carregar a configuração.

**3. Conversa normal no Copilot Chat**

```
Você: lista as 5 últimas transações falhadas

Copilot detecta que precisa de dados reais → 
chama o Droid PostgreSQL →
recebe resultado da query SELECT * FROM transactions WHERE status='failed' LIMIT 5 →
formata resposta para você
```

**Você não invoca o MCP manualmente**. O Copilot decide quando usar cada Droid baseado no contexto da conversa.

---

## Droids Alinhados à Nossa Stack

| Droid             | Serviço         | Quando Kássia Acessa                                       |
|-------------------|-----------------|------------------------------------------------------------|
| **PostgreSQL**    | Banco relacional| Consultar schema, validar dados, conferir integridade      |
| **MongoDB**       | Banco documento | Verificar coleções, documentos aninhados, índices          |
| **Redis**         | Cache/fila      | Conferir chaves, TTL, estrutura de dados em memória        |
| **Filesystem**    | Arquivos locais | Ler configs, listar estrutura de pastas, checar rotas      |
| **GitHub**        | Repositório Git | Ver PRs, issues, branches, histórico de commits            |

**Exemplo concreto:**

Kássia precisa adicionar uma coluna `refund_reason` na tabela `payments`:

1. **Droid PostgreSQL** → mostra schema atual da tabela
2. **Droid Filesystem** → localiza migration mais recente (`003_add_status.py`)
3. **Copilot** → gera migration `004_add_refund_reason.py` seguindo o padrão existente

Sem Droids, Copilot geraria código genérico de migração sem saber a estrutura atual.

---

## Por Que MCP Muda o Jogo

### Antes: IA opera por suposição

| Situação                          | Resposta sem MCP                                 |
|-----------------------------------|--------------------------------------------------|
| "cria migration para users"       | Gera tabela genérica `id, name, email`           |
| "endpoint precisa de cache?"      | "Recomendo Redis" (genérico)                     |
| "qual branch tem o hotfix X?"     | "Verifique no Git" (delega para você)            |

### Depois: IA opera por evidência

| Situação                          | Resposta com MCP                                            |
|-----------------------------------|-------------------------------------------------------------|
| "cria migration para users"       | Vê schema atual → gera ALTER TABLE mantendo referências FK  |
| "endpoint precisa de cache?"      | Consulta Redis → "sim, padrão usado em `/produtos`"        |
| "qual branch tem o hotfix X?"     | GitHub Droid → "branch `hotfix/payment-timeout` tem commit" |

**Impacto prático:**

- Menos código genérico que não funciona no projeto real
- Sugestões alinhadas ao padrão de arquitetura existente
- Redução de iterações "copia → cola → ajusta → testa → falha"

---

## Segurança: MCP Executa Código Local

:::danger ⚠️ Cuidado Crítico

Um MCP server pode:
- **Ler arquivos** do sistema
- **Executar comandos SQL** no banco  
- **Chamar APIs** com suas credenciais
- **Modificar dados** se o handler permitir

**Use apenas servidores MCP de fonte confiável.**
:::

### Checklist Mínimo de Segurança

| Item                          | O Que Validar                                                   |
|-------------------------------|-----------------------------------------------------------------|
| **Origem conhecida**          | Código-fonte público? Empresa conhecida? Comunidade ativa?      |
| **Escopo mínimo**             | Servidor acessa só o necessário? (1 banco, 1 pasta, não "tudo") |
| **Revisão de permissões**     | String de conexão tem apenas SELECT? Ou tem DROP TABLE?         |
| **Versionamento**             | `.vscode/mcp.json` no Git para auditoria                        |
| **Credenciais separadas**     | Não usar senha de admin — criar usuário com permissões limitadas|

**Exemplo de configuração segura:**

```json
{
  "servers": {
    "postgres-readonly": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "-y", 
        "@modelcontextprotocol/server-postgres",
        "postgresql://copilot_reader:senha_segura@localhost/producao"
      ]
    }
  }
}
```

Onde `copilot_reader` tem apenas: `GRANT SELECT ON ALL TABLES TO copilot_reader;`

---

## Quando NÃO Usar Droids

| Situação                                  | Por Quê                                              |
|-------------------------------------------|------------------------------------------------------|
| Projeto sem acesso a dados reais          | MCP não ajuda se não há serviço para conectar        |
| Código 100% desconectado (algoritmos)     | Exemplo: implementar quicksort — não precisa de MCP  |
| Ambiente sem permissão para executar Node | MCP servers geralmente rodam em Node/Python          |
| Dados extremamente sensíveis sem controle | Risco de vazamento se configuração errada            |

**Use Holocrons (arquivos .github/instructions/)** para conhecimento estático.  
**Use Droids** quando precisa de dados dinâmicos do ambiente operacional.

---

## Troubleshooting

### 💡 Problema: Copilot não usa o Droid configurado

**Sintomas:**
- Droid aparece na lista (Copilot → View → MCP Servers)
- Copilot continua dando respostas genéricas

**Diagnóstico:**
```
1. Verifique que `.vscode/mcp.json` está na raiz do workspace
2. Reinicie o VS Code completamente (feche e abra)
3. Pergunte explicitamente: "use o Droid PostgreSQL para listar tabelas"
```

Se ainda não funcionar:
- Veja logs: `Output → MCP` no painel inferior do VS Code
- Erro comum: `command not found` → instale a dependência (`npm install -g ...`)

---

### 💡 Problema: Erro "connection refused" ao conectar banco

**Sintomas:**
- MCP server tenta conectar
- Falha com timeout ou porta recusada

**Solução:**
```bash
# 1. Confirme que o serviço está rodando
docker ps  # ou pg_isready para PostgreSQL

# 2. Verifique a string de conexão no mcp.json
# localhost funciona? Ou precisa 127.0.0.1? Ou IP da rede?

# 3. Teste conexão manual
psql postgresql://user:pass@localhost/db  # se PostgreSQL
```

---

### 💡 Problema: MCP server funcionava, agora não funciona mais

**Causas comuns:**

1. **Mudança de versão**: atualização do VS Code pode quebrar MCP antigo
   - Solução: atualize o servidor (`npm update -g @modelcontextprotocol/server-*`)

2. **Mudança de credenciais**: senha do banco foi alterada
   - Solução: atualize string de conexão no `mcp.json`

3. **Serviço caiu**: Docker ou servidor de banco parado
   - Solução: `docker-compose up -d` ou restart do serviço

---

## Arquitetura Detalhada: Linha de Execução

Para entender melhor como MCP funciona sob o capô:

```
1. Você digita: "lista produtos em estoque"

2. VS Code Copilot analisa contexto:
   ├─> Detecta que precisa consultar banco de dados
   └─> Identifica MCP server "postgres" configurado

3. VS Code envia JSON-RPC para MCP server:
   {
     "method": "tools/call",
     "params": {
       "name": "query",
       "arguments": {
         "sql": "SELECT * FROM products WHERE stock > 0"
       }
     }
   }

4. MCP server PostgreSQL:
   ├─> Valida SQL (verifica se é SELECT, não DROP)
   ├─> Executa query no banco real
   └─> Retorna JSON com resultado

5. VS Code recebe resposta:
   [
     {"id": 1, "name": "Mouse Gamer", "stock": 45},
     {"id": 2, "name": "Teclado RGB", "stock": 12}
   ]

6. Copilot formata resposta para você:
   "Há 2 produtos em estoque:
   - Mouse Gamer: 45 unidades
   - Teclado RGB: 12 unidades"
```

**Termos-chave explicados:**

- **JSON-RPC**: formato de chamada de função remota usando JSON (texto estruturado)
- **stdio**: tipo de transporte onde VS Code conversa com MCP server via entrada/saída padrão (como se fosse terminal)
- **tools/call**: método que o Cliente usa para invocar uma "ferramenta" (tool) do servidor
- **validation**: servidor MCP deve validar entrada antes de executar (não aceitar `DROP TABLE` se configurado read-only)

---

## Decisão: Quando Investir em Droids?

Use este critério para decidir se vale configurar MCP no projeto:

| Critério                                      | Configurar Droids?  |
|-----------------------------------------------|---------------------|
| Projeto com banco de dados ativo              | ✅ Sim               |
| APIs internas complexas (>10 endpoints)       | ✅ Sim               |
| Estrutura de código dinâmica (microsserviços) | ✅ Sim               |
| Projeto acadêmico/teste isolado               | ⚠️ Opcional          |
| Código de algoritmos sem I/O                  | ❌ Não necessário    |
| Ambiente sem permissão para executar serviços | ❌ Inviável          |

**Regra simples:**

> Se você passa mais de 10 minutos por dia explicando ao Copilot qual é o estado atual do banco/API/código, **vale configurar Droids**.

---

## Exemplo Completo: Antes vs Depois

**Cenário:** Adicionar coluna `phone` na tabela `users`.

### Sem Droid PostgreSQL

```
Você: preciso adicionar coluna phone na tabela users

Copilot:
```sql
ALTER TABLE users ADD COLUMN phone VARCHAR(20);
```

Você aplica → erro:
```
ERROR: column "phone" of relation "users" already exists
```

(Copilot não viu que a coluna já existe)
```

### Com Droid PostgreSQL

```
Você: preciso adicionar coluna phone na tabela users

Copilot:
1. consulta schema da tabela users via Droid
2. vê que coluna "phone" JÁ EXISTE
3. responde: "A coluna phone já existe na tabela users. 
   Quer modificá-la (tipo, constraint) ou precisa de outra ação?"
```

**Economia:** 0 erros, 0 iterações perdidas.

---

## Exercício Prático

**Missão:** Entender o impacto de Droids sem precisar configurar agora.

1. **Leia seu `.github/instructions/regras-negocio.md`** (se existir)
2. **Identifique 3 perguntas** que você faz frequentemente ao Copilot sobre seu projeto:
   - Exemplo: "qual o schema da tabela X?"
   - Exemplo: "onde está implementado o fluxo Y?"
   - Exemplo: "esse endpoint retorna 200 ou 201?"

3. **Para cada pergunta, responda:**
   - Copilot consegue responder SEM ver dados reais? (sim/não)
   - Se tivesse Droid conectado, a resposta seria mais precisa? (sim/não)
   - Qual Droid ajudaria? (PostgreSQL, Filesystem, GitHub, etc.)

**Exemplo de análise:**

| Pergunta                         | Precisa dados reais? | Droid útil      |
|----------------------------------|----------------------|-----------------|
| Schema da tabela payments        | Sim                  | PostgreSQL      |
| Padrão de rotas no projeto       | Não (via Holocrons)  | -               |
| Última migration aplicada        | Sim                  | PostgreSQL/File |

**Resultado esperado:** você identifica **onde Droids fariam diferença** antes de investir tempo em configuração.

---

## Recursos Externos

- [Especificação oficial do MCP](https://spec.modelcontextprotocol.io/)
- [Repositório com servidores prontos](https://github.com/modelcontextprotocol/servers)
- [MCP Inspector](https://github.com/modelcontextprotocol/inspector) — ferramenta para debug de servidores

---

## Checklist de Validação

Você está pronto para a próxima aula se consegue:

- [ ] Explicar a diferença entre **Holocron** (conhecimento estático) e **Droid** (dados dinâmicos do ambiente)
- [ ] Desenhar a arquitetura: Cliente ↔ MCP Server ↔ Serviço
- [ ] Listar 3 cenários onde Droid seria mais útil que instruções estáticas
- [ ] Identificar 2 riscos de segurança ao configurar MCP
- [ ] Descrever o que é JSON-RPC e stdio no contexto de MCP

:::tip 🏆 Treinamento Jedi Completo
Você entende o conceito de MCP, sua arquitetura, quando aplicar e os cuidados de segurança para usar Droids de forma responsável no contexto operacional real.
:::
