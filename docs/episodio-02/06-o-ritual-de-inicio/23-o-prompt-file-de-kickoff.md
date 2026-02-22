---
title: 23 - O Prompt File de Kickoff
sidebar_position: 23
description: Como construir o kickoff.prompt.md — o ritual que orquestra todos os artefatos de início de projeto numa sequência determinística e reproduzível.
---

> *"Um ritual não é burocracia. É a garantia de que você nunca começa um projeto com preguiça de contexto."*

**Duração estimada:** ~40 min

## Vídeo introdutório

<video controls width="100%" preload="metadata">
	<source src="/copilot-na-pratica/videos/23-o-prompt-file-de-kickoff.mp4" type="video/mp4" />
	Seu navegador não suporta vídeo HTML5.
</video>

## O Problema: Início de Projeto Sem Ritual

Sem um ritual de kickoff, o início de projeto é caótico:

```
Demanda chega
→ Um dev começa a codar "para ganhar tempo"
→ O outro faz discovery improvisado
→ Decisões técnicas ficam no Slack
→ Spike nunca é escrito ("vou escrever depois")
→ copilot-instructions.md do projeto fica genérico
→ Semana 2: os dois devs têm contextos diferentes
→ Semana 3: o que foi decidido no início é contestado porque não foi documentado
```

Com o kickoff:

```
Demanda chega
→ Quem vai conduzir abre o kickoff.prompt.md
→ 6 etapas, cada uma com um artefato obrigatório
→ O agente não avança sem o artefato da etapa anterior
→ 30-45 minutos → projeto com contexto completo para os dois devs
```

A diferença não é o tempo gasto no início — é o tempo economizado nas semanas seguintes.

## Por Que Cada Etapa Tem um Artefato

A regra do kickoff é simples:
> **Sem artefato, a etapa não aconteceu.**

Um artefato é exatamente isso: algo que você pode abrir, ler e compartilhar. Uma conversa, uma ideia, uma "decisão tácita" — não são artefatos. "Falamos sobre rate limits" não é o mesmo que "DISCOVERY.md com rate limits documentados e PENDÊNCIAs resolvidas."

Isso muda o comportamento. Quando o agente exige o artefato para avançar, você não pode fingir que a etapa aconteceu.

## O Kickoff Prompt File Completo

Salve como `kickoff/kickoff.prompt.md` na biblioteca `squad-prompts/`:

