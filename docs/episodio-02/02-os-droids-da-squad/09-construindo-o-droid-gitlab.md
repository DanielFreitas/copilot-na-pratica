---
title: 9 - Construindo o Droid GitLab
sidebar_position: 9
description: Como construir um MCP server em Python para o GitLab self-hosted da empresa — o Droid que analisa repositórios sem você baixar nada.
---

> *"Um Droid bem programado não precisa de ordens para cada passo. Você define o que ele faz, e ele decide quando fazer."*

**Duração estimada:** ~45 min

## Vídeo introdutório

<video controls width="100%" preload="metadata">
	<source src="/copilot-na-pratica/videos/09-construindo-o-droid-gitlab.mp4" type="video/mp4" />
	Seu navegador não suporta vídeo HTML5.
</video>

## O Problema Real: O Trabalho Manual que Ninguém Podia Automatizar

O `DISCOVERY.md` da Aula 5 lista, na seção "Repositórios para Analisar", os repos que a squad precisa entender. Para uma demanda de cobrança recorrente, eram quatro repos: `billing-service`, `notification-service`, `scheduler-service` e `libs/empresa-scheduler`.

Sem o Droid, o fluxo era:

```
1. Abrir o GitLab no browser
2. Navegar até o repositório
3. Abrir os arquivos relevantes um por um
4. Copiar código para o chat do Copilot
5. Fazer perguntas
6. Ir pro próximo arquivo
7. Repetir para cada um dos 4 repos
```

**Custo real:** 45 minutos de trabalho manual por demanda. Para uma squad de 2 devs com 3 demandas por sprint, isso é 4.5 horas por sprint em trabalho que um Droid poderia fazer em 2 minutos.

Mas o problema não é só tempo — é qualidade. Quando você copia código manualmente, você pré-seleciona o que parece relevante. Você pode perder exatamente o arquivo que tem a informação crítica porque não sabia que devia procurar lá.

O Droid GitLab elimina o trabalho manual **e** a seleção enviesada. Você diz o que quer entender, ele escolhe onde olhar.

## O Que é um MCP Server

**MCP** (Model Context Protocol) é o protocolo que permite ao Copilot chamar ferramentas externas autonomamente durante uma sessão de Agent Mode. Um MCP server é um processo que expõe ferramentas via esse protocolo.

Quando você instrui o agente:
```
"Com base no DISCOVERY.md, analise o billing-service
e identifique como ele processa cobranças."
```

O agente decide que precisa usar o Droid GitLab, chama a ferramenta `ler_arquivo` com os parâmetros certos, recebe o código, e usa esse contexto para responder. Tudo sem você abrir o browser ou clonar nada.

```
┌─────────────────────────────────────────────────────────────────────┐
│                     ARQUITETURA DO DROID                            │
│                                                                      │
│  VS Code (Agent Mode)                                                │
│       ↓                                                              │
│  copilot-instructions.md + sua instrução                            │
│       ↓                                                              │
│  Agente decide: preciso ver código do billing-service               │
│       ↓                                                              │
│  Chama: gitlab_droid.ler_arquivo("billing-service", "app/main.py")  │
│       ↓                                                              │
│  MCP Server (gitlab-droid/) → API GitLab REST → retorna conteúdo   │
│       ↓                                                              │
│  Agente usa o conteúdo para responder                               │
│                                                                      │
│  Você viu: ZERO. O Droid trabalhou nos bastidores.                  │
└─────────────────────────────────────────────────────────────────────┘
```

## Estrutura do Projeto

O `gitlab-droid/` vive na pasta `squad-prompts/` que você vai criar no Capítulo 4 — mas pode existir como repositório separado também. O que importa é que o VS Code saiba onde ele está.

```
gitlab-droid/
├── server.py              ← ponto de entrada do MCP server
├── tools/
│   ├── __init__.py
│   ├── ler_arquivo.py     ← lê conteúdo de arquivo num repo
│   ├── listar_repos.py    ← lista repos de um grupo/namespace
│   ├── buscar_uso_de_lib.py  ← busca uso de uma lib em toda a org
│   └── mapear_endpoints.py   ← mapeia endpoints FastAPI de um repo
├── pyproject.toml
└── README.md
```

