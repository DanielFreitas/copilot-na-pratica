---
title: 18 - Construindo seu Droid
sidebar_position: 18
description: Critérios para decidir entre usar MCP pronto ou desenhar servidor customizado.
---

> *"Quando nenhum Droid existente resolve, você constrói o seu."*

**Duração estimada:** ~40 min

## Vídeo introdutório

<video controls width="100%" preload="metadata">
	<source src="/copilot-na-pratica/videos/18-construindo-seu-droid.mp4" type="video/mp4" />
	Seu navegador não suporta vídeo HTML5.
</video>

## O Problema Real: Integração Específica Sem Solução Pronta

Kássia trabalha em projeto que usa **Elasticsearch** para busca de produtos.

**Tentativa 1: Buscar Droid pronto**

```
Kássia pesquisa:
- Repositório oficial de servidores MCP
- npm registry: @modelcontextprotocol/server-elasticsearch
- GitHub: "mcp elasticsearch"

Resultado: não existe servidor MCP oficial para Elasticsearch
```

**Opções:**

1. **Desistir** → continuar copiando/colando queries do Kibana
2. **Esperar** → aguardar comunidade criar servidor
3. **Construir** → criar Droid Elasticsearch customizado

Kássia escolhe **construir**.

**Resultado:** Droid custom que permite Copilot:
- Consultar índices do Elasticsearch
- Validar mappings (schema)
- Buscar documentos por query DSL
- Ver aggregations para análise

Economia: **5h/semana** de copiar/colar queries do Kibana.

---

## Quando Vale Criar Droid Custom

Use esta tabela de decisão:

| Situação                                      | Criar Custom? | Alternativa                 |
|-----------------------------------------------|---------------|-----------------------------|
| API interna da empresa                        | ✅ Sim         | Nenhum servidor conhece     |
| Fluxo específico do time (ex: deploy runner)  | ✅ Sim         | Solução genérica não serve  |
| Ferramenta sem servidor oficial (Elasticsearch)| ✅ Sim         | Não há opção pronta         |
| Banco de dados comum (PostgreSQL, MongoDB)    | ❌ Não         | Use servidor oficial        |
| GitHub/GitLab                                 | ❌ Não         | Servidor oficial existe     |
| Sistema de arquivos local                     | ❌ Não         | Servidor oficial existe     |
| Integração complexa mas baixa frequência      | ⚠️ Talvez      | Custo vs benefício          |

### Critérios Objetivos

**Vale criar se:**

- ✅ Usa >5x por semana
- ✅ Servidor pronto não existe
- ✅ Time tem capacidade de manter (Node/Python)
- ✅ Benefício > 2h/semana economizadas

**NÃO vale criar se:**

- ❌ Usa &lt;1x por semana (esforço não compensa)
- ❌ Servidor confiável já existe (não reinventar roda)
- ❌ Time não tem capacidade técnica/tempo para manter
- ❌ Dados sensíveis sem infraestrutura de segurança adequada

---

## Quando NÃO Vale Criar

### Problema Já Coberto por Servidor Confiável

**Cenário:** time quer criar "melhor servidor PostgreSQL".

**Análise:**

```
Servidor oficial: @modelcontextprotocol/server-postgres
- Mantido pela comunidade MCP
- Testes automatizados
- Atualizações de segurança
- Documentação completa
- Usado por milhares de projetos

Seu servidor custom:
- Mantido apenas pelo time
- Testes? Depende de você
- Segurança? Sua responsabilidade
- Documentação? Se tiver tempo
- Usuários: só o time
```

**Decisão:** use o oficial. Foque esforço onde agrega valor único.

---

### Manutenção Inviável para o Time

**Cenário:** time de 3 devs sem experiência em Node/Python quer criar Droid para API interna.

**Considerações:**

| Aspecto                | Esforço Estimado                     |
|------------------------|--------------------------------------|
| Desenvolvimento inicial| 8-16h (primeira versão funcional)    |
| Testes                 | 4-8h (casos edge, validações)        |
| Documentação           | 2-4h (README, exemplos)              |
| Manutenção contínua    | **2-4h/mês** (atualizações, bugs)    |
| On-call                | Quebrou? Alguém precisa consertar    |

**Decisão:** se time não tem folga para **2-4h/mês de manutenção**, não crie.

