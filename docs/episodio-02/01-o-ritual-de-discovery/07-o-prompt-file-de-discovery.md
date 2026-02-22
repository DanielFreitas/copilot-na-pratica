---
title: 7 - O Prompt File de Discovery
sidebar_position: 7
description: Como construir o discovery.prompt.md — o arquivo que transforma o levantamento técnico num ritual replicável, versionado e executável no Agent Mode.
---

> *"Um Jedi não memoriza cada movimento do sabre. Ele treina até que o movimento seja automático. O prompt file é o treino codificado."*

**Duração estimada:** ~35 min

## Vídeo introdutório

<video controls width="100%" preload="metadata">
	<source src="/copilot-na-pratica/videos/07-o-prompt-file-de-discovery.mp4" type="video/mp4" />
	Seu navegador não suporta vídeo HTML5.
</video>

## O Problema Real: O Discovery Conduzido Diferente em Cada Projeto

Você aprendeu as 8 dimensões. Você sabe as perguntas certas para cada uma. Mas colocar isso em prática de forma consistente — toda demanda, com qualquer dev da squad, sob pressão de sprint — é um problema diferente.

**Sem prompt file:**

```
Projeto A — Daniel conduz o discovery:
  → Foca em APIs e banco (pontos fortes dele)
  → Esquece cache ("não parecia ter")
  → Documentou 6 de 8 dimensões

Projeto B — Kássia conduz o discovery:
  → Foca em libs internas e filas (ponto forte dela)
  → Não mapeou os curls validados das APIs
  → Documentou 7 de 8 dimensões (dimensão diferente da do Daniel)

Projeto C — os dois são pressionados pela sprint:
  → "Vamos fazer discovery rápido"
  → 15 minutos de conversa informal
  → DISCOVERY.md preenchido de memória depois
  → Documentou 4 de 8 dimensões

Resultado: cada discovery é diferente, com buracos em lugares diferentes,
           e ninguém sabe o que não foi coberto.
```

**Com prompt file:**

```
Projetos A, B e C — qualquer dev executa discovery.prompt.md:

  Agent Mode: carrega prompt file → executa fluxo estruturado
  Pergunta dimensão por dimensão, na ordem certa
  Daniel responde o que sabe, marca 🔍 o que não sabe
  Kássia responde o que sabe, marca 🔍 o que não sabe

  Ao final: DISCOVERY.md gerado com todas as dimensões verificadas
            — preenchidas, N/A, ou 🔍 Pendente
            — sem buraco silencioso

Resultado: cada discovery tem a mesma cobertura, independente de quem conduz.
```

**Diferença:** o conhecimento sobre o que perguntar deixa de ser habilidade individual de Kássia e vira artefato que qualquer dev da squad executa com o mesmo resultado.

## O que é um Prompt File

Um **prompt file** (arquivo `.prompt.md`) é um arquivo Markdown com frontmatter que o VS Code Copilot reconhece como instrução estruturada executável no Agent Mode.

```
┌─────────────────────────────────────────────────────────────────────┐
│              PROMPT FILE vs PROMPT NO CHAT                          │
│                                                                      │
│  Prompt no chat            Prompt file                               │
│  ───────────────           ──────────────────────────────────────── │
│  Existe no histórico       Existe no repositório Git                 │
│  Descarta quando fecha     Persiste e evolui com MR                  │
│  Cada sessão recria        Referenciável via #file:                  │
│  Não executa no Agent      Executa como fluxo no Agent Mode          │
│  Sem versionamento         Histórico de mudanças rastreável          │
│  Individual                Compartilhado com toda a squad            │
└─────────────────────────────────────────────────────────────────────┘
```

No Ep. I, você conheceu prompt files como "Pergaminhos" — técnicas de sabre codificadas. No Ep. II, o `discovery.prompt.md` é o primeiro Pergaminho da squad: não uma técnica de combate individual, mas um protocolo de preparação antes de qualquer missão.

## Onde Vive

```
projeto-xpto/
└── .github/
    └── prompts/
        └── discovery/
            └── discovery.prompt.md     ← aqui
```

O diretório `.github/prompts/` é o padrão do VS Code para prompt files. Arquivos nesse diretório são automaticamente reconhecidos pelo Copilot.

Por que dentro do projeto e não na biblioteca da squad (`squad-prompts/`)?