## Implementação: As 4 Ferramentas

### pyproject.toml

```toml
[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[project]
name = "gitlab-droid"
version = "1.0.0"
description = "MCP server para GitLab self-hosted"
requires-python = ">=3.13"
dependencies = [
    "mcp>=1.0.0",
    "httpx>=0.27.0",
    "python-dotenv>=1.0.0",
]

[project.scripts]
gitlab-droid = "gitlab_droid.server:main"
```

### server.py

```python
"""
Droid GitLab — MCP server para análise de repositórios.
Ferramentas disponíveis:
  - ler_arquivo: lê conteúdo de um arquivo específico
  - listar_repos: lista repositórios de um namespace
  - buscar_uso_de_lib: busca referências a uma lib em toda a org
  - mapear_endpoints: mapeia endpoints FastAPI de um repositório
"""
import asyncio
import os
from mcp.server import Server
from mcp.server.stdio import stdio_server
from dotenv import load_dotenv

from .tools.ler_arquivo import ler_arquivo_tool
from .tools.listar_repos import listar_repos_tool
from .tools.buscar_uso_de_lib import buscar_uso_de_lib_tool
from .tools.mapear_endpoints import mapear_endpoints_tool

load_dotenv()

# Valida variáveis de ambiente obrigatórias ao iniciar
GITLAB_URL = os.environ.get("GITLAB_URL")
GITLAB_TOKEN = os.environ.get("GITLAB_TOKEN")

if not GITLAB_URL or not GITLAB_TOKEN:
    raise EnvironmentError(
        "GITLAB_URL e GITLAB_TOKEN são obrigatórios. "
        "Configure no .env ou nas variáveis de ambiente do sistema."
    )

app = Server("gitlab-droid")

# Registra as 4 ferramentas no server
app.register_tool(ler_arquivo_tool)
app.register_tool(listar_repos_tool)
app.register_tool(buscar_uso_de_lib_tool)
app.register_tool(mapear_endpoints_tool)


def main():
    asyncio.run(stdio_server(app))


if __name__ == "__main__":
    main()
```

### tools/ler_arquivo.py

```python
"""
Ferramenta: ler_arquivo
Lê o conteúdo de um arquivo específico num repositório GitLab.
"""
import httpx
import os
import base64
from urllib.parse import quote_plus
from mcp.types import Tool, TextContent


ler_arquivo_tool = Tool(
    name="ler_arquivo",
    description=(
        "Lê o conteúdo de um arquivo de um repositório GitLab. "
        "Use quando precisar ver o código-fonte, configurações, "
        "ou qualquer arquivo de um repositório sem precisar cloná-lo. "
        "Exemplos: ler o main.py de um serviço, verificar o pyproject.toml "
        "de uma lib interna, leer as rotas de uma API FastAPI."
    ),
    inputSchema={
        "type": "object",
        "properties": {
            "repositorio": {
                "type": "string",
                "description": (
                    "Caminho do repositório no GitLab. Exemplos: "
                    "'squad/billing-service', 'libs/empresa-auth', "
                    "'plataforma/scheduler-service'"
                )
            },
            "arquivo": {
                "type": "string",
                "description": (
                    "Caminho do arquivo dentro do repositório. "
                    "Exemplos: 'app/main.py', 'pyproject.toml', "
                    "'app/routes/payments.py'"
                )
            },
            "branch": {
                "type": "string",
                "description": "Branch a ler. Padrão: 'main'",
                "default": "main"
            }
        },
        "required": ["repositorio", "arquivo"]
    }
)


async def ler_arquivo(repositorio: str, arquivo: str, branch: str = "main") -> list[TextContent]:
    """Lê arquivo do GitLab via API REST."""
    gitlab_url = os.environ["GITLAB_URL"]
    token = os.environ["GITLAB_TOKEN"]

    # Encoda o path do repositório: "squad/billing-service" → "squad%2Fbilling-service"
    repo_encoded = quote_plus(repositorio)
    # Encoda o path do arquivo: "app/main.py" → "app%2Fmain.py"
    arquivo_encoded = quote_plus(arquivo)

    url = f"{gitlab_url}/api/v4/projects/{repo_encoded}/repository/files/{arquivo_encoded}/raw"

    async with httpx.AsyncClient() as client:
        response = await client.get(
            url,
            headers={"PRIVATE-TOKEN": token},
            params={"ref": branch},
            # Timeout generoso — repos grandes podem demorar
            timeout=30.0
        )

    if response.status_code == 404:
        return [TextContent(
            type="text",
            text=f"Arquivo não encontrado: {arquivo} em {repositorio} (branch: {branch})"
        )]

    if response.status_code == 403:
        return [TextContent(
            type="text",
            text=(
                f"Sem permissão para acessar {repositorio}. "
                "Verifique se o token tem escopo read_repository."
            )
        )]

    response.raise_for_status()

    return [TextContent(
        type="text",
        text=f"# {arquivo} ({repositorio} @ {branch})\n\n```\n{response.text}\n```"
    )]


# Registra a função handler no tool
ler_arquivo_tool.handler = ler_arquivo
```