**Alternativa:** peça ajuda ao time de plataforma/infraestrutura.

---

### Benefício Menor que Custo Operacional

**Cenário:** criar Droid para consultar planilha Excel compartilhada.

**Análise de custo vs benefício:**

```
Custo:
- Desenvolvimento: 10h
- Manutenção: 2h/mês
- Parsing de Excel: complexo (formatos variados)
- Sincronização: quando planilha muda?

Benefício:
- Usa 1x por semana
- Economia: 5 min/semana (copiar dados da planilha)
- Total economizado: ~4h/ano

Relação: 10h investidas + 24h/ano manutenção = 34h
vs 4h/ano economizadas

Decisão: NÃO VALE
```

**Alternativa:** converta planilha para formato estruturado (JSON/CSV) e use Droid Filesystem.

---

## Anatomia de um Servidor MCP Custom

### 1. Definir Tools Necessárias

**Exemplo: Droid Elasticsearch**

| Tool                | Entrada                  | Saída                         |
|---------------------|--------------------------|-------------------------------|
| `list_indices`      | (nenhuma)                | Lista de índices no cluster   |
| `get_mapping`       | `index_name`             | Schema do índice (mappings)   |
| `search`            | `index`, `query` (DSL)   | Documentos encontrados        |
| `aggregate`         | `index`, `aggs` (DSL)    | Aggregations (métricas/contagem)|

**Como decidir quais tools criar:**

1. Liste as **5 operações mais frequentes** que você faz manualmente
2. Para cada operação, identifique:
   - Entrada necessária
   - Saída esperada
   - Validação requerida

---

### 2. Implementar Handlers com Validação

**Handler:** função que recebe parâmetros da tool e executa ação.

**Exemplo de handler `search` em Python:**

```python
from mcp.server import Server
from elasticsearch import Elasticsearch

app = Server("elasticsearch-mcp")
es_client = Elasticsearch(["http://localhost:9200"])

@app.tool("search")
async def search_documents(index: str, query: dict) -> dict:
    """
    Busca documentos no Elasticsearch.
    
    Args:
        index: nome do índice
        query: query DSL do Elasticsearch
    
    Returns:
        dict com hits encontrados
    """
    
    # Validação 1: índice existe?
    if not es_client.indices.exists(index=index):
        raise ValueError(f"Index '{index}' does not exist")
    
    # Validação 2: query é dict?
    if not isinstance(query, dict):
        raise ValueError("Query must be a dictionary")
    
    # Validação 3: previne operações perigosas
    if "delete_by_query" in str(query):
        raise ValueError("Delete operations not allowed")
    
    # Execução segura
    try:
        response = es_client.search(index=index, body=query)
        return {
            "total": response["hits"]["total"]["value"],
            "hits": [hit["_source"] for hit in response["hits"]["hits"]]
        }
    except Exception as e:
        return {"error": str(e)}
```

**Boas práticas:**

- ✅ Sempre validar entrada antes de executar
- ✅ Prevenir operações destrutivas (delete, drop)
- ✅ Tratar exceções (não deixar servidor crasher)
- ✅ Retornar erro descritivo (não apenas "falhou")

---

### 3. Definir Transporte e Autenticação

#### Transporte: stdio

**O que é:** comunicação via entrada/saída padrão (stdin/stdout).

**Como funciona:**

```
VS Code envia JSON para stdin:
{"method": "tools/call", "params": {"name": "search", "arguments": {...}}}

Servidor lê stdin → processa → escreve JSON no stdout:
{"result": {"total": 42, "hits": [...]}}

VS Code lê stdout → retorna para Copilot
```

**Implementação em Python:**

```python
import sys
import json
from mcp.server import Server

app = Server("elasticsearch-mcp")

# Registra handlers...

if __name__ == "__main__":
    # Lê mensagens do stdin, escreve respostas no stdout
    app.run(transport="stdio")
```

**Implementação em Node.js:**

```javascript
import { Server } from '@modelcontextprotocol/sdk';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const server = new Server({
  name: 'elasticsearch-mcp',
  version: '1.0.0'
});

// Registra handlers...

const transport = new StdioServerTransport();
await server.connect(transport);
```

---

#### Autenticação

**Opções comuns:**

