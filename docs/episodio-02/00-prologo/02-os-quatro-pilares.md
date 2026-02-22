---
title: 2 - Os Quatro Pilares
sidebar_position: 2
description: Os quatro pilares que transformam dois devs com IA numa squad que opera com IA — cada um resolvendo uma dor específica da Aula 1.
---

> *"Cada pilar resolve exatamente uma dor. Juntos, resolvem o sistema."*

**Duração estimada:** ~35 min

## Vídeo introdutório

<video controls width="100%" preload="metadata">
	<source src="/copilot-na-pratica/videos/02-os-quatro-pilares.mp4" type="video/mp4" />
	Seu navegador não suporta vídeo HTML5.
</video>

## O Problema Real: A Solução Fragmentada que Nunca Chegou

Na Aula 1, você nomeou quatro dores com precisão cirúrgica: contexto que evapora, prompts descartados, cada início diferente, dois Copilots sem contexto compartilhado. Agora vem a pergunta mais importante: o que resolve cada uma delas?

A resposta frustrante é que a maioria dos times já tentou resolver. Alguém criou uma pasta no repositório pra guardar prompts — e parou de alimentar depois de dois projetos. Alguém propôs um template de discovery — e ninguém usou porque era burocrático demais. Alguém sugeriu um `README.md` de decisões técnicas — e ficou desatualizado na terceira sprint.

**Sem sistema integrado:**

```
Problema: contexto some no chat
Tentativa: pasta "prompts-úteis" no Drive
Resultado: 3 arquivos criados, 2 encontrados, 0 mantidos

Problema: cada início é diferente
Tentativa: template de checklist no Notion
Resultado: preenchido nas primeiras demandas, ignorado na pressão

Problema: dois Copilots sem contexto
Tentativa: explicar o contexto no começo de cada sessão
Resultado: sessão começa em 5 minutos de re-contextualização
```

**Com os quatro pilares:**

```
Problema: contexto some no chat
Solução: Pilar Memória → DISCOVERY.md vive no repositório, versionado, consultável

Problema: cada início é diferente
Solução: Pilar Ritual → kickoff.prompt.md executa sempre o mesmo fluxo

Problema: dois Copilots sem contexto
Solução: Pilar Padrão → copilot-instructions.md compartilhado como DNA da squad

Problema: trabalho manual repetitivo
Solução: Pilar Fluxo → Droids executam o que não precisa de julgamento humano
```

**Diferença:** os pilares são artefatos técnicos versionados no repositório — não acordos informais que dependem de disciplina individual para sobreviver.

## O Que é um Pilar (e o Que Não É)

Antes de entrar em cada pilar, um alinhamento importante:

Um **pilar** não é uma ferramenta, não é um processo, não é uma regra. É um **princípio com artefato concreto associado**. Sem o artefato, o pilar não existe — só existe intenção.

```
┌─────────────────────────────────────────────────────────────────────┐
│                    PRINCÍPIO vs ARTEFATO                            │
├──────────────────────────┬──────────────────────────────────────────┤
│  Pilar (princípio)       │  Artefato (o que prova que existe)       │
├──────────────────────────┼──────────────────────────────────────────┤
│  Ritual                  │  kickoff.prompt.md executado             │
│  Memória                 │  DISCOVERY.md comitado no repo           │
│  Fluxo                   │  Droid configurado e ativo               │
│  Padrão                  │  copilot-instructions.md compartilhado   │
└──────────────────────────┴──────────────────────────────────────────┘
```

"A gente tem ritual" significa que `kickoff.prompt.md` existe no repositório e foi executado na última demanda. Não significa que o time "tem o hábito de alinhar antes de começar".

Essa distinção é crítica. Hábito depende de disciplina e memória. Artefato depende de Git.

## Pilar 1 — Ritual

**Dor que resolve:** cada início é diferente.

**Definição:** o Ritual é o ponto de partida obrigatório de toda demanda — um `prompt file` que executa sempre a mesma sequência de etapas, gera sempre os mesmos artefatos, e garante que Daniel e Kássia nunca comecem o desenvolvimento sem contexto compartilhado.

Pense na preparação de um Jedi antes de uma batalha. Não existe Cavaleiro que saia em missão sem verificar o sabre, estudar o briefing, confirmar o plano de extração. Esse protocolo não é burocracia — é a garantia de que cada missão começa de um estado conhecido.