```markdown
# Kickoff de Projeto

**Problema que resolve:** garantir que todo novo projeto começa com os 6 artefatos
de contexto produzidos na sequência correta antes de qualquer linha de código.
**Quando usar:** ao receber uma nova demanda ou iniciar um novo projeto.
**Pré-requisitos:**
  - Droid GitLab configurado e testado
  - Droid Confluence configurado e testado
  - `squad-prompts/` acessível (prompt files de discovery e spike disponíveis)
  - `copilot-instructions.md` da squad disponível
**Resultado esperado:** 6 artefatos produzidos. Se qualquer etapa não produzir
seu artefato, a etapa não foi concluída — não avance.

---

Execute as etapas abaixo em sequência usando todas as ferramentas disponíveis.

**Regra de ouro:** não avance para a próxima etapa sem o artefato da etapa anterior.
Se o artefato estiver incompleto, trate a etapa como bloqueada e sinalize.

---

## Etapa 1 — Discovery

Execute o `discovery.prompt.md` da biblioteca de prompts da squad.

Artefato obrigatório: `DISCOVERY.md` preenchido com todas as seções
(cabeçalho, objetivo, fontes consultadas com evidências, mapeamento de APIs,
dependências, casos de borda, decisões prévias, pendências sinalizadas com 🔍).

Não avance sem este artefato.

---

## Etapa 2 — Análise de Fontes Existentes (Droid GitLab)

Usando o Droid GitLab, execute para os repositórios relevantes:
1. Mapeie os endpoints expostos pelas APIs que a demanda vai integrar
2. Identifique o uso atual das libs relevantes (ex: libs de HTTP, retry, autenticação)
3. Verifique se há implementação similar já feita que pode ser reutilizada
4. Acrescente ao DISCOVERY.md na seção "Fontes consultadas" as descobertas

Artefato obrigatório: mapa de endpoints + uso de libs adicionado ao DISCOVERY.md.

Não avance sem este artefato.

---

## Etapa 3 — Spike

Execute o `spike.prompt.md` da biblioteca de prompts da squad usando o DISCOVERY.md
preenchido nas etapas anteriores como base.

Artefato obrigatório: spike no template padrão com todas as seções preenchidas
(cabeçalho com status RASCUNHO, contexto, As-Is, To-Be, análise técnica,
decisões técnicas DT-xx e tarefas de backlog com critério de aceite).

Não avance sem este artefato.

---

## Etapa 4 — Publicação no Confluence (Droid Confluence)

Publique o spike no Confluence usando o Droid Confluence.

Artefato obrigatório: URL do spike publicado no Confluence,
com título no formato `[SPIKE] {título}` e conteúdo completo do spike.

Mostre a URL ao final desta etapa.

Não avance sem a URL.

---

## Etapa 5 — Ponte para o Projeto

Crie ou atualize o `copilot-instructions.md` do projeto para incluir:
- Link do spike publicado
- Padrões técnicos específicos da demanda (libs aprovadas, estrutura de pastas)
- Contexto-chave do DISCOVERY.md que o Copilot deve sempre considerar
  (ex: "amount sempre em centavos", "X-Idempotency-Key por tentativa")
- Instruções de autonomia para os aspectos definidos no spike

Artefato obrigatório: `copilot-instructions.md` do projeto com seções preenchidas
e link do spike incluído.

Não avance sem este artefato.

---

## Etapa 6 — Alinhamento de Responsabilidades

Com base no spike (especialmente nas tarefas de backlog), produza:
- Divisão de responsabilidades entre os devs (tarefa por tarefa)
- Critérios de aceite por responsabilidade
- Dependências entre tarefas (quem precisa de quem antes)
- Ordem de implementação recomendada

Artefato obrigatório: divisão de responsabilidades documentada
(pode ser appended ao DISCOVERY.md como seção "Divisão de Trabalho").

---

## Resumo Final

Ao concluir as 6 etapas, confirme:
- [ ] DISCOVERY.md preenchido com fontes, evidências e casos de borda
- [ ] Mapa de endpoints + uso de libs (Droid GitLab) no DISCOVERY.md
- [ ] Spike completo no template padrão com DTs e tarefas de backlog
- [ ] URL do spike no Confluence
- [ ] copilot-instructions.md do projeto com link do spike
- [ ] Divisão de trabalho documentada

Se algum checkitem não está marcado, a etapa correspondente precisa ser completada.
```

## O Que Está Por Trás de Cada Etapa

```
Etapa 1 — Discovery
  ↳ Força a pesquisa antes do código
  ↳ Sem isso, o spike vai ser genérico (Aula 14)

Etapa 2 — Análise de Fontes (Droid GitLab)
  ↳ Preenche lacunas que o DISCOVERY.md humano sempre deixa
  ↳ Impede reinventar o que já existe no repo

Etapa 3 — Spike
  ↳ Transforma o discovery em decisões e tarefas
  ↳ Sem spike, cada dev implementa o que acha que foi decidido

Etapa 4 — Publicação (Confluence)
  ↳ Materializa o spike como artefato compartilhável
  ↳ URL é a "prova de existência" do spike

Etapa 5 — Ponte (copilot-instructions.md do projeto)
  ↳ Conecta o spike ao contexto dos dois Copilots
  ↳ Sem isso, cada dev carrega o contexto manualmente em cada sessão

Etapa 6 — Alinhamento
  ↳ Converte o spike em ação: quem faz o quê
  ↳ Fecha o kickoff com responsabilidades claras
```

## Anti-padrões vs Padrão Correto