O `discovery.prompt.md` referencia a estrutura do `DISCOVERY.md` **desta demanda** — o arquivo que está na raiz do projeto sendo trabalhado. Para que o Agent Mode encontre o `DISCOVERY.md` automaticamente, o prompt file precisa estar no mesmo workspace.

Na Aula 18, você vai migrar o `discovery.prompt.md` base para a biblioteca da squad (`squad-prompts/`) e referenciar a partir do projeto.

## Anatomia do discovery.prompt.md

```markdown
---
mode: agent
description: Conduz o levantamento técnico completo de uma nova demanda e gera o DISCOVERY.md
---

# Discovery — Levantamento Técnico

Você vai conduzir o discovery desta demanda comigo.

## Instruções

1. Pergunte uma dimensão por vez, na sequência abaixo
2. Para cada dimensão, faça as perguntas específicas listadas
3. Aceite "não sei" como resposta válida — registre como 🔍 pendente
4. Ao final de todas as dimensões, gere o DISCOVERY.md completo

**Não antecipe respostas. Não assuma informações. Pergunte.**

---

## Contexto inicial

Antes de começar, me diga:
- Qual é o nome da demanda?
- Qual é o link para o ticket/issue?
- Quem está participando deste discovery?

---

## Dimensão 1 — Demanda

Pergunte:
- Como você descreveria essa demanda em termos técnicos?
- O que muda no sistema? Qual é o resultado esperado em 2-4 linhas?

---

## Dimensão 2 — APIs Envolvidas

Para cada API mencionada, pergunte:
- Qual é a URL base por ambiente (dev, staging, prod)?
- Qual é o mecanismo de autenticação?
- Qual é o rate limit? Por minuto, por segundo, por IP ou por client?
- Existe algum header obrigatório além do Authorization?
- Tem campo com nome ou tipo não óbvio? (ex: amount em centavos, não reais)
- Você tem um curl que funciona com autenticação real? Valide antes de registrar.

Se não há APIs envolvidas, registre: "N/A — [justificativa]"

---

## Dimensão 3 — Bancos de Dados

Pergunte:
- Qual banco é o principal? Qual é o tipo (PostgreSQL, MongoDB...)?
- Quais tabelas/collections serão lidas ou escritas?
- Existe algum campo com nome ou tipo contraintuitivo?
- O serviço tem permissão de escrita ou apenas leitura?
- Existe índice nas colunas que serão filtradas nas queries?

Se não há banco envolvido, registre: "N/A — [justificativa]"

---

## Dimensão 4 — Cache

Pergunte:
- Este recurso usa cache? Se tiver dúvida: verifique antes de dizer N/A.
- Qual é o tipo (Redis, Memcached) e o TTL por recurso?
- Como o cache é invalidado quando o dado muda?
- Quem publica o evento de invalidação?

Se não há cache, registre: "N/A — verificado com [fonte]"

---

## Dimensão 5 — Gateways

Pergunte:
- Existe um API gateway entre o cliente e o serviço?
- Quais são os headers obrigatórios?
- O gateway valida o payload de alguma forma silenciosa?
- Qual é o rate limit do gateway (pode ser diferente do serviço)?

Se não há gateway, registre: "N/A — chamadas diretas ao serviço"

---

## Dimensão 6 — Filas / Mensageria

Pergunte:
- O sistema usa mensageria? Kafka, RabbitMQ, SQS...?
- Quais tópicos/filas são relevantes?
- Qual é o formato da mensagem?
- Quem produz e quem consome cada tópico?

Se não há mensageria, registre: "N/A — [justificativa]"

---

## Dimensão 7 — Libs Internas

Pergunte:
- Quais libs internas da empresa serão usadas?
- Qual é a versão atual em produção?
- Houve breaking changes nos últimos 3 meses?
- Onde estão os exemplos de uso mais recentes no GitLab?

Se não há libs internas, registre: "N/A"

---

## Dimensão 8 — Ambientes

Pergunte:
- Qual é a URL base em cada ambiente (dev, staging, prod)?
- Como obter credenciais para cada ambiente?
- Existe algum comportamento diferente entre ambientes (feature flags, rate limits)?

---

## Dimensão 9 — Repositórios para Analisar

Pergunte:
- Qual serviço já implementa algo similar ao que será feito?
- Quais repos contêm exemplos de uso das libs internas identificadas?
- Qual repo tem o contrato da API que será consumida?

Liste cada repo com o motivo da análise.

---

## Geração do DISCOVERY.md

Após cobrir todas as dimensões, gere o arquivo DISCOVERY.md completo com:
- Todas as informações coletadas organizadas por seção
- Campos N/A com justificativa onde aplicável
- Todas as lacunas marcadas com 🔍 e quem pode responder
- Salve como `DISCOVERY.md` na raiz do workspace
```

