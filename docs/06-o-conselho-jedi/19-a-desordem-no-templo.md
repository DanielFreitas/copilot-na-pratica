---
title: 19 - A Desordem no Templo
sidebar_position: 19
description: Diagnóstico de inconsistência no uso de IA dentro do time.
---

**Duração estimada:** ~30 min

## Vídeo introdutório

<video controls width="100%" preload="metadata">
	<source src="/copilot-na-pratica/videos/19-a-desordem-no-templo.mp4" type="video/mp4" />
	Seu navegador não suporta vídeo HTML5.
</video>

## O Problema Real: Cada Dev Tem Sua Própria "Verdade"

Time de 5 devs implementando funcionalidades diferentes no mesmo projeto:

**Ana** está criando endpoint de usuários:

```
Ana para Copilot: cria endpoint POST /users

Copilot (sem contexto compartilhado): 
- Supõe Express.js
- Retorna 200 OK
- Validação básica
```

**Bruno** está criando endpoint de pagamentos:

```
Bruno para Copilot: cria endpoint POST /payments

Copilot (com Holocron local do Bruno):
- Usa FastAPI (padrão do projeto)
- Retorna 201 Created
- Validação Pydantic completa
```

**Carla** está criando endpoint de produtos:

```
Carla para Copilot: cria endpoint POST /products

Copilot (com instruções diferentes de Ana e Bruno):
- Usa Flask (outro framework!)
- Retorna 204 No Content
- Sem validação
```

**Resultado na revisão de PR:**

| Dev   | Framework | Status Code | Validação       | Padrão? |
|-------|-----------|-------------|-----------------|---------|
| Ana   | Express   | 200 OK      | Básica          | ❌       |
| Bruno | FastAPI   | 201 Created | Pydantic        | ✅       |
| Carla | Flask     | 204         | Nenhuma         | ❌       |

**Custo:**
- Tech Lead gasta **3 horas** rewriting código de Ana e Carla
- PRs ficam **2 dias** em revisão aguardando ajustes
- Deploy atrasado porque precisa refatorar antes

**Causa raiz:** **não há Holocron compartilhado** — cada dev tem instruções locais diferentes (ou nenhuma).

---

## Sintomas Clássicos de Desordem

### Sintoma 1: Cada Pessoa Usa Instruções Diferentes

**Como identificar:**

```bash
# Listar arquivos .github/copilot-instructions.md de cada branch
git log --all --oneline --source -- .github/copilot-instructions.md

# Comparar conteúdo entre branches
git diff origin/feature-ana:/.github/copilot-instructions.md \
         origin/feature-bruno:/.github/copilot-instructions.md
```

**Sinais de problema:**

- Arquivo `.github/copilot-instructions.md` com conteúdo diferente em cada branch
- Commits conflitantes no mesmo arquivo (múltiplas pessoas editando sem coordenação)
- Histórico mostra que cada dev sobrescreve instruções do outro

**Exemplo real encontrado:**

```markdown
# Branch de Ana
Use Express.js para endpoints.
Retorne sempre 200 OK.

# Branch de Bruno (mesmo arquivo!)
Use FastAPI com Pydantic.
Siga RFC 7231 para status codes (201 para criação).

# Branch de Carla
Não definido (arquivo ausente)
```

---

### Sintoma 2: Ausência de Holocron Compartilhado

**Como identificar:**

```bash
# Verificar se existe estrutura compartilhada
ls .github/instructions/

# Se retornar "not found" → não existe
# Se retornar vazio → existe mas não está sendo usado
```

**Sinais de problema:**

- Pasta `.github/instructions/` não existe
- Pasta existe mas contém apenas 1-2 arquivos genéricos
- Última atualização foi há >3 meses (Holocron Morto)

**O que deveria existir:**

```
.github/
├── copilot-instructions.md          ← Holocron Principal
├── instructions/
│   ├── api.md                        ← Padrão de endpoints
│   ├── testing.md                    ← Padrão de testes
│   ├── infra.md                      ← Deploy e configs
│   └── regras-negocio.md             ← Regras funcionais
```

---

### Sintoma 3: Skills Locais Sem Padrão

**Como identificar:**

```bash
# Cada dev tem pasta local de skills
find ~ -name "*.skill.md" 2>/dev/null

# Resultado:
/Users/ana/Desktop/my-skills/create-endpoint.skill.md
/Users/bruno/Documents/skills-copilot/api-test.skill.md
/Users/carla/Downloads/skill-exemplo.skill.md
```

**Problema:**

- Skills não estão versionadas no repositório
- Cada dev tem versão diferente da mesma skill
- Ninguém sabe quais skills existem no time
- Quando dev sai, leva skills embora