1. **Credenciais no comando** (configuração simples)
   ```json
   {
     "command": "python",
     "args": ["elasticsearch-mcp.py", "--host", "localhost", "--user", "admin", "--pass", "secret"]
   }
   ```

2. **Variáveis de ambiente** (mais seguro)
   ```json
   {
     "command": "python",
     "args": ["elasticsearch-mcp.py"],
     "env": {
       "ES_HOST": "localhost:9200",
       "ES_USER": "admin",
       "ES_PASS": "${ELASTICSEARCH_PASSWORD}"
     }
   }
   ```

3. **Arquivo de configuração** (melhor para múltiplas credenciais)
   ```python
   # elasticsearch-mcp.py
   import os
   from dotenv import load_dotenv
   
   load_dotenv()  # Carrega de .env
   
   es_client = Elasticsearch(
       [os.getenv("ES_HOST")],
       http_auth=(os.getenv("ES_USER"), os.getenv("ES_PASS"))
   )
   ```

**Recomendação:** variáveis de ambiente (não comita credenciais no Git).

---

### 4. Observar Logs e Tratamento de Erro

**Por que logar:**

- Debug: entender por que tool falhou
- Auditoria: saber quem consultou o quê
- Performance: identificar queries lentas

**Como implementar:**

```python
import logging

# Configurar logger
logging.basicConfig(
    filename="elasticsearch-mcp.log",
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)

@app.tool("search")
async def search_documents(index: str, query: dict) -> dict:
    logging.info(f"Search requested: index={index}, query={query}")
    
    try:
        response = es_client.search(index=index, body=query)
        logging.info(f"Search successful: {response['hits']['total']['value']} hits")
        return {"total": response["hits"]["total"]["value"], "hits": [...]}
    
    except Exception as e:
        logging.error(f"Search failed: {str(e)}")
        return {"error": str(e)}
```

**O que logar:**

| Evento               | Level     | Exemplo                                  |
|----------------------|-----------|------------------------------------------|
| Tool invocada        | INFO      | `"search requested: index=products"`     |
| Sucesso              | INFO      | `"search completed: 42 results"`         |
| Erro de validação    | WARNING   | `"invalid index name: 'prod*'"`          |
| Erro de execução     | ERROR     | `"connection timeout to Elasticsearch"`  |
| Operação bloqueada   | WARNING   | `"blocked delete operation attempt"`     |

---

### 5. Empacotar para Uso no Workspace

**Opção 1: Script local (desenvolvimento)**

```
projeto/
├── .vscode/
│   └── mcp.json
└── tools/
    └── elasticsearch-mcp.py
```

**mcp.json:**

```json
{
  "servers": {
    "elasticsearch": {
      "type": "stdio",
      "command": "python",
      "args": ["./tools/elasticsearch-mcp.py"]
    }
  }
}
```

---

**Opção 2: Pacote npm/PyPI (produção)**

1. Estrutura de pacote:

```
elasticsearch-mcp/
├── package.json       # ou setup.py
├── src/
│   └── index.js       # ou main.py
├── README.md
└── tests/
    └── test_search.js
```

2. Publicar:

```bash
# npm
npm publish

# PyPI
python -m build
twine upload dist/*
```

3. Usar no workspace:

```json
{
  "servers": {
    "elasticsearch": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@sua-empresa/elasticsearch-mcp"]
    }
  }
}
```

**Quando usar cada opção:**

| Cenário                    | Opção Recomendada   |
|----------------------------|---------------------|
| Protótipo/teste            | Script local        |
| Uso apenas no seu projeto  | Script local        |
| Compartilhar com time      | Pacote npm/PyPI     |
| Múltiplos projetos         | Pacote npm/PyPI     |

---

## Desenvolvimento e Debug de Servidor MCP

### Ferramentas Disponíveis

#### 1. MCP Inspector

**O que faz:** interface gráfica para testar servidor MCP sem VS Code.

```bash
# Instalar
npm install -g @modelcontextprotocol/inspector

# Rodar servidor com inspector
mcp-inspector python ./tools/elasticsearch-mcp.py
```

Abre navegador com:
- Lista de tools disponíveis
- Formulário para invocar tools
- Visualização de resposta JSON
- Logs de erro

---

#### 2. Logs do VS Code

**Onde ver:**

```
VS Code → View → Output → selecionar "MCP" no dropdown
```