## Como Executar no Agent Mode

```
1. Abra o Copilot Chat
2. Selecione "Agent Mode" (ícone de modos no canto superior do chat)
3. No campo de mensagem, use o seletor de arquivo:
   #file:.github/prompts/discovery/discovery.prompt.md
4. Adicione: "Execute o discovery desta demanda"
5. Envie

O agente carrega o prompt file → começa fazendo as perguntas → você responde.
```

Ou pelo atalho de prompt files do VS Code:

```
1. Cmd/Ctrl + Shift + P → "Copilot: Run Prompt File"
2. Selecione discovery.prompt.md
3. O Agent Mode é iniciado automaticamente
```

## Exemplos: Da Instrução Vaga ao Prompt File

```python
# ❌ Anti-padrão: instruir o agente diretamente no chat, sem estrutura
# Por que parece certo: mais rápido, parece flexível
# O que acontece na prática: cada sessão conduz o discovery de forma diferente
#                             Daniel pergunta sobre APIs, esquece cache
#                             Kássia pergunta sobre libs, esquece gateway

# Sessão de Daniel:
# "Me ajude a fazer o discovery da integração com a API de pagamentos"
# → Copilot faz perguntas genéricas baseadas no que parece relevante
# → Esquece a dimensão de cache porque Daniel não mencionou
# → Discovery cobre 6 de 8 dimensões (sem consistência)

# ⚠️ Parcial: prompt copiado de um bloco de notas para o chat
# Por que é melhor: pelo menos tem perguntas estruturadas
# O que ainda falta: não versionado, cada dev usa uma versão diferente,
#                    não executa no Agent Mode como fluxo, não gera DISCOVERY.md

# ✅ Correto: .github/prompts/discovery/discovery.prompt.md executado no Agent Mode
#
# Benefícios concretos:
# - Git versionado: você sabe qual versão está usando, pode ver o histórico
# - Compartilhado: Daniel e Kássia sempre usam a mesma versão
# - Executa como fluxo: o agente conduz dimensão por dimensão sem você coordenar
# - Gera artefato: DISCOVERY.md criado automaticamente ao final
# - Evolui via MR: quando você melhora uma pergunta, toda a squad se beneficia
```

## Refinando o Prompt File: As Três Regras

Um prompt file de discovery de qualidade segue três regras:

### Regra 1 — Perguntas Específicas

A diferença entre uma pergunta útil e uma inútil no discovery:

| ❌ Vaga | ✅ Específica |
|---|---|
| "Tem cache?" | "Qual é o TTL do recurso X e quem publica o evento de invalidação?" |
| "Quais APIs são usadas?" | "Qual é a URL base em staging e qual o rate limit por minuto?" |
| "Quais libs internas?" | "Qual versão está em prod e houve breaking change nos últimos 3 meses?" |
| "Tem gateway?" | "Quais headers são obrigatórios além do Authorization?" |

Quanto mais específica a pergunta, mais útil a resposta — e menos chance de o dev dizer "acho que sim" sem verificar.

### Regra 2 — "Não sei" é válido

O prompt file deve deixar explícito que "não sei" é uma resposta aceitável. Um discovery que força o dev a inventar respostas para não parecer despreparado é pior que um discovery com pendências honestas.

```markdown
# Instrução obrigatória no início do prompt file:
Aceite "não sei" como resposta válida — registre como 🔍 pendente
com quem pode responder ou onde buscar.

Não force o desenvolvedor a inventar respostas.
```

### Regra 3 — Gera o Artefato

O discovery só terminou quando o `DISCOVERY.md` está no repositório. O prompt file deve instruir o agente a **criar o arquivo**, não apenas a fazer um resumo no chat.

```markdown
# Instrução final obrigatória:
Após cobrir todas as dimensões, gere o arquivo DISCOVERY.md completo
e salve como `DISCOVERY.md` na raiz do workspace.
```