**O que deveria ser:**

```
projeto/
└── .github/
    └── skills/
        ├── api-testing.skill.md       ← Versionado no Git
        ├── api-scaffolding.skill.md   ← Time todo usa
        └── database-migration.skill.md ← Padronizado
```

---

### Sintoma 4: Respostas Variáveis para o Mesmo Problema

**Como identificar:**

Peça para 3 devs executarem a mesma tarefa:

```
Tarefa: crie endpoint GET /users/\{id\}
```

**Respostas do Copilot:**

| Dev   | Resultado                                       | Por Quê?                   |
|-------|-------------------------------------------------|----------------------------|
| Ana   | Express.js, sem autenticação, retorna JSON simples | Sem Holocron               |
| Bruno | FastAPI, JWT middleware, Pydantic response model| Tem Holocron local (bom)   |
| Carla | Flask, retorna 500 se user não existe (errado)  | Tem Holocron local (ruim)  |

**Problema:** mesmo com Copilot, **não há garantia de consistência** entre pessoas.

---

## Custos Reais da Desordem

### Custo 1: Inconsistência Arquitetural

**Exemplo concreto:**

Time implementa módulo de pagamentos ao longo de 2 sprints:

| Sprint | Dev   | Implementou                     | Framework Usado |
|--------|-------|---------------------------------|-----------------|
| 1      | Bruno | POST /payments                  | FastAPI         |
| 1      | Ana   | GET /payments/\{id\}              | Flask           |
| 2      | Carla | POST /payments/refund           | Express (Node!) |
| 2      | Bruno | GET /payments/history           | FastAPI         |

**Resultado:**
- Projeto tem **3 frameworks diferentes** para a mesma API
- Dependências duplicadas (requirements.txt + package.json)
- Deploy complexo (precisa de Python + Node no mesmo container)
- Debugging impossível (cada endpoint se comporta diferente)

**Custo mensurável:**
- **+40% tempo de build** (compilar 2 ambientes)
- **+30% custo de infra** (imagem Docker 2x maior)
- **+2h/semana** de dev resolvendo conflitos de dependências

---

### Custo 2: Bugs por Regra Ausente

**Exemplo:**

Regra de negócio: "Pagamento acima de R$ 5.000 exige aprovação manual".

**Implementação sem Holocron compartilhado:**

```python
# Bruno implementa POST /payments (com regra)
@router.post("/payments")
def create_payment(amount: float):
    if amount > 5000:
        return {"status": "pending_approval"}
    # ... processa pagamento

# Ana implementa POST /payments/refund (sem regra!)
@router.post("/payments/refund")
def refund_payment(payment_id: int):
    # ESQUECEU DE VALIDAR LIMITE
    # Permite reembolso de R$ 10.000 sem aprovação
    return {"status": "refunded"}
```

**Incidente em produção:**

1. Cliente solicita reembolso de R$ 10.000
2. Sistema processa automaticamente (deveria exigir aprovação)
3. Perda de R$ 10.000 não autorizada

**Custo:**
- **R$ 10.000** de perda financeira
- **8 horas** de investigação (postmortem)
- **16 horas** de correção + testes retroativos

**Causa raiz:** regra não estava documentada em Holocron acessível por toda a equipe.

---

### Custo 3: Aumento de Retrabalho

**Ciclo de retrabalho típico:**

```
1. Dev implementa feature (4h)
2. PR aberto para revisão
3. Tech Lead vê que não segue padrão → solicita mudanças (15min)
4. Dev refatora para alinhar (2h)
5. PR revisado novamente
6. Tech Lead encontra outro problema não detectado antes (10min)
7. Dev corrige (1h)
8. PR aprovado (finalmente)

Total: 7h para tarefa de 4h (75% de retrabalho)
```

**Multiplicado por time de 5 devs:**
- 5 PRs/semana com retrabalho = **17,5h/semana perdidas**
- **70h/mês** de desperdício
- **~2 desenvolvedores inteiros** trabalhando só em retrabalho

---

### Custo 4: Revisão de PR Mais Lenta

**Tempo médio de aprovação de PR:**

| Situação                          | Tempo até Aprovação | Por Quê?                                    |
|-----------------------------------|---------------------|---------------------------------------------|
| **Time organizado** (Holocron)    | 4 horas             | Código já vem padronizado, pouco a revisar  |
| **Time desorganizado** (sem Holocron)| 2-3 dias         | Múltiplas rodadas de feedback e correção    |

**Impacto no throughput:**

