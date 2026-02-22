---
title: 11 - O Droid Confluence
sidebar_position: 11
description: Como configurar o MCP do Confluence para publicar spikes automaticamente — sem sair do VS Code, sem copiar e colar, sempre no template correto.
---

> *"Todo conhecimento que não é registrado é conhecimento que não existiu."*

**Duração estimada:** ~35 min

## Vídeo introdutório

<video controls width="100%" preload="metadata">
	<source src="/copilot-na-pratica/videos/11-o-droid-confluence.mp4" type="video/mp4" />
	Seu navegador não suporta vídeo HTML5.
</video>

## O Problema Real: Publicação Manual que Ninguém Faz Direito

O spike foi gerado. Ele está no editor, bem formatado, com as seções certas. E agora começa o trabalho manual:

1. Abrir o Confluence no browser
2. Navegar até o espaço correto (errar uma vez, navegar de novo)
3. Criar uma nova página
4. Escolher o template (ou esquecer e criar sem template)
5. Copiar o conteúdo do editor
6. Colar no editor do Confluence — e ver a formatação quebrar
7. Ajustar markdown para o formato do Confluence
8. Publicar
9. Copiar a URL e colar no `DISCOVERY.md` e no ticket

Em média: **15 minutos por spike**. Para uma squad que faz 3 spikes por sprint: **45 minutos de trabalho manual puro** que o Droid Confluence elimina completamente.

Mas o problema não é só tempo. É qualidade:
- Spike publicado no espaço errado → ninguém encontra
- Spike sem template → revisão difícil, padrão inconsistente
- Título no formato errado → busca do Confluence não ajuda
- URL não registrada no ticket → context vira ilha de informação

O Droid Confluence resolve todos esses problemas com uma instrução.

## O Droid Confluence Já Existe

Diferente do Droid GitLab que você construiu na Aula 9, o Droid Confluence é um MCP server já disponível — você só precisa configurar. O servidor oficial da Atlassian suporta a API do Confluence Cloud e da maioria das instâncias on-premise recentes.

```
MCP server disponível: @modelcontextprotocol/server-confluence
Ferramentas que expõe:
  - confluence_create_page: cria página com conteúdo
  - confluence_update_page: atualiza página existente
  - confluence_search: busca por título ou conteúdo
  - confluence_get_page: lê conteúdo de uma página
  - confluence_get_space: lista espaços disponíveis
```

## Configuração no VS Code

Adicione ao `.vscode/mcp.json` (mesmo arquivo do Droid GitLab):

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
    },
    "confluence-droid": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-confluence"],
      "env": {
        "CONFLUENCE_URL": "${env:CONFLUENCE_URL}",
        "CONFLUENCE_USERNAME": "${env:CONFLUENCE_USERNAME}",
        "CONFLUENCE_API_TOKEN": "${env:CONFLUENCE_API_TOKEN}"
      }
    }
  }
}
```

Configure as variáveis de ambiente:

```powershell
# Windows — configurar permanente para a sessão de usuário
[System.Environment]::SetEnvironmentVariable(
    "CONFLUENCE_URL",
    "https://sua-empresa.atlassian.net/wiki",
    "User"
)
[System.Environment]::SetEnvironmentVariable(
    "CONFLUENCE_USERNAME",
    "seu.email@empresa.com",
    "User"
)
[System.Environment]::SetEnvironmentVariable(
    "CONFLUENCE_API_TOKEN",
    "seu-api-token-aqui",
    "User"
)
```

O API token do Confluence é gerado em: Atlassian Account Settings → Security → API tokens.

## A Instrução de Publicação: Como Garantir Consistência

A chave para o Droid publicar sempre no lugar certo com o template certo é a instrução no `copilot-instructions.md` da squad. Adicione esta seção:

```markdown
## Publicação de Spikes no Confluence

Quando publicar um spike, siga obrigatoriamente:

### Espaço
Engineering > Squad Pagamentos > Spikes
(Espaço key: ~ENGPAG, página pai: "Spikes")

### Título
Formato obrigatório: `[SPIKE] {nome da demanda em português}`
Exemplos:
- ✅ `[SPIKE] Cobrança Recorrente de Assinaturas`
- ❌ `Spike cobrança recorrente` (sem prefixo, sem formato)

### Template
Use a estrutura completa do spike-template.md:
- Contexto, As-Is, To-Be, Análise Técnica, Decisões, Tarefas de Backlog

### Após publicar
Retorne a URL da página publicada para que eu possa registrar no ticket
e no copilot-instructions.md do projeto.
```

Com essa instrução no `copilot-instructions.md`, você instrui o agente simplesmente:

```
Publique o spike no Confluence seguindo as instruções do our style guide.
```

E o Droid publica no espaço certo, com o título no formato certo, usando o template certo.

## Demo: Gerar e Publicar em Sequência

Instrução completa em uma sessão:

```
#file:DISCOVERY.md

