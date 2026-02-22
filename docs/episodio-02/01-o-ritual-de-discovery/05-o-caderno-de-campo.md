---
title: 5 - O Caderno de Campo
sidebar_position: 5
description: Como construir o DISCOVERY.md — o artefato central do sistema, que transforma contexto efêmero em memória consultável pelo Copilot.
---

> *"Documentação é o que você escreve para auditores. Caderno de campo é o que você escreve para você mesmo às 23h quando o sistema está quebrando."*

**Duração estimada:** ~35 min

## Vídeo introdutório

<video controls width="100%" preload="metadata">
	<source src="/copilot-na-pratica/videos/05-o-caderno-de-campo.mp4" type="video/mp4" />
	Seu navegador não suporta vídeo HTML5.
</video>

## O Problema Real: A Documentação que Ninguém Consulta

Toda empresa tem documentação. Páginas no Confluence bem formatadas, READMEs cuidadosos, ADRs com datas e contexto. E toda empresa tem o mesmo problema: quando chega uma demanda nova, ninguém sabe exatamente qual documentação é relevante, onde está, e se está atualizada.

**Sem DISCOVERY.md:**

```
Daniel começa integração com API de pagamentos

├── Existe documentação?
│   └── Sim → Confluence, última atualização: 14 meses atrás
│       ├── O rate limit está documentado? Parcialmente.
│       ├── O header X-Client-Version está documentado? Não encontrou.
│       └── O comportamento do campo referencia_externa está correto? Incerto.
│
├── Onde buscar o que falta?
│   └── Perguntar no Slack → esperar → talvez receber resposta
│       ├── Rate limit: Kássia soube de um colega
│       ├── Header: encontrou num commit antigo por acaso
│       └── Campo: descobriu na própria integração (staging, dia 3)
│
└── O contexto ficou onde?
    ├── Cabeça do Daniel
    ├── Uma thread do Slack
    └── Um comentário no código que "vai limpar depois"
```

**Com DISCOVERY.md:**

```
Daniel começa integração com API de pagamentos

└── discovery.prompt.md conduz o levantamento (30-40 min)
    ├── Rate limit: documentado com fonte validada
    ├── Header obrigatório: documentado com curl testado
    ├── Campo referencia_externa: documentado com regra clara
    └── O que AINDA não se sabe: marcado como 🔍 pendente

DISCOVERY.md commitado no repositório do projeto.

Kássia lê o DISCOVERY.md → contexto compartilhado.
Copilot de Kássia lê #file:DISCOVERY.md → mesmo contexto.
Novo integrante no projeto → lê o DISCOVERY.md → não precisa perguntar nada.
```

**Diferença:** o conhecimento técnico da demanda deixa de existir só na cabeça de quem levantou e passa a existir como artefato versionado, consultável por qualquer sessão do Copilot.

## O que o DISCOVERY.md NÃO É

Antes de ver o que é, veja o que não é — porque a tentação de transformá-lo em algo diferente é real:

```
┌────────────────────────────────────────────────────────────────────┐
│                   O QUE NÃO É                                      │
├────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ❌ Não é documentação formal                                       │
│     Documentação formal é escrita para ser lida depois.             │
│     DISCOVERY.md é escrito para ser usado agora.                   │
│                                                                      │
│  ❌ Não é requirements document                                     │
│     Não descreve o que o sistema deve fazer.                        │
│     Descreve o que o ambiente já faz e quais são as restrições.    │
│                                                                      │
│  ❌ Não é design doc                                                │
│     Não propõe a solução.                                           │
│     Mapeia o terreno antes de propor a solução.                    │
│                                                                      │
│  ❌ Não é eterno                                                     │
│     Vive no repositório do projeto.                                 │
│     Quando o projeto termina, ele foi usado. Não precisa           │
│     de manutenção contínua.                                        │
│                                                                      │
└────────────────────────────────────────────────────────────────────┘
```

## O Template Completo

