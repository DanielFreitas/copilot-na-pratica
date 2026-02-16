---
title: 22 - Manual do Padawan
sidebar_position: 22
description: Onboarding de 1 dia com métricas simples de adoção e qualidade.
---

**Duração estimada:** ~30 min

## Vídeo introdutório

<video controls width="100%" preload="metadata">
	<source src="/copilot-na-pratica/videos/22-manual-do-padawan.mp4" type="video/mp4" />
	Seu navegador não suporta vídeo HTML5.
</video>

## O Problema Real: Onboarding Oral Não Escala

**Novo dev (Padawan) entra no time:**

**Onboarding tradicional (sem Manual):**

```
Dia 1:
09h00 - Tech Lead explica stack (30min)
10h00 - Dev sênior mostra estrutura de código (1h)
11h00 - Padawan esquece 80% do que ouviu
14h00 - Padawan pergunta novamente "qual o padrão de API?"
15h00 - Dev sênior repete explicação (20min)
16h00 - Padawan implementa endpoint → faz diferente do padrão
17h00 - Code review → solicita mudanças → Padawan confuso

Dia 2-3:
- Mais perguntas repetidas
- Mais retrabalho
- Dev sênior gasta 4h/dia mentorando

Resultado:
- Padawan levou 1 semana para primeira entrega
- Time perdeu 12h de devs sêniores
- Primeira entrega teve retrabalho (3h)
```

**Total:** ~18 horas de custo de onboarding (Padawan + mentoria).

---

**Onboarding com Manual do Padawan:**

```
Dia 1:
09h00 - Tech Lead: "Leia docs/onboarding/manual-padawan.md e siga checklist"
10h00 - Padawan lê sozinho, configura ambiente
12h00 - Padawan lê Holocrons (api.md, testing.md, regras-negocio.md)
14h00 - Padawan implementa primeira tarefa guiada (seguindo manual)
16h00 - Code review → aprovado com ajustes mínimos
17h00 - Padawan produtivo no primeiro dia

Dia 2:
- Padawan trabalha com autonomia
- Perguntas pontuais (não repetitivas)
- Dev sênior gasta 1h/dia (não 4h)

Resultado:
- Padawan entregou no primeiro dia
- Time gastou 3h de mentoria total (não 12h)
- Primeira entrega com retrabalho mínimo (30min)
```

**Total:** ~4 horas de custo de onboarding (economia de 78%).

---

## Onboarding de 1 Dia

**Meta:** novo dev produtivo em **1 dia útil** (não 1 semana).

### Roteiro Completo

#### Manhã (4h): Setup e Leitura

**09h00 - 10h30: Setup de Ambiente (1h30)**

```markdown
# Checklist de Setup

1. **Ferramentas Base**
   - [ ] VS Code instalado (versão >= 1.85)
   - [ ] Git configurado (SSH ou token)
   - [ ] Node.js LTS instalado
   - [ ] Python 3.13 instalado (ou versão do projeto)
   - [ ] Docker Desktop instalado

2. **Extensões VS Code**
   - [ ] GitHub Copilot
   - [ ] GitHub Copilot Chat
   - [ ] Python (se backend Python)
   - [ ] ESLint (se projeto JS/TS)
   - [ ] Extensões do projeto (ver .vscode/extensions.json)

3. **Repositório**
   - [ ] Clone: `git clone <url>`
   - [ ] Dependências: `npm install` ou `pip install -r requirements.txt`
   - [ ] Banco local: `docker-compose up -d` (se aplicável)
   - [ ] Build inicial: `npm run build` → sucesso ✅

4. **Validação**
   - [ ] Servidor sobe: `npm run dev` → http://localhost:3000 acessível
   - [ ] Testes passam: `npm test` → 0 failures
   - [ ] Copilot ativo: escrever comentário → sugere código
```

**Resultado esperado:** ambiente funcional em 1h30.

---

**10h30 - 12h00: Leitura do Padrão do Time (1h30)**

