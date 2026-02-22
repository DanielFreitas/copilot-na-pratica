---
title: 10 - O Droid GitLab em Ação
sidebar_position: 10
description: Como usar o Droid GitLab integrado ao fluxo de discovery — toolsets, orquestração autônoma e como o agente decide quando chamar cada ferramenta.
---

> *"A diferença entre uma ferramenta e um Droid é que a ferramenta você usa. O Droid trabalha enquanto você pensa no que vem a seguir."*

**Duração estimada:** ~40 min

## Vídeo introdutório

<video controls width="100%" preload="metadata">
	<source src="/copilot-na-pratica/videos/10-o-droid-gitlab-em-acao.mp4" type="video/mp4" />
	Seu navegador não suporta vídeo HTML5.
</video>

## O Problema Real: Ferramentas que o Agente Não Sabe Usar

Um MCP server com ferramentas mal descritas produz um agente que não as usa — ou que as usa na hora errada.

❌ **Descrição genérica demais:**
```python
Tool(
    name="ler_arquivo",
    description="Lê um arquivo."
    # Resultado: o agente raramente chama porque não sabe quando é relevante
)
```

❌ **Descrição técnica demais:**
```python
Tool(
    name="ler_arquivo",
    description=(
        "Executa GET /api/v4/projects/{id}/repository/files/{path}/raw "
        "na API REST do GitLab v4 com PRIVATE-TOKEN no header."
    )
    # Resultado: o agente chama quando ele não devia — não entende o propósito
)
```

✅ **Descrição em linguagem natural com contexto de uso:**
```python
Tool(
    name="ler_arquivo",
    description=(
        "Lê o conteúdo de um arquivo de um repositório GitLab. "
        "Use quando precisar ver o código-fonte, configurações, "
        "ou qualquer arquivo de um repositório sem precisar cloná-lo. "
        "Exemplos: ler o main.py de um serviço, verificar o pyproject.toml "
        "de uma lib interna, ler as rotas de uma API FastAPI."
    )
    # Resultado: o agente chama exatamente quando necessário
)
```

A descrição da ferramenta é o único meio que o agente tem de entender **quando** usá-la. Escreva pensando em "para que situação essa ferramenta é a resposta certa?", não em "o que essa ferramenta tecnicamente faz?".

## Demo: DISCOVERY.md → Análise via Droid

Retomando a demanda de cobrança recorrente da Aula 8. O `DISCOVERY.md` terminou com:

```markdown
## Repositórios para Analisar

- [ ] billing-service: padrão de cobrança existente
- [ ] notification-service: padrão de job recorrente com retry
- [ ] scheduler-service: como os jobs são orquestrados
- [ ] libs/empresa-scheduler: exemplos de uso da lib
```

Com o Droid ativo, a instrução para o agente é:

```
#file:DISCOVERY.md

Com base nos repositórios listados na seção "Repositórios para Analisar",
faça o seguinte:

1. Liste os endpoints do billing-service
2. Leia como o notification-service implementa retry nos jobs
3. Mapeie como o scheduler-service registra e dispara jobs
4. Encontre exemplos de uso do empresa-scheduler nos repos listados

Consolide o resultado como uma seção "Análise de Fontes" no DISCOVERY.md.
```

O agente executa sem interrupção:

```
Agente chamando: mapear_endpoints("squad/billing-service")
→ Resultado: 8 endpoints mapeados em app/routes/payments.py

Agente chamando: ler_arquivo("squad/notification-service", "app/jobs/email_job.py")
→ Resultado: implementação de retry com backoff exponencial em 47 linhas

Agente chamando: ler_arquivo("plataforma/scheduler-service", "app/api/v1/jobs.py")
→ Resultado: POST /jobs/{job_type}/schedule com payload e cron expression

Agente chamando: buscar_uso_de_lib("empresa-scheduler")
→ Resultado: 3 repos encontrados usando a lib, com versões

Agente chamando: ler_arquivo("squad/notification-service", "pyproject.toml")
→ Resultado: empresa-scheduler = "^2.1.0" — versão confirmada

Agente consolida e atualiza DISCOVERY.md...
```

