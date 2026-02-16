---
title: 20 - O Código Jedi
sidebar_position: 20
description: Padronização da estrutura compartilhada de instruções, prompts, agentes e skills.
---

**Duração estimada:** ~30 min

## Vídeo introdutório

<video controls width="100%" preload="metadata">
	<source src="/copilot-na-pratica/videos/20-o-codigo-jedi.mp4" type="video/mp4" />
	Seu navegador não suporta vídeo HTML5.
</video>

## O Problema Real: Time Sem Padrão = Cada Um Faz de Um Jeito

Depois do diagnóstico (aula 19), time decidiu criar estrutura compartilhada.

**Pergunta do time:**

```
Dev 1: onde eu coloco instruções de API?
Dev 2: posso criar pasta "meus-prompts"?
Dev 3: skill vai em .github ou em docs/?
Tech Lead: ... (não tem resposta)
```

**Resultado:** cada dev cria estrutura diferente:

```
# Dev 1
.github/
└── api-instructions.md

# Dev 2
.github/
└── my-prompts/
    └── stuff.md

# Dev 3
docs/
└── copilot/
    └── skills/
```

**Problema:** mesmo com intenção de organizar, **falta convenção** → volta à desordem.

---

## Estrutura Padrão do Conselho Jedi

**Definição:** conjunto de pastas e arquivos com localização e nomenclatura padronizadas para **todo** time seguir.

### Estrutura Completa

```
projeto/
├── .github/
│   ├── copilot-instructions.md          ← Holocron Principal
│   ├── instructions/                    ← Holocrons por Território
│   │   ├── api.md                       
│   │   ├── testing.md
│   │   ├── infra.md
│   │   ├── frontend.md                  (se aplicável)
│   │   └── regras-negocio.md
│   ├── prompts/                         ← Prompt Files
│   │   ├── create-endpoint.prompt.md
│   │   ├── code-review.prompt.md
│   │   └── generate-tests.prompt.md
│   ├── agents/                          ← Custom Agents
│   │   ├── architect.agent.md
│   │   ├── reviewer.agent.md
│   │   ├── security.agent.md
│   │   └── dba.agent.md
│   └── skills/                          ← Skills Compartilhadas
│       ├── api-testing.skill.md
│       ├── api-scaffolding.skill.md
│       └── database-migration.skill.md
├── .vscode/
│   └── mcp.json                         ← Droids (MCP servers)
└── docs/
    └── onboarding/
        └── setup-copilot.md             ← Guias de setup
```

---

### Por Que Essa Estrutura?

#### `.github/` como Raiz

**Motivo:** GitHub Copilot automaticamente indexa arquivos dentro de `.github/` como contexto do projeto.

**Alternativa rejeitada:** `docs/copilot/`  
**Por que não:** VS Code não indexa automaticamente, precisaria configurar manualmente em cada máquina.

---

#### `copilot-instructions.md` na Raiz de `.github/`

**Motivo:** Holocron Principal (persistente em todas as conversas) deve estar no local padrão reconhecido pelo Copilot.

**Nomenclatura fixa:** `copilot-instructions.md` (não pode ser `instructions.md` ou `main-instructions.md`).

---

#### `instructions/` para Holocrons por Território

**Motivo:** separar contexto por domínio técnico (API, testes, infra) facilita manutenção e responsabilização.

**Convenção de nomenclatura:**

| Arquivo              | Conteúdo                                    |
|----------------------|---------------------------------------------|
| `api.md`             | Padrão de rotas, status codes, validação    |
| `testing.md`         | Estratégia de testes, cobertura, ferramentas|
| `infra.md`           | Deploy, configs, variáveis de ambiente      |
| `frontend.md`        | Componentes, estilos, state management      |
| `regras-negocio.md`  | Regras funcionais, limites, exceções        |

**Regra:** nome no singular (não `apis.md`), em kebab-case (não `TestingGuide.md`).

---

#### `prompts/` para Prompt Files

**Motivo:** centralizar comandos reutilizáveis que múltiplos devs usam.

**Convenção de nomenclatura:**

```
ação-alvo.prompt.md

Exemplos:
- create-endpoint.prompt.md
- code-review.prompt.md
- generate-tests.prompt.md
- document-api.prompt.md
```