Este é o template que você vai commitar no repositório. Cada seção tem um propósito específico que a Aula 6 vai detalhar. Por agora, conheça a estrutura:

```markdown
# DISCOVERY — [Nome da Demanda]

**Data:** [data do levantamento]
**Demanda:** [link para issue/ticket]
**Squad:** [quem participou do levantamento]

---

## Demanda

[Descrição da demanda em linguagem técnica — não o texto do ticket,
mas o que a squad entendeu que precisa ser feito]

---

## APIs Envolvidas

<!-- Para cada API: URL base, autenticação, rate limit, versão,
     curls validados, campos não óbvios -->

---

## Bancos de Dados

<!-- Tipo, nome, schema relevante (tabelas, colunas),
     permissões de acesso, índices que importam -->

---

## Cache

<!-- Tipo (Redis, Memcached...), TTL por recurso,
     estratégia de invalidação, quem invalida -->

---

## Gateways

<!-- Nome, regras de roteamento, headers obrigatórios,
     rate limit, validações silenciosas -->

---

## Filas / Mensageria

<!-- Broker (Kafka, RabbitMQ, SQS...), tópicos/filas relevantes,
     formato de mensagem, quem produz e quem consome -->

---

## Libs Internas

<!-- Nome, versão atual em produção, breaking changes recentes,
     onde encontrar exemplos de uso no GitLab -->

---

## Ambientes

<!-- URLs por ambiente (dev, staging, prod),
     como obter credenciais, diferenças de comportamento entre ambientes -->

---

## Repositórios para Analisar

<!-- Repos que o Droid GitLab deve consultar durante o levantamento -->
- [ ] [nome-do-repo]: [por que analisar]
- [ ] [nome-do-repo]: [por que analisar]

---

## Decisões Técnicas Iniciais

<!-- O que já foi decidido antes de começar — libs escolhidas,
     abordagens descartadas, restrições da empresa -->

---

## Pendências 🔍

<!-- O que ainda falta descobrir — não bloqueie o desenvolvimento,
     registre o que falta e avance -->
- 🔍 [o que falta]: [quem pode responder / onde buscar]
```

## Cada Seção por Dentro

### Demanda

Não copie o texto do ticket. Reescreva em linguagem técnica do ponto de vista de quem vai implementar.

```markdown
# ❌ Anti-padrão: copiar o texto do ticket
## Demanda
"Como solicitado pelo cliente, implementar funcionalidade de pagamento
recorrente conforme especificação do setor comercial."

# ✅ Correto: descrição técnica da squad
## Demanda
Adicionar suporte a cobranças recorrentes no módulo de pagamentos.
A cobrança será agendada no momento da assinatura e executada via job
diário às 2h, usando a API de pagamentos v2 (cobrança automática).
Clientes com falha de pagamento recebem 3 tentativas com intervalo de 24h.
```

### Repositórios para Analisar

Esta seção é o insumo direto para o Droid GitLab (Aula 9). Liste os repos que o agente precisa consultar durante o levantamento — e por que cada um.

```markdown
## Repositórios para Analisar
- [ ] pagamentos-service: entender como cobranças avulsas são processadas hoje
- [ ] scheduler-service: entender como jobs recorrentes são agendados
- [ ] libs/empresa-payments: ver versão atual e exemplos de autenticação
```

### Pendências 🔍

Pendências não são fraqueza — são honestidade. Um discovery com zero pendências é quase sempre um falso positivo: você simplesmente não perguntou o suficiente.

```markdown
# ❌ Anti-padrão: deixar a seção de pendências vazia para parecer que o
#                 discovery está "completo"
## Pendências 🔍
(nenhuma)

# ✅ Correto: registrar o que ainda falta, com quem pode responder
## Pendências 🔍
- 🔍 Rate limit da API em ambiente de staging: perguntar @plataforma-api
- 🔍 Política de retry em caso de serviço de e-mail fora: verificar runbook
- 🔍 Versão do empresa-payments em produção: verificar com o time de libs
```

