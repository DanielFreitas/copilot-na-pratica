---
title: 3 - A Arquitetura do Sistema
sidebar_position: 3
description: O mapa completo do sistema antes de começar a caminhar — como cada peça se conecta e por que a ordem de construção importa.
---

> *"Antes de sair em missão, um Jedi estuda o mapa. Não porque vai seguir cada rota — mas porque sabe onde está quando precisar improvisar."*

**Duração estimada:** ~30 min

## Vídeo introdutório

<video controls width="100%" preload="metadata">
	<source src="/copilot-na-pratica/videos/03-a-arquitetura-do-sistema.mp4" type="video/mp4" />
	Seu navegador não suporta vídeo HTML5.
</video>

## O Problema Real: Construir Sem Saber Onde Encaixa

Cursos técnicos têm um problema clássico: você aprende cada técnica isoladamente e só entende como conectá-las quando já está no meio do projeto. Ai você olha pra trás e vê que a aula 5 pressupunha algo que a aula 8 explicou. Que o artefato da aula 3 é insumo obrigatório da aula 7. Que fazer em ordem errada significa refazer.

**Sem o mapa:**

```
Aula 5: você cria o DISCOVERY.md
→ "Isso é só um arquivo de notas?"

Aula 7: você cria o discovery.prompt.md
→ "Ah, esse prompt preenche o DISCOVERY.md"

Aula 9: você cria o Droid GitLab
→ "Ah, o Droid analisa os repos que estão no DISCOVERY.md"

Aula 23: você cria o kickoff.prompt.md
→ "Ah, o kickoff.prompt.md ORQUESTRA todos os outros"

Resultado: você chegou ao sistema — mas sem saber pra onde estava indo
           em cada aula. Cada peça pareceu isolada até a última.
```

**Com o mapa:**

```
Aula 5: DISCOVERY.md → você sabe: "estou construindo o Caderno de Campo"
Aula 7: discovery.prompt.md → "estou construindo o condutor do Caderno"
Aula 9: Droid GitLab → "estou construindo o braço operacional do Caderno"
Aula 23: kickoff.prompt.md → "estou montando o orquestrador de tudo isso"

Resultado: cada aula tem propósito visível. Você sabe o que está construindo
           e onde vai encaixar — antes de escrever a primeira linha.
```

**Diferença:** quando você vê o mapa agora, cada capítulo tem um papel claro. Você sabe o que vai construir, por que naquela ordem, e o que quebra se pular.

## O Sistema Completo

Este é o sistema que você vai construir ao longo do curso. Leia devagar. Cada seta é uma dependência. Cada bloco é um artefato.