## Entregável da Aula

Copie o `discovery.prompt.md` completo da seção "Anatomia" para o seu repositório em `.github/prompts/discovery/discovery.prompt.md`.

Adapte as perguntas para o contexto da sua empresa:
- Se usa mensageria diferente de Kafka → ajuste a dimensão de Filas
- Se tem gateway proprietário com regras específicas → adicione as perguntas específicas
- Se tem libs internas com muitas versões → expanda a dimensão de Libs

## Exercício Prático

**Missão:** Criar e executar o `discovery.prompt.md` num projeto real.

1. Crie o arquivo `.github/prompts/discovery/discovery.prompt.md` no seu repositório com o conteúdo desta aula.

2. Abra o Agent Mode no Copilot Chat.

3. Execute o prompt file referenciando-o via `#file:` ou via "Run Prompt File".

4. Conduza um discovery completo de uma demanda real ou hipotética — respondendo uma dimensão por vez.

5. Verifique o `DISCOVERY.md` gerado:

| Critério | Verificação |
|---|---|
| Todas as dimensões presentes | Sim / Não |
| Nenhuma dimensão em branco | Sim / Não |
| Pendências marcadas com 🔍 | Sim / Não |
| Curls validados (onde aplicável) | Sim / Não |
| Arquivo salvo na raiz do projeto | Sim / Não |

**Critério de sucesso:** o `DISCOVERY.md` foi gerado pelo agente ao final da sessão — não você escrevendo manualmente. O agente conduziu, você respondeu, o artefato existe no repositório.

## Troubleshooting

### 💡 Problema: Agent Mode não executa o prompt file

**Sintoma:**
Você referencia `#file:.github/prompts/discovery/discovery.prompt.md` mas o agente trata como texto normal, não executa o fluxo.

**Causa:**
Pode ser modo errado (não está no Agent Mode) ou o arquivo não tem o frontmatter correto.

**Solução:**
Verifique:

1. O Copilot Chat está em "Agent" (não "Chat" ou "Edit"):
   ```
   Canto superior do painel de chat → seletor de modo → "Agent"
   ```

2. O arquivo tem frontmatter obrigatório:
   ```markdown
   ---
   mode: agent
   description: [descrição do prompt]
   ---
   ```

3. O arquivo está em `.github/prompts/` (com ponto na frente de `.github`).

### 💡 Problema: O agente faz perguntas muito genéricas — não segue as dimensões

**Sintoma:**
O agente carregou o prompt file mas está fazendo perguntas abertas em vez das perguntas específicas das dimensões.

**Causa:**
As perguntas do prompt file não são específicas o suficiente — o agente tem latitude para interpretar.

**Solução:**
Adicione exemplos de respostas esperadas em cada dimensão:

```markdown
## Dimensão 4 — Cache

Pergunte:
- Este recurso usa cache? (Se tiver dúvida: verifique o código ou pergunte
  ao time de infra antes de dizer N/A)
- Qual é o tipo e o TTL por recurso?

**Exemplo de resposta esperada:**
"Redis, TTL de 300s para /saldo, invalidado via evento 'saldo_atualizado'
publicado pelo payments-service no tópico cache-invalidation"
```

O exemplo não é para você copiar — é para calibrar o nível de detalhe esperado da resposta.

:::tip 🏆 Treinamento Jedi Completo
Você está pronto para a próxima aula se:

- [ ] O arquivo `.github/prompts/discovery/discovery.prompt.md` existe no repositório com o frontmatter correto (`mode: agent`)
- [ ] Executei o prompt file no Agent Mode e o agente conduziu o discovery dimensão por dimensão — sem eu precisar coordenar
- [ ] O `DISCOVERY.md` foi gerado automaticamente pelo agente ao final da sessão
- [ ] Adaptei pelo menos uma pergunta do prompt file para o contexto específico da minha empresa
:::

---

Você tem o Caderno de Campo (Aula 5), as dimensões (Aula 6) e o prompt que conduz o levantamento (Aula 7). Na **Aula 8 — O Agente Conduz, a Squad Responde**, você vai executar o fluxo completo em tempo real — e aprender o que fazer quando não sabe a resposta, porque é exatamente nesses momentos que o discovery revela mais valor.



