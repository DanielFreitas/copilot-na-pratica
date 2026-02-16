---
title: 14 - Holocrons Vivos
sidebar_position: 14
description: Processo prático para manter documentação atualizada com apoio de IA.
---

> *"Holocrons que se atualizam sozinhos. Quase como se tivessem vida própria."*

**Duração estimada:** ~30 min

## Vídeo introdutório

<video controls width="100%" preload="metadata">
	<source src="/copilot-na-pratica/videos/14-holocrons-vivos.mp4" type="video/mp4" />
	Seu navegador não suporta vídeo HTML5.
</video>

## Pré-requisitos obrigatórios

Esta aula complementa:
- **Arquivos da Aliança** (aula 12): Criar documentação inicial
- **Mapas de Batalha** (aula 13): Documentar fluxos visuais

Agora você aprenderá a **manter essa documentação atualizada** conforme código evolui.

## O Problema Real: Documentação Morta

Todo projeto tem esse cenário:

```python
# Código atual (app/api/routes/produtos.py):
@router.get("/produtos/{id}", response_model=ProdutoDetalhesResponse)
def get_produto(
    id: int,
    include_reviews: bool = False,  # ← Novo parâmetro (adicionado mês passado)
    db: Session = Depends(get_db)
):
    """Retorna detalhes de um produto."""
    produto = db.query(Produto).get(id)
    if not produto:
        raise HTTPException(404, "Produto não encontrado")
    
    # Lógica para incluir reviews se solicitado
    if include_reviews:
        produto.reviews = db.query(Review).filter_by(produto_id=id).all()
    
    return produto
```

```markdown
# Documentação desatualizada (docs/api/endpoints-produto.md):
## GET /produtos/{id}
Retorna detalhes de um produto.

**Parâmetros:**
- `id` (path, obrigatório): ID do produto

**Resposta:**
- 200: Produto encontrado
- 404: Produto não encontrado

<!-- Documentação não menciona `include_reviews` que foi adicionado! -->
```

❌ **Consequências:**
- Desenvolvedor novo não sabe que pode incluir reviews
- API parece menos funcional do que realmente é
- Time perde tempo perguntando "como listar reviews junto?"
- Copilot gera código sem usar parâmetro disponível

**Holocrons Vivos** resolvem isso com **processo + automação** para manter código e docs sincronizados.

## 🔄 O Que São "Holocrons Vivos"

**Holocron Vivo** = documentação que:
1. **Reflete estado atual do código** (não o design inicial)
2. **Atualiza em ciclo contínuo** (não uma vez por trimestre)
3. **Usa IA como assistente** (Copilot gera/atualiza docs)
4. **É validável automaticamente** (CI detecta drift entre código e doc)

**Diferença crítica:**

| Documentação Tradicional | Holocron Vivo |
|--------------------------|---------------|
| Escrita uma vez no início do projeto | Atualizada constantemente |
| Fica desatualizada em meses | Drift detectado em dias |
| Atualizar é tarefa manual chata | IA ajuda a gerar/atualizar |
| Ninguém confia | Time usa como fonte verdade |

## 📋 Processo Simples de Manutenção

### Passo 1: Selecionar Módulo ou Endpoint Existente

Escolha componente que mudou recentemente ou está sem docs:

```bash
# Listar arquivos modificados recentemente
git log --since="1 month ago" --name-only --pretty=format: | sort | uniq

# Exemplo de output:
app/api/routes/produtos.py         ← Mudou, precisa revisar docs
app/services/checkout.py           ← Mudou
docs/api/endpoints-produto.md      ← Doc existe mas pode estar desatualizado
```

**Priorização:**
1. **Crítico:** APIs públicas, fluxos de pagamento, autenticação
2. **Alto:** Features usadas frequentemente
3. **Médio:** Módulos internos importantes
4. **Baixo:** Código experimental ou deprecated

### Passo 2: Pedir Comparação Entre Código e Documentação

Use o Copilot para detectar divergências:

```
Você no chat:
"Compare o código atual em app/api/routes/produtos.py com a documentação em docs/api/endpoints-produto.md.

Liste divergências objetivas:
- Parâmetros adicionados/removidos/renomeados
- Respostas que mudaram (status codes, schemas)
- Comportamentos novos não documentados
- Documentação que descreve código antigo"
```

**Copilot analisa e responde:**

```markdown
## Divergências Encontradas

### 1. Parâmetro `include_reviews` não documentado
**Código:** Aceita `include_reviews: bool = False` como query param
**Documentação:** Não menciona este parâmetro
**Impacto:** Usuários não sabem que podem incluir reviews na resposta

### 2. Schema de resposta mudou
**Código:** Retorna `ProdutoDetalhesResponse` (novo schema com campo `reviews`opcional)
**Documentação:** Descreve schema antigo sem campo `reviews`

### 3. Comportamento condicional não descrito
**Código:** Se `include_reviews=true`, faz JOIN com tabela `reviews`
**Documentação:** Não explica esse comportamento

## Documentação Obsoleta Detectada
- Menção a campo `descricao_curta` que não existe mais no schema
```

