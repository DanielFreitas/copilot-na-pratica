---
title: 22 - Revisão Cruzada Assíncrona
sidebar_position: 22
description: Como usar o Copilot para pré-revisar MRs com contexto completo do spike e do discovery — e como o revisor humano usa esse resultado como ponto de partida.
---

> *"Uma boa revisão não é sobre encontrar erros. É sobre confirmar que o código chegou onde o spike prometia que chegaria."*

**Duração estimada:** ~35 min

## Vídeo introdutório

<video controls width="100%" preload="metadata">
	<source src="/copilot-na-pratica/videos/22-revisao-cruzada-assincrona.mp4" type="video/mp4" />
	Seu navegador não suporta vídeo HTML5.
</video>

## O Problema Real: Revisão Sem Contexto

Revisar um MR de 300+ linhas sem o contexto do spike é trabalho ineficiente:

```
Sem contexto do spike, o revisor verifica:
  ✅ Estilo de código (consegue verificar)
  ✅ Bugs óbvios (consegue verificar)
  ❌ Se a implementação reflete as decisões do spike (não tem como sem o spike)
  ❌ Se todos os casos de borda do DISCOVERY.md foram cobertos (sem o DISCOVERY.md)
  ❌ Se o retry implementado corresponde ao DT-01 do spike (sem as decisões técnicas)
```

Com contexto:

```
Com spike + DISCOVERY.md carregados, o revisor (humano ou Copilot) verifica:
  ✅ DT-01: Backoff exponencial com 24h mínimo → implementado? ✅/❌
  ✅ API: X-Idempotency-Key por tentativa, não por cobrança → implementado? ✅/❌
  ✅ amount em centavos → implementado? ✅/❌
  ✅ Invalidação do cache de assinatura após mudança de status → implementado? ✅/❌
  ✅ Testes cobrem os 4 cenários das tarefas de backlog? ✅/❌
```

A segunda lista é mais valiosa e mais rápida de produzir — porque parte do contexto correto.

## O prompt file de Revisão de MR

Salve como `revisao/revisao-mr.prompt.md` na biblioteca `squad-prompts/`:

```markdown
# Revisão de MR com Contexto

**Problema que resolve:** revisar MRs com contexto completo do spike e discovery,
verificando consistência entre o que foi decidido e o que foi implementado.
**Quando usar:** quando você é o revisor de um MR e quer uma pré-revisão focada
antes de ler o diff manualmente.
**Pré-requisitos:**
  - Diff do MR disponível (via `#file:` ou colado no chat)
  - Spike do projeto disponível (no Confluence ou `#file:`)
  - `DISCOVERY.md` disponível (`#file:DISCOVERY.md`)
**Resultado esperado:** lista estruturada com ✅ o que está correto, ⚠️ o que pode
melhorar e ❌ o que precisa mudar antes do merge.

---

Você vai revisar o MR abaixo com base no contexto do projeto.

## Critérios de Revisão

### 1. Consistência com o Spike
Para cada decisão técnica do spike (DT-01, DT-02...):
- A implementação segue a decisão?
- Se divergiu: a divergência é justificada?

### 2. Cobertura do DISCOVERY.md
- Os casos de borda identificados no discovery foram tratados?
  - Rate limits respeitados?
  - Cabeçalhos obrigatórios presentes?
  - Campos não óbvios usados corretamente (ex: amount em centavos)?
  - Estratégia de cache clara?

### 3. Consistência com o DNA da Squad
- Padrões técnicos seguidos (lib de retry, HTTP client, estrutura)?
- Type hints presentes em funções públicas?
- Naming de testes seguindo `test_{método}_{cenário}_{resultado}`?

### 4. Cobertura de Testes
- As tarefas de backlog do spike que exigiam testes foram atendidas?
- Casos de borda do DISCOVERY.md têm teste?

### 5. Segurança Básica
- Credenciais hardcoded?
- Logs que expõem dados sensíveis?
- Inputs externos sem validação?

## Formato de Saída

Organize a revisão em 3 seções:

**✅ Correto — não toca**
[o que está implementado corretamente conforme o contexto]

**⚠️ Pode melhorar — sugestão, não bloqueio**
[o que funciona mas tem alternativa melhor, sem precisar travar o merge]

**❌ Precisa mudar antes do merge**
[o que está errado ou inconsistente com o spike/DISCOVERY.md/DNA]