```markdown
# Roteiro de Leitura

1. **Contexto Geral** (15min)
   - [ ] Leia `.github/copilot-instructions.md`
   - [ ] Entenda: stack, estrutura de pastas, convenções

2. **Padrões Técnicos** (45min)
   - [ ] `.github/instructions/api.md` (se backend)
   - [ ] `.github/instructions/testing.md` (todos)
   - [ ] `.github/instructions/regras-negocio.md` (todos)
   - [ ] `.github/instructions/infra.md` (se trabalha com deploy)

3. **Ferramentas Disponíveis** (20min)
   - [ ] Liste prompt files em `.github/prompts/`
   - [ ] Liste agents em `.github/agents/`
   - [ ] Liste skills em `.github/skills/`
   - [ ] Leia README de pelo menos 1 skill

4. **Droids (MCP)** (10min)
   - [ ] Verifique `.vscode/mcp.json`
   - [ ] Entenda quais Droids estão ativos
   - [ ] Teste consultar 1 Droid: "lista as tabelas do banco"
```

**Resultado esperado:** Padawan sabe onde encontrar padrões e ferramentas.

---

#### Tarde (4h): Prática Guiada

**14h00 - 16h00: Execução de Tarefa Real Guiada (2h)**

**Escolha tarefa de complexidade baixa-média:**

- ✅ Criar endpoint GET /users/\{id\}
- ✅ Adicionar validação de CPF
- ✅ Corrigir bug simples (já diagnosticado)
- ❌ Refatoração complexa (deixar para depois)
- ❌ Feature nova sem especificação clara

---

**Passo-a-passo da tarefa guiada:**

```markdown
# Tarefa: Criar endpoint GET /users/\{id\}

## 1. Consultar Padrão (5min)

- Abra `.github/instructions/api.md`
- Veja: framework (FastAPI), estrutura de pastas, exemplo de código

## 2. Usar Prompt File (10min)

- Invocar: `/run create-endpoint.prompt.md`
- Preencher inputs:
  - method: GET
  - path: /users/\{id\}
- Copilot gera código base

## 3. Revisar Código Gerado (15min)

- Validar aderência ao padrão
- Adicionar docstring
- Conferir tipo de retorno (Pydantic model)

## 4. Consultar Droid (5min)

- Perguntar: "qual o schema da tabela users?"
- Droid PostgreSQL → mostra colunas
- Ajustar código para refletir schema real

## 5. Escrever Testes (30min)

- Consultar `.github/instructions/testing.md`
- Usar skill: `use skill api-testing para endpoint /users/\{id\}`
- Copilot gera testes automáticos
- Rodar: `pytest tests/test_users.py` → deve passar

## 6. Submeter PR (15min)

- Criar branch: `git checkout -b feat/get-user-by-id`
- Commitar: `git commit -m "feat: adiciona GET /users/\{id\}"`
- Push + abrir PR
- Preencher checklist do PR template
```

**Resultado esperado:** PR aberto, testes passando, código aderente ao padrão.

---

**16h00 - 17h00: Revisão com Checklist de Qualidade (1h)**

**Dev sênior revisa PR junto com Padawan:**

```markdown
# Checklist de Revisão (para Padawan aprender)

## Aderência ao Padrão

- [ ] Usa framework correto (FastAPI)?
- [ ] Estrutura de arquivo segue `api/v1/endpoints/`?
- [ ] Pydantic models para request/response?
- [ ] Status code correto (200 para GET)?
- [ ] Docstring presente?

## Qualidade

- [ ] Testes cobrem casos principais?
- [ ] Tratamento de erro (404 se user não existe)?
- [ ] Sem código duplicado?
- [ ] Sem magic numbers (valores hardcoded)?

## Documentação

- [ ] Se mudou API: atualizou `.github/instructions/api.md`? (neste caso: não)
- [ ] Commit message descritivo?
- [ ] PR description explica o quê e por quê?

## Resultado

- ✅ Aprovado com ajustes mínimos
- ⚠️ Aprovado com sugestões não bloqueantes
- ❌ Precisa de mudanças (raro no primeiro dia)
```

**Dev sênior explica cada item e por quê é importante.**

---

**17h00 - 17h30: Registro de Dúvidas e Ajustes (30min)**

```markdown
# Retrospectiva do Primeiro Dia

**O que funcionou bem:**
- Setup foi tranquilo
- Holocrons foram claros
- Prompt file ajudou muito

**O que pode melhorar:**
- Exemplo em api.md estava desatualizado (corrigir)
- Não sabia onde encontrar documentação de Pydantic (adicionar link)

**Dúvidas restantes:**
- Como fazer deploy? (ver amanhã: instructions/infra.md)
- Como debugar com Copilot? (pair programming na próxima sprint)
```