```
kickoff.prompt.md (Ritual de início — Aula 23)
│
├── Etapa 1: discovery.prompt.md → DISCOVERY.md preenchido
├── Etapa 2: Droid GitLab analisa repos do DISCOVERY.md
├── Etapa 3: spike.prompt.md → spike estruturado gerado
├── Etapa 4: Droid Confluence publica spike
├── Etapa 5: copilot-instructions.md do projeto criado
└── Etapa 6: Daniel e Kássia com responsabilidades divididas
```

Cada etapa tem um artefato. Sem artefato, a etapa não aconteceu.

```markdown
# ❌ Anti-padrão: começar pelo que parece mais urgente
# Por que parece certo: "eu conheço bem esse domínio, não preciso de ritual"
# O que acontece na prática: quem "conhece bem" carrega contexto implícito
#                             que o outro dev (e o Copilot) não compartilha
# O que fazer em vez disso: rodar o kickoff.prompt.md mesmo quando "já sei"

# ⚠️ Parcial: rodar só o discovery antes de começar
# O que ainda falta: sem spike, sem copilot-instructions.md — o Copilot
#                    ainda não tem o contexto das decisões técnicas

# ✅ Correto: kickoff.prompt.md como portão obrigatório
# Resultado: Daniel e Kássia sempre partem do mesmo estado verificável
# Os dois Copilots sempre têm acesso aos mesmos artefatos
```

O Ritual não é o mais trabalhoso dos pilares. Mas é o primeiro — porque sem ele, os outros três não têm ponto de partida consistente.

## Pilar 2 — Memória

**Dor que resolve:** conhecimento que evaporou no chat.

**Definição:** a Memória é o conjunto de artefatos vivos que registram o conhecimento técnico da squad de forma persistente, versionada e consultável. Não documentação formal — registros operacionais que o Copilot consegue referenciar diretamente.

No Ep. I, você conheceu os Holocrons (`copilot-instructions.md` e arquivos `.instructions.md`) — conhecimento estático sobre como seu projeto ou squad funciona. No Ep. II, a Memória da squad tem duas camadas:

```
┌──────────────────────────────────────────────────────────────────────┐
│                      ARQUITETURA DA MEMÓRIA                          │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Camada 1 — Memória de Projeto (por demanda)                        │
│  └── DISCOVERY.md          → contexto técnico da demanda atual      │
│  └── copilot-instructions.md do projeto → decisões desta integração │
│                                                                      │
│  Camada 2 — Memória da Squad (persistente)                          │
│  └── squad-prompts/        → prompts curados que funcionam          │
│  └── copilot-instructions.md da squad → DNA compartilhado           │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

A Memória de Projeto nasce no Ritual (Pilar 1) e morre quando o projeto termina — mas morre de forma explícita, como arquivos comitados no repositório, não como contexto evaporado no chat.

A Memória da Squad cresce a cada projeto. Cada demanda adiciona pelo menos um prompt Ã  biblioteca, refina o `copilot-instructions.md`, documenta uma decisão que vai se repetir.

```python
# ❌ Anti-padrão: confiar na memória dos participantes
# Por que parece certo: "a gente se lembra das coisas importantes"
# O que acontece: a memória dos participantes tem limite, é individual,
#                 e não é consultável pelo Copilot

# ⚠️ Parcial: guardar contexto em Confluence ou Notion
# O que ainda falta: Copilot não lê Confluence automaticamente —
#                    ele precisa de um Droid ou de referência explícita

