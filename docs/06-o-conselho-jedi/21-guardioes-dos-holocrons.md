---
title: 21 - Guardiões dos Holocrons
sidebar_position: 21
description: Governança mínima para manter instruções e contexto sempre atualizados.
---

**Duração estimada:** ~30 min

## Vídeo introdutório

<video controls width="100%" preload="metadata">
	<source src="/copilot-na-pratica/videos/21-guardioes-dos-holocrons.mp4" type="video/mp4" />
	Seu navegador não suporta vídeo HTML5.
</video>

## O Problema Real: Holocrons Morrem Sem Governança

Time implementou estrutura perfeita na aula 20 (Código Jedi):

```
.github/
├── copilot-instructions.md
├── instructions/
│   ├── api.md
│   ├── testing.md
│   └── regras-negocio.md
└── ...
```

**3 meses depois:**

```
Dev novo: seguindo api.md, criei endpoint com Flask

Tech Lead: ❌ Projeto usa FastAPI agora, mudamos há 2 meses

Dev: mas api.md diz Flask...

Tech Lead: ai, esquecemos de atualizar
```

**Problema:** estrutura existe, mas **ninguém mantém atualizado** → Holocron Morto (aula 14).

**Resultado:**
- Documentação mente
- Devs não confiam mais nos Holocrons
- Voltam a perguntar tudo manualmente
- Estrutura vira peso morto

---

## O Que É Governança (Versão Prática)

**Governança** não é burocracia. É responder 3 perguntas simples:

1. **Quem** é responsável por cada arquivo?
2. **Quando** deve ser revisado/atualizado?
3. **Como** garantir que foi atualizado?

Se você responde essas 3 perguntas, tem governança.

---

## Ownership (Responsabilidade Clara)

### Por Que Ownership É Crítico

**Sem ownership:**

```
Bug encontrado em produção → regra de negócio estava errada

Tech Lead: quem mantém regras-negocio.md?
Time: ... (silêncio)
Tech Lead: então ninguém atualiza?
Time: achava que era responsabilidade de todo mundo
```

**Problema:** "responsabilidade de todos = responsabilidade de ninguém".

---

**Com ownership:**

```
Bug encontrado em produção → regra de negócio estava errada

Tech Lead: quem mantém regras-negocio.md?
Ana (PO): eu! vou atualizar agora

[10 minutos depois]

Ana: atualizado, PR #456 aberto para review
```

**Diferença:** 10 minutos vs dias (ou nunca).

---

### Como Definir Ownership

**Passo 1: Mapear arquivos críticos**

| Arquivo                               | Quem Usa Diariamente?    |
|---------------------------------------|--------------------------|
| `.github/copilot-instructions.md`     | Time todo                |
| `.github/instructions/api.md`         | Backend squad            |
| `.github/instructions/testing.md`     | Time todo                |
| `.github/instructions/infra.md`       | DevOps/SRE               |
| `.github/instructions/regras-negocio.md` | PO + Backend lead     |

---

**Passo 2: Atribuir dono por domínio**

**Regra:** dono = pessoa/squad com **maior conhecimento técnico** naquele domínio.

| Arquivo                        | Dono             | Backup           |
|--------------------------------|------------------|------------------|
| `api.md`                       | Bruno (Backend)  | Ana (Backend)    |
| `testing.md`                   | Carla (QA Lead)  | Bruno            |
| `infra.md`                     | Diego (DevOps)   | Carla            |
| `regras-negocio.md`            | Ana (PO)         | Bruno (Tech Lead)|
| `copilot-instructions.md`      | Tech Lead        | PO               |

**Por que backup?** Se dono principal sai de férias/empresa, backup assume temporariamente.

---

**Passo 3: Documentar ownership**

Crie arquivo `docs/ownership.md`:

```markdown
# Ownership de Holocrons e Artefatos

| Arquivo                          | Dono Principal  | Backup      | Última Atualização |
|----------------------------------|-----------------|-------------|--------------------|
| `.github/copilot-instructions.md`| @techlead       | @po         | 2026-02-10         |
| instructions/api.md              | @bruno          | @ana        | 2026-02-15         |
| instructions/testing.md          | @carla          | @bruno      | 2026-01-20         |
| instructions/infra.md            | @diego          | @carla      | 2026-02-01         |
| instructions/regras-negocio.md   | @ana            | @techlead   | 2026-02-16         |
| prompts/*.prompt.md              | Criador original| Tech Lead   | Ver Git log        |
| agents/*.agent.md                | Criador original| Tech Lead   | Ver Git log        |

## Como Atualizar Ownership

1. Abra PR modificando esta tabela
2. Pinga responsável atual: "@ana você quer passar ownership de api.md?"
3. Se sim, Tech Lead aprova
4. Merge → ownership atualizado
```