### Passo 3: Listar Divergências Objetivas

Crie checklist de correções necessárias:

```markdown
## Checklist de Atualização - docs/api/endpoints-produto.md

### Adições necessárias:
- [ ] Documentar parâmetro `include_reviews` (query, opcional, default=false)
- [ ] Atualizar schema de resposta com campo `reviews` (presente se include_reviews=true)
- [ ] Explicar impacto de performance (include_reviews faz JOIN adicional)

### Remoções necessárias:
- [ ] Remover menção a `descricao_curta` (campo foi removido 2 meses atrás)

### Correções:
- [ ] Status 404 só ocorre se produto não existe (era descrito errado antes)
```

### Passo 4: Atualizar README/Arquivo Técnico Baseado no Código Real

Peça ao Copilot para gerar docs atualizados:

```
"Gere documentação atualizada para GET /produtos/{id} baseada NO CÓDIGO ATUAL de app/api/routes/produtos.py.

Formato:
- Descrição clara do endpoint
- Tabela de parâmetros (path, query, body)
- Exemplos de request/response
- Casos de erro com status codes
- Notas sobre performance quando relevante"
```

**Copilot gera:**

```markdown
## GET /produtos/{id}

Retorna detalhes de um produto por ID, com opção de incluir reviews.

### Parâmetros

| Nome | Tipo | Localização | Obrigatório | Descrição |
|------|------|-------------|-------------|-----------|
| `id` | integer | path | ✅ Sim | ID do produto a buscar |
| `include_reviews` | boolean | query | ❌ Não (default: false) | Se true, inclui lista de reviews do produto na resposta |

### Respostas

#### 200 OK - Produto encontrado

**Schema:** `ProdutoDetalhesResponse`

```json
{
  "id": 123,
  "nome": "Notebook Dell",
  "preco": 3500.00,
  "estoque": 10,
  "reviews": [  // ← Presente apenas se include_reviews=true
    {
      "id": 1,
      "rating": 5,
      "comentario": "Excelente produto"
    }
  ]
}
```

**Nota de Performance:** Usar `include_reviews=true` adiciona JOIN com tabela `reviews`. Para listagens grandes, prefira endpoint separado `GET /produtos/{id}/reviews`.

#### 404 Not Found - Produto não existe

```json
{
  "detail": "Produto não encontrado"
}
```

### Exemplos

**Request básico:**
```bash
GET /produtos/123
```

**Request com reviews:**
```bash
GET /produtos/123?include_reviews=true
```
```

### Passo 5: Revisar Linguagem e Exemplos

Checklist de qualidade final:

```markdown
## Qualidade do Holocron Vivo

### Linguagem:
- [ ] Tom técnico mas não excessivamente formal
- [ ] Termos do domínio explicados ou linkados para glossário
- [ ] Sem jargão desnecessário ("basicamente", "simples", etc)

### Exemplos:
- [ ] Request examples com dados realistas (não "foo", "bar", "123")
- [ ] Response examples com estrutura completa (não "...")
- [ ] Exemplos de erro além de happy path
- [ ] Códigos curl/httpie funcionais (copiar & rodar)

### Completude:
- [ ] Todos parâmetros documentados (não apenas os óbvios)
- [ ] Edge cases mencionados (nulls, valores zerados, limites)
- [ ] Efeitos colaterais explicados (cria log auditoria, envia email, etc)
- [ ] Dependências mencionadas (precisa estar autenticado, etc)

### Manutenibilidade:
- [ ] Data de última atualização presente
- [ ] Link para código-fonte relacionado
- [ ] Owner/maintainer identificado para perguntas
```

## 🤖 Automação de Sincronização

### CI Check: Detectar Drift Automaticamente

Configure GitHub Action que alerta quando código muda mas docs não:

```yaml
# .github/workflows/docs-sync-check.yml
name: Check Docs Sync

on: [pull_request]

jobs:
  check-docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0  # Histórico completo para comparar
      
      - name: Check if API routes changed
        id: check_routes
        run: |
          if git diff --name-only origin/main | grep -q "app/api/routes/"; then
            echo "routes_changed=true" >> $GITHUB_OUTPUT
          fi
      
      - name: Check if API docs updated
        id: check_docs
        if: steps.check_routes.outputs.routes_changed == 'true'
        run: |
          if ! git diff --name-only origin/main | grep -q "docs/api/"; then
            echo "::warning::API routes mudaram mas docs/api/ não foi atualizado. Revisar se documentação precisa de atualização."
          fi
```