**Regra:** verbo no infinitivo + substantivo + `.prompt.md`.

---

#### `agents/` para Custom Agents

**Motivo:** agentes representam "personas" técnicas específicas.

**Convenção de nomenclatura:**

```
persona.agent.md

Exemplos:
- architect.agent.md
- reviewer.agent.md
- security.agent.md
- dba.agent.md
- devops.agent.md
```

**Regra:** nome no singular (papel da pessoa), em minúsculas.

---

#### `skills/` para Skills Compartilhadas

**Motivo:** automatizações complexas devem ser versionadas e compartilhadas.

**Convenção de nomenclatura:**

```
dominio-acao.skill.md

Exemplos:
- api-testing.skill.md         (domínio: api, ação: testing)
- api-scaffolding.skill.md     (domínio: api, ação: scaffolding)
- database-migration.skill.md  (domínio: database, ação: migration)
```

**Regra:** kebab-case, domínio técnico + ação + `.skill.md`.

---

## Convenções Essenciais

### Convenção 1: Nomes Curtos e Descritivos

**❌ Evite:**

```
.github/
├── instructions/
│   ├── api-endpoints-and-routes-pattern.md              (muito longo)
│   ├── test.md                                           (muito genérico)
│   └── regras-do-dominio-de-pagamentos-e-financeiro.md  (específico demais)
```

**✅ Prefira:**

```
.github/
├── instructions/
│   ├── api.md                    (claro e curto)
│   ├── testing.md                (descritivo)
│   └── regras-negocio.md         (domínio geral, não específico)
```

**Regra prática:** 2-3 palavras no máximo.

---

### Convenção 2: Escopo por Domínio Técnico

**❌ Evite:**

```
.github/
├── instructions/
│   ├── backend.md        (muito amplo — abrange API, testes, infra, etc.)
│   └── frontend.md       (idem)
```

**✅ Prefira:**

```
.github/
├── instructions/
│   ├── api.md            (domínio: camada de API)
│   ├── testing.md        (domínio: testes)
│   ├── infra.md          (domínio: infraestrutura)
│   ├── ui-components.md  (domínio: componentes de UI)
│   └── state-management.md (domínio: estado no frontend)
```

**Por quê:** facilita encontrar informação relevante e atribuir responsabilidade.

---

### Convenção 3: Responsabilidade Clara por Artefato

**Cada arquivo crítico deve ter:**

1. **Dono explícito** (pessoa/squad responsável por manter)
2. **Última atualização** (data)
3. **Trigger de revisão** (quando revisar)

**Exemplo no cabeçalho de arquivo:**

```markdown
# Instrução: Padrão de API

**Dono:** @bruno (Squad Backend)  
**Última atualização:** 2026-02-10  
**Revisão:** sempre que houver mudança arquitetural ou novo endpoint padrão

---

## Contexto

Esta instrução define como criar endpoints REST...
```

---

### Convenção 4: Proibição de Conteúdo Duplicado

**Problema comum:**

```markdown
# .github/copilot-instructions.md
Use FastAPI para todos os endpoints.

# .github/instructions/api.md
Use FastAPI com Pydantic para validação.

# .github/agents/architect.agent.md
Recomende Flask ou FastAPI, o que fizer mais sentido.
```

**Conflito:** 3 arquivos com orientações sobre framework.

**Solução:**

1. **Escolher fonte única de verdade:**
   - Decisão: `.github/instructions/api.md` é a fonte oficial
   
2. **Referenciar, não duplicar:**

```markdown
# .github/copilot-instructions.md
Para padrões de API, consulte `.github/instructions/api.md`.

# .github/agents/architect.agent.md
Ao avaliar framework de API, siga `.github/instructions/api.md` (padrão: FastAPI).
```

**Regra:** se informação existe em A, arquivos B e C **referenciam A**, não duplicam.

---

## Checklist de Setup do Dev

**Objetivo:** garantir que todo novo dev tem ambiente padronizado antes de começar.

### Checklist Completo

Crie arquivo `docs/onboarding/checklist-padawan.md`:

```markdown
# Checklist de Setup do Padawan

## 1. Ferramentas Instaladas

- [ ] **VS Code** atualizado (versão >= 1.85)
- [ ] **GitHub Copilot** instalado (extensão)
- [ ] **GitHub Copilot Chat** instalado (extensão)
- [ ] **Git** configurado com SSH ou token
- [ ] **Node.js** (versão LTS atual)
- [ ] **Python 3.13** (ou versão do projeto)
- [ ] **Docker Desktop** (se projeto usa containers)

---

## 2. Repositório Configurado

- [ ] Repositório clonado: `git clone ...`
- [ ] Dependências instaladas: `npm install` / `pip install -r requirements.txt`
- [ ] Banco de dados local rodando (se aplicável)
- [ ] Build inicial bem-sucedido: `npm run build` / `pytest`

---

## 3. Holocrons Acessíveis

- [ ] Arquivo `.github/copilot-instructions.md` existe e foi lido
- [ ] Pasta `.github/instructions/` existe
- [ ] Leu instruções relevantes:
  - [ ] `api.md` (se trabalha com backend)
  - [ ] `testing.md` (todos devem ler)
  - [ ] `regras-negocio.md` (todos devem ler)
  - [ ] `infra.md` (se trabalha com deploy)

---

## 4. Prompt Files e Agents

- [ ] Pasta `.github/prompts/` existe
- [ ] Testou invocar pelo menos 1 prompt file:
  - Comando: `/run create-endpoint.prompt.md`
- [ ] Pasta `.github/agents/` existe
- [ ] Testou conversar com pelo menos 1 agent:
  - Comando: `@architect como implementar autenticação JWT?`

---

## 5. Skills Instaladas

- [ ] Pasta `.github/skills/` existe
- [ ] Testou executar skill `api-testing`:
  - Comando: `use skill api-testing para validar endpoint /users`

---

## 6. Droids (MCP) Ativados

- [ ] Arquivo `.vscode/mcp.json` existe
- [ ] Droids configurados:
  - [ ] PostgreSQL (ou banco do projeto)
  - [ ] Filesystem
  - [ ] (Outros relevantes)
- [ ] Testou consultar Droid:
  - Comando: `lista as tabelas do banco`

---

## 7. Validação Final

- [ ] **Teste inline:** escrever comentário → Copilot sugere código aderente ao padrão
- [ ] **Teste chat:** perguntar sobre arquitetura → Copilot responde com base em Holocrons
- [ ] **Teste skill:** executar skill de testes → gera testes com padrão do projeto

---

## 8. Primeira Tarefa Guiada

- [ ] Executar primeira tarefa com pair programming (com dev sênior)
- [ ] Usar Holocrons durante implementação
- [ ] Submeter PR seguindo template
- [ ] PR aprovado (critério de setup completo)

---

**Meta:** completar checklist em **1 dia de trabalho**.

**Responsável por validar:** Tech Lead ou Dev Sênior designado.
```

---

### Como Usar o Checklist

**1. Novo dev entra no time:**

```
Tech Lead: "Olá! Antes de começar, siga o checklist:
docs/onboarding/checklist-padawan.md"
```

**2. Dev marca items conforme completa:**

```markdown
- [x] VS Code instalado
- [x] Copilot ativo
- [x] Repositório clonado
- [ ] Holocrons lidos  ← Ainda falta
```

**3. Validação final:**

```
Dev: "completei checklist, PR da primeira tarefa: #123"

Tech Lead revisa PR:
- Código segue padrão? ✅
- Usou Holocrons? ✅
→ PR aprovado → setup validado
```

---

## Convenções de Nomenclatura: Referência Rápida

| Tipo de Arquivo       | Padrão                     | Exemplo                           |
|-----------------------|----------------------------|-----------------------------------|
| Holocron Principal    | `copilot-instructions.md`  | `.github/copilot-instructions.md` |
| Holocron Território   | `dominio.md`               | `.github/instructions/api.md`     |
| Prompt File           | `verbo-alvo.prompt.md`     | `create-endpoint.prompt.md`       |
| Agent                 | `persona.agent.md`         | `architect.agent.md`              |
| Skill                 | `dominio-acao.skill.md`    | `api-testing.skill.md`            |
| MCP config            | `mcp.json`                 | `.vscode/mcp.json`                |
| Checklist onboarding  | `checklist-padawan.md`     | `docs/onboarding/checklist-padawan.md` |