### tools/listar_repos.py

```python
"""
Ferramenta: listar_repos
Lista repositórios de um namespace (grupo ou usuário) do GitLab.
"""
import httpx
import os
from urllib.parse import quote_plus
from mcp.types import Tool, TextContent


listar_repos_tool = Tool(
    name="listar_repos",
    description=(
        "Lista os repositórios de um grupo ou namespace do GitLab. "
        "Use para descobrir quais repos existem num grupo, "
        "ou para mapear todos os serviços de uma squad/plataforma."
    ),
    inputSchema={
        "type": "object",
        "properties": {
            "namespace": {
                "type": "string",
                "description": (
                    "Grupo ou namespace no GitLab. "
                    "Exemplos: 'squad-pagamentos', 'plataforma', 'libs'"
                )
            },
            "apenas_ativos": {
                "type": "boolean",
                "description": "Se true, lista apenas repos com push nos últimos 90 dias",
                "default": True
            }
        },
        "required": ["namespace"]
    }
)


async def listar_repos(namespace: str, apenas_ativos: bool = True) -> list[TextContent]:
    """Lista repositórios de um namespace via GitLab API."""
    gitlab_url = os.environ["GITLAB_URL"]
    token = os.environ["GITLAB_TOKEN"]

    namespace_encoded = quote_plus(namespace)
    url = f"{gitlab_url}/api/v4/groups/{namespace_encoded}/projects"

    params = {
        "per_page": 100,
        "order_by": "last_activity_at",
        "sort": "desc",
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(
            url,
            headers={"PRIVATE-TOKEN": token},
            params=params,
            timeout=30.0
        )

    response.raise_for_status()
    projetos = response.json()

    if apenas_ativos:
        from datetime import datetime, timedelta, timezone
        cutoff = datetime.now(timezone.utc) - timedelta(days=90)
        projetos = [
            p for p in projetos
            if datetime.fromisoformat(
                p["last_activity_at"].replace("Z", "+00:00")
            ) > cutoff
        ]

    linhas = [f"## Repositórios em {namespace}\n"]
    for p in projetos:
        linhas.append(f"- **{p['name']}** — `{p['path_with_namespace']}`")
        if p.get("description"):
            linhas.append(f"  {p['description']}")

    return [TextContent(type="text", text="\n".join(linhas))]


listar_repos_tool.handler = listar_repos
```

### tools/buscar_uso_de_lib.py