```
╔══════════════════════════════════════════════════════════════════════╗
║                        SISTEMA DA SQUAD                             ║
â• ══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  DEMANDA CHEGA                                                       ║
║       │                                                              ║
║       ▼                                                              ║
║  ┌─────────────────────────────────────────────────────────────┐    ║
║  │  kickoff.prompt.md — o orquestrador (Aulas 23–24)          │    ║
║  │  Ponto de entrada obrigatório. Coordena todas as etapas.   │    ║
║  └──────────────────────────┬──────────────────────────────────┘    ║
║                             │                                        ║
║                             ▼                                        ║
║  ┌──────────────────────────────────────────────────────────────┐   ║
║  │  ETAPA 1 — Discovery (Aulas 4–8)                            │   ║
║  │                                                              │   ║
║  │  discovery.prompt.md → conduz levantamento                  │   ║
║  │       │                                                      │   ║
║  │       ▼                                                      │   ║
║  │  DISCOVERY.md ← preenchido pela squad + agente              │   ║
║  │  (dimensões: APIs, Banco, Cache, Gateways, Libs, Repos...)  │   ║
║  └──────────────────────────┬──────────────────────────────────┘   ║
║                             │                                        ║
║                             ▼                                        ║
║  ┌──────────────────────────────────────────────────────────────┐   ║
║  │  ETAPA 2 — Análise de Fontes (Aulas 9–12)                   │   ║
║  │                                                              │   ║
║  │  Droid GitLab ← lê repos listados no DISCOVERY.md           │   ║
║  │       │                                                      │   ║
║  │       ▼                                                      │   ║
║  │  DISCOVERY.md ← enriquecido com mapa de endpoints,          │   ║
║  │                 dependências, padrões de código              │   ║
║  └──────────────────────────┬──────────────────────────────────┘   ║
║                             │                                        ║
║                             ▼                                        ║
║  ┌──────────────────────────────────────────────────────────────┐   ║
║  │  ETAPA 3 — Spike (Aulas 13–16)                              │   ║
║  │                                                              │   ║
║  │  spike.prompt.md ← usa DISCOVERY.md como insumo             │   ║
║  │       │                                                      │   ║
║  │       ▼                                                      │   ║
║  │  spike gerado (as-is, to-be, decisões, tarefas)             │   ║
║  │       │                                                      │   ║
║  │       ▼                                                      │   ║
║  │  Droid Confluence ← publica spike no espaço correto         │   ║
║  └──────────────────────────┬──────────────────────────────────┘   ║
║                             │                                        ║
║                             ▼                                        ║
║  ┌──────────────────────────────────────────────────────────────┐   ║
║  │  ETAPA 4 — Ponte para o Desenvolvimento (Aulas 15–16)       │   ║
║  │                                                              │   ║
║  │  copilot-instructions.md do projeto                         │   ║
║  │  ← link do spike + decisões técnicas chave + onde buscar    │   ║
║  │    mais contexto via Droid Confluence                        │   ║
║  └──────────────────────────┬──────────────────────────────────┘   ║
║                             │                                        ║
║                             ▼                                        ║
║  ┌──────────────────────────────────────────────────────────────┐   ║
║  │  DESENVOLVIMENTO COM CONTEXTO COMPARTILHADO                 │   ║
║  │                                                              │   ║
║  │  Daniel: abre VS Code → lê copilot-instructions.md          │   ║
║  │  Kássia: abre VS Code → lê o mesmo copilot-instructions.md  │   ║
║  │                                                              │   ║
║  │  Dois Copilots. Mesmo contexto. Desenvolvimento alinhado.   │   ║
║  └──────────────────────────────────────────────────────────────┘   ║
║                                                                      ║
â• ══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  RODANDO EM PARALELO (Aulas 17–22)                                  ║
║                                                                      ║
║  squad-prompts/ (GitLab) ← biblioteca cresce a cada projeto         ║
║  copilot-instructions.md da squad ← DNA compartilhado evolui via MR ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝
```

Leia o diagrama de cima pra baixo. Cada bloco é uma etapa. Cada seta é uma dependência real: se a etapa anterior não aconteceu, a próxima não funciona com a eficiência prometida.

## Como Cada Peça se Conecta

### DISCOVERY.md é o Hub

Tudo converge para o `DISCOVERY.md`. O `discovery.prompt.md` o cria. O Droid GitLab o enriquece. O `spike.prompt.md` o consome. O `copilot-instructions.md` do projeto o referencia.

Não é coincidência — é design. Um único artefato como fonte de verdade para uma demanda específica evita o problema de contexto espalhado em múltiplos lugares desconectados.

```
┌─────────────────────────────────────────────────────────────────────┐
│                    DISCOVERY.md como Hub                            │
│                                                                      │
│   discovery.prompt.md ──────────────────▶ DISCOVERY.md             │
│                                               ▲     │               │
│   Droid GitLab ─────────────────────────────▶ │     │               │
│   (enriquece)                                  │     ▼               │
│   Droid Confluence ◀───────────────────────────────  │               │
│   (consome para publicar)                            │               │
│                                                      ▼               │
│   spike.prompt.md ──────────────────────────▶ spike gerado          │
│                                                      │               │
│   copilot-instructions.md ◀──────────────────────────               │
│   (herda decisões do spike)                                          │
└─────────────────────────────────────────────────────────────────────┘
```

### O kickoff.prompt.md é o Orquestrador