**Tech Lead anota feedback e atualiza Manual se necessário.**

---

## Template Completo: Manual do Padawan

Crie arquivo `docs/onboarding/manual-padawan.md`:

```markdown
# Manual do Padawan — Onboarding em 1 Dia

Bem-vindo ao time! Este manual te guiará no primeiro dia.

---

## ⏰ Cronograma

| Horário        | Atividade                               |
|----------------|-----------------------------------------|
| 09h00 - 10h30  | Setup de ambiente                       |
| 10h30 - 12h00  | Leitura do padrão do time               |
| 12h00 - 14h00  | Almoço                                  |
| 14h00 - 16h00  | Execução de tarefa real guiada          |
| 16h00 - 17h00  | Revisão com checklist de qualidade      |
| 17h00 - 17h30  | Retrospectiva e registro de dúvidas    |

---

## 🎯 Objetivo

Ao final do dia você deve:
- Ter ambiente funcional ✅
- Conhecer padrões do time ✅
- Ter submetido seu primeiro PR ✅
- Saber usar Holocrons, Prompt Files, Agents, Skills ✅

---

## 📋 Checklist de Setup

### 1. Ferramentas Base

- [ ] **VS Code** (versão >= 1.85)
  - Download: https://code.visualstudio.com/
- [ ] **Git** configurado
  - Test: `git --version`
- [ ] **Node.js** LTS
  - Download: https://nodejs.org/
  - Test: `node --version` (>=, 18.x)
- [ ] **Python 3.13**
  - Download: https://www.python.org/downloads/
  - Test: `python --version`
- [ ] **Docker Desktop**
  - Download: https://www.docker.com/products/docker-desktop/
  - Test: `docker --version`

---

### 2. Extensões VS Code

Abra VS Code → Extensions (Ctrl+Shift+X) → instale:

- [ ] **GitHub Copilot** (by GitHub)
- [ ] **GitHub Copilot Chat** (by GitHub)
- [ ] **Python** (by Microsoft) — se projeto Python
- [ ] **ESLint** (by Microsoft) — se projeto JS/TS
- [ ] **Outras extensões** listadas em `.vscode/extensions.json`

---

### 3. Clonar Repositório

```bash
# SSH (recomendado)
git clone git@github.com:sua-org/seu-repo.git

# HTTPS (se não tem SSH configurado)
git clone https://github.com/sua-org/seu-repo.git

cd seu-repo
```

---

### 4. Instalar Dependências

**Se Python:**
```bash
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
.venv\Scripts\activate     # Windows
pip install -r requirements.txt
```

**Se Node:**
```bash
npm install
```

---

### 5. Setup de Banco de Dados

**Se projeto usa Docker:**
```bash
docker-compose up -d
```

**Validar:**
```bash
docker ps  # Deve mostrar container rodando
```

**Se banco local (sem Docker):**
- Siga instruções em `docs/setup/database.md`

---

### 6. Build Inicial

**Python:**
```bash
pytest --collect-only  # Lista testes encontrados
```

**Node:**
```bash
npm run build  # Deve completar sem erros
```

---

### 7. Rodar Servidor Localmente

**Python (FastAPI):**
```bash
uvicorn main:app --reload
```

**Node (Express):**
```bash
npm run dev
```

**Acessar:** http://localhost:3000 (ou porta configurada)

---

### 8. Validar Copilot

1. Abra qualquer arquivo `.py` ou `.js`
2. Escreva comentário:
   ```python
   # Função que retorna lista de usuários ativos
   ```
3. Copilot deve sugerir código
4. Se não sugerir: verificar se extensão está ativa (ícone no canto inferior direito)

---

## 📚 Leitura do Padrão do Time

### Ordem de Leitura

1. **Contexto Geral** (15min)
   - `.github/copilot-instructions.md`

2. **Padrões Técnicos** (45min)
   - `.github/instructions/api.md` (backend)
   - `.github/instructions/testing.md` (todos)
   - `.github/instructions/regras-negocio.md` (todos)

3. **Ferramentas** (20min)
   - Liste arquivos em `.github/prompts/`
   - Liste arquivos em `.github/agents/`
   - Liste arquivos em `.github/skills/`

4. **Droids (se aplicável)** (10min)
   - Abra `.vscode/mcp.json`
   - Teste: pergunte no Copilot Chat "lista as tabelas do banco"

---

## 🛠 Primeira Tarefa Guiada

**Tarefa:** Criar endpoint GET /users/\{id\}

### Passo 1: Consultar Padrão

- Abra `.github/instructions/api.md`
- Encontre seção "Estrutura de Endpoint"
- Veja exemplo de código

---

### Passo 2: Usar Prompt File

No Copilot Chat:
```
/run create-endpoint.prompt.md
```

Preencha:
- method: `GET`
- path: `/users/\{id\}`

Copilot gera código base.

---

### Passo 3: Consultar Droid (Opcional)

```
Você no Chat: mostra o schema da tabela users

