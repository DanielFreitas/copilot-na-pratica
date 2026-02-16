---
title: 12 - Arquivos da Aliança
sidebar_position: 12
description: Processo manual para transformar conhecimento disperso do time em contexto útil no repositório.
---

> *"O conhecimento do time estava espalhado pela galáxia. Hora de reunir nos Arquivos da Aliança."*

**Duração estimada:** ~30 min

## Vídeo introdutório

<video controls width="100%" preload="metadata">
	<source src="/copilot-na-pratica/videos/12-arquivos-da-alianca.mp4" type="video/mp4" />
	Seu navegador não suporta vídeo HTML5.
</video>

## Pré-requisitos obrigatórios

Esta aula complementa os **Pergaminhos do Domínio** (aula 07). Enquanto aquela aula ensinou **o formato** de documentar regras, esta aula ensina **o processo** de extrair conhecimento disperso e transformá-lo em documentação utilizável.

## O Problema Real: Conhecimento na Cabeça das Pessoas

Analise este diálogo comum em times de desenvolvimento:

```
Desenvolvedor novo: "Qual o limite de desconto para cliente Gold?"

Tech Lead: "Ah, isso mudou mês passado. A Joana sabe, pergunta pra ela."

Joana: "Era 30% mas o comercial pediu 25%. Tá num email que mandei... deixa eu achar..."
[15 minutos depois]
Joana: "Achei! 25% mas só para compras acima de R$ 500."

Desenvolvedor: "E pra compras abaixo?"
Joana: "Aí é 20%... ou 15%? Melhor confirmar com o product."
```

❌ **Problemas desse cenário:**
- Desenvolvedor perdeu **30+ minutos** buscando informação
- Regra não está documentada em lugar oficial
- Dependência de pessoas específicas (gargalo)
- Risco de implementar errado (memória falha)
- Copilot não pode ajudar (informação inacessível)

**Arquivos da Aliança** resolvem isso criando um **processo de migração** de conhecimento disperso (wiki, chat, email, memória) para **arquivos Markdown versionados** no repositório.

## 🗺️ Mapeando Fontes de Conhecimento Disperso

Primeiro, identifique ONDE o conhecimento do seu projeto está escondido:

| Fonte | Exemplo de Conteúdo | Problema | Solução |
|-------|---------------------|----------|---------|
| **Wiki corporativa** | Fluxos de aprovação, regras de negócio | Desatualizada, fora do repo | Migrar para `docs/business-rules/` |
| **Slack/Teams** | Decisões em threads, exceções de regras | Não buscável após 90 dias | Extrair decisões oficiais e documentar |
| **Email** | Especificações, mudanças de requisito | Privado, não versionado | Criar Pergaminhos baseados nos emails |
| **Google Docs** | Documentos de design, PRDs | Fora do Git, sem histórico confiável | Converter para Markdown versionado |
| **Memória do time** | "A gente sempre faz assim..." | Conhecimento oral, não compartilhável | Entrevistar e documentar |
| **Código-fonte** | Comentários inline, docstrings | Espalhado, sem visão consolidada | Extrair em docs centralizados quando necessário |

## 📋 Processo de Unificação: 5 Passos Práticos

### Passo 1: Localizar Fonte Oficial

**Fonte oficial** = origem validada onde a informação é **autoritativa** (tem um responsável que valida se está correto).

**Como identificar:**
```
Perguntas para fazer:
- Quem é o dono dessa regra? (Product Owner, Tech Lead, Especialista de Domínio)
- Onde essa informação foi oficialmente decidida? (reunião, doc, ticket)
- Essa regra já mudou antes? (histórico de alterações)
- Tem alguém que pode validar se isso está correto? (validador)
```

**Exemplos:**

| Regra | Fonte Oficial | Validador |
|-------|---------------|-----------|
| Limite de desconto por tier | Documento comercial aprovado | Gerente Comercial |
| Fluxo de pagamento | PRD do produto "Checkout v2" | Product Owner |
| Validação de CPF | RFC técnico em ticket JIRA-123 | Tech Lead Backend |
| Política de retenção de dados | Documento jurídico/LGPD | DPO (Data Protection Officer) |