O `kickoff.prompt.md` não faz discovery. Não gera spike. Não configura Droids. Ele **coordena** — executa os outros prompt files na sequência correta, garante que cada etapa entregou seu artefato antes de avançar, e termina com Daniel e Kássia prontos para começar.

Pense nele como o maestro: não toca nenhum instrumento, mas sem ele a orquestra não tem ritmo.

### Os Droids são os Braços

O Droid GitLab e o Droid Confluence não tomam decisões. Eles executam: consultam repositórios, mapeiam endpoints, publicam páginas. Isso libera Daniel e Kássia para o que importa — análise, decisão, julgamento.

O `mcp.json` define quais Droids estão disponíveis no workspace. O `kickoff.prompt.md` decide quando acionar cada um.

### A Biblioteca é a Memória de Longo Prazo

O `squad-prompts/` e o `copilot-instructions.md` da squad não fazem parte do fluxo de uma demanda específica — eles são a camada de aprendizado acumulado. A cada projeto, a biblioteca cresce. A cada sprint, o DNA da squad fica mais preciso. O sistema fica mais rápido com o uso — não mais lento.

## Por Que a Ordem Importa

O curso está estruturado numa sequência específica. Cada capítulo depende do anterior porque cada artefato é insumo do próximo:

```
┌─────────────────────────────────────────────────────────────────────┐
│               DEPENDÊNCIAS ENTRE CAPÍTULOS                          │
│                                                                      │
│  Cap. 1 (Discovery) ──────────▶ gera DISCOVERY.md                  │
│       │                                           │                  │
│       │  Cap. 2 (Droids) usa repos do             │                  │
│       └─────────────────────────────────────────▶ │                  │
│                                                    ▼                 │
│  Cap. 2 (Droids) ─────────────▶ enriquece DISCOVERY.md             │
│       │                                           │                  │
│       │  Cap. 3 (Spike) consome o DISCOVERY       │                  │
│       └─────────────────────────────────────────▶ │                  │
│                                                    ▼                 │
│  Cap. 3 (Spike) ──────────────▶ gera spike + copilot-instructions  │
│       │                                           │                  │
│       │  Cap. 4 (Memória) salva prompt files      │                  │
│       └─────────────────────────────────────────▶ │                  │
│                                                    ▼                 │
│  Cap. 4 (Memória) ─────────────▶ biblioteca com prompts dos caps 1-3│
│       │                                                              │
│       │  Cap. 5 (Padrão) usa prompts salvos                         │
│       ▼                                                              │
│  Cap. 5 (Padrão) ──────────────▶ copilot-instructions.md da squad  │
│       │                                                              │
│       │  Cap. 6 (Ritual) orquestra tudo dos caps 1-5                │
│       ▼                                                              │
│  Cap. 6 (Ritual) ──────────────▶ kickoff.prompt.md funcional        │
│       │                                                              │
│       │  Cap. 7 (Missão) executa o sistema completo                 │
│       ▼                                                              │
│  Cap. 7 (Missão) ──────────────▶ sistema em operação real           │
└─────────────────────────────────────────────────────────────────────┘
```

O que acontece se você pular um capítulo:

| Capítulo pulado | O que quebra nos próximos |
|---|---|
| Cap. 1 (Discovery) | Cap. 2 não sabe quais repos analisar. Cap. 3 gera spike genérico. |
| Cap. 2 (Droids) | Cap. 3 não tem análise de fontes reais. Spike fica teórico. |
| Cap. 3 (Spike) | Cap. 6 não tem artefato para publicar. Ponte para dev fica incompleta. |
| Cap. 4 (Memória) | Cap. 6 usa prompt files recriados do zero a cada vez. |
| Cap. 5 (Padrão) | Cap. 6 orquestra dois Copilots que divergem na execução. |
| Cap. 6 (Ritual) | Cap. 7 não tem orquestrador. Os artefatos existem mas não se conectam. |

Você pode pausar entre capítulos. Mas dentro de um capítulo, a sequência das aulas é obrigatória — cada aula entrega o artefato que a próxima precisa.

## O Que Você Vai Construir em Cada Capítulo