---

## Critério de Pronto

**Como saber que o Código Jedi está implementado?**

### Teste Prático

**1. Novo dev entra no time**

```
Sem falar nada além de "leia o checklist", observe se dev consegue:
- Instalar ferramentas
- Configurar ambiente
- Ler Holocrons
- Executar primeira tarefa

Se conseguir SEM perguntar a todo momento → Código Jedi funciona ✅
```

---

**2. Dev executa tarefa usando apenas padrão compartilhado**

```
Tarefa: criar endpoint POST /users com validação Pydantic

Dev não pergunta para ninguém, apenas:
- Lê .github/instructions/api.md
- Usa prompt file create-endpoint.prompt.md
- Executa skill api-testing
- Submete PR

PR aprovado sem retrabalho → Código Jedi funciona ✅
```

---

**3. 3 devs fazem mesma tarefa = resultado idêntico**

```
Tarefa: implementar autenticação JWT

Dev A → lê api.md → implementa com FastAPI + JWT
Dev B → lê api.md → implementa com FastAPI + JWT
Dev C → lê api.md → implementa com FastAPI + JWT

Resultados são 95% iguais → Código Jedi funciona ✅
```

---

## Exemplo Completo: Implementar Código Jedi do Zero

**Cenário:** time de 5 devs, projeto FastAPI, sem estrutura atual.

### Passo 1: Tech Lead Cria Estrutura Base

```bash
# Criar pastas
mkdir -p .github/instructions
mkdir -p .github/prompts
mkdir -p .github/agents
mkdir -p .github/skills
mkdir -p docs/onboarding

# Criar arquivos vazios (serão preenchidos gradualmente)
touch .github/copilot-instructions.md
touch .github/instructions/api.md
touch .github/instructions/testing.md
touch .github/instructions/regras-negocio.md
touch docs/onboarding/checklist-padawan.md
```

---

### Passo 2: Preencher Holocron Principal

```markdown
# .github/copilot-instructions.md

# Contexto do Projeto

Este é um sistema de e-commerce com API REST em **FastAPI** e banco **PostgreSQL**.

## Stack Técnica

- **Backend:** Python 3.13, FastAPI, SQLAlchemy
- **Banco:** PostgreSQL 15
- **Cache:** Redis
- **Deploy:** Docker Compose, Railway

## Estrutura de Pastas

```
api/              ← Endpoints
models/           ← Modelos SQLAlchemy
services/         ← Lógica de negócio
tests/            ← Testes pytest
```

## Documentação Adicional

- **Padrão de API:** ver `.github/instructions/api.md`
- **Padrão de Testes:** ver `.github/instructions/testing.md`
- **Regras de Negócio:** ver `.github/instructions/regras-negocio.md`

## Quando em Dúvida

Sempre consulte as instruções específicas por domínio antes de supor.
```

---

### Passo 3: Preencher Holocrons por Território

```markdown
# .github/instructions/api.md

**Dono:** @bruno (Squad Backend)  
**Última atualização:** 2026-02-16

---

## Framework e Padrões

- **Framework:** FastAPI
- **Validação:** Pydantic models
- **Autenticação:** JWT (biblioteca: python-jose)

## Estrutura de Endpoint

```python
# api/v1/endpoints/users.py

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

router = APIRouter(prefix="/users", tags=["Users"])

class UserCreate(BaseModel):
    name: str
    email: str

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_user(user: UserCreate):
    # Implementação
    pass
```

## Status Codes

| Operação     | Sucesso | Erro Cliente | Erro Servidor |
|--------------|---------|--------------|---------------|
| GET          | 200     | 404          | 500           |
| POST (criar) | 201     | 400, 409     | 500           |
| PUT          | 200     | 400, 404     | 500           |
| DELETE       | 204     | 404          | 500           |

## Validações

- Sempre usar Pydantic models para request/response
- Retornar mensagem de erro descritiva: `{"detail": "User already exists"}`
```

---

### Passo 4: Criar Prompt Files Essenciais

