---
title: 14 - Do Discovery ao Spike
sidebar_position: 14
description: Como construir o spike.prompt.md que transforma o DISCOVERY.md em spike estruturado — e por que spike genérico é sempre sinal de discovery incompleto.
---

> *"O spike é o espelho do discovery. Se o DISCOVERY.md está vago, o spike vai ser vago. Não tem prompt que resolva um discovery ruim."*

**Duração estimada:** ~35 min

## Vídeo introdutório

<video controls width="100%" preload="metadata">
	<source src="/copilot-na-pratica/videos/14-do-discovery-ao-spike.mp4" type="video/mp4" />
	Seu navegador não suporta vídeo HTML5.
</video>

## O Problema Real: O Elo Frágil Entre Discovery e Spike

O `DISCOVERY.md` e o `spike-template.md` existem. Mas a passagem de um para o outro é onde a qualidade se perde. Sem um processo definido, acontece uma de três coisas:

**Cenário A — Spike escrito do zero, ignorando o discovery:**
```
Daniel escreve o spike de memória, sem consultar o DISCOVERY.md.
O spike tem o que Daniel sabe — não o que foi levantado.
As pendências do discovery ficam escondidas dentro de afirmações no spike.
```

**Cenário B — Spike gerado com discovery incompleto:**
```
Daniel pede ao Copilot para gerar o spike.
O Copilot gera com base no que tem — que é vago.
Resultado: spike genérico que não serve.
Daniel acha que o problema é o prompt e continua tentando.
```

**Cenário C — Processo correto:**
```
Discovery completo → pendências resolvidas → spike.prompt.md executado → spike específico.
Spike gerado é específico porque o DISCOVERY.md é específico.
```

A diferença entre B e C não é o prompt — é a qualidade do input.

## A Regra de Ouro: Spike Genérico = Discovery Incompleto

Internalize esta regra antes de construir o `spike.prompt.md`:

```
┌─────────────────────────────────────────────────────────────────────┐
│                     DIAGNÓSTICO DE QUALIDADE                        │
│                                                                      │
│  Spike ficou genérico?                                               │
│  └── NÃO volte pro prompt de spike                                  │
│      VOLTE pro DISCOVERY.md                                         │
│                                                                      │
│  Perguntas de diagnóstico:                                           │
│  ├── A seção de APIs tem URL real, autenticação real, curl?         │
│  │   (se não: discovery incompleto)                                  │
│  ├── A seção de banco tem schema, permissões, migrations existentes?│
│  │   (se não: discovery incompleto)                                  │
│  ├── As pendências 🔍 foram resolvidas antes de gerar o spike?      │
│  │   (se não: resolva as críticas primeiro)                         │
│  └── A seção "Repositórios para Analisar" foi analisada?            │
│      (se não: rode o Droid GitLab antes de gerar o spike)           │
└─────────────────────────────────────────────────────────────────────┘
```

## Construindo o spike.prompt.md

O prompt file fica em `.github/prompts/spikes/spike.prompt.md`.