**Resultado:** PR que muda API recebe aviso se não atualizar docs.

### Pre-commit Hook: Lembrete Local

```bash
# .git/hooks/pre-commit
#!/bin/bash

# Detectar se API mudou
if git diff --cached --name-only | grep -q "app/api/routes/"; then
    echo "⚠️  AVISO: Você modificou rotas de API."
    echo "   Lembre-se de atualizar docs/api/ se necessário."
    echo ""
    echo "   Checklist rápido:"
    echo "   - [ ] Novos parâmetros documentados?"
    echo "   - [ ] Exemplos ainda funcionam?"
    echo "   - [ ] Status codes atualizados?"
    echo ""
    read -p "Continuar com commit? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Y]$ ]]; then
        exit 1
    fi
fi
```

Instalar:
```bash
chmod +x .git/hooks/pre-commit
```

### Bot de PR Comment: Sugestão Automática

GitHub Action que comenta no PR sugerindo atualização:

```yaml
# .github/workflows/docs-bot.yml
- name: Comment on PR if docs needed
  if: steps.check_routes.outputs.routes_changed == 'true'
  uses: actions/github-script@v6
  with:
    script: |
      github.rest.issues.createComment({
        issue_number: context.issue.number,
        owner: context.repo.owner,
        repo: context.repo.repo,
        body: `🤖 **Docs Bot**\n\nDetectei mudanças em \`app/api/routes/\`. Considere atualizar:\n- \`docs/api/endpoints-*.md\`\n- Exemplos de request/response\n- Diagramas de fluxo se aplicável`
      })