Droid PostgreSQL → retorna colunas
```

Ajuste código para usar schema real.

---

### Passo 4: Escrever Testes

Consulte `.github/instructions/testing.md` para padrão.

Ou use skill:
```
use skill api-testing para endpoint /users/\{id\}
```

Copilot gera testes. Rodar:
```bash
pytest tests/test_users.py
```

---

### Passo 5: Submeter PR

```bash
git checkout -b feat/get-user-by-id
git add .
git commit -m "feat: adiciona GET /users/\{id\}"
git push origin feat/get-user-by-id
```

Abra PR no GitHub. Preencha checklist do template.

---

## ✅ Checklist de Revisão

Antes de solicitar review, valide:

- [ ] Código aderente ao padrão (ver `.github/instructions/`)
- [ ] Testes escritos e passando
- [ ] Status code correto (200 para GET)
- [ ] Tratamento de erro (404 se não encontrar)
- [ ] Commit message descritivo
- [ ] PR description preenchida

---

## 🎓 Retrospectiva do Dia

Ao final, registre em `seu-nome-retro-dia1.md`:

**O que funcionou bem:**
- ...

**O que pode melhorar:**
- ...

**Dúvidas restantes:**
- ...

Compartilhe com Tech Lead para ajustes futuros.

---

## 📞 Contatos

**Dúvidas técnicas:** @techlead  
**Dúvidas de processo:** @scrum-master  
**Acesso/permissões:** @it-support  

**Canal Slack:** #dev-team  
**Canal Copilot:** #copilot-help  

---

## 🏆 Meta do Primeiro Dia

Conseguir concluir uma entrega real com padrão e autonomia básica.

**Sucesso:** PR aprovado com ajustes mínimos.
```

---

## Métricas Simples de Adoção e Qualidade

**Governança precisa de métricas para saber se está funcionando.**

### Métrica 1: Uso de Prompts e Skills

**O que medir:**

```
Quantas vezes prompts/skills foram usados nesta semana?
```

**Como coletar:**

```bash
# Contar invocações em logs do Copilot (se disponível)
# Ou perguntar na retro: "quem usou prompt file esta semana?"
```

**Meta:**
- **Mês 1:** 20% do time usa pelo menos 1x/semana
- **Mês 3:** 80% do time usa pelo menos 3x/semana
- **Mês 6:** 100% do time usa diariamente

---

### Métrica 2: Taxa de PR Aprovado Sem Retrabalho Grande

**O que medir:**

```
Quantos PRs foram aprovados na primeira revisão (sem solicitar mudanças grandes)?
```

**Como coletar:**

```
1. Listar PRs mergeados na última semana
2. Para cada PR, contar rodadas de review:
   - 1 rodada = aprovado sem retrabalho ✅
   - 2+ rodadas = teve retrabalho ⚠️
3. Calcular taxa

Taxa = (PRs aprovados na 1ª rodada / Total de PRs) × 100%
```

**Meta:**
- **Sem Manual:** ~40% aprovados na 1ª rodada
- **Com Manual:** ~80% aprovados na 1ª rodada

---

### Métrica 3: Consistência de Padrão Entre PRs

**O que medir:**

```
3 devs fazem mesma tarefa → resultados são similares?
```

**Como coletar:**