```markdown
# .github/prompts/create-endpoint.prompt.md

---
description: Cria endpoint REST seguindo padrão do projeto
mode: agent
tools: [terminal, filesystem]
---

# Tarefa

Criar endpoint ${input:method} ${input:path}.

## Checklist

1. Verificar estrutura em `api/v1/endpoints/`
2. Criar arquivo seguindo padrão (ver `.github/instructions/api.md`)
3. Definir Pydantic models para request/response
4. Implementar handler com validações
5. Definir status codes corretos (201 para POST, 200 para GET, etc.)
6. Adicionar docstring
7. Registrar router em `api/main.py`

## Validações

- [ ] Usa FastAPI APIRouter
- [ ] Pydantic models definidos
- [ ] Status code correto
- [ ] Tratamento de erro com HTTPException
```

---

### Passo 5: Criar Checklist de Onboarding

(Use o template completo da seção "Checklist de Setup do Dev" acima)

---

### Passo 6: Workshop com o Time (2h)

**Agenda:**

```
1. Apresentação da estrutura (20min)
   - Por que criar padrão compartilhado?
   - Tour pela estrutura .github/

2. Hands-on: cada dev lê Holocrons (30min)
   - api.md
   - testing.md
   - regras-negocio.md

3. Exercício: implementar endpoint juntos (40min)
   - Tarefa: POST /products
   - Usar instruções para guiar
   - Todo mundo faz simultaneamente
   - Comparar resultados

4. Definir ownership (15min)
   - Quem é dono de api.md?
   - Quem é dono de testing.md?

5. Q&A e ajustes (15min)
```

---

### Passo 7: Commitar e Versionar

```bash
git add .github/ docs/onboarding/
git commit -m "feat: implementa Código Jedi (estrutura compartilhada)

- Cria Holocron Principal (.github/copilot-instructions.md)
- Adiciona instruções por território (api.md, testing.md, regras-negocio.md)
- Cria prompt file create-endpoint
- Adiciona checklist de onboarding

Refs: diagnóstico de desordem (docs/diagnostico-desordem-2026-02.md)"

git push origin main
```

---

## Troubleshooting

### 💡 Problema: Devs não sabem onde colocar novo arquivo

**Sintoma:**

```
Dev: "criei novo prompt file, onde eu salvo?"
Tech Lead: ...
```

**Solução:**

Crie **árvore de decisão** em `docs/onboarding/onde-colocar.md`:

```markdown
# Onde Colocar Cada Tipo de Arquivo?

## Você criou uma instrução persistente?

- **Sim, é geral (vale para todo o projeto):**
  → `.github/copilot-instructions.md`

- **Sim, é por domínio técnico (API, testes, infra):**
  → `.github/instructions/dominio.md`

## Você criou um comando reutilizável?

- **Sim, é um prompt file:**
  → `.github/prompts/verbo-alvo.prompt.md`

## Você criou uma persona técnica?

- **Sim, é um agent:**
  → `.github/agents/persona.agent.md`

## Você criou uma automação multi-step?

- **Sim, é uma skill:**
  → `.github/skills/dominio-acao.skill.md`

## Você configurou um Droid?

- **Sim, é configuração MCP:**
  → `.vscode/mcp.json`

## Ainda em dúvida?

Pergunte no canal #copilot do Slack.
```

---

### 💡 Problema: Estrutura está sendo ignorada

**Sintoma:**

Estrutura criada há 1 mês, mas:
- Devs continuam criando arquivos fora do padrão
- Ninguém atualiza Holocrons
- Setup de novos devs ainda é manual/oral

**Diagnóstico:**

1. **Falta de comunicação:**
   - Time não sabe que estrutura existe
   - Solução: apresentação no daily/weekly

2. **Falta de enforcement:**
   - Ninguém valida adesão ao padrão
   - Solução: adicionar checklist no PR template

3. **Estrutura não agrega valor percebido:**
   - Devs acham "burocracia"
   - Solução: mostrar métricas de melhoria (PRs mais rápidos, menos retrabalho)

---

### 💡 Problema: Conflito de ownership

**Sintoma:**

```
Bruno e Ana discutindo:
Bruno: "eu sou dono de api.md"
Ana: "não, eu achava que era eu"
```

**Solução:**

Criar **matriz RACI** em `docs/ownership.md`:

```markdown
# Ownership de Artefatos

| Arquivo                        | Responsável (R) | Aprovador (A) | Consultado (C) | Informado (I) |
|--------------------------------|-----------------|---------------|----------------|---------------|
| copilot-instructions.md        | Tech Lead       | Tech Lead     | Time todo      | Time todo     |
| instructions/api.md            | Bruno           | Tech Lead     | Backend squad  | Frontend      |
| instructions/testing.md        | Carla           | Tech Lead     | Time todo      | -             |
| instructions/regras-negocio.md | Ana (PO)        | Tech Lead     | Time todo      | Stakeholders  |
| prompts/*.prompt.md            | Criador         | Tech Lead     | Usuários       | -             |

## Legenda

- **R (Responsible):** quem mantém o arquivo atualizado
- **A (Accountable):** quem aprova mudanças
- **C (Consulted):** quem deve ser consultado antes de mudar
- **I (Informed):** quem deve ser avisado após mudança
```

---

## Exercício Prático

**Missão:** Implementar Código Jedi no seu projeto.

**Tempo estimado:** 4 horas (pode ser dividido em 2 dias)

---

**Dia 1 (2h): Criar Estrutura Base**

1. Crie pastas e arquivos vazios:
   ```bash
   mkdir -p .github/{instructions,prompts,agents,skills}
   mkdir -p docs/onboarding
   touch .github/copilot-instructions.md
   touch docs/onboarding/checklist-padawan.md
   ```

2. Preencha Holocron Principal com:
   - Contexto do projeto (1 parágrafo)
   - Stack técnica (lista)
   - Estrutura de pastas (tree)
   - Links para instruções específicas

3. Identifique 3 domínios técnicos críticos:
   - Exemplo: API, Testing, Infra
   - Crie arquivo vazio para cada: `.github/instructions/dominio.md`

4. Commite estrutura base:
   ```bash
   git add .github/ docs/
   git commit -m "feat: adiciona estrutura base do Código Jedi"
   git push
   ```

---

**Dia 2 (2h): Preencher Conteúdo Essencial**

1. Preencha `.github/instructions/api.md` (ou domínio mais crítico):
   - Framework usado
   - Estrutura de código
   - Padrões de nomenclatura
   - Exemplo completo de arquivo

2. Crie 1 prompt file útil:
   - Identifique comando que time usa com frequência
   - Crie `.github/prompts/comando.prompt.md`
   - Teste invocar: `/run comando.prompt.md`

3. Preencha `docs/onboarding/checklist-padawan.md`:
   - Use template da aula
   - Adapte para stack do projeto

4. Commite conteúdo:
   ```bash
   git add .github/ docs/
   git commit -m "feat: preenche Código Jedi com conteúdo inicial"
   git push
   ```

---

**Validação:**

- [ ] Estrutura de pastas criada e versionada
- [ ] Holocron Principal tem contexto do projeto
- [ ] Pelo menos 1 Holocron por Território preenchido
- [ ] Pelo menos 1 prompt file funcional
- [ ] Checklist de onboarding existe e está completo
- [ ] Time foi comunicado sobre nova estrutura

---

## Recursos Externos

- [GitHub Copilot Custom Instructions Best Practices](https://github.blog/changelog/2024-03-25-github-copilot-custom-instructions/)
- [Repository Structure for AI Context](https://martinfowler.com/articles/patterns-legacy-displacement/repository-structure.html)

---

## Checklist de Validação

Você está pronto para a próxima aula se:

- [ ] Sabe desenhar estrutura padrão completa (.github/ com subpastas instructions, prompts, agents, skills)
- [ ] Entende convenções essenciais (nomes curtos, escopo por domínio, responsabilidade clara, sem duplicação)
- [ ] Consegue criar checklist de setup completo usando template
- [ ] Sabe validar se Código Jedi está funcionando (teste do novo dev, tarefa usando apenas padrão, 3 devs = resultado igual)
- [ ] Conhece matriz de decisão "onde colocar cada arquivo"
- [ ] Sabe resolver conflitos de ownership (matriz RACI)

:::tip 🏆 Treinamento Jedi Completo
Você definiu o Código Jedi do time com estrutura padronizada, convenções claras e checklist de configuração consistentes. Todo novo integrante consegue executar missão real seguindo apenas o padrão compartilhado.
:::