1. Gere o spike completo para a demanda "Cobrança Recorrente de Assinaturas"
   usando o template padrão (As-Is, To-Be, Análise Técnica, Decisões, Tarefas)
   baseado no contexto do DISCOVERY.md.

2. Publique o spike no Confluence no espaço correto com o título padrão.

3. Retorne a URL da página criada.
```

O agente executa:

```
Gerando spike com base no DISCOVERY.md...
[spike gerado com todas as seções]

Chamando: confluence_create_page(
    space_key="~ENGPAG",
    parent_title="Spikes",
    title="[SPIKE] Cobrança Recorrente de Assinaturas",
    content=[spike em formato Confluence]
)

Publicado com sucesso.
URL: https://empresa.atlassian.net/wiki/spaces/ENGPAG/pages/12345678
```

## Anti-padrões vs Padrão Correto

❌ **Instruções vagas para o Droid:**
```
"Publique no Confluence."
→ Droid publica no espaço errado, sem template, com título qualquer
```

⚠️ **Instruções na hora da publicação:**
```
"Publique no espaço Engineering > Squad Pagamentos > Spikes,
com título [SPIKE] Cobrança Recorrente, usando o template padrão."
→ Funciona, mas você precisa lembrar e escrever isso toda vez
```

✅ **Instruções no `copilot-instructions.md` da squad:**
```markdown
## Publicação de Spikes
[espaço, título, template definidos uma vez]
→ Você diz apenas "publique o spike" — o Droid sabe todo o resto
```

## Verificando a Publicação

Após o Droid publicar, sempre verifique dois pontos:

1. **A URL é acessível:** cole a URL retornada no browser e confirme que a página abriu corretamente com o conteúdo completo.

2. **O conteúdo está no espaço certo:** verifique o breadcrumb da página no Confluence (Engineering > Squad Pagamentos > Spikes > [SPIKE] ...).

Isso leva 30 segundos e evita descobrir dias depois que o spike foi publicado no espaço pessoal de alguém.

## Exercício Prático

**Missão:** Configurar o Droid Confluence e publicar uma página de teste.

1. Configure o Droid Confluence no `mcp.json` com as variáveis de ambiente corretas.
2. Reinicie o VS Code e confirme que o Droid aparece nas ferramentas do Agent Mode.
3. Publique uma página de teste:
   ```
   Crie uma página no meu espaço pessoal do Confluence com título:
   "[TESTE] Droid Confluence Funcionando — {data de hoje}"
   e conteúdo: "Teste de publicação via MCP. Pode deletar."
   ```
4. Acesse a URL retornada e verifique se a publicação está correta.
5. Adicione as instruções de publicação de spike ao `copilot-instructions.md` da squad.

**Critério de sucesso:** página publicada, URL retornada corretamente, conteúdo legível no Confluence.

## Troubleshooting

### 💡 Problema: O Droid publica no espaço errado

**Causa:** a instrução de espaço não foi incluída no `copilot-instructions.md` ou foi vaga demais.

**Solução:**
1. Especifique o `space_key` exato, não apenas o nome do espaço:
   ```markdown
   ## Espaço para Spikes
   Space key: ~ENGPAG (não "Engineering" — use a key)
   Página pai: "Spikes" (título exato da página pai)
   ```
2. Para descobrir o `space_key`: abra o espaço no Confluence, olhe a URL:
   `https://empresa.atlassian.net/wiki/spaces/ENGPAG/pages/...`
   A key é `ENGPAG`.

### 💡 Problema: O template não é aplicado — formatação saiu diferente

**Causa:** o conteúdo foi enviado como markdown mas o Confluence usa Storage Format (XML interno) ou Atlassian Document Format.

**Solução:**
1. O MCP server do Confluence geralmente converte markdown automaticamente
2. Se a formatação estiver errada, instrua o agente a verificar:
   ```
   "Após publicar, leia a página criada via confluence_get_page
   e confirme que o conteúdo está correto."
   ```
3. Se persistir, considere enviar como plain text e deixar o Confluence renderizar

:::tip 🏆 Treinamento Jedi Completo
Você está pronto para a próxima aula se:

- [ ] O Droid Confluence está configurado no `mcp.json` e aparece nas ferramentas do Agent Mode
- [ ] Publiquei uma página de teste e obtive a URL correta
- [ ] As instruções de publicação (espaço, título, template) estão no `copilot-instructions.md` da squad
- [ ] Sei como descobrir o `space_key` correto da minha instância do Confluence
:::

---

Você tem dois Droids operacionais: um que analisa repositórios e um que publica no Confluence. Mas até agora você os usou separadamente. Na **Aula 12 — Dois Droids, Uma Missão**, você vai orquestrar os dois numa única instrução: do `DISCOVERY.md` com repos listados até o spike publicado no Confluence, sem intervenção manual, sem trocar de contexto.