**O que aparece:**

```
[2026-02-16 10:30:15] Server 'elasticsearch' started
[2026-02-16 10:30:20] Tool 'search' called with args: {"index": "products", "query": {...}}
[2026-02-16 10:30:21] Tool 'search' returned 42 results
[2026-02-16 10:30:25] Error: connection timeout
```

---

#### 3. Testes Unitários

**Exemplo em Python (pytest):**

```python
# tests/test_search.py
import pytest
from elasticsearch_mcp import search_documents

@pytest.mark.asyncio
async def test_search_valid_index():
    result = await search_documents(
        index="products",
        query={"match_all": {}}
    )
    assert result["total"] >= 0
    assert "hits" in result

@pytest.mark.asyncio
async def test_search_invalid_index():
    with pytest.raises(ValueError, match="does not exist"):
        await search_documents(
            index="nao-existe",
            query={"match_all": {}}
        )

@pytest.mark.asyncio
async def test_search_blocks_delete():
    with pytest.raises(ValueError, match="not allowed"):
        await search_documents(
            index="products",
            query={"delete_by_query": {...}}
        )
```

**Executar:**

```bash
pytest tests/ --verbose
```

---

## Template Completo: Droid Elasticsearch

### Arquivo: `elasticsearch-mcp.py`

```python
#!/usr/bin/env python3
"""
Servidor MCP para Elasticsearch
Permite consultar índices, mappings, buscar documentos e agregar dados.
"""

import os
import sys
import json
import logging
from typing import Dict, Any
from elasticsearch import Elasticsearch
from mcp.server import Server

# Configurar logging
logging.basicConfig(
    filename="elasticsearch-mcp.log",
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)

# Criar servidor MCP
app = Server("elasticsearch-mcp")

# Cliente Elasticsearch (ler credenciais de env vars)
es_client = Elasticsearch(
    [os.getenv("ES_HOST", "http://localhost:9200")],
    http_auth=(
        os.getenv("ES_USER", "elastic"),
        os.getenv("ES_PASS", "changeme")
    )
)

# Tool 1: Listar índices
@app.tool("list_indices")
async def list_indices() -> Dict[str, Any]:
    """Lista todos os índices no cluster Elasticsearch."""
    try:
        indices = es_client.cat.indices(format="json")
        logging.info(f"Listed {len(indices)} indices")
        return {
            "indices": [
                {"name": idx["index"], "docs": idx["docs.count"], "size": idx["store.size"]}
                for idx in indices
            ]
        }
    except Exception as e:
        logging.error(f"Failed to list indices: {e}")
        return {"error": str(e)}

# Tool 2: Obter mapping
@app.tool("get_mapping")
async def get_mapping(index: str) -> Dict[str, Any]:
    """Retorna o mapping (schema) de um índice."""
    try:
        if not es_client.indices.exists(index=index):
            raise ValueError(f"Index '{index}' does not exist")
        
        mapping = es_client.indices.get_mapping(index=index)
        logging.info(f"Retrieved mapping for index '{index}'")
        return {"mapping": mapping[index]["mappings"]}
    
    except ValueError as e:
        logging.warning(str(e))
        return {"error": str(e)}
    except Exception as e:
        logging.error(f"Failed to get mapping: {e}")
        return {"error": str(e)}

# Tool 3: Buscar documentos
@app.tool("search")
async def search_documents(index: str, query: Dict[str, Any]) -> Dict[str, Any]:
    """
    Busca documentos em um índice.
    
    Args:
        index: nome do índice
        query: Elasticsearch Query DSL (dict)
    
    Returns:
        dict com total e hits encontrados
    """
    try:
        # Validações
        if not es_client.indices.exists(index=index):
            raise ValueError(f"Index '{index}' does not exist")
        
        if not isinstance(query, dict):
            raise ValueError("Query must be a dictionary")
        
        # Bloquear operações perigosas
        query_str = json.dumps(query).lower()
        if any(op in query_str for op in ["delete", "update", "reindex"]):
            raise ValueError("Destructive operations not allowed")
        
        # Executar busca
        response = es_client.search(index=index, body=query, size=10)
        total = response["hits"]["total"]["value"]
        hits = [hit["_source"] for hit in response["hits"]["hits"]]
        
        logging.info(f"Search on '{index}': {total} results")
        return {"total": total, "hits": hits}
    
    except ValueError as e:
        logging.warning(str(e))
        return {"error": str(e)}
    except Exception as e:
        logging.error(f"Search failed: {e}")
        return {"error": str(e)}

# Tool 4: Aggregations
@app.tool("aggregate")
async def aggregate_data(index: str, aggs: Dict[str, Any]) -> Dict[str, Any]:
    """
    Executa aggregations no índice.
    
    Args:
        index: nome do índice
        aggs: aggregations DSL (dict)
    
    Returns:
        dict com agregações calculadas
    """
    try:
        if not es_client.indices.exists(index=index):
            raise ValueError(f"Index '{index}' does not exist")
        
        response = es_client.search(index=index, body={"size": 0, "aggs": aggs})
        logging.info(f"Aggregation on '{index}' completed")
        return {"aggregations": response["aggregations"]}
    
    except ValueError as e:
        logging.warning(str(e))
        return {"error": str(e)}
    except Exception as e:
        logging.error(f"Aggregation failed: {e}")
        return {"error": str(e)}

# Executar servidor
if __name__ == "__main__":
    logging.info("Starting Elasticsearch MCP server")
    app.run(transport="stdio")
```