# ✅ Correto: DISCOVERY.md no repositório + squad-prompts/ no GitLab
#
# Copilot consegue acessar:
#   #file:DISCOVERY.md → contexto da demanda atual
#   #file:.github/squad-prompts/discovery.prompt.md → prompt reutilizável
#   copilot-instructions.md → DNA da squad já carregado automaticamente
```

A Memória não é um arquivo. É uma prática de curadoria (Aula 17): saber o que vale salvar, como documentar, quando considerar obsoleto.

## Pilar 3 — Fluxo

**Dor que resolve:** trabalho manual repetitivo que consome tempo.

**Definição:** o Fluxo é a automação de tudo que não requer julgamento humano. No contexto da squad, isso significa Droids (MCP servers) executando tarefas que seriam feitas manualmente: consultar repositórios no GitLab, publicar no Confluence, mapear endpoints, verificar schemas.

Se você fez o Ep. I, conhece bem os Droids — MCP servers que conectam o Copilot a serviços externos. No Ep. II, os Droids ganham um papel diferente: não são auxiliares de desenvolvimento, são **componentes do ritual de discovery**. São chamados automaticamente pelo `kickoff.prompt.md`, executam em sequência, e entregam artefatos — não respostas.

```
┌────────────────┐     ┌─────────────────┐     ┌───────────────────┐
│  VS Code       │────▶│  Droid GitLab   │────▶│  GitLab           │
│  Agent Mode    │     │  (MCP Server)   │     │  self-hosted      │
│                │     │                 │     │                   │
│  "analise os   │     │  ler_arquivo()  │     │  repos da empresa │
│   repos do     │     │  listar_repos() │     │                   │
│   DISCOVERY"   │     │  mapear_        │     │                   │
│                │     │  endpoints()    │     │                   │
└────────────────┘     └─────────────────┘     └───────────────────┘
         │
         ▼
┌────────────────┐     ┌─────────────────┐     ┌───────────────────┐
│  VS Code       │────▶│  Droid          │────▶│  Confluence       │
│  Agent Mode    │     │  Confluence     │     │  da empresa       │
│                │     │  (MCP Server)   │     │                   │
│  "publique o   │     │  create_page()  │     │  espaço de spikes │
│   spike no     │     │  com template   │     │                   │
│   Confluence"  │     │  padrão         │     │                   │
└────────────────┘     └─────────────────┘     └───────────────────┘
```

```python
# ❌ Anti-padrão: fazer download manual de arquivos para analisar
# Por que parece certo: "são dois cliques, não é tão trabalhoso"
# O que acontece: dois cliques por arquivo × 5 repos × toda demanda =
#                 30+ minutos de trabalho que não agrega julgamento nenhum

# ⚠️ Parcial: usar Copilot para gerar o spike mas publicar manualmente
# O que ainda falta: 15 minutos de copiar, formatar, colar no Confluence —
#                    tempo que poderia estar no discovery, não na publicação

# ✅ Correto: Droid GitLab analisa → Droid Confluence publica
#
# Instrução: "com base no DISCOVERY.md, analise os repositórios listados,
#             gere o spike e publique no Confluence no espaço correto"
#
# O agente executa em sequência:
#   1. Lê DISCOVERY.md → identifica repos
#   2. Droid GitLab → analisa cada repo
#   3. Gera spike com contexto real
#   4. Droid Confluence → publica
#
# Você: revisa o resultado. Tempo humano investido: 10 minutos.
# Sem Droids: esse mesmo fluxo levaria 90 minutos.
```

O Fluxo não elimina o julgamento humano — ele **concentra** o julgamento humano nas partes que importam. O que precisa de análise e decisão fica com Daniel e Kássia. O que é operacional e repetitivo fica com os Droids.

## Pilar 4 — Padrão

**Dor que resolve:** dois Copilots sem contexto compartilhado.

**Definição:** o Padrão é o `copilot-instructions.md` da squad — o DNA compartilhado que define como os dois Copilots se comportam, nomeiam artefatos, estruturam código, tomam decisões de autonomia. Não é uma política — é um arquivo versionado que ambos leem e ambos contribuem para manter.

No Ep. I, o `copilot-instructions.md` era individual — cada Kássia configurava o Copilot para suas preferências. No Ep. II, o Padrão é da squad: **um arquivo, dois devs, contexto convergente**.

```markdown
# ✅ Exemplo: copilot-instructions.md da squad (fragmento — Aula 20)

## Como Usamos o Copilot

### Autonomia do Agente
- Para tarefas de discovery: deixar rodar sem interrupção
- Para geração de código: revisar antes de aceitar
- Para refatoração: sempre mostrar diff antes de aplicar

### Nomeação de Artefatos
- Prompt files: verbo-substantivo.prompt.md
- Context files: CONTEXT-{nome-api}.md
- Discovery: DISCOVERY.md (sempre maiúsculo, sempre na raiz do projeto)

### Quando Parar e Perguntar
- Decisão arquitetural que afeta mais de um serviço
- Mudança em contrato de API existente
- Qualquer mudança que afete o copilot-instructions.md da squad
```

```python
# ❌ Anti-padrão: cada dev configura o Copilot do seu jeito
# Por que parece certo: "o Copilot só afeta meu trabalho"
# O que acontece: Daniel gera código com nomeação X, Kássia com nomeação Y
#                 code review vira sessão de alinhamento de estilo
#                 onboarding de novo dev: "como vocês fazem isso aqui?"