❌ **Não são fontes oficiais:**
- Comentário casual no Slack ("acho que era 20%...")
- Código legacy sem documentação (pode estar bugado)
- Memória de desenvolvedor que saiu da empresa

### Passo 2: Extrair Apenas Regra Estável e Verificável

**Regra estável** = não muda toda semana (muda no máximo mensalmente)  
**Regra verificável** = pode ser testada objetivamente (não é subjetiva)

**Checklist de extração:**

#### ✅ O que INCLUIR:
- **Validações com valores específicos:**  
  `"Desconto máximo: 25% para compras > R$ 500, caso contrário 15%"`
  
- **Fluxos com passos numerados:**  
  `"1. Validar pagamento 2. Reservar estoque 3. Confirmar pedido"`
  
- **Exceções de negócio documentadas:**  
  `"Cliente com pedido em atraso: bloquear novo pedido"`
  
- **Definições de campos obrigatórios:**  
  `"Pedido precisa: customer_id, items (min 1), payment_method"`

#### ❌ O que EXCLUIR:
- **Informação volátil:**  
  `"Na sprint atual estamos testando nova taxa de conversão"` → Muda toda sprint
  
- **Decisões temporárias:**  
  `"Por enquanto vamos usar limite de 10%"` → Não é estável
  
- **Conversas sem conclusão:**  
  Thread do Slack com 50 mensagens mas sem decisão final
  
- **Informação sem dono:**  
  Regra que ninguém consegue validar se está correta

### Passo 3: Padronizar Linguagem Técnica

Transforme linguagem informal/ambígua em linguagem técnica precisa.

**Antes/Depois:**

| ❌ Texto Original (Ambíguo) | ✅ Texto Padronizado (Preciso) |
|------------------------------|--------------------------------|
| "Cliente bom tem desconto maior" | "Cliente tier Gold: desconto máximo 30%; tier Silver: 20%; tier Bronze: 10%" |
| "Se o pedido for grande, libera frete grátis" | "Pedidos com subtotal >= R$ 200,00: frete gratuito" |
| "Validar que o CPF tá certo" | "Validar CPF: 11 dígitos numéricos, algoritmo de dígito verificador conforme Receita Federal" |
| "Cliente que não paga fica bloqueado" | "Cliente com fatura vencida > 30 dias: status = 'bloqueado', não pode criar novos pedidos" |

**Regras de padronização:**
- Use **valores numéricos exatos** (não "alto", "baixo", "muito")
- Use **tipos de dados** (string, int, boolean, decimal)
- Use **operadores precisos** (>=, >, ==, !=, IN)
- Use **nomes de campos reais** do sistema (customer_id, payment_method)
- Use **enums/constantes** quando aplicável ("status": "ativo" | "bloqueado" | "pendente")

### Passo 4: Salvar em Local Apropriado

Organize documentação em estrutura padronizada:

```
docs/
  business-rules/          ← Regras de negócio (validações, fluxos, políticas)
    pedido-validacao.md
    cliente-desconto.md
    pagamento-fluxo.md
    
  architecture/            ← Decisões arquiteturais (ADRs)
    adr-001-escolha-fastapi.md
    adr-002-banco-postgres.md
    
  api/                     ← Documentação de endpoints (se não usar OpenAPI)
    endpoints-pedido.md
    endpoints-cliente.md
    
  processes/               ← Processos do time (como fazer deploy, code review)
    como-fazer-deploy.md
    checklist-code-review.md
    
  glossary/                ← Definições de termos do domínio
    termos-negocio.md
```

**Regra de nomenclatura:**
- Use kebab-case: `pedido-validacao.md` (não `PedidoValidacao.md` ou `pedido_validacao.md`)
- Seja descritivo: `cliente-desconto-por-tier.md` (não `regra1.md`)
- Use prefixo quando relevante: `adr-001-...` para ADRs (Architecture Decision Records = registros de decisões arquiteturais)

### Passo 5: Revisar com Dono do Domínio

**Dono do domínio** = pessoa responsável por validar que a regra está correta (Product Owner, especialista de negócio, Tech Lead).

**Checklist de revisão:**