---

### Configuração no workspace: `.vscode/mcp.json`

```json
{
  "$schema": "https://raw.githubusercontent.com/microsoft/vscode/main/extensions/mcp/schemas/mcp.schema.json",
  "servers": {
    "elasticsearch": {
      "type": "stdio",
      "command": "python",
      "args": ["./tools/elasticsearch-mcp.py"],
      "env": {
        "ES_HOST": "http://localhost:9200",
        "ES_USER": "elastic",
        "ES_PASS": "${ELASTICSEARCH_PASSWORD}"
      },
      "enabled": true
    }
  }
}
```

---

### Arquivo de variáveis: `.env` (não commitar)

```bash
ELASTICSEARCH_PASSWORD=senha_super_segura_aqui
```

---

## Exercício: Desenhar Droid Custom (Sem Código)

**Missão:** especificar Droid para uma dor real do time.

### Template de Especificação

**1. Problema alvo**

```
Descreva a dor em 2-3 frases:
- O que você faz manualmente hoje?
- Quantas vezes por semana?
- Quanto tempo perde?

Exemplo:
"Consultamos API interna de inventário 10x/dia para validar 
disponibilidade de produtos. Precisamos copiar/colar IDs de produtos 
do código para Postman, executar request, interpretar JSON. 
Perda: ~30min/dia."
```

**2. Tools necessárias**

| Tool               | Entrada                  | Saída                        |
|--------------------|--------------------------|------------------------------|
| `check_stock`      | `product_id`             | quantidade em estoque        |
| `list_products`    | `category` (opcional)    | lista de produtos ativos     |
| `reserve_product`  | `product_id`, `quantity` | confirmação de reserva       |

**3. Permissões mínimas**

```
O que o Droid PODE fazer:
- Consultar produtos (GET)
- Consultar estoque (GET)
- Reservar produtos (POST /reserve)

O que o Droid NÃO PODE fazer:
- Deletar produtos (DELETE)
- Alterar preços (PUT /price)
- Acessar dados de clientes
```

**4. Riscos identificados**

| Risco                          | Mitigação                                |
|--------------------------------|------------------------------------------|
| Credenciais vazadas no Git     | Usar variáveis de ambiente               |
| Reserva sem validação          | Validar estoque antes de reservar        |
| API lenta (timeout)            | Timeout de 5s + retry com backoff        |
| Dados sensíveis nos logs       | Não logar product_id completo (mask)     |

**5. Métrica de sucesso**

```
Como saber que o Droid está funcionando bem?

- Redução de 30min/dia → 5min/dia (economia de 80%)
- 0 erros de "produto indisponível" em produção (validação antecipada)
- Time usa Droid >5x/dia (adoção confirmada)
```

---

### Exemplo Completo Preenchido

**1. Problema alvo**

"Time consulta Jira API 15x/dia para verificar status de tickets relacionados a PRs. 
Precisamos copiar ID do ticket do código, abrir Jira no navegador, buscar ticket. 
Perda: ~45min/dia."

**2. Tools necessárias**