```markdown
---
mode: agent
---

# Spike — Geração a partir do Discovery

Você vai gerar um spike técnico completo baseado no DISCOVERY.md deste projeto.

**Antes de começar, verifique:**
- O DISCOVERY.md tem URLs reais nas APIs (não "a confirmar")
- A seção "Repositórios para Analisar" foi analisada (via Droid GitLab ou manualmente)
- As pendências críticas 🔍 estão resolvidas ou têm responsável definido

Se qualquer um desses pontos estiver incompleto, informe antes de gerar o spike.

---

## Estrutura do Spike

Gere o spike usando exatamente o spike-template.md disponível em docs/spike-template.md.
Siga a sequência: Cabeçalho → Contexto → As-Is → To-Be → Análise Técnica → Decisões → Tarefas.

---

## Diretrizes para Cada Seção

### Contexto
- Descreva o **problema de negócio**, não a solução
- Use o campo "Demanda" do DISCOVERY.md como ponto de partida
- 2-3 parágrafos máximo

### As-Is
- Documente o **processo atual real**, não idealizado
- Se o processo é manual hoje, documente exatamente os passos manuais
- Liste a infraestrutura relevante com especificidade: versões, URLs, nomes de tabelas

### To-Be
- Detalhe o processo proposto **passo a passo**
- Inclua SQL de migrations se houver mudança de banco
- Liste os arquivos novos que serão criados com seus caminhos

### Análise Técnica
- Para cada API: endpoint, método, autenticação, campos não óbvios, rate limit
- Para cada lib interna: versão, como usar, onde buscar exemplos
- Construa a tabela de riscos considerando especificamente:
  - Cache: pode ficar stale? qual a estratégia de invalidação?
  - Rate limit: o volume da operação respeita os limites?
  - Falha de dependência: o que acontece se a API estiver indisponível?

### Decisões Técnicas
- Cada decisão deve ter: o que foi decidido, o que foi descartado, por que
- Inclua obrigatoriamente as decisões sobre:
  - Estratégia de retry (se aplicável)
  - Tratamento de erros e idempotência
  - Mudanças de schema (se aplicável)
- Mínimo 2 decisões técnicas, máximo 5

### Tarefas de Backlog
- Entre 5 e 10 tarefas
- Cada tarefa com: título acionável + critério de aceite específico
- Formato: `- [TASK] {título}\n  - Critério de aceite: {critério}`
- A primeira tarefa deve ser a de infraestrutura/banco (se houver migration)
- A última deve ser sobre observabilidade ou testes de integração

---

## Verificação Final

Antes de entregar o spike, verifique:
- [ ] Nenhuma seção está com placeholder não preenchido
- [ ] As-Is documenta situação real, não "não existe nada"
- [ ] Cada decisão técnica tem justificativa (não só o que foi decidido)
- [ ] Tarefas têm critério de aceite (não só título)
- [ ] O spike é específico o suficiente para começar o desenvolvimento sem reunião
```

## Como Executar o spike.prompt.md

No Agent Mode com `#file:DISCOVERY.md` carregado:

```
#file:DISCOVERY.md
#file:docs/spike-template.md

Execute o spike.prompt.md para esta demanda.
```

Ou de forma explícita:

```
#file:DISCOVERY.md
#file:.github/prompts/spikes/spike.prompt.md
#file:docs/spike-template.md

Gere o spike seguindo as instruções do prompt file.
```

## Demo: A Diferença que o Discovery Completo Faz

**Discovery incompleto → spike genérico:**
```markdown
# APIs Envolvidas
- API de pagamentos interna (URL a confirmar)
- Autenticação: OAuth2 (detalhes a verificar)

# Análise Técnica
A API de pagamentos interna será usada para processar cobranças.
Será necessário implementar retry para tratar falhas.
```

**Spike gerado com esse discovery:**
```markdown
## Análise Técnica
### APIs Envolvidas
A implementação usará a API de pagamentos interna com autenticação OAuth2.
Será necessário verificar os detalhes antes de implementar.

[→ Esse spike não ajuda o dev. Ele já sabe que vai usar a API.]
```

**Discovery completo → spike específico:**
```markdown
# APIs Envolvidas
### API de Pagamentos v2
- URL: https://api.empresa.com/v2 (prod), https://staging-api.empresa.com/v2 (staging)
- Autenticação: OAuth2 Client Credentials
  - Token: POST https://auth.empresa.com/oauth/token
  - Variáveis: PAYMENTS_CLIENT_ID, PAYMENTS_CLIENT_SECRET, scope: payments:write
- Rate limit: 200 req/min (confirmado @plataforma-api)
- Header obrigatório: X-Idempotency-Key: {uuid}
- Campo amount: integer em centavos (não float em reais)
```

**Spike gerado com esse discovery:**
```markdown
## Análise Técnica
### APIs Envolvidas
**POST /pagamentos** (API de pagamentos v2):
- Auth: OAuth2 token via `empresa-auth v3.2.1` (`refresh=True` obrigatório)
- Header obrigatório: `X-Idempotency-Key: {uuid}` em cada request
- `amount` é integer em centavos — converter antes de enviar
- Rate limit 200 req/min não apresenta risco (volume estimado: ~50 cobranças/dia)

[→ Esse spike permite o dev começar sem precisar ler mais documentação]
```