Ao final, o `DISCOVERY.md` tem a seção "Análise de Fontes" preenchida com contexto real — não suposições.

## Toolsets: O Agente Certo para Cada Contexto

Quando você tem múltiplos Droids (GitLab + Confluence) e muitas ferramentas, o agente pode ficar desorientado se todas estiverem ativas ao mesmo tempo. **Toolsets** resolvem isso: você define grupos de ferramentas por contexto de uso.

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
      },
      "toolsets": {
        "discovery": {
          "tools": ["ler_arquivo", "mapear_endpoints"],
          "description": "Análise de repositórios durante o discovery"
        },
        "libs-internas": {
          "tools": ["buscar_uso_de_lib", "ler_arquivo"],
          "description": "Análise de uso e versões de libs internas"
        },
        "onboarding": {
          "tools": ["listar_repos", "mapear_endpoints", "buscar_uso_de_lib"],
          "description": "Mapeamento completo do ecossistema para novos membros"
        }
      }
    }
  }
}
```

Com toolsets configurados, você instrui o agente qual contexto usar:

```
# Discovery: agente usa só ler_arquivo e mapear_endpoints
"Usando o toolset de discovery, analise os repos do DISCOVERY.md..."

# Libs: agente usa buscar_uso_de_lib e ler_arquivo
"Usando o toolset de libs-internas, mostre como empresa-auth é usado..."

# Onboarding: agente usa tudo
"Usando o toolset de onboarding, mapeie todo o ecossistema do grupo paymentos..."
```

❌ **Todas as ferramentas ativas, sem toolsets:**
```
Agente: hmm, tenho listar_repos, ler_arquivo, buscar_uso_de_lib, mapear_endpoints,
        criar_pagina_confluence, buscar_pagina_confluence, publicar_spike...
        Qual devo usar para analisar o billing-service?
        [agente fica indeciso, pode chamar ferramenta errada]
```

✅ **Toolset de discovery ativo:**
```
Agente: contexto de discovery — ferramentas disponíveis: ler_arquivo, mapear_endpoints
        Para analisar o billing-service: mapear_endpoints é a ferramenta certa.
        [agente chama diretamente, sem hesitação]