## DISCOVERY.md vs Documentação Formal

| | DISCOVERY.md | Confluence / Notion |
|---|---|---|
| **Escrito por** | Squad que vai implementar | Equipe de docs / squad após o projeto |
| **Quando** | Antes de escrever código | Durante ou depois do projeto |
| **Nível de detalhe** | Curls, versões, edge cases | Visão geral, decisões de nível alto |
| **Atualização** | Durante o levantamento | Quando alguém lembra |
| **Acessível pelo Copilot** | Sim (`#file:DISCOVERY.md`) | Só via Droid Confluence (Aula 11) |
| **Ciclo de vida** | Termina com o projeto | "Eterno" (frequentemente desatualizado) |
| **Propósito** | Habilitar o desenvolvimento | Registrar para posteridade |

## Onde Vive no Repositório

```
projeto-xpto/
├── .github/
│   └── prompts/           ← prompt files da squad (Aula 7)
├── src/
├── tests/
├── DISCOVERY.md           ← na raiz do projeto, visível a todos
└── README.md
```

Na raiz do projeto, não numa pasta de `/docs`. O motivo é acessibilidade: qualquer dev que clona o repo vê imediatamente que existe um contexto de discovery disponível. E o Copilot, quando você inclui `#file:DISCOVERY.md`, carrega o contexto sem que você precise explicar nada.

## Entregável da Aula: Template Pronto para Uso

Copie e adapte. Este template vai no repositório do projeto:

```markdown
# DISCOVERY — [Nome da Demanda]

**Data:** <!-- ex: 2026-02-21 -->
**Demanda:** <!-- link para issue/ticket -->
**Squad:** <!-- ex: Daniel, Kássia -->

---

## Demanda

<!-- Descrição técnica em 2-4 linhas: o que precisa ser feito,
     o que muda no sistema, qual é o resultado esperado -->

---

## APIs Envolvidas

<!-- Template para cada API:
### [Nome da API]
- **URL base:** [por ambiente se diferente]
- **Autenticação:** [tipo, onde obter token/credenciais]
- **Versão:** [qual versão usar]
- **Rate limit:** [req/min, req/s, burst]
- **Headers obrigatórios:** [além do Authorization]
- **Curl validado:**
  ```bash
  curl -X [METHOD] [URL] \
    -H "Authorization: Bearer $TOKEN" \
    -d '[payload]'
  ```
- **Campos não óbvios:** [campos com comportamento diferente do esperado]
-->

---

## Bancos de Dados

<!-- Template para cada banco:
### [Nome/Tipo]
- **Tipo:** [PostgreSQL, MongoDB, etc.]
- **Tabelas/Collections relevantes:** [com schema se importante]
- **Permissões de acesso:** [o que o serviço pode fazer]
- **Índices relevantes:** [para queries que serão feitas]
-->

---

## Cache

<!-- Se não usa cache, escreva "N/A — [projeto] não usa cache" -->
<!-- Template:
- **Tipo:** [Redis, Memcached, etc.]
- **TTL por recurso:** [ex: /saldo: 300s, /produtos: 3600s]
- **Estratégia de invalidação:** [como o cache é limpo quando dado muda]
- **Quem invalida:** [qual serviço publica o evento de invalidação]
-->

---

## Gateways

<!-- Se não há gateway, escreva "N/A — chamadas diretas ao serviço" -->

---

## Filas / Mensageria

<!-- Se não usa mensageria, escreva "N/A" -->

---

## Libs Internas

<!-- Template para cada lib:
### [nome-da-lib]
- **Versão atual em produção:** [x.y.z]
- **Breaking changes recentes:** [se houver]
- **Exemplos de uso:** [link para repositório com exemplos]
-->

---

## Ambientes

| Ambiente | URL Base | Como obter credenciais |
|---|---|---|
| dev | | |
| staging | | |
| prod | | |

---

## Repositórios para Analisar

- [ ] [nome-do-repo]: [por que analisar]

---

## Decisões Técnicas Iniciais

<!-- O que já foi decidido antes de começar -->

---

## Pendências 🔍

<!-- Use 🔍 para cada item que ainda falta descobrir -->
- 🔍 [o que falta]: [quem pode responder]
```