- Time organizado: **10 PRs/semana** mergeados
- Time desorganizado: **3-4 PRs/semana** mergeados
- Perda de **60% de velocidade** apenas por falta de padrão compartilhado

---

## Método de Diagnóstico

### Passo 1: Mapear Estrutura Atual de `.github/`

**Comando de inventário:**

```bash
# Listar tudo em .github/ recursivamente
tree .github/ -L 3

# Ou no PowerShell:
Get-ChildItem -Path .github -Recurse | Select-Object FullName
```

**O que procurar:**

| Arquivo/Pasta                  | Existe? | Última atualização | Conteúdo útil? |
|--------------------------------|---------|---------------------|----------------|
| `.github/copilot-instructions.md` | ☐    | _____               | ☐              |
| `.github/instructions/`        | ☐       | _____               | ☐              |
| `.github/prompts/`             | ☐       | _____               | ☐              |
| `.github/agents/`              | ☐       | _____               | ☐              |
| `.github/skills/`              | ☐       | _____               | ☐              |

**Exemplo de output problemático:**

```
.github/
└── workflows/
    └── ci.yml

# Resultado: NÃO existe estrutura de instruções Copilot
```

**Exemplo de output saudável:**

```
.github/
├── copilot-instructions.md          ← Atualizado há 2 dias
├── instructions/
│   ├── api.md                        ← Atualizado há 1 semana
│   ├── testing.md                    ← Atualizado há 3 dias
│   └── regras-negocio.md             ← Atualizado há 5 dias
├── prompts/
│   └── create-endpoint.prompt.md     ← Atualizado há 1 semana
└── skills/
    └── api-testing.skill.md          ← Atualizado há 2 semanas
```

---

### Passo 2: Listar Instruções Duplicadas ou Conflitantes

**Comando de busca:**

```bash
# Buscar todos os arquivos que mencionam "padrão de API"
grep -r "padrão de API\|API pattern\|endpoint" .github/ 

# Comparar instruções entre arquivos
diff .github/copilot-instructions.md .github/instructions/api.md
```

**Conflitos comuns encontrados:**

| Arquivo A                         | Diz                          | Arquivo B                 | Diz                        | Conflito? |
|-----------------------------------|------------------------------|---------------------------|----------------------------|-----------|
| `copilot-instructions.md`         | "Use FastAPI"                | `instructions/api.md`     | "Use Flask"                | ✅ SIM     |
| `copilot-instructions.md`         | "Retorne 201 para criação"   | Pergaminho negócio        | "Retorne 200"              | ✅ SIM     |
| `prompts/create-endpoint.prompt.md`| "Validação Pydantic"        | `agents/architect.agent.md`| "Validação manual"        | ✅ SIM     |

**Como resolver:**

1. **Identificar fonte de verdade:** qual arquivo é oficial?
2. **Consolidar:** mover todo o conteúdo para 1 arquivo canônico
3. **Remover duplicatas:** deletar instruções conflitantes
4. **Documentar decisão:** commitar explicando por que escolheu aquela abordagem

---

### Passo 3: Identificar Áreas Sem Padrão

**Checklist de cobertura:**

Seu time tem padrão documentado para:

- [ ] **Estrutura de endpoints** (rotas, verbos HTTP, status codes)
- [ ] **Validação de entrada** (biblioteca, mensagens de erro)
- [ ] **Autenticação/Autorização** (JWT, OAuth, roles)
- [ ] **Testes** (unitário vs integração, cobertura mínima)
- [ ] **Logs** (formato, nível, informações sensíveis)
- [ ] **Tratamento de erro** (exceções customizadas, respostas padronizadas)
- [ ] **Migrations de banco** (ferramenta, nomenclatura, rollback)
- [ ] **Deploy** (CI/CD, ambientes, aprovações)
- [ ] **Documentação** (onde fica, quando atualizar, formato)
- [ ] **Regras de negócio** (limites, validações funcionais)

**Áreas não cobertas = riscos de inconsistência.**

---

### Passo 4: Priorizar Gaps por Impacto

**Matriz de priorização:**

| Gap Identificado                | Frequência de Uso | Custo de Inconsistência | Prioridade |
|---------------------------------|-------------------|-------------------------|------------|
| Padrão de endpoint              | Diária            | Alto (retrabalho)       | 🔴 ALTA     |
| Regras de negócio               | Diária            | Crítico (bugs)          | 🔴 ALTA     |
| Tratamento de erro              | Diária            | Médio (UX ruim)         | 🟡 MÉDIA    |
| Migrations de banco             | Semanal           | Alto (dados corruptos)  | 🔴 ALTA     |
| Logs                            | Diária            | Baixo (debug mais lento)| 🟢 BAIXA    |
| Documentação                    | Semanal           | Médio (onboarding lento)| 🟡 MÉDIA    |