```markdown
## Checklist de Validação do Arquivo da Aliança

[ ] **Correção:** Regra reflete comportamento atual do sistema?
[ ] **Completude:** Todos edge cases importantes estão cobertos?
[ ] **Clareza:** Pessoa nova no time conseguiria implementar baseado nesse doc?
[ ] **Versionamento:** Histórico de mudanças está rastreável (commits Git)?
[ ] **Responsabilidade:** Está claro quem é o dono dessa regra?
[ ] **Testabilidade:** Regra pode ser validada em testes automatizados?
```

**Exemplo de revisão:**

```markdown
# docs/business-rules/pedido-desconto.md

---
owner: João Silva (Product Owner)
last_updated: 2024-01-15
reviewed_by: Maria Santos (Tech Lead)
---

# Regra de Negócio — Desconto de Pedido por Tier

## Objetivo
Aplicar desconto diferenciado conforme categoria do cliente.

## Regra
| Tier do Cliente | Desconto Máximo | Desconto Padrão Sugerido |
|-----------------|-----------------|--------------------------|
| Gold            | 30%             | 25%                      |
| Silver          | 20%             | 15%                      |
| Bronze          | 10%             | 5%                       |
| Sem tier        | 0%              | 0%                       |

## Validações
- Desconto solicitado > máximo para tier → Rejeitar com HTTP 400
- Cliente sem tier tentando usar desconto → Rejeitar com HTTP 403
- Desconto negativo ou > 100% → Rejeitar com HTTP 400

## Edge Cases
### Cliente mudou de tier APÓS criar carrinho
**Comportamento:** Usar tier no momento da finalização (não do início do carrinho)

### Promoções temporárias acumulam com desconto de tier?
**Não.** Aplicar apenas o MAIOR entre desconto de tier e desconto de promoção.

## Histórico
- 2024-01-15: João Silva - Criação inicial
- 2024-01-20: Maria Santos - Adicionou edge case de mudança de tier
```

**Após aprovação do dono, committar:**
```bash
git add docs/business-rules/pedido-desconto.md
git commit -m "docs: adiciona regra de desconto por tier de cliente

Validado por: João Silva (PO)
Reviewed-by: Maria Santos (Tech Lead)"
```

## 🎯 O Que Entra vs O Que Não Entra

### ✅ ENTRA nos Arquivos da Aliança:

**1. Regras de validação com valores específicos**
```markdown
## Validação de Senha
- Mínimo: 8 caracteres
- Máximo: 128 caracteres
- Obrigatório: 1 maiúscula, 1 minúscula, 1 número, 1 símbolo
- Proibido: senhas comuns (lista: top 10000 senhas vazadas)
```

**2. Fluxos críticos passo a passo**
```markdown
## Fluxo de Estorno de Pagamento
1. Cliente solicita estorno (máximo 7 dias após compra)
2. Sistema verifica elegibilidade (produto não usado, nota fiscal válida)
3. Aprovação automática se valor < R$ 100, manual se > R$ 100
4. Crédito em conta em 2-5 dias úteis
```

**3. Exceções de negócio documentadas**
```markdown
## Exceções de Limite de Pedido
- Cliente Gold SEM limite de pedido (qualquer valor)
- Cliente Bronze: limite R$ 1.000 por pedido
- Cliente novo (< 30 dias): limite R$ 500 primeiro pedido
```

**4. Definições funcionais recorrentes**
```markdown
## Definição de "Cliente Ativo"
Cliente é considerado ativo se:
- Fez pelo menos 1 compra nos últimos 90 dias OU
- Acessou plataforma nos últimos 30 dias OU
- Tem assinatura premium ativa
```

### ❌ NÃO ENTRA nos Arquivos da Aliança:

**1. Conversas informais sem validação**
```
Thread do Slack:
[12:34] Dev: "acho que cliente Gold tem desconto de 30%?"
[12:35] PO: "talvez, não lembro exato"
[12:36] Dev: "vou colocar 25% pra ficar safe"
```
→ Não é fonte oficial, ninguém confirmou

**2. Decisões temporárias de sprint**
```markdown
## Estratégia de Cache (Sprint 23)
Nesta sprint estamos testando cache Redis com TTL de 5 minutos.
Se funcionar bem, vamos manter, senão voltamos para cache em memória.
```
→ Decisão em teste, não é estável