Uma visão prática do que sai das suas mãos em cada trecho:

### Capítulo 1 — Ritual de Discovery (Aulas 4–8)

Você vai construir o **Caderno de Campo da squad**:
- `DISCOVERY.md` — template com todas as dimensões técnicas
- `discovery.prompt.md` — prompt que conduz o levantamento

Ao final do capítulo: quando uma nova demanda chega, você tem um ritual de levantamento estruturado. O Copilot conduz. Você responde. O artefato existe no repositório.

### Capítulo 2 — Os Droids da Squad (Aulas 9–12)

Você vai construir os **braços operacionais do sistema**:
- `gitlab-droid/` — MCP server Python para o GitLab self-hosted da empresa
- `.vscode/mcp.json` — configuração com toolsets por contexto
- Confluence MCP — configurado e validado

Ao final do capítulo: o Droid GitLab analisa repositórios sem você baixar nada. O Droid Confluence publica spikes sem você sair do VS Code.

### Capítulo 3 — O Spike que Não Some (Aulas 13–16)

Você vai construir o **pipeline do spike**:
- `spike-template.md` — estrutura padrão da squad
- `spike.prompt.md` — prompt que transforma DISCOVERY.md em spike estruturado
- `copilot-instructions.md` de projeto — ponte entre spike e sessão de dev

Ao final do capítulo: um DISCOVERY.md completo vira spike publicado no Confluence em menos de 20 minutos.

### Capítulo 4 — A Memória da Squad (Aulas 17–19)

Você vai construir o **Arquivo Jedi da squad**:
- Critério de curadoria — o que vale salvar, o que não vale
- `squad-prompts/` — repositório GitLab estruturado por categoria

Ao final do capítulo: prompts que funcionaram nos capítulos anteriores estão versionados, documentados e acessíveis para qualquer demanda futura.

### Capítulo 5 — O Estilo da Squad (Aulas 20–22)

Você vai construir o **DNA compartilhado**:
- `copilot-instructions.md` da squad — versão 1.0 com autonomia, nomeação, padrões de código
- Protocolo de atualização via MR

Ao final do capítulo: Daniel e Kássia geram código para o mesmo problema e o resultado converge — mesma estrutura, mesma nomeação, mesma autonomia do agente.

### Capítulo 6 — O Ritual de Início (Aulas 23–24)

Você vai construir o **orquestrador**:
- `kickoff.prompt.md` — 6 etapas, 6 artefatos, sequência obrigatória

Ao final do capítulo: uma única instrução executa todo o sistema. Demanda entra, artefatos saem, desenvolvimento começa alinhado.

### Capítulo 6.5 — Quando o Ritual Quebra (Aula 25)

Você vai construir o **guia de diagnóstico**:
- Tabela sintoma → causa → recuperação para cada tipo de falha

Ao final do capítulo: quando o sistema falha, você sabe diagnosticar sem tentar aleatoriamente.

### Capítulo 7 — A Missão Final (Aula 26)

Você vai **executar o sistema completo** num projeto real:
- Demanda complexa, multiplas dependências, sem roteiro visível
- Todos os artefatos dos capítulos anteriores em operação conjunta

Ao final do capítulo: você viu o sistema funcionar de ponta a ponta — e reconheceu cada peça no lugar certo.

## O Sistema em Números

Para ter uma referência concreta do que "funciona" significa:

| Etapa | Sem o sistema | Com o sistema |
|---|---|---|
| Discovery inicial | 2–4h de reuniões + contexto espalhado | ~30 min com `discovery.prompt.md` |
| Análise de repositórios | Download manual, exploração manual | Droid GitLab em minutos |
| Geração e publicação do spike | Escrita manual + copiar pro Confluence | `spike.prompt.md` + Droid Confluence |
| Alinhamento da squad | Reunião de 1h antes de começar | `copilot-instructions.md` já carregado |
| Início de desenvolvimento | Cada dev começa do seu jeito | Ambos a partir dos mesmos artefatos |
| **Total** | **Meio dia ou mais** | **~45 minutos** |