**Regra de priorização:**

```
Prioridade = (Frequência × Custo de Inconsistência) / Esforço de Padronizar

Alta: resolver em 1 sprint
Média: resolver em 2-3 sprints
Baixa: resolver quando houver folga
```

---

## Resultado do Diagnóstico

**Template de relatório:**

```markdown
# Diagnóstico de Desordem no Templo Jedi

**Data:** 16/02/2026  
**Responsável:** Kássia Oliveira (Tech Lead)

## Sintomas Identificados

1. **Inconsistência arquitetural**
   - 3 frameworks diferentes usados para a mesma API
   - Custo estimado: +40% tempo de build

2. **Ausência de Holocron compartilhado**
   - Pasta `.github/instructions/` não existe
   - Cada dev tem instruções locais diferentes

3. **Skills sem versionamento**
   - 8 skills encontradas em pastas locais de devs
   - Nenhuma no repositório

4. **Conflitos de instrução**
   - copilot-instructions.md diz "FastAPI"
   - instructions/api.md (branch antiga) diz "Flask"

## Gaps por Prioridade

### 🔴 Alta (resolver em 1 sprint)
- [ ] Criar Holocron Principal (copilot-instructions.md)
- [ ] Documentar regras de negócio (instructions/regras-negocio.md)
- [ ] Padronizar estrutura de endpoints (instructions/api.md)
- [ ] Resolver conflito FastAPI vs Flask

### 🟡 Média (resolver em 2-3 sprints)
- [ ] Versionar skills compartilhadas (.github/skills/)
- [ ] Documentar padrão de testes (instructions/testing.md)
- [ ] Definir processo de atualização de Holocrons

### 🟢 Baixa (resolver quando houver folga)
- [ ] Padronizar formato de logs
- [ ] Criar templates de documentação

## Custos Estimados da Desordem (atual)

- **Retrabalho:** 70h/mês (~R$ 21.000 em custo de dev)
- **PRs lentos:** 2-3 dias vs 4h ideais
- **Risco de bugs:** 2 incidentes/mês por regra ausente

## Ações Mínimas para Estabilizar

1. Tech lead cria estrutura `.github/instructions/` na próxima semana
2. Time workshop (2h) para definir padrões críticos
3. Cada dev migra 1 skill local para repositório
4. Revisão quinzenal de Holocrons (30min recurring)

## Meta

- **1 mês:** 80% de PRs aprovados sem retrabalho
- **2 meses:** 100% de devs usando Holocrons compartilhados
- **3 meses:** 0 conflitos de instrução detectados
```

---

## Exemplo Completo: Antes vs Depois do Diagnóstico

### Antes

**Estrutura:**

```
projeto/
├── .github/
│   └── workflows/
│       └── ci.yml
└── src/
    └── api/
```

**Sintomas:**
- Ana usa Express
- Bruno usa FastAPI
- Carla usa Flask
- PRs levam 3 dias
- Retrabalho: 70h/mês

---

### Depois (pós-diagnóstico)

**Estrutura:**

```
projeto/
├── .github/
│   ├── copilot-instructions.md           ← Criado
│   ├── instructions/
│   │   ├── api.md                         ← Criado (padrão FastAPI)
│   │   ├── testing.md                     ← Criado
│   │   └── regras-negocio.md              ← Criado
│   ├── prompts/
│   │   └── create-endpoint.prompt.md      ← Migrado
│   └── skills/
│       └── api-testing.skill.md           ← Migrado
└── docs/
    └── diagnostico-desordem-2026-02.md    ← Relatório
```

**Melhorias:**
- 100% do time usa FastAPI (conflito resolvido)
- PRs levam 6 horas (vs 3 dias)
- Retrabalho: 15h/mês (vs 70h/mês)
- **Economia: R$ 16.500/mês** em custo de dev

---

## Troubleshooting

### 💡 Problema: Time resiste a criar padrões compartilhados

**Sintoma:**

```
Tech Lead: vamos criar Holocron compartilhado

Devs: "não precisa, cada um já tem o seu jeito de trabalhar"
```

**Causa:** percepção de que padronizar = perder flexibilidade.

**Solução:**

1. **Mostre custos reais:**
   ```
   "Gastamos 70h/mês em retrabalho = R$ 21.000"
   "Se padronizar, economizamos R$ 16.000/mês"
   ```

2. **Comece pequeno:**
   - Não tente padronizar tudo de uma vez
   - Escolha 1 gap crítico (ex: estrutura de endpoint)
   - Prove valor em 1 sprint
   - Depois expanda