A diferença não é o prompt. É o input.

## O Checklist de Pré-execução

Antes de executar o `spike.prompt.md`, passe por este checklist:

| Item | Verificar |
|---|---|
| APIs com URL real (não "a confirmar") | |
| Autenticação documentada com especificidade | |
| Rate limit verificado (mesmo que seja N/A) | |
| Banco: schema relevante identificado | |
| Cache: estratégia de invalidação documentada | |
| Repositórios analisados (Droid GitLab ou manual) | |
| Pendências críticas 🔍 resolvidas | |

Se qualquer item estiver incompleto, resolva antes de gerar o spike.

## Exercício Prático

**Missão:** Gerar um spike a partir de um `DISCOVERY.md` completo.

1. Use o `DISCOVERY.md` da Aula 8 (ou complete um DISCOVERY.md de uma demanda real).
2. Passe pelo checklist de pré-execução. Se houver pendências críticas, resolva-as primeiro.
3. Execute o `spike.prompt.md` no Agent Mode com o `DISCOVERY.md` e o `spike-template.md` carregados.
4. Avalie o spike gerado:

| Critério | Presente? |
|---|---|
| As-Is documenta processo atual (não "não existe") | |
| To-Be tem passo a passo específico | |
| Análise Técnica menciona detalhes do DISCOVERY.md (URLs reais, versões) | |
| Pelo menos 2 decisões técnicas com justificativa | |
| Tarefas com critério de aceite | |

5. Se algum critério não foi atendido, identifique qual seção do `DISCOVERY.md` estava incompleta.

**Critério de sucesso:** spike gerado que um dev poderia usar para começar o desenvolvimento sem reunião adicional.

## Troubleshooting

### 💡 Problema: O spike está bem estruturado mas as decisões técnicas ficaram superficiais

**Causa:** o DISCOVERY.md tem os dados técnicos mas não tem as alternativas consideradas durante o discovery.

**Solução:** adicione uma seção ao `DISCOVERY.md` durante o discovery:
```markdown
## Alternativas Consideradas
- Retry com intervalo fixo de 1h (descartado — acordo comercial exige 24h entre tentativas)
- Usar fila SQS em vez de scheduler direto (descartado — a empresa não usa SQS ainda)
```

Com isso registrado, o `spike.prompt.md` vai gerar decisões técnicas com justificativas reais.

### 💡 Problema: O spike ficou certo mas as tarefas de backlog estão muito vagas

**Causa:** a seção To-Be do DISCOVERY.md não detalhou os componentes que serão criados.

**Solução:** antes de executar o spike.prompt.md, adicione ao DISCOVERY.md:
```markdown
## Componentes a Criar (estimativa)
- Job de cobrança recorrente
- Serviço cliente da API de pagamentos
- Migration para tabela de tentativas
- Atualização do status de assinatura após falha
```

O spike.prompt.md vai usar isso para gerar tarefas mais específicas.

:::tip 🏆 Treinamento Jedi Completo
Você está pronto para a próxima aula se:

- [ ] O `spike.prompt.md` está em `.github/prompts/spikes/spike.prompt.md`
- [ ] Executei o prompt com um `DISCOVERY.md` completo e o spike gerado é específico (menciona URLs, versões, nomes reais)
- [ ] Quando o spike ficou genérico, identifiquei que o problema era no `DISCOVERY.md`, não no prompt
- [ ] Sei as 5 perguntas de diagnóstico para identificar onde o discovery estava incompleto
:::

---

Você tem o spike gerado e publicado no Confluence. Mas para o Copilot usar esse contexto durante o desenvolvimento, precisa de uma ponte: um arquivo que diga "para este projeto, &lt;o que importa saber&gt; está aqui". Na **Aula 15 — O copilot-instructions.md como Ponte**, você vai criar o arquivo que conecta o desenvolvimento ao spike publicado — e vai definir a fronteira entre o que fica nesse arquivo e o que fica no Confluence.