## Exercício Prático

**Missão:** Criar o `DISCOVERY.md` no repositório de um projeto real (ou de projecto hipotético da sua empresa).

1. Escolha uma demanda ou projeto atual — pode ser algo simples.

2. Crie o arquivo `DISCOVERY.md` na raiz do repositório usando o template desta aula.

3. Preencha pelo menos 3 seções com informação real:
   - **Demanda** — reescreva tecnicamente
   - **APIs Envolvidas** — pelo menos uma API com rate limit e curl validado
   - **Pendências** — pelo menos 2 itens honestos com 🔍

4. Abra o Copilot Chat e teste: `#file:DISCOVERY.md qual é o rate limit da API de pagamentos?`

   O Copilot deve responder com o valor que você registrou — sem você explicar nada.

**Critério de sucesso:** o DISCOVERY.md está commitado no repositório **e** o Copilot responde sobre o rate limit usando o dado do arquivo, não uma suposição genérica.

## Troubleshooting

### 💡 Problema: "Quem vai manter esse arquivo atualizado?"

**Sintoma:**
Preocupação de que o DISCOVERY.md vai ficar desatualizado e se tornar mais uma fonte de informação incorreta.

**Causa:**
Confundir ciclo de vida do DISCOVERY.md com documentação de sistema. São ciclos diferentes.

**Solução:**
O DISCOVERY.md tem ciclo de vida de projeto, não de sistema:
- É criado no início da demanda
- É atualizado durante o discovery e o desenvolvimento (quando novas informações emergem)
- É "arquivado" quando o projeto termina — ele permanece no histórico do Git mas não precisa ser mantido

Ele não documenta como o sistema funciona futuramente — documenta o que a squad descobriu sobre as dependências **desta demanda específica**. A próxima demanda terá seu próprio DISCOVERY.md. As atualizações acontecem naturalmente porque qualquer dev que descobre informação nova durante o desenvolvimento simplesmente adiciona ao arquivo já aberto.

### 💡 Problema: "Já temos templates e documentação no Confluence — por que um arquivo no repo?"

**Sintoma:**
A empresa já tem estrutura de documentação e criar mais um arquivo parece duplicação.

**Causa:**
A questão não é onde a documentação existe — é se o Copilot consegue lê-la.

**Solução:**
O Copilot acessa o DISCOVERY.md via `#file:DISCOVERY.md` em qualquer sessão, com qualquer dev. O Confluence requer o Droid Confluence (Aula 11) para ser acessado e consultas explícitas. Além disso, o Confluence é ótimo para documentação de longo prazo — o DISCOVERY.md é para o contexto imediato da demanda. Os dois coexistem sem conflito: o DISCOVERY.md referencia onde está a documentação permanente, e o Droid Confluence acessa quando precisa de mais profundidade.

:::tip 🏆 Treinamento Jedi Completo
Você está pronto para a próxima aula se:

- [ ] O arquivo `DISCOVERY.md` está commitado no repositório com pelo menos 3 seções preenchidas
- [ ] O Copilot respondeu sobre o conteúdo do DISCOVERY.md usando `#file:DISCOVERY.md` — com o dado do arquivo, não uma suposição
- [ ] Entendo a diferença entre DISCOVERY.md (contexto operacional da demanda) e documentação formal (visão de longo prazo do sistema)
- [ ] A seção de Pendências tem pelo menos 2 itens com 🔍 — o discovery não terminou com zero pendências
:::

---

Você tem o caderno. Agora precisa saber o que registrar em cada seção. A **Aula 6 — As Dimensões do Discovery** vai entrar em cada dimensão com profundidade: que perguntas fazer, o que esquecer custa caro, e como distinguir informação obrigatória de informação complementar por tipo de projeto.