3. **Envolva o time na decisão:**
   - Workshop de 2h para definir padrões juntos
   - Vote em abordagem (FastAPI vs Flask)
   - Documente consenso

---

### 💡 Problema: Gaps são tantos que não sei por onde começar

**Sintoma:** lista com 20+ gaps identificados, paralisia por análise.

**Solução:**

Use regra **80/20**:

```
20% dos gaps causam 80% dos problemas
```

**Como identificar os 20%:**

1. Liste todos os gaps
2. Para cada um, responda:
   - Causa bug em produção? (peso 10)
   - Causa retrabalho diário? (peso 5)
   - Causa PR lento? (peso 3)
3. Ordene por pontuação
4. Escolha top 3

**Exemplo:**

| Gap                     | Causa bug? | Retrabalho? | PR lento? | Total |
|-------------------------|------------|-------------|-----------|-------|
| Regras de negócio       | 10         | 5           | 3         | 18    |
| Padrão de endpoint      | 0          | 5           | 3         | 8     |
| Formato de logs         | 0          | 0           | 0         | 0     |

Foque em: **Regras de negócio** e **Padrão de endpoint**.

---

### 💡 Problema: Diagnóstico está desatualizado

**Sintoma:** relatório de diagnóstico foi feito há 6 meses, situação mudou.

**Solução:**

Agende **diagnóstico recorrente**:

```markdown
# Calendário de Manutenção

- Diagnóstico completo: a cada 6 meses
- Revisão rápida: a cada sprint (30min na retro)
- Atualização ad-hoc: quando incidente grave acontecer
```

**Revisão rápida na retro:**

1. Alguém teve problema de inconsistência esta sprint?
2. Algum gap novo identificado?
3. Algum gap antigo foi resolvido?
4. Atualizar lista de prioridades

---

## Exercício Prático

**Missão:** Faça diagnóstico real do seu projeto.

**Passo 1: Inventário**

```bash
# Execute no seu projeto
tree .github/ -L 3
```

Preencha:

- [ ] Existe `.github/copilot-instructions.md`?
- [ ] Existe `.github/instructions/`?
- [ ] Existem arquivos lá dentro?
- [ ] Última atualização foi há menos de 1 mês?

---

**Passo 2: Teste de Consistência**

Escolha 3 devs do time. Peça para cada um executar:

```
Tarefa: crie endpoint GET /products com validação de autenticação
```

Compare resultados:

| Dev | Framework | Autenticação | Validação | Igual? |
|-----|-----------|--------------|-----------|--------|
| 1   |           |              |           |        |
| 2   |           |              |           |        |
| 3   |           |              |           |        |

Se **não forem iguais** → você tem desordem.

---

**Passo 3: Identificar Top 3 Gaps**

Liste áreas sem padrão:

1. _____________________
2. _____________________
3. _____________________

Use matriz de priorização (frequência × custo).

---

**Passo 4: Criar Relatório**

Use o template da seção "Resultado do Diagnóstico" acima.

---

**Critério de sucesso:**

- [ ] Você tem lista clara de gaps
- [ ] Gaps estão priorizados (alta/média/baixa)
- [ ] Tem estimativa de custo da desordem atual
- [ ] Tem plano de ação para top 3 gaps
- [ ] Relatório está versionado no Git (`docs/diagnostico-desordem-YYYY-MM.md`)

---

## Recursos Externos

- [GitHub Copilot Best Practices for Organizations](https://github.blog/developer-skills/github/how-to-use-github-copilot-an-organizational-guide/)
- [Team Alignment Patterns](https://martinfowler.com/articles/patterns-legacy-displacement/team-alignment.html)

---

## Checklist de Validação

Você está pronto para a próxima aula se:

- [ ] Sabe listar os 4 sintomas clássicos de desordem (instruções diferentes, ausência de Holocron, skills locais, respostas variáveis)
- [ ] Consegue executar diagnóstico completo (mapear estrutura, listar duplicatas, identificar gaps, priorizar)
- [ ] Identifica 3 custos reais mensuráveis da desordem (inconsistência, bugs, retrabalho, PR lento)
- [ ] Sabe usar matriz de priorização (frequência × custo)
- [ ] Consegue criar relatório de diagnóstico siguindo template
- [ ] Entende quando fazer diagnóstico recorrente (a cada 6 meses + revisão em retros)

:::tip 🏆 Treinamento Jedi Completo
Você sabe diagnosticar a desordem no uso de IA e produzir um mapa objetivo de gaps técnicos e operacionais com custos mensuráveis e plano de ação priorizado.
:::