**3. Informação sem dono responsável**
```markdown
## Regra de Notificação
Alguém uma vez mencionou que cliente deve receber email após 3 dias de inatividade.
Não sei quem decidiu isso nem se ainda vale.
```
→ Sem validação, sem responsável, não confiável

**4. Detalhes de implementação técnica volátil**
```markdown
## Como Fazer Deploy (processo atual)
1. Rodar script deploy.sh
2. Aguardar 5 minutos
3. Checar logs manualmente
[Esse processo muda toda sprint conforme automação evolui]
```
→ Muda frequentemente, melhor manter como runbook separado que pode ser editado sem revisão pesada

## 🛠️ Ferramentas Para Extração de Conhecimento

### Entrevistas Estruturadas com Stakeholders

**Template de entrevista:**
```markdown
# Entrevista: Regras de Desconto

**Entrevistado:** João Silva (Product Owner)
**Data:** 2024-01-15
**Facilitador:** Maria Santos (Tech Lead)

## Perguntas
1. Qual o limite de desconto por tier de cliente?
2. Existem exceções a essa regra?
3. Como tratar promoções acumuladas com desconto de tier?
4. Essa regra mudou recentemente? Vai mudar em breve?
5. Quem pode aprovar alterações nessa regra?

## Respostas
[documentar aqui durante entrevista]

## Próximos Passos
- [ ] Criar docs/business-rules/pedido-desconto.md
- [ ] Validar com João antes de commitar
- [ ] Atualizar código para seguir regra documentada
```

### Copilot Como Assistente de Extração

Use o Copilot para ajudar a extrair e padronizar:

```
Você: "Analise este email do product owner e extraia as regras de negócio em formato padronizado:

[cola email com 3 parágrafos de texto informal sobre regras de desconto]

Formato esperado:
- Regra objetiva
- Valores numéricos
- Condições explícitas
- Edge cases identificados"

Copilot: [extrai e formata em markdown estruturado]
```

### Diff de Código vs Documentação

```bash
# Encontrar TODOs e FIXMEs que indicam conhecimento não documentado
git grep -n "TODO\|FIXME\|XXX\|HACK" app/

# Exemplo de output:
app/services/pedido.py:45: # TODO: validar limite de desconto por tier (ver com PO)
app/api/routes/checkout.py:12: # FIXME: regra de frete grátis mudou, atualizar
```

Esses comentários inline são **sinais** de conhecimento que deveria estar em Arquivos da Aliança.

## 💡 Troubleshooting Comum

### Problema: "Não sei por onde começar, temos muito conhecimento disperso"

**Solução:** Priorize por impacto:

1. **Crítico (começar aqui):** Regras de pagamento, autenticação, cálculos financeiros
2. **Alto:** Fluxos principais do produto, validações de domínio
3. **Médio:** Regras de UX, configurações não-críticas
4. **Baixo:** Detalhes de implementação volátil

**Meta inicial:** Documente 5 regras críticas no primeiro mês, não tente documentar tudo de uma vez.

### Problema: "Stakeholder diz 'não tenho tempo para revisar documentação'"

**Solução:** Reduza fricção:

```markdown
# ❌ Pedido ruim (muito trabalho):
"João, revisei todas regras de desconto em 10 páginas. Consegue revisar tudo até sexta?"

# ✅ Pedido bom (focado):
"João, extraí a regra de desconto de tier dos seus emails (5 minutos de leitura).

Está correto?
- Gold: 30% máximo
- Silver: 20% máximo
- Bronze: 10% máximo

Se sim, responda 'OK' que eu commito. Se não, me diz o que corrigir."
```

**Revisão assíncrona:** Use Pull Request com review request para o stakeholder validar no tempo dele.

### Problema: "Documentação fica desatualizada rápido"

**Solução:** Integre ao fluxo de mudança:

```markdown
## Checklist de PR (template)
- [ ] Código implementado
- [ ] Testes passando
- [ ] **Se mudança de regra de negócio:** Atualizei docs/business-rules/
- [ ] CI/CD passando
```

**CI Check:** Configure GitHub Action que falha se PR muda `app/services/pedido.py` mas NÃO muda `docs/business-rules/pedido-*.md`:

```yaml
# .github/workflows/check-docs.yml
- name: Check if docs updated
  run: |
    if git diff --name-only origin/main | grep -q "app/services/pedido.py"; then
      if ! git diff --name-only origin/main | grep -q "docs/business-rules/pedido"; then
        echo "ERROR: Pedido service mudou mas docs não foram atualizados"
        exit 1
      fi
    fi
```

### Problema: "Não sei se a regra que encontrei ainda está válida"

**Solução:** Marque como **"A VALIDAR"**:

```markdown
# docs/business-rules/pedido-desconto.md

---
status: ⚠️ A VALIDAR
source: Email do João Silva de 2023-06-10
owner: João Silva (PO) - precisa confirmar se ainda vale
---

# Regra de Desconto (RASCUNHO - NÃO USAR)

[conteúdo extraído]

## ⚠️ ATENÇÃO
Esta regra foi extraída de fonte antiga e PRECISA ser validada antes de uso.
Validador: @joao.silva
```

Depois de validado, remova o aviso e mude status para `status: ✅ VALIDADO`.

## 📝 Exercício Prático Completo

**Missão:** Crie seu primeiro Arquivo da Aliança.

### Cenário Real
Seu time tem uma regra de **"Prazo de Entrega por Região"** que está espalhada em:
- Email do logistics manager (2023-11-20)
- Comentário inline no código `app/services/shipping.py`
- Thread do Slack de 3 meses atrás

**Fontes fornecidas:**

**Email do Logistics:**
```
Oi pessoal, atualizando prazo de entrega:
- Sul/Sudeste: 3-5 dias úteis
- Norte/Nordeste: 7-10 dias úteis
- Centro-Oeste: 5-7 dias úteis

Se cliente for Premium, reduz 2 dias em qualquer região.
Valeu!
```

**Comentário no código:**
```python
# FIXME: Sul/Sudeste é 3 dias ou 5? Email antigo dizia 5, novo diz 3-5
prazo = 5  # usando 5 pra ficar safe
```

**Thread do Slack:**
```
[11/15] PM: "Cliente Premium tem desconto no prazo?"
[11/15] Logistics: "Sim, -2 dias"
[11/15] Dev: "E se der zero ou negativo?"
[11/15] Logistics: "Mínimo sempre 1 dia"
```

### Tarefa

1. **Extraia** a regra oficial consolidando as 3 fontes
2. **Padronize** em formato técnico (tabela com valores exatos)
3. **Identifique** edge cases (ex: prazo negativo/zero)
4. **Crie** arquivo `docs/business-rules/entrega-prazo.md`
5. **Marque** para validação do logistics manager

**Template sugerido:**
```markdown
---
owner: [Nome] (Logistics Manager)
status: ⚠️ A VALIDAR
last_extracted: 2024-01-15
sources: 
  - Email de 2023-11-20
  - Thread Slack #logistics de 2023-11-15
---

# Regra de Negócio — Prazo de Entrega por Região

## Objetivo
Definir prazo de entrega padrão conforme região do destinatário e tier do cliente.

## Tabela de Prazos
[completar com tabela estruturada]

## Redução para Cliente Premium
[completar com regra de -2 dias]

## Edge Cases
### Prazo resultante zero ou negativo
**Comportamento:** [completar com regra de mínimo 1 dia]

## Validações
- [ ] Validado por: [Nome do Logistics Manager]
- [ ] Código atualizado para seguir essa regra
- [ ] Testes cobrem edge cases
```

**Critério de sucesso:**
- ✅ Regra consolidada de múltiplas fontes
- ✅ Formato tabular padronizado
- ✅ Edge cases documentados
- ✅ Owner identificado para validação
- ✅ Arquivo pronto para commitar após aprovação

## 🎯 Próxima Missão

Na próxima aula (**Mapas de Batalha**) você aprenderá a usar **diagramas de sequência** para documentar fluxos complexos de forma visual. Enquanto Arquivos da Aliança são textuais, Mapas de Batalha são visuais — ambos servem como contexto para o Copilot.

:::tip 🏆 Treinamento Jedi Completo
Você domina o processo de converter conhecimento disperso (wiki, chat, email, memória) em Arquivos da Aliança estruturados, versionados e utilizáveis como contexto para IA. Agora o conhecimento do time está acessível no repositório ao invés de trancado nas cabeças das pessoas.
:::