# ⚠️ Parcial: compartilhar o copilot-instructions.md via chat ou e-mail
# O que ainda falta: não é versionado, não é auditável, a próxima versão
#                    diverge se alguém editar sem MR

# ✅ Correto: copilot-instructions.md no repositório compartilhado da squad
#             branch protection: merge exige aprovação dos dois

# Resultado:
# Daniel abre VS Code → lê o DNA da squad → Copilot alinhado
# Kássia abre VS Code → lê o mesmo DNA → Copilot alinhado
# Novo integrante clona o repo → já tem o contexto
```

O Padrão não é imutável. Ele evolui — via MR, com revisão dos dois, de forma rastreável. O que não pode é evoluir de forma unilateral e silenciosa.

## Como os Quatro Pilares se Reforçam

Os pilares não são independentes. Cada um depende dos outros para funcionar com a eficiência prometida:

```
┌──────────────────────────────────────────────────────────────────────┐
│                    INTERDEPENDÊNCIA DOS PILARES                      │
│                                                                      │
│        RITUAL                          MEMÓRIA                       │
│    (kickoff.prompt.md)            (DISCOVERY.md                      │
│          │                         squad-prompts/)                   │
│          │  gera os artefatos da        │                            │
│          ├────────────────────────────▶ │                            │
│          │                             │                             │
│          │  usa os prompts da           │                            │
│          │ ◀──────────────────────────  │                            │
│          │                             │                             │
│        FLUXO                          PADRÃO                         │
│    (Droids GitLab                 (copilot-instructions.md           │
│     e Confluence)                  da squad)                         │
│          │                             │                             │
│          │  executa partes do ritual    │                            │
│          ├──────────────────────────▶  │                            │
│          │                             │                             │
│          │  define como os Droids      │                            │
│          │  são nomeados e usados       │                            │
│          │ ◀──────────────────────────  │                            │
└──────────────────────────────────────────────────────────────────────┘
```

Na prática:

- **Ritual sem Memória:** o kickoff executa e gera artefatos que desaparecem quando o projeto termina — mesma dor de antes.
- **Memória sem Ritual:** os artefatos existem mas nunca são criados de forma consistente. Às vezes estão, às vezes não.
- **Fluxo sem Padrão:** os Droids executam tarefas mas os resultados não seguem uma estrutura consistente — Daniel recebe um spike num formato, Kássia em outro.
- **Padrão sem Fluxo:** o DNA da squad define como os Droids deveriam ser usados, mas os Droids nunca foram configurados. O DNA documenta uma prática que não existe.

| Combinação | O que falta | Custo |
|---|---|---|
| Ritual + Memória (sem Fluxo + Padrão) | Automação e consistência | Tempo manual de publicação e divergência de estilo |
| Ritual + Fluxo (sem Memória + Padrão) | Persistência e DNA compartilhado | Contexto some, Copilots divergem |
| Memória + Padrão (sem Ritual + Fluxo) | Ponto de partida e automação | Início inconsistente, trabalho manual |
| Todos os quatro | — | Sistema completo |

Você não precisa construir os quatro ao mesmo tempo. Mas precisa entender que cada pilar sem os outros tem eficiência limitada. O curso está estruturado para construir na ordem certa — Ritual primeiro, depois Memória, Fluxo e Padrão — porque cada capítulo depende do anterior.

## O Mapa do Curso

Agora que você vê o sistema completo, veja onde cada pilar é construído:

| Pilar | Capítulo | Aulas | Entregável |
|---|---|---|---|
| Memória (base) | Cap. 1 — Ritual de Discovery | 4–8 | `DISCOVERY.md` + `discovery.prompt.md` |
| Fluxo | Cap. 2 — Os Droids da Squad | 9–12 | `gitlab-droid/` + `mcp.json` + Confluence MCP |
| Memória (spike) | Cap. 3 — O Spike que Não Some | 13–16 | `spike-template.md` + `spike.prompt.md` |
| Memória (biblioteca) | Cap. 4 — A Memória da Squad | 17–19 | `squad-prompts/` + critério de curadoria |
| Padrão | Cap. 5 — O Estilo da Squad | 20–22 | `copilot-instructions.md` da squad |
| Ritual | Cap. 6 — O Ritual de Início | 23–24 | `kickoff.prompt.md` |
| Sistema completo | Cap. 7 — A Missão Final | 26 | Todos operando juntos |

A ordem importa. Você vai construir os componentes da Memória antes de construir o Ritual — porque o Ritual precisa dos artefatos da Memória para funcionar. Você vai construir o Fluxo antes do Padrão — porque o Padrão vai definir como o Fluxo é usado.

## Exercício Prático

**Missão:** Mapear quais pilares já existem de alguma forma na sua squad — e quais estão completamente ausentes.

1. **Para cada pilar, responda com honestidade:**

| Pilar | Existe alguma versão disso? | É um artefato versionado? | Funciona sob pressão? |
|---|---|---|---|
| Ritual (ponto de partida fixo) | Sim / Não / Parcial | Sim / Não | Sim / Não |
| Memória (contexto que persiste) | Sim / Não / Parcial | Sim / Não | Sim / Não |
| Fluxo (automação com Droids) | Sim / Não / Parcial | Sim / Não | Sim / Não |
| Padrão (DNA compartilhado) | Sim / Não / Parcial | Sim / Não | Sim / Não |

2. **Identifique o pilar mais fraco:** qual tem o maior impacto na sua squad?

3. **Responda:** por que os quatro precisam existir juntos? Escreva em uma frase — sem consultar a aula.

**Critério de sucesso:** você consegue preencher a tabela com honestidade e identificar o pilar que será mais transformador para a sua realidade atual.

## Troubleshooting

### 💡 Problema: "Nossa squad é pequena — não precisamos de tudo isso"

**Sintoma:**
Time de 2-3 devs, comunicação fácil, contexto compartilhado organicamente. Os quatro pilares parecem overhead desnecessário.

**Causa:**
Times pequenos resolvem problemas de sistema com comunicação — e isso funciona até o momento em que não funciona mais: quando o projeto escala, quando alguém sai, quando a pressão de sprint comprime o tempo de alinhamento.

**Solução:**
Pense em qual pilar teria mais valor imediato, não em implantar os quatro na próxima sprint. Para um time de 2 pessoas, o Padrão (`copilot-instructions.md` compartilhado) e a Memória (biblioteca de prompts) têm custo baixíssimo de implantação e retorno imediato. Comece por eles.

### 💡 Problema: "Já tentamos processos antes e nunca mantivemos"

**Sintoma:**
A squad já experimentou checklists, templates e rituais que funcionaram nas primeiras semanas e foram abandonados na pressão da sprint.

**Causa:**
Processos que dependem de disciplina falham sob pressão. Artefatos que vivem no repositório — e são tecnicamente necessários para o kickoff funcionar — não dependem de disciplina. Se você precisa do `DISCOVERY.md` para o Copilot responder bem, você vai criá-lo. Não por disciplina: por necessidade técnica.

**Solução:**
A diferença entre um processo e um artefato técnico está na consequência de ignorá-lo. Ignorar um processo tem consequência social (alguém vai cobrar). Ignorar o `DISCOVERY.md` tem consequência técnica imediata: o Copilot gera contexto errado, o spike fica genérico, o Droid analisa o repo errado. O sistema se auto-reforça tecnicamente — não depende de ninguém lembrar de cobrar.

:::tip 🏆 Treinamento Jedi Completo
Você está pronto para a próxima aula se:

- [ ] Preenchi a tabela de diagnóstico dos quatro pilares com honestidade — marcando o que realmente existe como artefato versionado, não o que existe como intenção
- [ ] Consigo dizer qual pilar está mais fraco na minha squad atual e por que
- [ ] Consigo explicar por que um processo que depende de disciplina falha sob pressão — e como um artefato técnico muda isso
- [ ] Escrevi em uma frase por que os quatro pilares precisam existir juntos, sem consultar a aula
:::

---

Você tem o diagnóstico (Aula 1) e o mapa (Aula 2). Agora falta o destino antes de começar a caminhar: a **Aula 3 — A Arquitetura do Sistema** mostra como cada peça se conecta numa visão completa — do momento em que a demanda chega até o momento em que Daniel e Kássia começam o desenvolvimento em paralelo com o mesmo contexto.


