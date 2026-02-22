---
title: 17 - O que Vale Salvar
sidebar_position: 17
description: Como estabelecer o critério de curadoria da biblioteca de prompts — o que salvar, o que descartar e como fazer isso em 15 minutos ao final de cada projeto.
---

> *"Um arquivo Jedi com tudo dentro é um arquivo Jedi sem nada encontrável. O valor não está em salvar mais — está em salvar certo."*

**Duração estimada:** ~30 min

## Vídeo introdutório

<video controls width="100%" preload="metadata">
	<source src="/copilot-na-pratica/videos/17-o-que-vale-salvar.mp4" type="video/mp4" />
	Seu navegador não suporta vídeo HTML5.
</video>

## O Problema Real: O Cemitério de Prompts

Duas patologias opostas destroem uma biblioteca de prompts:

**Patologia A — Salvar nada:**
```
Projeto 1: Daniel escreve prompt de discovery
Projeto 2: Daniel escreve "o mesmo" prompt de discovery (do zero)
Projeto 3: idem
Resultado: 3 versões ligeiramente diferentes, sem evolução acumulada
```

**Patologia B — Salvar tudo:**
```
Projeto 1: salvos 20 prompts
Projeto 2: salvos 18 prompts
Projeto 3: salvos 22 prompts
Biblioteca tem 60 prompts
Dev abre a biblioteca → não sabe o que funciona, não encontra o que precisa
Resultado: ninguém usa a biblioteca
```

A biblioteca que funciona é aquena que **o dev abre, encontra o prompt certo e confia que ele vai funcionar**. Isso exige curadoria, não acumulação.

## As Três Perguntas

Todo prompt candidato a entrar na biblioteca passa por três perguntas. Falhar em qualquer uma = descartar.

### Pergunta 1: Este problema vai se repetir em outros projetos?

```
✅ SALVA: "Prompt de discovery de APIs — funciona pra qualquer integração com API externa"
✅ SALVA: "Prompt de geração de spike — funciona pra qualquer demanda"
❌ DESCARTA: "Prompt para analisar especificamente o rate limit da API de pagamentos da empresa X"
             → Específico demais para ter valor em outro contexto
❌ DESCARTA: "Prompt para gerar migration da tabela subscriptions"
             → Específico demais para o projeto atual
```

### Pergunta 2: Qualquer membro da squad consegue executar e chegar ao mesmo resultado?

```
✅ SALVA: Prompt que, quando executado por Daniel ou Kássia, produz output equivalente
❌ DESCARTA: Prompt que funcionou para Daniel mas produziu resultado diferente quando Kássia tentou
             → Pode estar assumindo contexto implícito que só Daniel tinha
❌ DESCARTA: Prompt que depende de configuração específica da máquina de quem escreveu
             → Não é portátil
```

**Como testar:** antes de salvar, peça ao outro dev da squad para executar o prompt do zero. Se o resultado for diferente, o prompt precisa ser explicitado antes de salvar.

### Pergunta 3: O resultado é previsível e confiável?

```
✅ SALVA: Prompt que consistentemente produz um DISCOVERY.md bem estruturado
✅ SALVA: Prompt que consistentemente mapeia endpoints FastAPI corretamente
❌ DESCARTA: Prompt que às vezes funciona, às vezes produz resultado muito diferente
             → Se você não pode confiar no resultado, não coloca na biblioteca
❌ DESCARTA: Prompt que dependia de uma versão específica do Copilot que foi atualizada
             → Valide antes de salvar
```

## Exemplos Práticos: Salva ou Descarta?

| Prompt | Passa nas 3 perguntas? | Decisão |
|---|---|---|
| `discovery.prompt.md` — discovery completo de qualquer demanda | ✅ ✅ ✅ | Salva |
| `spike.prompt.md` — gera spike a partir do DISCOVERY.md | ✅ ✅ ✅ | Salva |
| "Analise a autenticação OAuth2 da API de pagamentos da empresa" | ❌ ❌ ✅ | Descarta |
| "Revise este MR considerando os padrões da squad" | ✅ ✅ ✅ | Salva |
| "Lista os endpoints do billing-service" | ✅ ❌ ✅ | Depende — se vira template genérico: salva |
| "Gere migration para tabela payment_attempts" | ❌ ❌ ✅ | Descarta |
| "Mapeia endpoints FastAPI de um repositório" | ✅ ✅ ✅ | Salva |
| "Debug do erro 422 que apareceu hoje no billing-service" | ❌ ✅ ❌ | Descarta |

## A Sessão de Curadoria: 15 Minutos, Não Mais

Ao final de cada projeto, a squad faz uma sessão de curadoria. O formato:

```
Quem: Daniel e Kássia juntos (ou assíncrono via MR)
Quando: no dia do merge da feature pra main
Quanto tempo: 15 minutos máximo
Onde: revisam a pasta .github/prompts/ do projeto
```

O ritual de 15 minutos:

```
1. Listar prompts criados para este projeto (2 min)
2. Para cada prompt, aplicar as 3 perguntas (8 min)
3. Para os que passam: ajustar para remover contexto específico do projeto (4 min)
   Ex: "Analise o billing-service" → "Analise o {nome-do-serviço}"
4. Criar MR adicionando os aprovados Ã  biblioteca squad-prompts (1 min)
```

O limite de 15 minutos é intencional. Se a curadoria demorar mais, está ficando grande demais ou você está tentando salvar coisas que não deveriam ser salvas.

## Generalizando Antes de Salvar

Prompts específicos muitas vezes têm núcleo genérico. Antes de descartar, tente generalizar:

❌ **Específico demais para salvar como está:**
```markdown
# Análise do billing-service

Analise o repositório `squad-pagamentos/billing-service` e mapa
todos os endpoints de cobrança.
```

✅ **Generalizado — agora vale a pena salvar:**
```markdown
# Mapeamento de Endpoints de um Serviço

**Quando usar:** quando você precisa entender rapidamente os endpoints
de um serviço FastAPI sem ler cada arquivo manualmente.

Analise o repositório `{repositório}` e mapeie:
- Todos os endpoints (método + path)
- Para cada endpoint: parâmetros obrigatórios + contrato de response
- Dependências de autenticação
```

A versão generalizada vai servir para qualquer serviço, não só o billing-service.

## O que Não é Prompt de Biblioteca

Também vale clareza sobre o que **não** vai para a biblioteca:

- **Contexto de projeto específico** → `copilot-instructions.md` do projeto (arquivado com o projeto)
- **Template de artefato** → `spike-template.md`, `DISCOVERY.md` template (ficam em `docs/`)
- **Script de automação** → não é um prompt, é código (fica no repositório de automação)
- **Instrução de uso único** → descarta (você não vai usar de novo)

## Exercício Prático

**Missão:** Criar o critério de curadoria e aplicá-lo nos seus prompts recentes.

1. Liste todos os prompts que você criou nas últimas 4 semanas (incluindo os deste curso).
2. Para cada um, preencha:

| Prompt | Vai se repetir? | Portátil? | Confiável? | Decisão |
|---|---|---|---|---|
| discovery.prompt.md | | | | |
| spike.prompt.md | | | | |
| [seus prompts aqui] | | | | |

3. Para os prompts com decisão "Salva": verifique se precisam ser generalizados.
4. Para os prompts com decisão "Descarta": confirme que você realmente não vai usar de novo — se houver dúvida, peça ao outro dev da squad para tentar executar.

**Critério de sucesso:** no final do exercício, você tem uma lista de 3-7 prompts aprovados para entrar na biblioteca na próxima aula.

## Troubleshooting

### 💡 Problema: Aplicar as 3 perguntas está demorando mais de 15 minutos

**Causa:** você está tentando decidir sem critério claro e entrando em debate.

**Solução:** o desempate é simples:
- Em caso de dúvida → descarta
- O risco de não salvar um prompt bom é baixo (você pode recriar)
- O risco de salvar um prompt ruim é alto (polui a biblioteca e erode a confiança)

### 💡 Problema: Prompt passou nas 3 perguntas mas quando o outro dev executou o resultado foi muito diferente

**Causa:** o prompt tem contexto implícito que você não percebia (arquivos abertos, memória da sessão anterior, etc.).

**Solução:** antes de salvar, adicione o contexto implícito explicitamente ao prompt:
```markdown
**Pré-requisitos:**
- `DISCOVERY.md` carregado via `#file:DISCOVERY.md`
- Droid GitLab ativo no Agent Mode
```

Com os pré-requisitos explicitados, qualquer dev consegue replicar o resultado.

:::tip 🏆 Treinamento Jedi Completo
Você está pronto para a próxima aula se:

- [ ] Apliquei as 3 perguntas em pelo menos 5 prompts recentes
- [ ] Identifiquei pelo menos 3 prompts que devo salvar e pelo menos 2 que não devo
- [ ] Generalizei pelo menos 1 prompt que estava específico demais
- [ ] Sei a diferença entre o que vai pra biblioteca de prompts, o que fica no `copilot-instructions.md` e o que é descartado
:::

---

Você sabe o que salvar. Agora precisa de um lugar para salvar — com estrutura, com convenção de nomeação, com documentação que permita qualquer dev encontrar e usar o prompt certo sem pedir ajuda. Na **Aula 18 — A Biblioteca Viva**, você vai criar o repositório `squad-prompts/` no GitLab, estruturá-lo, e migrar os prompts aprovados para dentro dele.