```python
"""
Ferramenta: buscar_uso_de_lib
Busca em quais repos do GitLab uma lib interna é usada.
"""
import httpx
import os
from mcp.types import Tool, TextContent


buscar_uso_de_lib_tool = Tool(
    name="buscar_uso_de_lib",
    description=(
        "Busca quais repositórios usam uma lib interna específica. "
        "Use quando o DISCOVERY.md mencionar uma lib e você precisar "
        "encontrar exemplos de uso real nos repos da empresa. "
        "Retorna uma lista de repos com a linha de código que usa a lib."
    ),
    inputSchema={
        "type": "object",
        "properties": {
            "nome_da_lib": {
                "type": "string",
                "description": (
                    "Nome exato da lib como aparece no pyproject.toml ou requirements. "
                    "Exemplos: 'empresa-auth', 'empresa-scheduler', 'empresa-events'"
                )
            },
            "namespace": {
                "type": "string",
                "description": "Namespace GitLab para restringir a busca. Padrão: busca em toda a instância",
                "default": ""
            }
        },
        "required": ["nome_da_lib"]
    }
)


async def buscar_uso_de_lib(nome_da_lib: str, namespace: str = "") -> list[TextContent]:
    """Busca uso de lib via GitLab Advanced Search API."""
    gitlab_url = os.environ["GITLAB_URL"]
    token = os.environ["GITLAB_TOKEN"]

    # Usa a API de busca de código do GitLab
    url = f"{gitlab_url}/api/v4/search"
    params = {
        "scope": "blobs",
        "search": nome_da_lib,
        # Restringe a arquivos de dependências para evitar falsos positivos
        "filename": "pyproject.toml,requirements.txt,requirements*.txt",
    }

    if namespace:
        # Busca restrita ao grupo
        url = f"{gitlab_url}/api/v4/groups/{namespace}/search"

    async with httpx.AsyncClient() as client:
        response = await client.get(
            url,
            headers={"PRIVATE-TOKEN": token},
            params=params,
            timeout=30.0
        )

    response.raise_for_status()
    resultados = response.json()

    if not resultados:
        return [TextContent(
            type="text",
            text=f"Nenhum repositório encontrado usando `{nome_da_lib}`."
        )]

    linhas = [f"## Repositórios que usam `{nome_da_lib}`\n"]
    for r in resultados[:20]:  # Limita a 20 resultados
        linhas.append(f"- **{r['project_id']}** — `{r['path']}`")
        if r.get("data"):
            # Mostra a linha relevante do arquivo
            linha_relevante = next(
                (l for l in r["data"].splitlines() if nome_da_lib in l),
                ""
            )
            if linha_relevante:
                linhas.append(f"  ```\n  {linha_relevante.strip()}\n  ```")

    linhas.append(
        f"\n💡 Para ver o uso concreto, use `ler_arquivo` nos repos listados "
        f"(ex: buscar exemplos de import e instanciação no código da aplicação)."
    )

    return [TextContent(type="text", text="\n".join(linhas))]


buscar_uso_de_lib_tool.handler = buscar_uso_de_lib
```

### tools/mapear_endpoints.py