| Tool               | Entrada          | Saída                              |
|--------------------|------------------|------------------------------------|
| `get_ticket`       | `ticket_id`      | título, status, assignee, descrição|
| `search_tickets`   | `project`, `jql` | lista de tickets                   |
| `link_pr_ticket`   | `ticket_id`, `pr_url` | confirmação de link         |

**3. Permissões mínimas**

```
PODE:
- Ler tickets (GET /issue)
- Buscar tickets (GET /search)
- Adicionar comentário (POST /comment) — apenas link de PR

NÃO PODE:
- Alterar status (PUT /issue)
- Deletar tickets (DELETE)
- Criar novos tickets (POST /issue)
```

**4. Riscos identificados**

| Risco                          | Mitigação                                |
|--------------------------------|------------------------------------------|
| Token Jira vazado              | Usar env var JIRA_TOKEN                  |
| Comentário spam em massa       | Limitar a 1 comentário/minuto            |
| API rate limit (100req/min)    | Cache de tickets por 5min                |
| Dados sensíveis no log         | Não logar descrição completa de tickets  |

**5. Métrica de sucesso**

```
- Redução de 45min/dia → 10min/dia (economia de 78%)
- 100% dos PRs linkados ao ticket correto (rastreabilidade)
- Team usa Droid >10x/dia (adoção confirmada)
- 0 reclamações de spam em tickets
```

---

## Decisão Final: Criar ou Não Criar?

Use este fluxograma:

```
┌─────────────────────────────────┐
│ Existe servidor pronto?         │
└─────────────────────────────────┘
          │
     Sim  │  Não
          ▼
┌─────────────────────────────────┐       ┌─────────────────────────────────┐
│ Use o servidor oficial          │       │ Frequência de uso >5x/semana?   │
│ (não reinvente a roda)          │       └─────────────────────────────────┘
└─────────────────────────────────┘                │
                                              Sim  │  Não
                                                   ▼
                    ┌─────────────────────────────────┐    ┌─────────────────┐
                    │ Economia >2h/semana?            │    │ Não vale criar  │
                    └─────────────────────────────────┘    └─────────────────┘
                                 │
                            Sim  │  Não
                                 ▼
         ┌─────────────────────────────────┐           ┌─────────────────┐
         │ Time consegue manter?           │           │ Não vale criar  │
         │ (folga de 2-4h/mês)             │           └─────────────────┘
         └─────────────────────────────────┘
                      │
                 Sim  │  Não
                      ▼
    ┌─────────────────────────────────┐           ┌──────────────────────┐
    │ CRIAR DROID CUSTOM               │           │ Pedir ajuda ao time  │
    │ Vale o investimento              │           │ de plataforma        │
    └─────────────────────────────────┘           └──────────────────────┘
```

---

## Recursos Externos

- [SDK oficial MCP para Python](https://github.com/modelcontextprotocol/python-sdk)
- [SDK oficial MCP para Node.js](https://github.com/modelcontextprotocol/typescript-sdk)
- [Guia de desenvolvimento de servidores](https://modelcontextprotocol.io/docs/building-servers)
- [MCP Inspector (ferramenta de debug)](https://github.com/modelcontextprotocol/inspector)

---

## Checklist de Validação

Você está pronto para ir ao próximo módulo se:

- [ ] Sabe decidir quando **criar custom** vs **usar servidor pronto** (tabela de decisão)
- [ ] Lista 3 critérios objetivos para validar se vale criar (frequência, economia, capacidade)
- [ ] Explica as 5 partes da anatomia de servidor MCP (tools, handlers, transporte, logs, empacotamento)
- [ ] Identifica 2 riscos ao criar servidor custom e mitigações correspondentes
- [ ] Consegue preencher template de especificação (problema, tools, permissões, riscos, métricas)
- [ ] Sabe onde ver logs de debug (VS Code Output → MCP, arquivo .log do servidor)
- [ ] Conhece alternativas quando NÃO vale criar (servidor oficial, pedir ajuda a plataforma)

:::tip 🏆 Treinamento Jedi Completo
Você sabe decidir entre adotar um Droid pronto ou especificar um Droid custom com critério técnico e operacional. Entende anatomia de servidor MCP, riscos envolvidos e métricas para validar sucesso da implementação.
:::