Esses números são o destino. A Aula 26 vai executar esse fluxo em tempo real, cronometrado. Você vai assistir e reconhecer cada peça que construiu.

## Exercício Prático

**Missão:** Desenhar o sistema de memória sem consultar a aula.

1. **Feche este documento.** Abra um arquivo em branco ou pegue um papel.

2. **Desenhe o fluxo** do momento em que a demanda chega até o momento em que o desenvolvimento começa. Inclua:
   - Os artefatos principais (DISCOVERY.md, spike, copilot-instructions.md)
   - Os prompt files que os criam
   - Os Droids que os enriquecem ou publicam
   - O orquestrador que conecta tudo

3. **Volte para esta aula** e compare com o diagrama do sistema.

4. **Marque o que faltou** — não como erro, mas como sinal de onde sua atenção vai ser necessária nos próximos capítulos.

**Critério de sucesso:** você consegue desenhar o fluxo com os nomes dos artefatos corretos e as setas de dependência certas — sem consultar. Se não conseguir na primeira vez, tente mais uma vez depois de reler o diagrama principal. O objetivo é que esse mapa fique tão claro que você possa explicar o sistema para um colega sem abrir a aula.

## Troubleshooting

### 💡 Problema: "O sistema parece complexo demais para o meu contexto"

**Sintoma:**
Você olha para o diagrama e sente que o seu projeto não justifica toda essa estrutura. Stack mais simples, menos Droids disponíveis, empresa sem GitLab ou Confluence.

**Causa:**
O sistema foi projetado para o contexto máximo — GitLab self-hosted, Confluence, squad de dois devs. Mas cada componente tem valor independente.

**Solução:**
Identifique o subconjunto que se aplica ao seu contexto:

| Contexto | O que implementar |
|---|---|
| Solo dev, qualquer stack | DISCOVERY.md + discovery.prompt.md + squad-prompts/ |
| Squad sem GitLab self-hosted | Pular Cap. 2 (Droid GitLab), manter o resto |
| Squad sem Confluence | Pular publicação via Droid, manter geração do spike |
| Squad com contexto já alinhado | Focar em Cap. 6 (kickoff) para consistência |

O sistema é modular. Use o que resolve suas dores atuais. Adicione o restante quando fizer sentido.

### 💡 Problema: "Não entendo por que o kickoff vem no Cap. 6 se é o ponto de entrada"

**Sintoma:**
Parece contra-intuitivo construir o orquestrador nos capítulos finais — se o kickoff é a primeira coisa a ser executada, por que não é a primeira a ser construída?

**Causa:**
O `kickoff.prompt.md` **orquestra** componentes que ainda não existem. Se você construísse o kickoff na Aula 2, ele referenciaria um `discovery.prompt.md` que ainda não existe, um Droid GitLab que ainda não está configurado, um `spike.prompt.md` que ainda não tem template.

**Solução:**
Pense como um roteiro: você escreve a cena clímax depois de ter estabelecido os personagens. O kickoff é o clímax. Os capítulos 1 a 5 são os personagens. Você precisa conhecê-los antes de vê-los em ação juntos.

:::tip 🏆 Treinamento Jedi Completo
Você está pronto para a próxima aula se:

- [ ] Desenhei o sistema completo sem consultar a aula — com os nomes corretos dos artefatos e as setas de dependência
- [ ] Sei o que vou construir em cada um dos sete capítulos — consigo nomear o entregável de cada um
- [ ] Consigo explicar por que o kickoff.prompt.md é construído no Cap. 6 e não no Cap. 1
- [ ] Identifiquei quais componentes do sistema se aplicam ao meu contexto atual
:::

---

O Prólogo termina aqui. Você tem o diagnóstico, o mapa dos quatro pilares, e a visão completa do sistema. Agora começa a construção.

**Capítulo 1 — O Ritual de Discovery** abre com uma pergunta direta: qual é o custo real de um discovery improvisado? Não custo teórico — custo que já aconteceu com você. A **Aula 4** vai te fazer sentir a dor antes de apresentar a solução.



