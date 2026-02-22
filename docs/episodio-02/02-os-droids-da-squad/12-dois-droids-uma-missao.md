---
title: 12 - Dois Droids, Uma Missão
sidebar_position: 12
description: Como orquestrar GitLab MCP e Confluence MCP na mesma sessão de Agent Mode — do DISCOVERY.md ao spike publicado com uma única instrução.
---

> *"Um Droid sozinho é ferramenta. Dois Droids em harmonia são sistema."*

**Duração estimada:** ~40 min

## Vídeo introdutório

<video controls width="100%" preload="metadata">
	<source src="/copilot-na-pratica/videos/12-dois-droids-uma-missao.mp4" type="video/mp4" />
	Seu navegador não suporta vídeo HTML5.
</video>

## O Problema Real: Orquestração Manual entre Ferramentas

Antes da orquestração automática, o fluxo manual tinha 6 etapas ativas:

```
1. Abrir DISCOVERY.md e ler os repos listados        [você]
2. Abrir GitLab, navegar, ler código                 [você]
3. Coletar notas e contexto relevante                [você]
4. Escrever o spike com base nas notas               [Copilot + você]
5. Abrir Confluence, criar página, colar conteúdo    [você]
6. Copiar URL e registrar no ticket e DISCOVERY.md   [você]
```

Etapas 1, 2, 3, 5 e parte da 6 são trabalho de movimentação de contexto — não de raciocínio. São exatamente as etapas que os Droids devem executar.

Com orquestração:

```
1. você: "Com base no DISCOVERY.md, analise os repos, gere o spike e publique."
─────────────────────────────────────────────────────────────────────────────────
2. agente lê DISCOVERY.md                            [automático]
3. agente chama Droid GitLab → analisa cada repo     [automático]
4. agente gera spike com contexto real               [automático]
5. agente chama Droid Confluence → publica           [automático]
6. agente retorna a URL                              [automático]
─────────────────────────────────────────────────────────────────────────────────
7. você: valida o resultado e registra a URL         [você — 2 minutos]
```

## Como o Agente Infere a Sequência

Quando você dá uma instrução de alto nível com múltiplas ferramentas envolvidas, o agente determina a sequência baseado em **dependências de dados**:

```
Instrução: "Analise os repos, gere o spike, publique no Confluence"
      ↓
Agente raciocina:
  - Para publicar o spike, preciso do spike pronto
  - Para gerar o spike, preciso do contexto dos repos
  - Para ter contexto dos repos, preciso analisar via GitLab
  - Para analisar via GitLab, preciso da lista de repos no DISCOVERY.md
  ↓
Sequência inferida:
  1. Ler DISCOVERY.md → extrair lista de repos
  2. Chamar Droid GitLab → analisar cada repo
  3. Gerar spike com contexto coletado
  4. Chamar Droid Confluence → publicar spike
  5. Retornar URL
```

Essa inferência de dependências é a razão pela qual instruções de alto nível funcionam. O agente não precisa que você diga "primeiro faça A, depois B, depois C" — ele deduz a ordem correta.

## Demo Completo: Do DISCOVERY.md Ao Spike Publicado

Demanda: Cobrança Recorrente (continuação da Aula 8).

**`DISCOVERY.md` ao final do discovery:**
```markdown
# DISCOVERY — Cobrança Recorrente de Assinaturas
...
## Repositórios para Analisar
- [ ] `squad-pagamentos/billing-service` — padrão de cobrança existente
- [ ] `squad-pagamentos/notification-service` — padrão de job com retry
- [ ] `plataforma/scheduler-service` — orquestração de jobs
```

**Instrução ao agente:**

```
#file:DISCOVERY.md

Execute o fluxo completo de análise e geração de spike:

1. Analise cada repositório listado em "Repositórios para Analisar":
   - Mapeie endpoints relevantes para cobrança
   - Identifique padrão de retry se existir
   - Note a versão de empresa-scheduler usada

2. Gere o spike completo seguindo o spike-template.md:
   - As-Is: situação atual baseada nos repos analisados
   - To-Be: proposta técnica para cobrança recorrente
   - Análise Técnica: APIs, dependências, riscos
   - Decisões Técnicas: baseadas no contexto real coletado
   - Tarefas de Backlog: 6-8 tarefas acionáveis

3. Publique no Confluence seguindo as instruções do squad style guide.

4. Retorne a URL da página publicada.
```

**Execução do agente:**

```
[1/5] Lendo DISCOVERY.md...
      → 3 repositórios identificados, 4 pendências 🔍

[2/5] Analisando repositórios via Droid GitLab...
      → Chamando: mapear_endpoints("squad-pagamentos/billing-service")
        Resultado: 8 endpoints, incluindo POST /pagamentos e GET /pagamentos/{id}
      → Chamando: ler_arquivo("squad-pagamentos/notification-service",
                              "app/jobs/notification_job.py")
        Resultado: retry com backoff exponencial, max 3 tentativas, intervalo 24h
      → Chamando: ler_arquivo("plataforma/scheduler-service", "app/api/v1/jobs.py")
        Resultado: POST /jobs/{type}/schedule, cron expression ou intervalo em minutos
      → Chamando: buscar_uso_de_lib("empresa-scheduler")
        Resultado: 3 repos usando v2.1.0, 1 usando v1.9.0

[3/5] Gerando spike...
      [spike completo gerado com 847 palavras, 6 tarefas de backlog]

[4/5] Publicando no Confluence via Droid Confluence...
      → Chamando: confluence_create_page(
          space_key="~ENGPAG",
          parent_title="Spikes",
          title="[SPIKE] Cobrança Recorrente de Assinaturas",
          content=[spike]
        )
        Resultado: página criada

[5/5] Pronto.
      URL: https://empresa.atlassian.net/wiki/spaces/ENGPAG/pages/887922441
```