---

**Passo 4: Comunicar ao time**

```
Tech Lead no Slack/Teams:

"Definimos ownership de Holocrons:
- api.md → @bruno
- testing.md → @carla
- regras-negocio.md → @ana

Ver tabela completa: docs/ownership.md

Se algo está desatualizado no SEU domínio, você é responsável por corrigir."
```

---

### Ownership em Cabeçalho de Arquivo

**Boas práticas:** incluir ownership no próprio arquivo.

```markdown
# Instrução: Padrão de API

**Dono:** @bruno (Backend Squad)  
**Backup:** @ana  
**Última atualização:** 2026-02-15  
**Próxima revisão:** sempre que houver mudança arquitetural

---

## Contexto

Este documento define padrões para endpoints REST...
```

**Vantagem:** quem abre arquivo já sabe quem acionar em caso de dúvida.

---

## Triggers de Atualização (Quando Revisar)

### Problema: Atualização Ad-Hoc Não Funciona

**Sem trigger definido:**

```
Dev implementa mudança → esquece de atualizar Holocron → Holocron fica desatualizado
```

**Com trigger claro:**

```
Dev implementa mudança arquitetural → trigger acionado → atualiza Holocron → commita junto
```

---

### Triggers Essenciais

| Trigger                              | Arquivo(s) a Atualizar                | Exemplo                                      |
|--------------------------------------|---------------------------------------|----------------------------------------------|
| **Mudança de arquitetura**           | `copilot-instructions.md`, `api.md`   | Migrar de Flask para FastAPI                 |
| **Nova regra funcional**             | `regras-negocio.md`                   | "Pagamento > R$ 5k exige aprovação"          |
| **Mudança de padrão de teste**      | `testing.md`                          | Adotar pytest em vez de unittest             |
| **Incidente de produção relevante**  | `regras-negocio.md`, `infra.md`       | Bug causado por regra ausente                |
| **Novo padrão de deploy**            | `infra.md`                            | Migrar de Heroku para Railway                |
| **Refatoração grande**               | Arquivo do domínio impactado          | Reestruturar pastas de API                   |

---

### Como Implementar Triggers

**Opção 1: Checklist no PR Template**

Crie `.github/pull_request_template.md`:

```markdown
## Descrição

<!-- Descreva a mudança -->

## Checklist

- [ ] Código aderente ao padrão (ver `.github/instructions/`)
- [ ] Testes adicionados/atualizados
- [ ] **Se houver mudança arquitetural:** atualizei `copilot-instructions.md` ou `instructions/*.md`
- [ ] **Se houver nova regra de negócio:** atualizei `instructions/regras-negocio.md`
- [ ] **Se houver mudança de infra:** atualizei `instructions/infra.md`
- [ ] Descrição de impacto técnico incluída

## Impacto

<!-- Quais módulos/serviços são afetados? -->

## Holocrons Atualizados (se aplicável)

<!-- Liste arquivos atualizados: -->
- `.github/instructions/api.md` (linha 42: adicionei validação de CPF)
```

**Como funciona:**

1. Dev abre PR
2. Vê checklist
3. **Antes de marcar "ready for review"**, valida se atualizou Holocrons relevantes
4. Reviewer valida se checklist foi seguido

---

**Opção 2: Bot Automatizado (Avançado)**

GitHub Actions que comenta em PR se detectar mudança sem atualização de Holocron:

```yaml
# .github/workflows/check-holocron-sync.yml

name: Check Holocron Sync

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  check-sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0
      
      - name: Check if architectural change needs Holocron update
        run: |
          # Listar arquivos modificados
          CHANGED_FILES=$(git diff --name-only origin/main...HEAD)
          
          # Se mudou algo em api/ mas NÃO mudou instructions/api.md
          if echo "$CHANGED_FILES" | grep -q "^api/" && ! echo "$CHANGED_FILES" | grep -q "instructions/api.md"; then
            echo "::warning::Você modificou 'api/' mas não atualizou 'instructions/api.md'. Confirme se é necessário."
          fi
          
          # Se mudou models/ verifica regras-negocio.md
          if echo "$CHANGED_FILES" | grep -q "^models/" && ! echo "$CHANGED_FILES" | grep -q "instructions/regras-negocio.md"; then
            echo "::warning::Você modificou 'models/' mas não atualizou 'instructions/regras-negocio.md'."
          fi
```

**Resultado:** PR recebe comentário automático se algo parece desatualizado.

---

**Opção 3: Revisão Quinzenal (Manual)**

Agendar reunião recorrente de 30min a cada 2 semanas:

```
Agenda: Revisar Holocrons

1. Tech Lead compartilha tela com .github/instructions/
2. Para cada arquivo:
   - Alguém mudou algo no domínio nas últimas 2 semanas?
   - Arquivo está atualizado?
   - Se não, dono atualiza durante a reunião ou abre issue
3. Commita atualizações
```

**Vantagem:** forçado, não depende de memória individual.  
**Desvantagem:** consome 30min a cada 2 semanas (custo aceitável).

---

## Checklist no PR: Definition of Done (DoD)

### O Que É DoD

**Definition of Done (DoD):** conjunto de critérios que **toda** alteração deve cumprir antes de ser considerada pronta.

**Sem DoD:**

```
Dev acha que PR está pronto → abre para review
Reviewer: "faltou testes"
Dev: "achei que não precisava"
Reviewer: "faltou atualizar Holocron"
Dev: "não sabia que tinha que atualizar"

Resultado: 3 rodadas de feedback, PR leva 2 dias
```

**Com DoD:**

```
Dev antes de abrir PR → consulta DoD
DoD: "tem testes? ✅"
DoD: "atualizou Holocron se aplicável? ✅"
DoD: validado → abre PR

Reviewer: tudo conforme DoD → aprova em 2h
```

---

### DoD Essencial para Holocrons

**Adicione ao PR template (`.github/pull_request_template.md`):**

```markdown
## Definition of Done (DoD)

Marque todos os itens antes de solicitar review:

### Código

- [ ] Código aderente ao padrão (ver `.github/instructions/`)
- [ ] Sem warnings de lint/type checker
- [ ] Build passa localmente

### Testes

- [ ] Testes unitários adicionados/atualizados
- [ ] Cobertura não diminuiu (rodar `pytest --cov`)
- [ ] Testes passam localmente

### Documentação

- [ ] **Se mudança arquitetural:** atualizei `.github/copilot-instructions.md` ou `instructions/*.md`
- [ ] **Se nova regra de negócio:** atualizei `instructions/regras-negocio.md`
- [ ] **Se mudança de padrão:** atualizei Holocron correspondente
- [ ] Docstrings/comentários atualizados

### Impacto

- [ ] Descrição de impacto técnico incluída neste PR
- [ ] Se breaking change: plan de migração documentado
- [ ] Stakeholders relevantes foram informados

### Rastreabilidade

- [ ] Referência a issue/card (ex: "Fixes #123")
- [ ] Se alterou Holocron: explicação do "por quê" no commit message
```

---

### Como Fazer DoD Funcionar

**1. Tech Lead valida adesão:**

Se PR não cumpre DoD → **não aprova** (bloqueia merge).

```
Reviewer: "faltou marcar item 'atualizei Holocron', favor completar antes de re-review"

Dev completa → reviewer aprova
```

---

**2. Automatizar verificação (quando possível):**

```yaml
# .github/workflows/dod-check.yml

name: DoD Check

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  check-dod:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Check if tests exist for new code
        run: |
          # Verifica se arquivos em src/ têm testes correspondentes
          # (lógica customizada)
          
      - name: Check if coverage decreased
        run: |
          pytest --cov --cov-report=term --cov-fail-under=80
```

---

## Meta de Governança

**Objetivo:** manter o Templo (estrutura de Holocrons) **previsível, auditável e confiável** para uso diário com IA.

### Previsível

**Significa:** qualquer dev sabe onde encontrar informação e confia que está atualizada.

**Validação:**

```
Pergunta para 3 devs aleatórios:
"Onde está documentado o padrão de API?"

Resposta esperada:
".github/instructions/api.md"

Se 3/3 acertam → previsível ✅
```

---

### Auditável

**Significa:** é possível rastrear quem mudou o quê, quando e por quê.

**Validação:**

```bash
# Ver histórico de mudanças em Holocron
git log --oneline .github/instructions/api.md

# Resultado esperado:
abc123 feat: adiciona validação de CPF em endpoints de usuário
def456 fix: corrige exemplo de status code (era 200, agora 201)
ghi789 docs: atualiza estrutura de pastas após refatoração

# Cada commit tem mensagem descritiva → auditável ✅
```

---

### Confiável

**Significa:** Holocrons refletem estado atual do código (não estão desatualizados).

**Validação:**

```
1. Abrir .github/instructions/api.md
2. Ler: "Use FastAPI com Pydantic"
3. Abrir código: api/v1/endpoints/users.py
4. Verificar: de fato usa FastAPI

Se Holocron = código → confiável ✅
```

**Métrica objetiva:**

```
Taxa de confiança = (Holocrons atualizados / Total de Holocrons) × 100%

Meta: ≥ 95% (máximo 5% de drift tolerado)
```

---

## Exemplo Completo: Governança do Zero

**Cenário:** time implementou Código Jedi (aula 20), agora precisa governar.

### Passo 1: Atribuir Ownership

**Reunião de 30min com time:**

```
Tech Lead: "vamos definir quem cuida de cada Holocron"

Time discute:
- api.md → Bruno (Backend lead)
- testing.md → Carla (QA)
- regras-negocio.md → Ana (PO)
- infra.md → Diego (DevOps)

Tech Lead documenta em docs/ownership.md → commita
```

---

### Passo 2: Definir Triggers

**Tech Lead adiciona ao PR template:**

```markdown
## Checklist

- [ ] Se mudança arquitetural: atualizei Holocron correspondente
- [ ] Se nova regra de negócio: atualizei regras-negocio.md
```

---

### Passo 3: Agendar Revisão Quinzenal

**Tech Lead cria evento recorrente:**

```
Título: Revisão de Holocrons
Frequência: a cada 2 semanas, sexta 16h30
Duração: 30min
Agenda:
1. Revisar .github/instructions/
2. Identificar desatualizações
3. Atribuir correções (ou corrigir na hora)
```

---

### Passo 4: Validar com Próximo PR

**Bruno abre PR mudando estrutura de API:**

```
PR #123: refatora endpoints para usar APIRouter
```

**Reviewer (Tech Lead) valida DoD:**

```
Reviewer: "vi que mudou estrutura de api/, mas não vejo atualização em api.md"

Bruno: "opa, esqueci! vou adicionar"

[Bruno adiciona commit atualizando api.md]

Reviewer: "agora sim, aprovado ✅"
```

---

### Passo 5: Medir Taxa de Confiança (Mensal)

**Tech Lead no fim do mês:**

```bash
# Listar todos os Holocrons
ls .github/instructions/

# Para cada um, verificar se está atualizado
# (comparar com código real)

Resultado:
- api.md: ✅ atualizado
- testing.md: ✅ atualizado
- infra.md: ❌ menciona Heroku, mas migramos para Railway
- regras-negocio.md: ✅ atualizado

Taxa de confiança: 3/4 = 75%

Ação: pingar Diego para atualizar infra.md
```

---

## Troubleshooting

### 💡 Problema: Dono esquece de atualizar

**Sintoma:**

```
Dev abre PR com mudança arquitetural
Dono do Holocron (Bruno) aprova PR
Mas esquece de atualizar Holocron
```

**Solução:**

**Opção 1: GitHub Actions comenta em PR**

```yaml
# .github/workflows/remind-holocron.yml

- name: Remind owner to update Holocron
  if: contains(github.event.pull_request.labels.*.name, 'architectural-change')
  run: |
    gh pr comment ${{ github.event.pull_request.number }} --body \
      "@bruno lembre de atualizar .github/instructions/api.md antes de merge"
```

---

**Opção 2: Bloquear merge se checklist não completado**

Branch protection rule:

```
Settings → Branches → Branch protection rules → main

☑ Require status checks to pass before merging
  ☑ Require branches to be up to date
  ☑ Status check: "Holocron updated" (custom GitHub Action)
```

GitHub Action valida se Holocron foi atualizado quando necessário.

---

### 💡 Problema: Ownership vira gargalo

**Sintoma:**

```
Dev precisa de ajuste urgente em api.md
Dono (Bruno) está de férias
Ninguém pode atualizar porque "não é o dono"
```

**Solução:**

**1. Sempre definir backup:**

```markdown
# docs/ownership.md

| Arquivo  | Dono   | Backup  |
|----------|--------|---------|
| api.md   | @bruno | @ana    |
```

Se dono indisponível → backup assume temporariamente.

---

**2. Permitir atualizações emergenciais:**

```markdown
# Regra de Exceção

Se mudança é:
- **Urgente** (hotfix de produção)
- **Pequena** (correção de typo, exemplo desatualizado)

Qualquer dev pode atualizar Holocron, mas deve:
1. Abrir PR explicando urgência
2. Pingar dono/backup para review pós-fato
3. Merge após aprovação de qualquer sênior
```

---

### 💡 Problema: Revisão quinzenal é ignorada

**Sintoma:**

```
Evento no calendário: "Revisão de Holocrons"
Ninguém comparece ou meeting é cancelada repetidamente
```

**Solução:**

**1. Tornar obrigatória:**

```
Tech Lead torna presença obrigatória para donos de Holocrons
Se não comparecer: justificar ausência + atualizar async
```

**2. Reduzir frequência:**

```
Se quinzenal é demais, tentar mensal
Ou: fazer rápido (15min) no final da retro
```

**3. Automatizar verificação:**

```
Script que roda toda semana:
- Compara Holocrons com código
- Envia relatório no Slack: "3 Holocrons desatualizados, acionar donos"
```

---

## Exercício Prático

**Missão:** Implementar governança básica no seu projeto.

**Tempo estimado:** 2 horas

---

**Passo 1: Definir Ownership (30min)**

1. Liste todos os Holocrons existentes:
   ```bash
   ls .github/instructions/
   ```

2. Para cada arquivo, identifique:
   - Quem tem mais conhecimento naquele domínio?
   - Quem seria backup?

3. Documente em `docs/ownership.md` usando template desta aula

4. Commite:
   ```bash
   git add docs/ownership.md
   git commit -m "docs: define ownership de Holocrons"
   git push
   ```

---

**Passo 2: Adicionar Checklist ao PR Template (20min)**

1. Edite `.github/pull_request_template.md` (ou crie se não existir)

2. Adicione seção "Holocrons Atualizados":
   ```markdown
   ## Holocrons Atualizados (se aplicável)
   
   - [ ] Se mudança arquitetural: atualizei Holocron correspondente
   - [ ] Se nova regra de negócio: atualizei regras-negocio.md
   ```

3. Commite:
   ```bash
   git add .github/pull_request_template.md
   git commit -m "feat: adiciona checklist de Holocron em PR template"
   git push
   ```

---

**Passo 3: Agendar Revisão Recorrente (10min)**

1. Crie evento no calendário do time:
   ```
   Título: Revisão de Holocrons
   Frequência: a cada 2 semanas (ou mensal)
   Duração: 30min
   Participantes: donos de Holocrons + Tech Lead
   ```

2. Adicione agenda no evento:
   ```
   1. Revisar cada arquivo em .github/instructions/
   2. Identificar desatualizações
   3. Atribuir correções ou corrigir na hora
   4. Commitar atualizações
   ```

---

**Passo 4: Validar com Próximo PR (prática real)**

1. Abrir PR com qualquer mudança
2. Verificar se checklist aparece
3. Marcar itens conforme aplicável
4. Validar se reviewer cobra adesão ao checklist

---

**Critério de sucesso:**

- [ ] Ownership documentado e versionado
- [ ] PR template inclui checklist de Holocrons
- [ ] Revisão recorrente agendada
- [ ] Próximo PR seguiu checklist
- [ ] Taxa de confiança mensurada (pelo menos 1x)

---

## Recursos Externos

- [Definition of Done Best Practices](https://www.scrum.org/resources/blog/walking-through-definition-done)
- [GitHub Branch Protection Rules](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches)
- [RACI Matrix for Documentation](https://www.atlassian.com/agile/project-management/raci-model)

---

## Checklist de Validação

Você está pronto para a próxima aula se:

- [ ] Sabe definir ownership por domínio técnico (dono + backup)
- [ ] Conhece 5 triggers de atualização (mudança arquitetural, nova regra, incidente, etc.)
- [ ] Consegue criar DoD para PRs incluindo checklist de Holocrons
- [ ] Entende as 3 metas de governança (previsível, auditável, confiável)
- [ ] Sabe como validar cada meta (testes práticos)
- [ ] Conhece 3 formas de enforcement (checklist em PR, bot automatizado, revisão quinzenal)
- [ ] Sabe resolver gargalo de ownership (backup, exceções emergenciais)

:::tip 🏆 Treinamento Jedi Completo
Você estabeleceu governança prática com ownership, gatilhos de atualização e DoD para manter os Holocrons saudáveis. O Templo é previsível, auditável e confiável para uso diário com IA.
:::
