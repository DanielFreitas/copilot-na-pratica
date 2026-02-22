---
title: 1 - Dois Jedis não são uma Squad
sidebar_position: 1
description: Como a ausência de sistema transforma dois devs competentes num gargalo de sincronização permanente.
---

> *"Dois Jedis competentes operando com IA não são uma squad. São dois silos esperando para colidir."*

**Duração estimada:** ~35 min

## Vídeo introdutório

<video controls width="100%" preload="metadata">
	<source src="/copilot-na-pratica/videos/01-dois-jedis-nao-sao-uma-squad.mp4" type="video/mp4" />
	Seu navegador não suporta vídeo HTML5.
</video>

## O Problema Real: A Squad que Nunca Foi Squad

Daniel e Kássia são bons devs. Conhecem a stack, entendem o negócio, usam o Copilot todo dia. E, toda vez que chega uma nova demanda, os dois abrem o VS Code, cada um no próprio computador, cada um com o próprio histórico de chat, e começam do zero.

Na última sprint, chega uma demanda de integração com uma API de pagamentos. Daniel vai direto pro código — já conhece o domínio. Kássia tinha mapeado esse mesmo gateway três semanas antes: as URLs por ambiente, os headers obrigatórios, os rate limits que dão problema de madrugada, os dois campos com nomes contra-intuitivos que quebram a serialização. Esse conhecimento existiu. Estava no chat dela, em prompts que funcionaram, em anotações que nunca viraram artefato compartilhado. Agora não existe mais — pelo menos não num lugar onde Daniel possa encontrar.

**Sem sistema:**

```
Demanda de integração chega

├── Daniel abre sessão de chat nova
│   Copilot não sabe nada do projeto
│   Daniel explica o contexto do zero
│   Daniel descobre o gateway por conta própria
│   Dia 2: descobre o rate limit da forma difícil (em produção)
│
└── Kássia recebe a mesma demanda num contexto diferente
    Copilot não sabe nada do projeto
    Kássia já conhece o gateway — mas o contexto está na cabeça dela
    Nunca soube que Daniel também estava mapeando
    Dia 3: code review mostra que os dois entenderam o contrato da API de formas diferentes
    Reunião de 1h para realinhar.
```

**Com sistema:**

```
Demanda chega

└── kickoff.prompt.md executado (Aula 23)
    discovery.prompt.md conduz o levantamento (Aula 7)
    Droid GitLab analisa os repos relevantes (Aula 9)
    DISCOVERY.md registra o que se sabe e o que ainda falta (Aula 5)
    Daniel e Kássia partem do mesmo contexto
    Os dois Copilots leem o mesmo Holocron
    Dia 1: 30 minutos de kickoff. Desenvolvimento começa alinhado.
```

**Diferença:** o conhecimento de Kássia sobre o gateway não some mais quando o projeto termina. Ele vira patrimônio da squad.

## Por Que Acontece Isso

O problema não é que Daniel e Kássia são descuidados ou que a comunicação é ruim. O problema é estrutural: **dois desenvolvedores com IA não são automaticamente uma squad com IA**. São dois indivíduos com Copilots individuais que, coincidentemente, entregam pro mesmo backlog.

Pense numa missão Jedi em dupla. Dois Cavaleiros chegam num planeta sem mapa compartilhado, sem briefing antes de partir, sem protocolo de comunicação em campo. Cada um explora uma região diferente, acumula informação diferente — e na hora de reunir, descobrem que mapearam o mesmo caminho a partir de pontos de entrada distintos. O que faltou não foi habilidade. Foi o **artefato de alinhamento**: o mapa compartilhado, o briefing antes da missão, o canal de sincronização.

No desenvolvimento com IA, esses artefatos têm nome:

```
┌──────────────────────────────────────────────────────────────────────┐
│                      O QUE ESTÁ FALTANDO                            │
├─────────────────────────────────────┬────────────────────────────────┤
│  Dor                                │  Artefato que resolve          │
├─────────────────────────────────────┼────────────────────────────────┤
│  Contexto que some no chat          │  DISCOVERY.md (Caderno de      │
│                                     │  Campo) — Aulas 5 e 6          │
├─────────────────────────────────────┼────────────────────────────────┤
│  Prompts descartados depois de      │  squad-prompts/ (Arquivo Jedi) │
│  funcionar uma vez                  │  — Aulas 17, 18 e 19           │
├─────────────────────────────────────┼────────────────────────────────┤
│  Cada início de demanda diferente   │  kickoff.prompt.md (Ritual de  │
│                                     │  preparação) — Aulas 23 e 24   │
├─────────────────────────────────────┼────────────────────────────────┤
│  Dois Copilots sem contexto         │  copilot-instructions.md (DNA  │
│  compartilhado                      │  da squad) — Aulas 20 e 21     │
└─────────────────────────────────────┴────────────────────────────────┘
```