**Você fez:** escrever uma instrução e validar o resultado.
**Os Droids fizeram:** 5 chamadas de ferramenta, análise de 3 repos, geração de spike, publicação.

## O Que Fazer Quando o Agente Toma uma Decisão Errada na Orquestração

Em algum momento, o agente vai errar. Exemplos comuns:

**Erro 1: Analisou o repo errado**
```
Agente leu billing-service/app/main.py mas a lógica real está em
billing-service/app/services/billing.py

# Correção:
"O arquivo correto para a lógica de cobrança é app/services/billing.py.
Leia esse arquivo e atualize a seção As-Is do spike."
```

**Erro 2: Spike genérico (contexto do GitLab não foi suficiente)**
```
Spike gerado não menciona o retry pattern do notification-service

# Correção:
"O spike está genérico na seção de retry. O notification-service usa
backoff exponencial com max 3 tentativas (você leu isso em notification_job.py).
Atualize a seção Análise Técnica com esse padrão específico."
```

**Erro 3: Publicou no espaço errado**
```
Spike publicado em "Espaço Pessoal > Daniel" em vez de "Engineering > Squad > Spikes"

# Correção:
"A página foi publicada no espaço errado. Exclua-a e republique em
Engineering > Squad Pagamentos > Spikes, space_key ~ENGPAG."
```

A regra: **corrija a etapa específica**, nunca reinicie o fluxo inteiro. O contexto coletado nas etapas anteriores é valioso — não descarte.

## Orquestração vs Execução Sequencial Manual

```
┌────────────────────────────┬────────────────────────────────────────┐
│  Execução Manual           │  Orquestração com 2 Droids             │
├────────────────────────────┼────────────────────────────────────────┤
│  ~45 min trabalho ativo    │  ~2 min de validação                   │
│  Abre browser 3x           │  Zero browser                          │
│  Copia-cola entre apps     │  Zero copia-cola                       │
│  Erro de espaço frequente  │  Erro nunca (instrução fixa)           │
│  Template esquecido às vezes│ Template sempre (instrução fixa)      │
│  URL raramente registrada  │  URL sempre retornada                  │
└────────────────────────────┴────────────────────────────────────────┘
```

## Exercício Prático

**Missão:** Executar o fluxo completo de orquestração.

1. Use o `DISCOVERY.md` de uma demanda real (pode ser a da Aula 8 ou criar uma nova).
2. Garanta que os dois Droids estão ativos no Agent Mode.
3. Execute o fluxo com uma única instrução:
   ```
   #file:DISCOVERY.md
   
   Execute o fluxo completo: analise os repositórios listados via Droid GitLab,
   gere o spike no template padrão e publique no Confluence.
   Retorne a URL da página criada.
   ```
4. Quando o agente terminar, verifique:

| Verificação | Status |
|---|---|
| URL retornada e acessível | |
| Spike publicado no espaço correto | |
| Título no formato `[SPIKE] ...` | |
| As-Is com dados reais dos repos | |
| Tarefas de backlog geradas | |

5. Se alguma etapa falhou, aplique a correção cirúrgica e documente o que ajustou.

**Critério de sucesso:** fluxo executado com uma única instrução + spike publicado e verificado.

## Troubleshooting

### 💡 Problema: O agente completa o GitLab mas não publica no Confluence

**Causa:** instrução ambígua sobre a publicação ou Droid Confluence não estava ativo quando a sessão iniciou.

**Solução:**
1. Verifique se o Droid Confluence aparece nas ferramentas ativas (ícone de ferramentas no Agent Mode)
2. Se necessário, reative explicitamente: feche e reabra a sessão de Agent Mode
3. Torne a instrução de publicação mais explícita:
   ```
   "...e use a ferramenta confluence_create_page para publicar no Confluence."
   ```

### 💡 Problema: O agente para no meio e pede confirmação entre as etapas

**Causa:** configuração do Agent Mode pede confirmação antes de operações de escrita.

**Solução:**
Isso é comportamento correto e desejável para publicação no Confluence — escrever numa wiki corporativa é uma operação com impacto. Confirme quando o agente parar antes de publicar. Se quiser que o agente publique sem confirmação, isso exige alteração de configuração que varia por versão do Copilot.

:::tip 🏆 Treinamento Jedi Completo
Você está pronto para a próxima aula se:

- [ ] Executei o fluxo completo com uma única instrução: DISCOVERY.md → análise GitLab → spike → Confluence
- [ ] O spike publicado tem dados reais coletados dos repos (não genérico)
- [ ] Sei o que fazer quando o agente erra numa etapa (corrijo aquela etapa, não reinicio tudo)
- [ ] Entendo por que o agente infere a sequência correta de chamadas automaticamente
:::

---

O Capítulo 2 está completo. Os Droids estão operacionais, integrados e orquestrando juntos. O que eles produzem — o spike — é o próximo elo da cadeia. Na **Aula 13 — A Anatomia do Spike Perfeito**, você vai definir o template padrão que garante que toda squad gere spikes com qualidade consistente. Porque um spike ruim é pior que nenhum spike: ele cria a ilusão de que o contexto foi documentado quando na verdade não foi.