```

## 📊 Itens Que Devem Estar Sincronizados

Use esta checklist para validar sincronização:

### ✅ Para Endpoints de API:

| Item | Código-Fonte | Documentação | Como validar |
|------|--------------|--------------|--------------|
| **Assinatura** | `@router.get("/path")` | "GET /path" | Path e método batem? |
| **Parâmetros** | Argumentos da função | Tabela de parâmetros | Todos params documentados? |
| **Request body** | Schema Pydantic | Exemplo JSON | Campos obrigatórios/opcionais batem? |
| **Response** | `response_model=` | Exemplo response | Schema correto? |
| **Status codes** | `raise HTTPException(4xx)` | Listados em docs | Todos erros possíveis documentados? |
| **Autenticação** | `Depends(get_current_user)` | Pré-requisitos | Menciona que precisa auth? |

### ✅ Para Modelos de Domínio:

| Item | Código-Fonte | Documentação | Como validar |
|------|--------------|--------------|--------------|
| **Campos** | `Column()` em SQLAlchemy | Listados em glossário | Campos deprecados removidos? |
| **Validações** | `CheckConstraint` | Regras de negócio | Constraints documentados? |
| **Relacionamentos** | `relationship()` | Diagramas ER | Foreign keys explicadas? |

### ✅ Para Fluxos de Negócio:

| Item | Código-Fonte | Documentação | Como validar |
|------|--------------|--------------|--------------|
| **Sequência** | Ordem do código | Diagrama de sequência | Fluxo bate? |
| **Condicionais** | `if`/`else` | Fluxos alternativos | Condições documentadas? |
| **Exceções** | `try`/`except` | Casos de erro | Todos tratamentos listados? |

## 🎯 Exercício Prático: Reviver Um Holocron Morto

**Missão:** Escolha um endpoint/módulo desatualizado do seu projeto e o ressuscite.

### Cenário Simulado

Você herda este endpoint:

```python
# app/api/routes/pedidos.py (código atual)
@router.post("/pedidos", response_model=PedidoResponse, status_code=201)
def criar_pedido(
    pedido: PedidoCreate,
    cupom_desconto: Optional[str] = None,  # ← Adicionado 2 meses atrás
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Cria novo pedido para usuário autenticado."""
    
    # Validar estoque
    for item in pedido.items:
        if not estoque_disponivel(item.produto_id, item.quantidade):
            raise HTTPException(400, f"Estoque insuficiente para {item.produto_id}")
    
    # Aplicar cupom se fornecido
    desconto = 0
    if cupom_desconto:
        cupom = db.query(Cupom).filter_by(codigo=cupom_desconto, ativo=True).first()
        if not cupom:
            raise HTTPException(404, "Cupom não encontrado ou expirado")
        desconto = cupom.valor_percentual
    
    # Calcular total
    subtotal = sum(item.preco * item.quantidade for item in pedido.items)
    total = subtotal * (1 - desconto / 100)
    
    # Criar pedido
    novo_pedido = Pedido(
        customer_id=current_user.id,
        items=pedido.items,
        subtotal=subtotal,
        desconto=desconto,
        total=total,
        status="pendente"
    )
    db.add(novo_pedido)
    db.commit()
    
    return novo_pedido
```

```markdown
# docs/api/endpoints-pedido.md (documentação desatualizada)
## POST /pedidos

Cria um novo pedido.

**Request Body:**
```json
{
  "items": [
    {"produto_id": 1, "quantidade": 2}
  ]
}
```

**Response:**
- 201: Pedido criado
```

### Tarefa

1. **Compare** código vs docs (identifique divergências)
2. **Liste** o que está faltando:
   - Parâmetro `cupom_desconto` não documentado
   - Validação de estoque não mencionada
   - Schema completo de response não mostrado
   - Status 400 (estoque) e 404 (cupom) não listados
   - Pré-requisito de autenticação não mencionado

3. **Gere** documentação atualizada com Copilot:
```
"Gere documentação completa para POST /pedidos baseada no código atual em app/api/routes/pedidos.py.

Incluir:
- Todos parâmetros (body e query)
- Exemplo de request COM cupom
- Exemplo de response completo (todos campos)
- Todos status codes possíveis com explicação
- Nota sobre autenticação obrigatória"
```

4. **Valide** com checklist de qualidade

5. **Commite** docs atualizados:
```bash
git add docs/api/endpoints-pedido.md
git commit -m "docs: atualiza POST /pedidos com parâmetro cupom_desconto

- Adiciona documentação de cupom (adicionado em JIRA-456)
- Documenta validação de estoque
- Exemplos de erro 400/404
- Schema completo de response"
```

**Critério de sucesso:**
- ✅ Novo desenvolvedor consegue usar API baseado só na docs
- ✅ Todos parâmetros documentados
- ✅ Exemplos funcionais (copiar & colar funciona)
- ✅ Casos de erro explicados

## 💡 Troubleshooting Comum

### Problema: "Temos 200 endpoints, impossível atualizar tudo"

**Solução:** Incremental por prioridade:

**Semana 1:** Top 10 endpoints mais usados (via logs de acesso)  
**Semana 2:** Endpoints críticos (pagamento, auth)  
**Semana 3:** Endpoints com mais confusão (tickets de suporte relacionados)  
**Ongoing:** Atualizar docs toda vez que endpoint mudar (via PR checklist)

**Meta:** 100% de cobertura em 3 meses, não em 1 semana.

### Problema: "Docs ficam desatualizados entre review e merge de PR"

**Causa:** Docs atualizados em commit separado, código muda depois.

**Solução:** Docs e código no MESMO commit/PR:

```bash
# ❌ Errado (2 PRs separados)
git commit -m "feat: adiciona parâmetro cupom"    # PR #123
# [merge]
# [3 dias depois]
git commit -m "docs: atualiza docs de cupom"      # PR #124

# ✅ Correto (PR único)
git add app/api/routes/pedidos.py docs/api/endpoints-pedido.md
git commit -m "feat: adiciona suporte a cupom de desconto

- Adiciona parâmetro cupom_desconto opcional
- Valida cupom ativo no banco
- Atualiza docs/api/endpoints-pedido.md com exemplos"
```

### Problema: "IA gera docs genéricos, não específicos do nosso domínio"

**Causa:** Prompt vago ou falta contexto de domínio.

**Solução:** Forneça contexto explícito:

```
# ❌ Prompt vago
"Documente este endpoint"

# ✅ Prompt com contexto de domínio
"Documente POST /pedidos para e-commerce B2C de eletrônicos.

Contexto do domínio:
- Cliente = pessoa física consumidor final
- Pedido = carrinho convertido em compra
- Cupom = código promocional com desconto percentual
- Estoque = reserva temporária por 30min após adicionar ao carrinho

Formato: Mesmo estilo de docs/api/endpoints-produto.md (tom técnico, exemplos com dados reais)"
```

Copilot usa contexto de domínio para gerar docs específicos.

## 🎯 Próxima Missão

Você completou o **Módulo 4: Aliados da Resistência**! Agora domina documentação como aliada do desenvolvimento:
- ✅ Arquivos da Aliança (extração de conhecimento disperso)
- ✅ Mapas de Batalha (diagramas de fluxo sem ambiguidade)
- ✅ Holocrons Vivos (documentação sempre sincronizada)

Na próxima missão (**Módulo 5: Os Droids**) você aprenderá sobre **Model Context Protocol (MCP)** — como criar servidores MCP que estendem capacidades do Copilot com ferramentas customizadas.

:::tip 🏆 Treinamento Jedi Completo — Módulo 4 Finalizado
Você domina Holocrons Vivos e sabe manter documentação sincronizada com código through processo + automação + IA. Agora a documentação do seu projeto é fonte confiável de verdade, não arquivo morto esquecidomês passado.
:::
