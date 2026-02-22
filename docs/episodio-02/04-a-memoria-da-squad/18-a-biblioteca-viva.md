---
title: 18 - A Biblioteca Viva
sidebar_position: 18
description: Como criar e estruturar o repositório squad-prompts/ no GitLab — com convenção de nomeação, documentação e processo de MR para novos prompts.
---

> *"Um Arquivo Jedi sem índice é um arquivo sem passado. Qualquer um pode consultar — desde que saiba o que está procurando."*

**Duração estimada:** ~40 min

## Vídeo introdutório

<video controls width="100%" preload="metadata">
	<source src="/copilot-na-pratica/videos/18-a-biblioteca-viva.mp4" type="video/mp4" />
	Seu navegador não suporta vídeo HTML5.
</video>

## O Problema Real: Prompts que Ninguém Encontra

Sem estrutura definida, prompts salvos têm uma vida curta:

```
Daniel salva prompt em: squad-prompts/discovery-prompt.md
Kássia procura por: squad-prompts/descubrir-demanda.md

Daniel salva prompt em: squad-prompts/revisao.md  
Kássia procura por: squad-prompts/revisao-de-codigo.md

Daniel: "Tenho certeza que salvamos um prompt de análise de endpoints..."
Kássia: "Onde?"
Daniel: "Não lembro."
```

Sem convenção de nomeação → prompts não encontráveis.
Sem documentação → prompts executados errado ou não executados.
Sem estrutura de pastas → não dá pra navegar por domínio.

## Estrutura do Repositório

Crie o repositório `squad-prompts` no GitLab do grupo da squad:

```
squad-prompts/
├── discovery/
│   ├── discovery.prompt.md          ← levantamento inicial de qualquer demanda
│   └── mapear-endpoints.prompt.md   ← mapear endpoints de um serviço
├── spikes/
│   ├── spike.prompt.md              ← geração de spike a partir do DISCOVERY.md
│   └── analisar-as-is.prompt.md     ← análise da situação atual de um serviço
├── integracao/
│   ├── client-http.prompt.md        ← criar cliente HTTP com retry e auth
│   └── autenticacao-oauth.prompt.md ← implementar OAuth2 client credentials
├── revisao/
│   ├── revisao-mr.prompt.md         ← revisão de MR com contexto do spike
│   └── revisao-seguranca.prompt.md  ← checklist de segurança (OWASP)
├── docs/
│   └── spike-template.md            ← template de spike (referenciado pelo spike.prompt.md)
└── README.md
```

## Convenção de Nomeação

**Regra:** `verbo-substantivo.prompt.md`

```
✅ discovery.prompt.md          ← verbo: descobrir / substantivo: demanda
✅ mapear-endpoints.prompt.md   ← verbo: mapear / substantivo: endpoints
✅ revisao-mr.prompt.md         ← verbo: revisar / substantivo: MR
✅ client-http.prompt.md        ← verbo: criar (implícito) / substantivo: cliente HTTP
✅ analisar-as-is.prompt.md     ← verbo: analisar / substantivo: as-is

❌ prompt-discovery.md          ← substantivo antes do verbo
❌ novo-prompt.md               ← não descreve o que faz
❌ daniel-discovery-v2-final.md ← inclui contexto pessoal e versão
❌ discovery_prompt.md          ← underscore em vez de hífen
```

## Anatomia de um Prompt Bem Documentado

Cada arquivo na biblioteca deve ter este cabeçalho antes do prompt em si:

```markdown
# {Título Descritivo da Ação}

**Problema que resolve:** {descrição em 1 frase do problema que este prompt resolve}
**Quando usar:** {situação específica em que este prompt é a escolha certa}
**Pré-requisitos:** {o que precisa estar pronto antes de executar}
**Resultado esperado:** {o que o dev vai obter ao executar}
**Tempo estimado:** {Duração típica da execução}

---

{o prompt em si começa aqui}
```

**Exemplo completo — `discovery/discovery.prompt.md`:**

```markdown
# Discovery — Levantamento Inicial de Demanda

**Problema que resolve:** levantar o contexto técnico completo de uma demanda
antes de começar o desenvolvimento, de forma estruturada e replicável.
**Quando usar:** na primeira sessão com uma nova demanda, antes de qualquer
decisão técnica ou estimativa de prazo.
**Pré-requisitos:** link do ticket da demanda disponível; pelo menos um dev
que conhece o domínio da demanda presente na sessão.
**Resultado esperado:** `DISCOVERY.md` preenchido com todas as dimensões do
levantamento, incluindo pendências 🔍 marcadas para resolver antes do desenvolvimento.
**Tempo estimado:** 30-45 minutos dependendo da complexidade da demanda.

---

[o prompt de discovery completo da Aula 7]
```

Por que esse cabeçalho importa:
- Um dev novo na squad entende quando usar sem precisar perguntar
- Você lembra depois de 6 meses sem usar
- O revisor do MR sabe o que avaliar

## O README.md da Biblioteca

O README é o índice — é a primeira coisa que qualquer dev lê:

```markdown
# squad-prompts — Biblioteca de Prompts da Squad

## Como Usar

1. No VS Code, abra o Agent Mode (Ctrl+I)
2. Use `#file:{caminho-do-prompt}` para carregar o prompt
3. Siga as instruções de pré-requisitos do prompt antes de executar

## Estrutura

| Pasta | O que tem |
|---|---|
| `discovery/` | Prompts de levantamento técnico antes do desenvolvimento |
| `spikes/` | Prompts de geração e análise de documentação técnica |
| `integracao/` | Prompts para implementação de integrações com APIs e serviços |
| `revisao/` | Prompts de revisão de código e MR |