Cada dor tem uma causa precisa. Cada causa tem um artefato que a elimina. Esse é o sistema que vamos construir ao longo do curso — capítulo por capítulo, artefato por artefato.

## Anatomia das Dores

### Dor 1: O Conhecimento que Evaporou

Uma sessão de Copilot Chat não persiste entre sessões nem entre desenvolvedores. O histórico fica visível pra quem criou — e some pra todos os outros.

O que evapora numa sessão típica de discovery:
- Os nomes reais das tabelas e colunas que o Copilot levantou
- Os curls validados que funcionaram com aquela API específica
- O motivo pelo qual foram para a versão 3 da lib e não a 4
- O rate limit que vai dar problema de madrugada em produção

```python
# ❌ Anti-padrão: contexto só existe no chat
# Por que parece certo: o chat tem tudo, dá pra rolar pra cima se precisar
# O que acontece na prática: próxima sessão, próximo dev — reexplica tudo
# O que fazer em vez disso: registrar em DISCOVERY.md no repo

# Sessão do Copilot da Kássia — Sprint 3:
#   Kássia: qual o rate limit da API de pagamentos?
#   Copilot: consultei o Droid GitLab → 100 req/min, burst de 150 fora do pico
#            header obrigatório: X-Partner-Id com o ID da empresa
#            campo de valor: "amount_in_cents", não "amount"
#
# Sessão encerrada. Contexto: cabeça da Kássia e chat local dela.

# ⚠️ Parcial: Kássia manda o resumo no Slack pro Daniel
# O que ainda falta: não é versionado, não é consultável pelo Copilot,
#                    some da timeline em dias, não sobrevive ao próximo dev

# ✅ Correto: rate limit registrado no DISCOVERY.md, comitado no repo,
#             consultável por qualquer sessão via #file:DISCOVERY.md
#
# Linha no DISCOVERY.md:
# ## APIs Envolvidas
# - **Pagamentos API**: rate limit 100 req/min (burst 150 fora do pico)
#   header: X-Partner-Id obrigatório | campo de valor: amount_in_cents
```

### Dor 2: Os Prompts Descartados

Daniel encontrou um prompt que mapeia endpoints de uma API FastAPI com precisão — vê os decorators, infere os contratos, lista os parâmetros. Ele usou uma vez, funcionou, fechou o chat. Na próxima demanda, vai recriar alguma versão desse prompt do zero — ligeiramente diferente, provavelmente pior. Kássia nunca soube que esse prompt existia.

```python
# ❌ Anti-padrão: prompts que funcionam ficam no histórico de chat
# Por que parece certo: "tenho ali se precisar, posso achar de novo"
# O que acontece na prática: a próxima versão é pior, a squad não aprende junto

# Linha do tempo real de uma squad sem biblioteca de prompts:
#   Sprint 1: Daniel usa prompt-v1 para mapear API → resultado excelente
#   Sprint 3: Daniel usa prompt-v1' (de memória) → menos preciso
#   Sprint 7: Daniel usa prompt-v1'' → mal lembra do original
#   Sprint 1-7: Kássia nunca soube do prompt-v1

# ⚠️ Parcial: Daniel salva o prompt num arquivo local, manda pro Slack
# O que ainda falta: não versionado, não evolui, novo dev não encontra,
#                    o Copilot não consegue referenciar com #file

# ✅ Correto: squad-prompts/ no GitLab
#   squad-prompts/
#   └── discovery/
#       └── mapeamento-endpoints.prompt.md   ← versionado, documentado,
#                                              acessível por qualquer um
#
# Resultado: Kássia executa o mesmo prompt, chega ao mesmo resultado.
# A próxima versão melhora o prompt — nunca piora.
```

### Dor 3: Cada Início é Diferente

Sem um ritual de início, cada demanda começa de maneira diferente. Daniel começa pelo banco de dados. Kássia começa pela interface de integração. Às vezes Daniel faz um spike, às vezes não. Às vezes Kássia documenta as decisões no Confluence, às vezes não. Às vezes os dois convergem cedo — às vezes convergem no code review, quando o custo de ajuste já é alto.

