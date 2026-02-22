---
title: 16 - Contexto Sob Demanda
sidebar_position: 16
description: Como usar o Droid Confluence como memória estendida da sessão — instruindo o agente a buscar contexto adicional exatamente quando precisar.
---

> *"Um Jedi não carrega todos os holocrons. Sabe onde cada um está e vai buscar quando precisa."*

**Duração estimada:** ~30 min

## Vídeo introdutório

<video controls width="100%" preload="metadata">
	<source src="/copilot-na-pratica/videos/16-contexto-sob-demanda.mp4" type="video/mp4" />
	Seu navegador não suporta vídeo HTML5.
</video>

## O Problema Real: O Limite do copilot-instructions.md

O `copilot-instructions.md` tem um limite prático: quando ele passa de ~50 linhas, o Copilot começa a perder sinal sobre qual parte do contexto é crítica. Não é um limite técnico documentado — é comportamental, observado em prática.

O dilema surgiu assim:

```
Daniel: quero que o Copilot saiba:
  1. Decisões técnicas chave ← 15 linhas ✅
  2. Padrões desta integração ← 10 linhas ✅
  3. Contrato completo da API de pagamentos ← 80 linhas 🚨
  4. Schema completo do banco ← 60 linhas 🚨
  5. Exemplos de uso do empresa-scheduler ← 40 linhas 🚨

Total: 205 linhas — ACIMA do limite prático
```

A solução não é escolher qual contexto colocar e qual omitir. É separar dois tipos de contexto:

- **Contexto sempre necessário** → `copilot-instructions.md` (sempre carregado)
- **Contexto necessário em situações específicas** → Confluence, buscado via Droid quando necessário

## A Instrução de Contexto Sob Demanda

No `copilot-instructions.md`, a seção "quando buscar mais contexto" faz o trabalho pesado:

```markdown
## Quando Buscar Mais Contexto

Quando precisar de detalhes além do que está neste arquivo, use o Droid Confluence:

| Se precisar de... | Busque... |
|---|---|
| Contrato completo da API de pagamentos (request/response) | Spike no Confluence: {URL} → seção "APIs Envolvidas" |
| Exemplos de uso do empresa-scheduler | Busque "empresa-scheduler exemplos" no Confluence |
| Schema completo de todas as tabelas | Página "Database Schema — subscription-service" no Confluence |
| Decisões arquiteturais anteriores (por que não usamos SQS) | Spike → seção "Decisões Técnicas" |
| Padrões de código da squad | `.github/copilot-instructions.md` da squad (não deste projeto) |
```

Quando você instrui o agente para fazer algo que exige mais contexto:

```
Implemente a validação do response da API de pagamentos.
```

O agente verifica o `copilot-instructions.md`, vê que o contrato completo está no Confluence, e vai buscar antes de gerar o código:

```
Agente: Vou buscar o contrato da API de pagamentos no Confluence
        antes de implementar a validação.

→ confluence_search("contrato API pagamentos cobrança recorrente")
→ Resultado: spike com seção detalhada de contratos

Agente: Com base no contrato, o response tem os campos:
        - payment_id: UUID
        - status: "success" | "failed" | "pending"
        - processed_at: ISO 8601
        - error_code: presente quando status = "failed"

Implementando a validação...
```

Resultado: código que valida corretamente o campo `error_code` só quando `status == "failed"` — detalhe que o agente descobriu no Confluence, não teve que adivinhar.

## O Padrão de Instrução para Busca Condicional

A instrução de busca condicional tem três partes:

```markdown
## Quando Buscar Mais Contexto

# Parte 1: QUANDO buscar (trigger)
"Quando precisar de {tipo de contexto}..."

# Parte 2: ONDE buscar (source)
"...use o Droid Confluence e busque {o quê específico}"

# Parte 3: O QUE esperar encontrar (expectation)
"O resultado terá {o que você vai encontrar lá}"
```

Exemplos bem escritos:

```markdown
# ✅ Trigger específico + source específico + expectation
Quando precisar do request body completo do POST /pagamentos:
use o Droid Confluence e busque a página "[SPIKE] Cobrança Recorrente".
Na seção "APIs Envolvidas > API de Pagamentos" você encontra o schema completo.

# ✅ Trigger por tipo + source por busca
Quando precisar de exemplos de uso de qualquer lib interna da empresa:
busque "{nome-da-lib} exemplos" no Confluence.
Os resultados geralmente têm a seção "Casos de Uso" com código real.

# ❌ Trigger vago + source vago
Quando precisar de mais contexto, busque no Confluence.
→ O agente não sabe o que buscar nem quando é relevante
```

## O Limite do copilot-instructions.md na Prática

Como identificar que o arquivo está grande demais:

```
Sintoma 1: O Copilot começa a "esquecer" instruções que estão no arquivo
           → Ex: você especificou no topo do arquivo que amount é em centavos,
             mas o Copilot gera código com float duas sessões depois

Sintoma 2: O Copilot segue as instruções do início do arquivo mas ignora o final
           → As primeiras seções são aplicadas, as últimas são ignoradas

Sintoma 3: Você mesmo precisa rolar o arquivo para lembrar o que colocou lá
           → Se você não consegue lembrar o conteúdo, o Copilot também não vai priorizar
```

Quando qualquer sintoma aparecer: remova contexto que não é necessário a todo momento e substitua por instrução de busca sob demanda.

## Anti-padrões vs Padrão Correto

❌ **copilot-instructions.md com 200 linhas:**
```markdown
# Contexto do Projeto
[80 linhas de contrato de API]
[60 linhas de schema do banco]
[40 linhas de exemplos de uso da lib]
[20 linhas de decisões técnicas]
→ Copilot perde sinal. As partes mais importantes ficam enterradas.
```

⚠️ **copilot-instructions.md enxuto mas sem instrução de busca:**
```markdown
# Contexto do Projeto
[20 linhas de decisões técnicas]
→ Copilot não sabe o contrato da API.
  Dev vai precisar explicar na hora ou o Copilot vai adivinhar errado.
```

✅ **copilot-instructions.md como ponte com contexto sob demanda:**
```markdown
# Contexto do Projeto
[20 linhas de decisões técnicas]

## Quando Buscar Mais Contexto
[tabela com triggers e sources específicos]
→ Copilot aplica as decisões sempre + busca contexto adicional quando necessário.
  O arquivo tem < 50 linhas e funciona como ponto de entrada para tudo.
```

## Exercício Prático

**Missão:** Otimizar o `copilot-instructions.md` do projeto com contexto sob demanda.

1. Abra o `copilot-instructions.md` criado na Aula 15.
2. Para cada seção que tem mais de 5 linhas, pergunte: "o dev precisa disso em todo commit ou só às vezes?"
   - Precisa sempre → mantém
   - Precisa às vezes → remove do arquivo e adiciona como instrução de busca
3. Adicione a seção "quando buscar mais contexto" com pelo menos 3 linhas de busca sob demanda.
4. Verifique o tamanho final — deve ter menos de 50 linhas.
5. Teste as duas situações:

| Situação | Comportamento esperado |
|---|---|
| `Implemente o PaymentProcessor` | Usa decisões do arquivo (OAuth2, amount em centavos) sem buscar |
| `Valide o response da API de pagamentos` | Busca o contrato no Confluence antes de gerar o código |

**Critério de sucesso:** arquivo com < 50 linhas + Copilot busca contexto adicional automaticamente quando necessário.

## Troubleshooting

### 💡 Problema: O agente não está buscando o contexto sob demanda espontaneamente

**Causa:** a instrução de busca pode estar vaga ou o agente não identificou a necessidade.

**Solução:**
1. Seja mais específico no trigger: "quando precisar do schema de request do POST /pagamentos" é melhor que "quando precisar de detalhes da API"
2. Para a primeira vez com um tipo de contexto novo, seja explícito:
   ```
   "Antes de implementar a validação do response, busque o contrato
   da API no Confluence conforme as instruções do nosso context file."
   ```
   Após o agente fazer uma vez, ele associa o padrão.

### 💡 Problema: O Droid Confluence retorna contexto genérico (página errada)

**Causa:** a instrução de busca no `copilot-instructions.md` não especifica suficientemente o documento.

**Solução:** use URL direta quando possível:
```markdown
| Contrato da API de pagamentos | Busque na página: {URL-direta-do-spike} |
```

URL direta elimina ambiguidade de busca. O Droid vai direto Ã  página certa.

:::tip 🏆 Treinamento Jedi Completo
Você está pronto para a próxima aula se:

- [ ] O `copilot-instructions.md` do projeto tem menos de 50 linhas
- [ ] A seção "quando buscar mais contexto" tem pelo menos 3 instruções de busca sob demanda
- [ ] O agente buscou contexto do Confluence automaticamente quando a sessão exigiu
- [ ] Sei identificar os 3 sintomas de que o `copilot-instructions.md` está grande demais
:::

---

O Capítulo 3 está completo. Você tem o `spike-template.md`, o `spike.prompt.md` e o `copilot-instructions.md` funcionando como uma cadeia: discovery → spike → contexto acessível para o desenvolvimento. Mas esses artefatos foram criados para esta demanda. E a próxima demanda vai exigir a mesma cadeia — com contexto diferente. O **Capítulo 4 — A Memória da Squad** resolve isso. Na **Aula 17 — O que Vale Salvar**, você vai criar o critério que decide o que entra na biblioteca permanente da squad e o que é descartado depois do projeto.