```python
"""
Ferramenta: mapear_endpoints
Mapeia os endpoints FastAPI de um repositório sem executar o código.
"""
import httpx
import os
import re
from urllib.parse import quote_plus
from mcp.types import Tool, TextContent


mapear_endpoints_tool = Tool(
    name="mapear_endpoints",
    description=(
        "Lê o código-fonte de um repositório FastAPI e mapeia todos os endpoints: "
        "método HTTP, path, parâmetros e descrição. "
        "Use quando precisar entender a API de um serviço durante o discovery "
        "sem precisar rodar o servidor nem ler cada arquivo manualmente."
    ),
    inputSchema={
        "type": "object",
        "properties": {
            "repositorio": {
                "type": "string",
                "description": "Caminho do repositório no GitLab. Exemplo: 'squad/billing-service'"
            },
            "arquivo_de_rotas": {
                "type": "string",
                "description": (
                    "Arquivo ou diretório com as rotas. "
                    "Padrão: 'app/main.py'. Outros comuns: 'app/routes/', 'app/api/'"
                ),
                "default": "app/main.py"
            }
        },
        "required": ["repositorio"]
    }
)


async def mapear_endpoints(repositorio: str, arquivo_de_rotas: str = "app/main.py") -> list[TextContent]:
    """Lê arquivo de rotas e extrai endpoints FastAPI via análise estática."""
    gitlab_url = os.environ["GITLAB_URL"]
    token = os.environ["GITLAB_TOKEN"]

    repo_encoded = quote_plus(repositorio)
    arquivo_encoded = quote_plus(arquivo_de_rotas)

    url = f"{gitlab_url}/api/v4/projects/{repo_encoded}/repository/files/{arquivo_encoded}/raw"

    async with httpx.AsyncClient() as client:
        response = await client.get(
            url,
            headers={"PRIVATE-TOKEN": token},
            params={"ref": "main"},
            timeout=30.0
        )

    if response.status_code == 404:
        return [TextContent(
            type="text",
            text=(
                f"Arquivo {arquivo_de_rotas} não encontrado em {repositorio}. "
                "Tente 'app/routes/payments.py' ou 'app/api/v1/endpoints/' se o projeto "
                "usa estrutura modular de rotas."
            )
        )]

    response.raise_for_status()
    codigo = response.text

    # Extrai decoradores FastAPI (@router.get, @app.post, etc.)
    # Padrão: @{router_var}.{metodo}("{path}", ...)
    pattern = r'@\w+\.(get|post|put|patch|delete|options)\(\s*["\']([^"\']+)["\']'
    endpoints = re.findall(pattern, codigo, re.IGNORECASE)

    if not endpoints:
        # Tenta padrão alternativo com f-strings ou variáveis
        return [TextContent(
            type="text",
            text=(
                f"Não foi possível extrair endpoints automaticamente de {arquivo_de_rotas}. "
                f"O arquivo pode usar prefixos dinâmicos ou separação em múltiplos arquivos.\n\n"
                f"Conteúdo bruto para análise manual:\n\n```python\n{codigo[:3000]}\n```"
            )
        )]

    linhas = [f"## Endpoints de {repositorio} ({arquivo_de_rotas})\n"]
    for metodo, path in endpoints:
        linhas.append(f"- `{metodo.upper()} {path}`")

    linhas.append(
        f"\n**Total:** {len(endpoints)} endpoints mapeados.\n"
        f"💡 Para detalhes de contratos (request/response), use `ler_arquivo` "
        f"nos arquivos de schema ou nos testes do serviço."
    )

    return [TextContent(type="text", text="\n".join(linhas))]


mapear_endpoints_tool.handler = mapear_endpoints
```

## Registrando o Droid no VS Code

Crie ou edite `.vscode/mcp.json` no repositório raiz:

```json
{
  "servers": {
    "gitlab-droid": {
      "type": "stdio",
      "command": "uv",
      "args": ["run", "--directory", "${workspaceFolder}/gitlab-droid", "gitlab-droid"],
      "env": {
        "GITLAB_URL": "${env:GITLAB_URL}",
        "GITLAB_TOKEN": "${env:GITLAB_TOKEN}"
      }
    }
  }
}
```

O token vai nas variáveis de ambiente do sistema — **nunca** no `mcp.json` diretamente. Configure no `.env` da sua máquina (não commitado) ou nas variáveis de ambiente do sistema.

### Verificando se o Droid está ativo

No VS Code, abra o Agent Mode (Ctrl+I ou ⌘I) e veja o ícone de ferramentas no canto do chat. O Droid GitLab deve aparecer com as 4 ferramentas listadas.

Teste rápido:
```
Liste os repositórios do namespace "squad-pagamentos" no GitLab.
```

Se o Droid estiver ativo, o agente vai chamar `listar_repos` automaticamente e retornar a lista.

## Anti-padrões vs Padrão Correto

❌ **Download manual de contexto:**
```bash
# O que você fazia antes
git clone https://gitlab.empresa.com/squad/billing-service
cd billing-service
grep -r "def " app/
# Copia resultado, cola no chat
# Repete para cada arquivo
```

⚠️ **MCP server funciona mas token no json:**
```json
{
  "servers": {
    "gitlab-droid": {
      "env": {
        "GITLAB_TOKEN": "glpat-xxxxxxxxxxxx"  
        // ❌ TOKEN NO ARQUIVO — RISCO DE SEGURANÇA
        // Esse arquivo pode ser commitado por engano
      }
    }
  }
}
```