```
┌────────────────────────────────────────────────────────────────────┐
│                     VARIABILIDADE DO INÍCIO                        │
├─────────────────────────────────┬──────────────────────────────────┤
│  Como Daniel começou            │  Como Kássia começou             │
├─────────────────────────────────┼──────────────────────────────────┤
│  Demanda 1: pelo banco de dados │  Demanda 1: pela API externa     │
│  Demanda 2: pelo spike          │  Demanda 2: direto no código     │
│  Demanda 3: sem discovery       │  Demanda 3: com discovery        │
│  Demanda 4: com Droid GitLab    │  Demanda 4: sem Droid            │
└─────────────────────────────────┴──────────────────────────────────┘

Resultado: dois entendimentos divergentes coexistem silenciosamente
           até colidirem no code review ou, pior, em produção.
```

```python
# ❌ Anti-padrão: iniciar por onde parece mais lógico no momento
# Por que parece certo: cada demanda é diferente, faz sentido ser flexível
# O que acontece na prática: flexibilidade vira imprevisibilidade —
#                             dois devs nunca partem do mesmo lugar

# ⚠️ Parcial: combinar no daily o ponto de partida antes de começar
# O que ainda falta: depende de memória humana, não é executável,
#                    o Copilot não sabe o que foi combinado

# ✅ Correto: kickoff.prompt.md define o ponto de partida como artefato,
#             não como combinação verbal
#
# kickoff.prompt.md executa sempre, nesta ordem:
#   1. discovery.prompt.md → DISCOVERY.md
#   2. Droid GitLab analisa repos listados
#   3. spike.prompt.md → spike publicado no Confluence
#   4. copilot-instructions.md atualizado
#   5. divisão de responsabilidades gerada
#
# Daniel sempre começa do Step 1. Kássia sempre começa do Step 1.
# O Copilot de cada um lê os mesmos artefatos.
```

### Dor 4: Dois Copilots Sem Contexto Compartilhado

Cada instância do Copilot conhece apenas o que o desenvolvedor daquela sessão explicou. O Copilot de Daniel não sabe o que o Copilot de Kássia descobriu ontem sobre o schema do banco. Não é uma limitação do Copilot — é uma consequência de usar o Copilot sem artefatos compartilhados.

```python
# ❌ Anti-padrão: confiar que o Copilot "vai entender" o contexto
# Por que parece certo: o Copilot parece inteligente o suficiente para inferir
# O que acontece na prática: ele infere — e erra porque não tem evidência real

# Sessão do Daniel, Dia 2 da demanda:
#   Daniel: gera o endpoint POST /reembolsos seguindo o padrão do projeto
#   Copilot: gera código com tabela "transactions" e coluna "status"
#
# Kássia já sabe: a tabela é "payments", a coluna é "payment_status"
# Kássia mapeou isso ontem. Está na cabeça dela.
# No Copilot dela. Não no Copilot dele.

# ⚠️ Parcial: Daniel pergunta pra Kássia no Slack antes de gerar
# O que ainda falta: depende de disponibilidade dela, não escala,
#                    o Copilot ainda não sabe — Daniel precisa repassar

# ✅ Correto: DISCOVERY.md comitado no repo do projeto
#
# ## Bancos de Dados
# - Tabela principal: **payments** (não "transactions")
#   - Coluna de status: **payment_status** (não "status")
#   - Valores: pending | success | failed | refunded
#
# Daniel: #file:DISCOVERY.md — gera o endpoint POST /reembolsos
# Copilot lê o DISCOVERY.md → gera com tabela e coluna correta, na primeira vez
```

## Dois Devs com IA vs Squad com IA

É aqui que a diferença se torna estrutural:

| | Dois devs com IA | Squad com IA |
|---|---|---|
| Início de demanda | Cada um começa do jeito que preferir | `kickoff.prompt.md` → mesmo ponto de partida |
| Contexto do projeto | Na cabeça de cada um | `DISCOVERY.md` no repo, acessível a qualquer sessão |
| Prompts que funcionam | No chat de quem criou | `squad-prompts/` versionado no GitLab |
| DNA do Copilot | Cada Copilot é um indivíduo | `copilot-instructions.md` compartilhado |
| Onboarding de novo dev | "Se vira nos 30" | Ritual de kickoff em 30 minutos |
| Conhecimento acumulado | Some com o tempo | Cresce a cada projeto |

A coluna da direita não é o estado futuro ideal. É o que vamos construir, artefato por artefato, ao longo das próximas 25 aulas.

## Por que Talento Não é o Problema

Antes da solução vem o diagnóstico certo. E o diagnóstico certo aqui é:

> O problema não é que Daniel e Kássia não são bons devs. É que estão **usando IA como indivíduos**, não como squad.

Dois devs talentosos sem sistema produzem dois silos de conhecimento que crescem em paralelo e colidem periodicamente. O talento individual mascara o custo — as colisões são pequenas, as reuniões de alinhamento parecem normais, o retrabalho entra no "custo natural do desenvolvimento".

O sistema existe para tornar esse custo visível. E então, eliminável.

## Exercício Prático

**Missão:** Fazer o diagnóstico da sua própria squad.

1. **Pense nas últimas 3 demandas** que você trabalhou com outra pessoa — ou, se trabalha solo, nos últimos 3 projetos com mais de uma sprint de Duração.

2. **Para cada demanda, responda:**
   - O contexto do discovery foi registrado em algum artefato ou ficou no chat?
   - Os prompts que funcionaram foram salvos em algum lugar compartilhado?
   - As duas pessoas partiram de um ponto comum ou cada uma do seu jeito?
   - O Copilot de um sabia o que o Copilot do outro descobriu?

3. **Monte seu inventário de dores** com a tabela abaixo:

| Situação | Acontece comigo? | Custo estimado |
|---|---|---|
| Contexto de discovery some quando o projeto termina | Sim / Não | _____ horas |
| Prompts que funcionam ficam só com quem criou | Sim / Não | _____ horas/sprint |
| Discovery é improvisado a cada nova demanda | Sim / Não | _____ horas/demanda |
| Dois devs sem contexto compartilhado no Copilot | Sim / Não | _____ iterações extras |
| Onboarding de novo integrante é lento e manual | Sim / Não | _____ dias |

4. **Some o custo**: quantas horas por sprint você gasta em problemas que poderiam ser evitados por artefatos compartilhados?

**Critério de sucesso:** você consegue nomear pelo menos 3 dores específicas com um custo real associado. Não estimativa — custo que você já pagou em algum projeto.

## Troubleshooting

### 💡 Problema: "Trabalho sozinho — essa aula é relevante pra mim?"

**Sintoma:**
Você é o único dev do projeto ou cada pessoa do time tem seu contexto completamente isolado.

**Causa:**
A narrativa usa uma dupla de devs, mas as dores são as mesmas para quem trabalha solo ou em times maiores.

**Solução:**
Substitua "Daniel e Kássia divergindo" por "você agora vs você daqui a três meses". O contexto que some, os prompts descartados, o início diferente — tudo isso tem custo individual. O sistema que vamos construir tem valor tanto para squads quanto para devs solo. A Dor 1 (contexto evaporado) e a Dor 2 (prompts descartados) são universais.

### 💡 Problema: "A gente já se comunica bem — esses problemas não acontecem com a gente"

**Sintoma:**
Você sente que os problemas descritos não se aplicam porque o time é alinhado, se fala bem e raramente tem conflitos.

**Causa:**
Comunicação boa mascara ausência de sistema. Quando o time se comunica bem, as colisões são resolvidas rapidamente — e esse custo de resolução vira invisível. Parece normal. Entra no orçamento tácito do projeto.

**Solução:**
Responda estas três perguntas com sim ou não direto, sem "depende":

- Se um dev do meu time sair amanhã, o contexto técnico que ele carrega ficará acessível para o próximo?
- Se um novo integrante entrar na segunda, ele consegue contribuir em alinhamento com o time em 2 horas?
- O Copilot de qualquer dev do time conhece as decisões arquiteturais do projeto atual sem que ele explique do zero?

Se qualquer resposta for "não" — o sistema faz diferença real.

:::tip 🏆 Treinamento Jedi Completo
Você está pronto para a próxima aula se:

- [ ] Preenchi a tabela de diagnóstico com pelo menos 3 dores identificadas e um custo real associado a cada uma
- [ ] Consigo descrever com uma frase o que cada artefato (DISCOVERY.md, squad-prompts/, kickoff.prompt.md, copilot-instructions.md) resolve
- [ ] Consigo explicar por que comunicação boa não substitui sistema — e consigo dar um exemplo concreto da minha realidade
- [ ] Entendo a diferença entre dois devs que usam IA e uma squad que opera com IA como sistema
:::

---

Na próxima aula, cada dor que você acabou de nomear ganha um antídoto preciso. Quatro problemas, quatro pilares, uma arquitetura que os conecta. **A Aula 2 — Os Quatro Pilares** mostra o mapa completo antes de iniciar a caminhada.