❌ **Kickoff parcial:**
```
"Fizemos o discovery e o spike, mas a publicação pode esperar."
→ A Etapa 5 não vai ter a URL para incluir no copilot-instructions.md
→ O copilot-instructions.md vai ter contexto incompleto
→ Os dois Copilots vão ficar sem o link do spike
```

⚠️ **Kickoff com artefatos incompletos:**
```
"O DISCOVERY.md tem tudo menos os rate limits — isso a gente resolve depois."
→ O spike vai ser escrito sem o caso de borda de rate limiting
→ Vai aparecer na implementação ou na homologação
→ "Depois" geralmente é "nunca" ou "tarde demais"
```

✅ **Kickoff completo com artefatos reais:**
```
Etapa 1: DISCOVERY.md com todas as seções, pendências explícitas com 🔍
Etapa 2: Mapa de endpoints adicionado ao DISCOVERY.md via Droid GitLab
Etapa 3: Spike com DT-01 a DT-N e tarefas de backlog com critério de aceite
Etapa 4: URL do Confluence confirmada
Etapa 5: copilot-instructions.md com link + padrões técnicos
Etapa 6: Divisão documentada com dependências
→ 30-45 min de kickoff = semanas de clareza
```

## Exercício Prático

**Missão:** Construir o `kickoff.prompt.md` na biblioteca e executá-lo em uma demanda real ou fictícia.

1. Adicione o prompt file Ã  biblioteca em `squad-prompts/kickoff/kickoff.prompt.md`.
2. Escolha uma demanda: pode ser algo real que está no backlog, ou uma fictícia como "sistema de notificações multi-canal".
3. No Copilot Agent Mode, com os Droids conectados, execute:
   ```
   Execute o kickoff.prompt.md para a demanda: {descrição da demanda}.
   ```
4. Acompanhe etapa por etapa. Não acelere o agente — deixe cada etapa completar seu artefato.
5. Ao final, verifique:
   - Todos os 6 checkitens do resumo final estão marcados?
   - A URL do Confluence é real?
   - O `copilot-instructions.md` do projeto tem o link?

**Critério de sucesso:** 6 artefatos produzidos, todos verificáveis.

## Troubleshooting

### 💡 Problema: O agente avança para a Etapa 2 sem completar o DISCOVERY.md

**Causa:** o prompt não estava configurado para o modo agente, ou foi executado no modo chat sem as ferramentas.

**Solução:** verifique o frontmatter do `kickoff.prompt.md`:
```markdown
---
mode: agent
tools: ['githubRepo', 'codebase']
---
```
Ou use a opção `Use Agent Mode` no Copilot Chat antes de executar.

### 💡 Problema: A Etapa 4 falha porque o Droid Confluence não está conectado

**Causa:** o MCP do Confluence não está rodando ou não está configurado no `mcp.json`.

**Solução:** volte Ã  Aula 11, verifique a configuração e teste com um prompt simples de publicação antes de rodar o kickoff completo.

### 💡 Problema: O kickoff fica genérico mesmo com o prompt file correto

**Causa:** a descrição da demanda passada no início foi vaga. "Fazer API de notificações" é diferente de "API para envio de notificações transacionais via push, SMS, email e WhatsApp com deduplicação por 24h e rastreabilidade por canal."

**Solução:** quanto mais contexto na instrução inicial, mais específico o discovery. Passe o link do card do Jira, a descrição do PO, os critérios de aceite — tudo que você tem.

:::tip 🏆 Treinamento Jedi Completo
Você está pronto para a próxima aula se:

- [ ] O `kickoff.prompt.md` está na biblioteca em `squad-prompts/kickoff/`
- [ ] Entendo por que cada etapa tem um artefato obrigatório
- [ ] Executei o kickoff e 6 artefatos foram produzidos
- [ ] Sei o que fazer quando uma etapa fica bloqueada (resolver o artefato antes de avançar)
:::

---

O `kickoff.prompt.md` existe. Na **Aula 24 — 30 Minutos do Zero ao Contexto**, você vai vê-lo executado em tempo real, sem cortes, num projeto completo: do momento em que a demanda chega até o momento em que os dois devs têm o mesmo contexto sem ter tido uma reunião.