✅ **Droid configurado com segurança:**
```json
{
  "servers": {
    "gitlab-droid": {
      "env": {
        "GITLAB_TOKEN": "${env:GITLAB_TOKEN}"
        // ✅ Variável de ambiente do sistema
        // Nunca aparece no arquivo
      }
    }
  }
}
```

## Exercício Prático

**Missão:** Construir e ativar o Droid GitLab no VS Code.

1. Clone ou crie a estrutura `gitlab-droid/` com os 4 arquivos de ferramentas.
2. Configure as variáveis de ambiente no seu sistema:
   ```bash
   # Windows (PowerShell — configurar permanente)
   [System.Environment]::SetEnvironmentVariable("GITLAB_URL", "https://gitlab.suaempresa.com", "User")
   [System.Environment]::SetEnvironmentVariable("GITLAB_TOKEN", "glpat-seu-token", "User")
   ```
3. Crie o `.vscode/mcp.json` apontando para o `gitlab-droid/`.
4. Reinicie o VS Code e verifique se o Droid aparece no Agent Mode.
5. Teste as 4 ferramentas:

| Ferramenta | Teste |
|---|---|
| `ler_arquivo` | Peça para ler o `README.md` de um repositório |
| `listar_repos` | Peça para listar os repos de um namespace do GitLab |
| `buscar_uso_de_lib` | Peça para buscar quem usa uma lib interna sua |
| `mapear_endpoints` | Peça para mapear os endpoints de um serviço FastAPI |

**Critério de sucesso:** as 4 ferramentas funcionam sem você abrir o browser ou clonar nada.

## Troubleshooting

### 💡 Problema: O Droid não aparece nas ferramentas do Agent Mode

**Causa mais comum:** erro de sintaxe no `mcp.json` ou caminho incorreto para o `gitlab-droid/`.

**Solução:**
1. Valide o JSON em `mcp.json` (sem vírgulas finais, aspas corretas)
2. Verifique se o caminho `${workspaceFolder}/gitlab-droid` existe
3. Abra o painel de Output (View → Output) e selecione "GitHub Copilot" para ver erros do MCP
4. Teste o server manualmente: `cd gitlab-droid && uv run gitlab-droid`

### 💡 Problema: Ferramenta retorna erro de autenticação 401

**Causa:** token inválido, expirado, ou sem os escopos corretos.

**Solução:**
1. Verifique se a variável de ambiente foi definida na **sessão atual** do terminal (feche e reabra o VS Code)
2. Gere um novo token no GitLab com escopos: `read_api`, `read_repository`
3. Para GitLab self-hosted, verifique se o token foi gerado na instância correta (não gitlab.com)
4. Teste o token direto: `curl -H "PRIVATE-TOKEN: $GITLAB_TOKEN" $GITLAB_URL/api/v4/user`

### 💡 Problema: `mapear_endpoints` retorna lista vazia

**Causa:** o serviço usa estrutura de rotas separadas em múltiplos arquivos.

**Solução:** instrua o agente a ler o arquivo de rotas correto:
```
Use a ferramenta ler_arquivo para ver o arquivo "app/api/v1/__init__.py"
do serviço billing-service e identificar onde as rotas estão registradas.
```

:::tip 🏆 Treinamento Jedi Completo
Você está pronto para a próxima aula se:

- [ ] O Droid GitLab está rodando e aparece no Agent Mode com as 4 ferramentas
- [ ] Testei `ler_arquivo` e li um arquivo de um repositório sem clonar
- [ ] Testei `mapear_endpoints` e obtive a lista de endpoints de um serviço FastAPI
- [ ] O `GITLAB_TOKEN` não está em nenhum arquivo commitado — só nas variáveis de ambiente
- [ ] Sei explicar a diferença entre o que o Droid faz e o que o agente decide
:::

---

O Droid está de pé. Mas um Droid parado nos bastidores não serve de nada — o valor vem quando ele trabalha integrado ao fluxo real. Na **Aula 10 — O Droid GitLab em Ação**, você vai executar o fluxo completo: `DISCOVERY.md` com repos listados → agente analisa via Droid → mapa de contexto gerado. E vai aprender o conceito de **toolsets**: como agrupar ferramentas por contexto para que o agente use o Droid certo no momento certo.