Para cada item ❌: cite o trecho de código + cite a referência (ex: "decisão DT-01 do spike").
```

## Demo: Pré-revisão em Ação

MR com 4 arquivos alterados (`payment_processor.py`, `recurring_billing_job.py`, `test_billing.py`, `models/payment_attempt.py`).

**Instrução:**
```
#file:DISCOVERY.md
#file:.github/copilot-instructions.md (projeto)
[diff do MR colado aqui ou via #file:]

Execute a revisão de MR usando o revisao-mr.prompt.md.
O spike relevante está em: {URL do Confluence}.
```

**Resultado da pré-revisão:**

```
✅ Correto — não toca
- X-Idempotency-Key gerado com uuid4() por tentativa (não por cobrança) ✅
  → conforme DT-02 do spike
- amount enviado como integer em centavos ✅
  → conforme DISCOVERY.md (campo não óbvio)
- empresa-auth v3.2.1 com refresh=True ✅
  → conforme decisão técnica do spike
- stamina usado para retry ✅
  → conforme DNA da squad

⚠️ Pode melhorar
- payment_processor.py tem 180 linhas — considere extrair `_authenticate()`
  pra método privado para facilitar teste unitário
- Logging no job não inclui subscription_id no contexto estruturado
  → quando o job falhar em prod vai ser difícil rastrear qual assinatura

❌ Precisa mudar antes do merge
- Cache invalidation ausente: ao atualizar subscription.status para "cobrancas_falhas",
  o cache Redis (TTL 600s) não está sendo invalidado.
  → DISCOVERY.md seção Cache: "Sempre invalidar o cache ao atualizar o status"
  → Risco: o sistema vai servir status desatualizado por até 10 minutos após a mudança

- test_billing.py não cobre o cenário "retry esgotado + status → cobranças_falhas"
  → Tarefa de backlog do spike: "testes cobrem success, failure e retry esgotado"
  → Critério de aceite não atendido
```

Em 5 minutos, o revisor humano sabe exatamente onde focar. Os dois itens com ❌ são específicos, citam o contexto de onde a exigência veio, e são acionáveis para quem vai corrigir.

## Como o Revisor Humano Usa o Resultado

A pré-revisão não substitui a revisão humana — ela calibra o foco:

```
Pré-revisão: identifica inconsistências com o contexto (spike, DISCOVERY.md, DNA)
Revisão humana: avalia clareza, decisões de design, legibilidade, arquitetura
```

**Workflow recomendado:**
1. Receba o MR
2. Carregue contexto e execute a pré-revisão (5 min)
3. Leia os ❌ — valide se concorda (1-2 min cada)
4. Leia o diff focando no que a pré-revisão não cobre: clareza do código, design, nomes (10-20 min)
5. Compile a revisão final humana incorporando o que o Copilot identificou

**Tempo total:** 20-30 min vs 1-2h sem contexto.

## Anti-padrões vs Padrão Correto

❌ **Aprovação automática da pré-revisão:**
```
"O Copilot não encontrou problemas, então mergeia."
→ O Copilot só verificou o que estava no contexto carregado
→ Clareza, legibilidade, decisões arquiteturais não foram avaliadas
→ A revisão humana é insubstituível para esses aspectos
```

⚠️ **Revisão humana sem pré-revisão:**
```
Funciona, mas é mais lenta e pode perder inconsistências com o spike
que o revisor humano não memorizou
```

✅ **Pré-revisão como calibrador + revisão humana focada:**
```
Pré-revisão: 5 min → identifica inconsistências com contexto documentado
Revisão humana: 20 min → foca em design, clareza, o que o Copilot não viu
Total: 25 min com maior cobertura
```

## Exercício Prático

**Missão:** Fazer a primeira pré-revisão de MR usando o prompt file.

1. Escolha um MR real — pode ser um existente ou o da última implementação.
2. Carregue o contexto:
   - `DISCOVERY.md` via `#file:`
   - `copilot-instructions.md` do projeto via `#file:`
   - Diff do MR (via `#file:` de um arquivo de patch, ou cole o diff no chat)
3. Execute o `revisao-mr.prompt.md` da biblioteca.
4. Para cada item ❌ identificado: valide se concorda — o item é real ou é um falso positivo?
5. Compare com uma revisão que você faria sem o contexto:

| Aspecto | Com pré-revisão | Sem pré-revisão |
|---|---|---|
| Tempo de revisão | | |
| Inconsistências com spike identificadas | | |
| Casos de borda do DISCOVERY.md verificados | | |
| DNA da squad verificado | | |

**Critério de sucesso:** pré-revisão executada + resultado estruturado com ✅ ⚠️ ❌ + pelo menos 1 item relevante identificado que você poderia ter perdido sem o contexto.

## Troubleshooting

### 💡 Problema: A pré-revisão retorna muitos ⚠️ e ❌ quando o código está correto (falsos positivos)

**Causa:** o contexto carregado pode estar desatualizado ou desincronizado com a implementação.

**Resolução:**
1. Verifique se o DISCOVERY.md tem as pendências 🔍 mais recentes resolvidas
2. Verifique se o `copilot-instructions.md` está sincronizado (protocolo da Aula 21)
3. Para cada item suspeito: valide você mesmo antes de passar para o dev. Se for falso positivo, ignore.

### 💡 Problema: A pré-revisão não encontrou o bug que estava no código

**Causa:** os bugs não identificados geralmente estão fora do contexto carregado — são bugs de lógica ou de design que exigem raciocínio sobre o comportamento esperado.

**Solução:** a pré-revisão complementa, não substitui. Bugs de lógica e design são responsabilidade da revisão humana. A pré-revisão cuida das inconsistências com o contexto documentado.

:::tip 🏆 Treinamento Jedi Completo
Você está pronto para a próxima aula se:

- [ ] O `revisao-mr.prompt.md` está na biblioteca em `squad-prompts/revisao/`
- [ ] Executei a pré-revisão em pelo menos 1 MR real e o resultado tinha ✅ ⚠️ ❌ com referências ao contexto
- [ ] Sei qual é o papel da pré-revisão e o que deixo para a revisão humana
- [ ] A revisão com pré-revisão foi mais rápida que minha revisão típica sem contexto
:::

---

O Capítulo 5 está completo. O DNA da squad está criado, sincronizado e protegido por processo de MR. A revisão cruzada usa contexto real e é mais rápida. Agora toda essa infraestrutura — discovery, Droids, spike, biblioteca, DNA — precisa ser **orquestrada** no início de cada projeto. Na **Aula 23 — O Prompt File de Kickoff**, você vai construir o `kickoff.prompt.md`: o ritual que garante que toda nova demanda começa com os 6 artefatos certos produzidos na sequência certa.