```
Teste trimestral:
1. Escolha 3 devs aleatórios
2. Tarefa: criar endpoint POST /products
3. Compare resultados:
   - Framework usado (igual?)
   - Estrutura de arquivo (igual?)
   - Validação (igual?)
   - Testes (igual?)

Se 80%+ das decisões são iguais → padrão está sendo seguido ✅
```

**Meta:**
- **Sem Manual:** ~50% de consistência
- **Com Manual:** ~85% de consistência

---

### Métrica 4: Tempo Médio de Execução por Tipo de Tarefa

**O que medir:**

```
Quanto tempo leva para implementar tarefas comuns?
```

**Como coletar:**

```
Rastrear tempo (via Jira/Linear/Notion):
- Criar CRUD básico: ___h
- Adicionar endpoint REST: ___h
- Escrever testes para módulo: ___h
- Corrigir bug simples: ___h
```

**Meta:**

| Tarefa                    | Sem Manual | Com Manual | Melhoria |
|---------------------------|-----------|-----------|----------|
| CRUD básico               | 8h        | 4h        | -50%     |
| Adicionar endpoint        | 2h        | 1h        | -50%     |
| Escrever testes           | 3h        | 1.5h      | -50%     |
| Corrigir bug simples      | 1h        | 0.5h      | -50%     |

---

### Métrica 5: Net Promoter Score (NPS) Interno

**O que medir:**

```
Devs recomendariam o Manual do Padawan para novos colegas?
```

**Como coletar:**

Pesquisa trimestral (anônima):

```
Em uma escala de 0-10, quanto você recomendaria o Manual do Padawan 
para novos desenvolvedores entrando no time?

0 = não recomendaria
10 = recomendaria fortemente
```

**Cálculo de NPS:**

```
Promotores (9-10) = X%
Neutros (7-8) = Y%
Detratores (0-6) = Z%

NPS = % Promotores - % Detratores
```

**Meta:**
- **NPS > 50:** Manual é bem avaliado
- **NPS > 70:** Manual é excelente

---

## Resultado Esperado

**Novo integrante produtivo no primeiro dia, sem depender de transmissão oral de contexto.**

### Como Validar

**Teste prático:**

```
Novo dev entra → recebe apenas link para Manual do Padawan

Observar (sem interferir):
- Conseguiu configurar ambiente sozinho?
- Conseguiu encontrar padrões?
- Conseguiu implementar primeira tarefa?
- PR foi aprovado sem retrabalho grande?

Se respondeu "sim" a 4/4 → Manual funciona ✅
```

---

### Indicadores de Sucesso

| Indicador                                         | Meta           |
|---------------------------------------------------|----------------|
| Tempo de setup de ambiente                        | < 2h           |
| Primeiro PR submetido                             | Dia 1          |
| Primeiro PR aprovado                              | Dia 1 ou 2     |
| Autonomia básica (trabalha sem perguntar tudo)    | Dia 2          |
| Uso de Holocrons/Prompt Files                     | Diário         |
| NPS do Manual                                     | > 70           |

---

## Troubleshooting

### 💡 Problema: Padawan não leu o Manual

**Sintoma:**

```
Padawan pergunta: "qual o framework que a gente usa?"

Tech Lead: "está no Manual, você leu?"

Padawan: "não, achei muito longo"
```

**Solução:**

**1. Reduzir tamanho do Manual:**
- Manter apenas essencial no dia 1
- Criar "Manual Estendido" para semana 2+

**2. Tornar leitura obrigatória:**
```
Tech Lead: "Primeiro dia é só setup + leitura. 
Amanhã você implementa tarefa real."
```

**3. Gamificar:**
```
Checklist com progresso visual:
✅ Setup (1/4)
✅ Leitura de Holocrons (2/4)
⬜ Primeira tarefa (3/4)
⬜ PR aprovado (4/4)
```

---

### 💡 Problema: Manual está desatualizado

**Sintoma:**

```
Padawan: "Manual diz para usar Flask, mas Holocron diz FastAPI"
```

**Solução:**

**1. Adicionar Manual à lista de Holocrons com ownership:**

```markdown
# docs/ownership.md

| Arquivo                    | Dono      |
|----------------------------|-----------|
| manual-padawan.md          | Tech Lead |
```

**2. Trigger de atualização:**

```
Sempre que mudar stack/framework/estrutura → atualizar Manual
```

**3. Revisão trimestral:**