```

## Como o Agente Decide a Sequência de Chamadas

Quando você dá uma instrução de alto nível ("analise os repositórios e atualize o DISCOVERY.md"), o agente determina a sequência de chamadas autonomamente. Entender essa lógica ajuda a escrever instruções melhores.

O agente segue este raciocínio:

```
1. Lê a instrução → entende o objetivo final
2. Lê o DISCOVERY.md (#file) → identifica o que joá existe e o que precisa coletar
3. Para cada repositório listado:
   a. Decide qual ferramenta usar (baseado nas descrições)
   b. Chama a ferramenta com os parâmetros extraídos do DISCOVERY.md
   c. Recebe o resultado e decide se precisa de mais contexto
4. Consolida tudo no formato solicitado
```

**O que isso significa para você:** quanto mais específico for o `DISCOVERY.md` (repositórios com paths corretos, libs com nomes exatos), mais preciso será o agente. Um `DISCOVERY.md` vago produz chamadas de ferramenta vagas.

## O que Fazer Quando o Agente Toma a Decisão Errada

O agente não é infalível. Às vezes ele:
- Chama a ferramenta errada (usa `buscar_uso_de_lib` quando devia usar `ler_arquivo`)
- Lê o arquivo errado (lê `app/main.py` quando a lógica está em `app/services/payment.py`)
- Para cedo (acha que tem contexto suficiente mas misou uma dependência)

Quando isso acontecer:

```
# ❌ Não faça: refazer tudo
"Esqueça o que você fez e recomece do zero."

# ✅ Faça: corrija o passo específico
"O arquivo correto para a lógica de cobrança é app/services/payment_processor.py,
não app/main.py. Leia esse arquivo e complementa a análise."

# ✅ Ou: adicione contexto
"Você identificou os endpoints mas não viu como o billing-service autentica
na API de pagamentos. Leia app/services/payment_processor.py para completar."
```

A correção cirúrgica é mais rápida e preserva o contexto que o agente já coletou.

## Exercício Prático

**Missão:** Executar o fluxo completo de análise com o Droid GitLab.

1. Abra um `DISCOVERY.md` de uma demanda real (ou crie um com ao menos 2 repositórios listados).

2. Instrua o agente para analisar os repositórios usando o Droid:
   ```
   #file:DISCOVERY.md
   
   Analise os repositórios listados na seção "Repositórios para Analisar".
   Para cada um:
   - Mapeie os endpoints principais (se for uma API)
   - Identifique as dependências principais no pyproject.toml
   - Note qualquer padrão relevante para a demanda descrita
   
   Adicione uma seção "Análise de Fontes" ao DISCOVERY.md com o resultado.
   ```

3. Configure um toolset de discovery no `mcp.json` e repita o exercício com o toolset ativo.

4. Compare as duas execuções:

| Critério | Sem toolset | Com toolset |
|---|---|---|
| Ferramentas chamadas | | |
| Erros de decisão do agente | | |
| Tempo até consolação final | | |
| Qualidade do resultado | | |

**Critério de sucesso:** o agente analisou ao menos 2 repositórios, o `DISCOVERY.md` tem uma seção "Análise de Fontes" com dados reais, e você não abriu o browser nem clonou nada.

## Troubleshooting

### 💡 Problema: O agente não usa o Droid, responde com conhecimento geral

**Causa:** o agente não sabe que o Droid existe ou a instrução não sinalizou que precisa de código real.

**Solução:**
1. Verifique se as ferramentas aparecem no ícone de ferramentas do Agent Mode
2. Torne explícito na instrução que você quer dados do repositório:
   ```
   "Analise o código do billing-service NO REPOSITÓRIO GITLAB e retorne
   a implementação real do método de cobrança."
   ```
3. Na primeira vez, referencie a ferramenta diretamente para "ensinar" o padrão:
   ```
   "Use a ferramenta ler_arquivo para ler app/services/payment.py
   do billing-service."
   ```
   Nas próximas vezes, o agente já associa o padrão.

### 💡 Problema: O agente chama o Droid mas usa o repo ou branch errado

**Causa:** o `DISCOVERY.md` não especifica o path completo do repositório no GitLab.

**Solução:** no DISCOVERY.md, sempre use o path completo:
```markdown
## Repositórios para Analisar

- [ ] `squad-pagamentos/billing-service` — padrão de cobrança
      ← ✅ namespace/repo, não só o nome do repo

- [ ] billing-service
      ← ❌ o agente vai tentar adivinhar o namespace e errar
```

:::tip 🏆 Treinamento Jedi Completo
Você está pronto para a próxima aula se:

- [ ] Executei o fluxo completo: `DISCOVERY.md` com repos → agente analisa via Droid → seção "Análise de Fontes" gerada
- [ ] Configurei pelo menos 2 toolsets no `mcp.json` (ex: `discovery` e `libs-internas`)
- [ ] Entendo a diferença entre descrição genérica e descrição em linguagem natural orientada a contexto de uso
- [ ] Sei o que fazer quando o agente usa a ferramenta errada (correção cirúrgica, não reinício)
:::

---

O Droid GitLab está operacional e integrado ao fluxo de discovery. O resultado natural do discovery é um spike — um documento técnico estruturado que vai pro Confluence. E para publicar no Confluence direto do VS Code, sem abrir o browser, sem copiar e colar, a squad precisa do segundo Droid. A **Aula 11 — O Droid Confluence** configura o MCP do Confluence e define como garantir que o Droid sempre use o template certo e publique no espaço correto.