## Como Adicionar um Novo Prompt

1. Crie o arquivo seguindo a convenção `verbo-substantivo.prompt.md`
2. Use o template de cabeçalho (veja qualquer prompt existente)
3. Abra MR com title: `[PROMPT] Nome descritivo`
4. A revisão deve validar: as 3 perguntas de curadoria + cabeçalho completo + funcionou quando testado
5. Aprovação de pelo menos 1 dev da squad antes do merge

## Prompts Disponíveis

### discovery/
- `discovery.prompt.md` — levantamento inicial de qualquer demanda
- `mapear-endpoints.prompt.md` — mapa de endpoints de um serviço FastAPI

### spikes/
- `spike.prompt.md` — gera spike a partir do DISCOVERY.md completo
- `analisar-as-is.prompt.md` — análise da situação atual de um serviço

### integracao/
- `client-http.prompt.md` — cliente HTTP com retry, auth e error handling
- `autenticacao-oauth.prompt.md` — OAuth2 client credentials completo

### revisao/
- `revisao-mr.prompt.md` — revisão de MR com contexto do spike carregado
- `revisao-seguranca.prompt.md` — checklist de segurança OWASP Top 10
```

## O Processo de MR para Novos Prompts

Um prompt na biblioteca vai ser executado muitas vezes. Vale o mesmo rigor que código:

**Branch:** `prompt/{nome-do-prompt}`
**MR title:** `[PROMPT] {título descritivo}`

**O que o revisor valida:**
1. O prompt passou nas 3 perguntas de curadoria (Aula 17)?
2. O cabeçalho está completo (problema, quando usar, pré-requisitos, resultado esperado)?
3. O prompt foi testado e funcionou? (inclua screenshot ou exemplo de output no MR)
4. A nomeação segue a convenção `verbo-substantivo.prompt.md`?
5. Está na pasta correta?

**Template de descrição do MR:**
```markdown
## Prompt: {nome-do-arquivo}

**Problema que resolve:** {1 frase}

**Passou nas 3 perguntas de curadoria:** ✅ / ❌
- Vai se repetir em outros projetos? ✅/❌
- Portátil (outro dev consegue usar)? ✅/❌
- Confiável (resultado previsível)? ✅/❌

**Testado por:** @{seu-user} em {data}
**Resultado do teste:** [descreva ou inclua exemplo de output]
```

## Exercício Prático

**Missão:** Criar o repositório `squad-prompts/` e migrar os prompts aprovados na Aula 17.

1. Crie o repositório `squad-prompts` no GitLab da squad.
2. Configure a branch protection:
   - Branch `main`: protegida, requer aprovação de ao menos 1 person
   - Push direto em main: proibido
3. Crie a estrutura de pastas no repositório.
4. Migre os prompts aprovados na Aula 17:
   - Adicione o cabeçalho completo em cada um
   - Revise se algum precisa ser generalizado antes de entrar
   - Coloque na pasta correta
5. Crie o README.md com a estrutura e o índice atualizado.
6. Adicione o repositório ao `mcp.json` como fonte para o Droid GitLab:

```json
{
  "servers": {
    "gitlab-droid": {
      "toolsets": {
        "biblioteca": {
          "tools": ["ler_arquivo", "listar_repos"],
          "description": "Acessa a biblioteca squad-prompts/ para encontrar prompts disponíveis"
        }
      }
    }
  }
}
```

**Critério de sucesso:** repositório criado com estrutura, pelo menos 3 prompts migrados com cabeçalho completo, e README com índice atualizado.

## Troubleshooting

### 💡 Problema: Onde colocar prompts que não se encaixam nas pastas existentes?

**Causa:** o prompt é de um domínio novo que ainda não tem pasta.

**Solução:**
1. Verifique se não se encaixa numa pasta existente com nome mais genérico
2. Se realmente é um novo domínio, crie a pasta junto com o primeiro prompt dela
3. Atualize o README.md para incluir a nova pasta

### 💡 Problema: Um prompt funciona diferente dependendo do projeto

**Causa:** o prompt depende de contexto que varia (estrutura do repositório, padrões da empresa, etc.).

**Solução:** explicite as variáveis no prompt usando placeholders:
```markdown
# Antes (falha em outros projetos)
Analise o repositório e mapeie os endpoints.

# Depois (funciona em qualquer projeto)
Analise o repositório `{repositório}` (ex: squad/billing-service)
e mapeie os endpoints dos arquivos em `{caminho-das-rotas}` (ex: app/routes/).
```

:::tip 🏆 Treinamento Jedi Completo
Você está pronto para a próxima aula se:

- [ ] O repositório `squad-prompts/` existe no GitLab com estrutura de pastas
- [ ] Pelo menos 3 prompts estão na biblioteca com cabeçalho completo
- [ ] O README.md tem o índice atualizado com todos os prompts disponíveis
- [ ] Branch protection está configurada (push direto em main proibido)
- [ ] Sei como fazer MR para adicionar um novo prompt e o que o revisor vai validar
:::

---

A biblioteca existe e tem os primeiros prompts. O valor real dela aparece com o uso — quando o agente consegue navegar a biblioteca e encontrar o prompt certo para cada situação. Na **Aula 19 — A Biblioteca em Uso**, você vai ver o efeito composto: como a biblioteca cresce de projeto em projeto e como o agente usa os prompts como ponto de partida para qualquer tarefa nova.