```
A cada 3 meses:
1. Novo dev faz onboarding usando Manual
2. Anota problemas/desatualizações
3. Tech Lead atualiza
```

---

### 💡 Problema: Tarefa guiada é muito difícil

**Sintoma:**

```
Padawan não consegue completar primeira tarefa no dia 1
Fica frustrado, leva 2-3 dias
```

**Solução:**

**Escolher tarefa mais simples:**

| Complexidade | Exemplo                                  | Adequado Dia 1? |
|--------------|------------------------------------------|-----------------|
| ⭐ Trivial    | Corrigir typo em docstring               | ❌ Muito simples |
| ⭐⭐ Baixa     | Criar endpoint GET (sem regra complexa)  | ✅ Ideal         |
| ⭐⭐⭐ Média   | Adicionar validação de CPF               | ⚠️ Depende       |
| ⭐⭐⭐⭐ Alta   | Refatorar arquitetura                    | ❌ Muito difícil |

**Recomendação:** tarefas ⭐⭐ no dia 1, ⭐⭐⭐ na primeira semana.

---

## Exercício Prático

**Missão:** Criar Manual do Padawan do zero.

**Tempo estimado:** 3 horas

---

**Passo 1: Definir Cronograma do Dia (30min)**

1. Liste atividades essenciais para primeiro dia
2. Estime tempo de cada atividade
3. Monte cronograma (use template desta aula)

---

**Passo 2: Criar Checklist de Setup (45min)**

1. Liste todas as ferramentas necessárias
2. Para cada ferramenta:
   - Link de download
   - Comando de validação (`--version`)
3. Adicione dependências do projeto
4. Adicione validação final (servidor subindo)

---

**Passo 3: Definir Tarefa Guiada (30min)**

1. Escolha tarefa de complexidade ⭐⭐:
   - Criar endpoint simples
   - Corrigir bug pequeno
   - Adicionar validação básica

2. Escreva passo-a-passo detalhado:
   - Onde consultar padrão
   - Qual prompt file usar
   - Como escrever testes
   - Como submeter PR

---

**Passo 4: Criar Arquivo docs/onboarding/manual-padawan.md (1h)**

Use template completo desta aula. Adapte:
- Stack do projeto
- Estrutura de pastas
- Ferramentas específicas
- Droids configurados

---

**Passo 5: Validar com Próximo Onboarding (prática real)**

1. Aguardar próximo dev entrar
2. Dar apenas link para Manual
3. Observar sem interferir
4. Anotar problemas/dúvidas
5. Atualizar Manual com feedback

---

**Critério de sucesso:**

- [ ] Manual completo criado e versionado
- [ ] Cronograma do dia definido
- [ ] Checklist de setup validado (testou com sua própria máquina limpa?)
- [ ] Tarefa guiada escolhida (complexidade adequada)
- [ ] Template preenchido com informações do projeto
- [ ] Próximo onboarding usou Manual (validação real)

---

## Recursos Externos

- [The First 90 Days (livro sobre onboarding)](https://www.amazon.com/First-90-Days-Strategies-Expanded/dp/1422188612)
- [GitLab Onboarding Template](https://about.gitlab.com/handbook/people-group/general-onboarding/)
- [Onboarding Metrics That Matter](https://www.cultureamp.com/blog/onboarding-metrics)

---

## Checklist de Validação

Você está pronto para a próxima módulo se:

- [ ] Sabe estruturar onboarding de 1 dia (manhã: setup + leitura, tarde: prática guiada)
- [ ] Consegue criar checklist de setup completo (ferramentas, extensões, build, validação)
- [ ] Sabe escolher tarefa guiada de complexidade adequada (⭐⭐ para dia 1)
- [ ] Conhece 5 métricas de adoção (uso de prompts, taxa de aprovação, consistência, tempo de execução, NPS)
- [ ] Sabe como validar se Manual funciona (teste prático com novo dev)
- [ ] Consegue resolver problemas comuns (Manual não lido, desatualizado, tarefa muito difícil)

:::tip 🏆 Treinamento Jedi Completo
Você estruturou um Manual do Padawan com onboarding objetivo de 1 dia e métricas práticas de evolução. Novo integrante é produtivo no primeiro dia, sem depender de transmissão oral de contexto.
:::
