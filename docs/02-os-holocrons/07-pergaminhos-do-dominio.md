---
title: 07 - Pergaminhos do Domínio
sidebar_position: 7
description: Como registrar regras de negócio verificáveis para impedir respostas inventadas.
---

> *"A Força não conhece meu cliente. Mas eu posso apresentá-los através de Pergaminhos."*

**Duração estimada:** ~40 min

## Vídeo introdutório

<video controls width="100%" preload="metadata">
	<source src="/copilot-na-pratica/videos/07-pergaminhos-do-dominio.mp4" type="video/mp4" />
	Seu navegador não suporta vídeo HTML5.
</video>

## Pré-requisito obrigatório

Esta aula complementa os **Holocrons** (instruções técnicas). Enquanto Holocrons dizem **como** escrever código (use FastAPI, siga PEP 8), **Pergaminhos** dizem **o que** o sistema deve fazer (regras de negócio específicas do seu domínio).

## O Problema Real: IA Inventando Regras

Imagine este diálogo comum:

**Você:** *"Crie validação de pedido"*

**Copilot (sem Pergaminho):** 
```python
def validar_pedido(pedido):
    if pedido.total < 10:  # ← DE ONDE VEIO ISSO?
        raise ValueError("Pedido mínimo: R$ 10")
    if pedido.desconto > 0.15:  # ← INVENTOU 15%!
        raise ValueError("Desconto máximo: 15%")
```

❌ **Problema:** O Copilot **supôs** regras (pedido mínimo R$ 10, desconto máximo 15%) porque você não documentou as regras reais.

Agora com um Pergaminho:

**Você:** Cria `docs/business-rules/pedido-validacao.md`:
```markdown
# Regra de Negócio — Validação de Pedido

## Limite de desconto
- Clientes Bronze: máximo 10%
- Clientes Prata: máximo 20%
- Clientes Ouro: máximo 30%

## Pedido mínimo
- Não há pedido mínimo
- Sistema deve aceitar pedidos de qualquer valor
```

**Copilot (com Pergaminho):**
```python
def validar_pedido(pedido, cliente):
    limite = {"bronze": 0.10, "prata": 0.20, "ouro": 0.30}[cliente.tier]
    if pedido.desconto > limite:
        raise ValueError(f"Desconto máximo: {limite*100}%")
    # Sem validação de mínimo (conforme documentado)
```

✅ **Resultado:** Código reflete **suas** regras, não suposições da IA.

## 🗂️ Onde e Como Organizar Pergaminhos

**Estrutura recomendada:**

```
docs/
  business-rules/           ← Pasta dedicada a regras de negócio
    README.md               ← Índice com links para todas as regras
    pedido-validacao.md     ← Uma regra por arquivo
    cliente-categorias.md
    desconto-calculo.md
    estoque-reserva.md
```

**Por que dentro de `docs/`?**
- O Copilot indexa automaticamente arquivos em `docs/` (também `documentation/`, `specs/`)
- Fica versionado no Git (rastreável via commits)
- Pode ser lido por novos membros da equipe
- Serve como documentação oficial do sistema

**Por que um arquivo por regra?**
- Facilita encontrar regras específicas
- Evita arquivos gigantes com centenas de regras misturadas
- Permite referenciar regras específicas em code reviews: *"Veja `estoque-reserva.md` para entender essa validação"*

## 📐 Anatomia de um Pergaminho Bem Escrito

Um bom Pergaminho é **verificável** (pode ser testado objetivamente) e **completo** (não deixa margem para interpretação). Use esta estrutura:

### Template Padrão

```markdown
# Regra de Negócio — [Nome da Regra]

## Objetivo
Uma frase clara sobre o que a regra valida/calcula/garante.

## Campos envolvidos
Lista de campos com tipos e se são obrigatórios:
- `campo_id` (obrigatório, inteiro positivo)
- `campo_status` (opcional, enum: "novo"|"processando"|"concluído")

## Comportamento esperado
Descrição passo a passo do que deve acontecer:
1. Sistema recebe entrada
2. Valida campos obrigatórios
3. Aplica regra de cálculo
4. Retorna resultado ou erro

## Erros e códigos de retorno
Tabela com cenários de erro:
| Condição | Status HTTP | Mensagem | Código |
|----------|-------------|----------|--------|
| Campo obrigatório ausente | 400 | "Campo X é obrigatório" | `CAMPO_OBRIGATORIO` |
| Valor fora do limite | 400 | "Valor deve estar entre Y e Z" | `VALOR_INVALIDO` |

## Edge cases (casos extremos)
Condições de exceção que precisam tratamento explícito:
- O que acontece se campo opcional for null vs vazio?
- Como tratar valores negativos?
- Limite máximo de itens na lista?
```

### Exemplo Completo: Validação de Pedido

Crie o arquivo `docs/business-rules/pedido-validacao.md`:

```markdown
# Regra de Negócio — Validação de Pedido

## Objetivo
Validar criação de pedido garantindo consistência de dados e aplicação correta de descontos conforme categoria do cliente.

## Campos envolvidos
- `customer_id` (obrigatório, UUID válido)
- `items` (obrigatório, array não vazio)
  - `items[].product_id` (obrigatório, UUID válido)
  - `items[].quantity` (obrigatório, inteiro > 0)
  - `items[].unit_price` (obrigatório, decimal >= 0)
- `discount_percent` (opcional, decimal 0-100)

## Comportamento esperado
1. Validar estrutura do payload (campos obrigatórios presentes)
2. Verificar existência do cliente no banco
3. Calcular `subtotal = sum(item.quantity * item.unit_price for item in items)`
4. Validar `discount_percent` conforme categoria do cliente:
   - Cliente Bronze: máximo 10%
   - Cliente Prata: máximo 20%
   - Cliente Ouro: máximo 30%
   - Cliente sem categoria: sem desconto (0%)
5. Calcular `total = subtotal * (1 - discount_percent/100)`
6. Persistir pedido no banco com status "pendente"
7. Retornar payload com `id`, `total`, `status`

## Erros e códigos de retorno

| Condição | Status HTTP | Mensagem | Código |
|----------|-------------|----------|--------|
| `customer_id` ausente | 400 | "Campo customer_id é obrigatório" | `CAMPO_OBRIGATORIO` |
| `items` vazio | 400 | "Pedido deve conter pelo menos 1 item" | `ITEMS_VAZIO` |
| Cliente não existe | 404 | "Cliente não encontrado" | `CLIENTE_NAO_ENCONTRADO` |
| `discount_percent` > limite | 400 | "Desconto máximo para sua categoria: X%" | `DESCONTO_EXCEDIDO` |
| `quantity` < 1 | 400 | "Quantidade deve ser maior que zero" | `QUANTIDADE_INVALIDA` |

## Edge cases

### Desconto maior que subtotal
- **Cenário:** Cliente Ouro com 30% de desconto em pedido de R$ 5
- **Comportamento:** Permitir (total = R$ 3,50), não bloquear

### Cliente inativo
- **Cenário:** `customer_id` existe mas `status = "inativo"`
- **Comportamento:** Rejeitar com 403 Forbidden, mensagem "Cliente inativo não pode fazer pedidos"

### Produto descontinuado
- **Cenário:** `product_id` existe mas `discontinued = true`
- **Comportamento:** Rejeitar com 400 Bad Request, mensagem "Produto X não está mais disponível"

### Pedido sem desconto
- **Cenário:** `discount_percent` não enviado no payload
- **Comportamento:** Tratar como 0% (não erro)

### Múltiplos itens do mesmo produto
- **Cenário:** Array items contém 2 entradas com mesmo `product_id`
- **Comportamento:** Somar quantidades (não rejeitar), ex: [{produto: A, qtd: 2}, {produto: A, qtd: 3}] → 5 unidades do produto A
```

## 🔄 Como o Copilot Usa Pergaminhos

Quando você pede geração de código relacionado a pedidos, o fluxo é:

```
Você pede: "Crie validação de pedido"
    ↓
Copilot busca contexto relevante
    ↓
Encontra docs/business-rules/pedido-validacao.md
    ↓
Lê campos obrigatórios, limites, edge cases
    ↓
Gera código que REFLETE essas regras específicas
    ↓
Sugere testes cobrindo os edge cases documentados
```

**Importante:** O Copilot não "adivinha" que aquele arquivo existe. Ele encontra o Pergaminho porque:
1. Está versionado no repositório (Git)
2. Está em pasta indexada (`docs/`, `documentation/`)
3. Tem nome relevante (`pedido-validacao.md` para código de pedidos)

**versionado** = o arquivo está rastreado pelo **Git** (sistema de controle de versão). Isso significa que o histórico de alterações é registrado através de **commits** (pontos na linha do tempo do projeto onde mudanças são salvas com mensagem descritiva e autoria). Exemplo:

```bash
git add docs/business-rules/pedido-validacao.md
git commit -m "docs: adiciona regra de validação de pedido"
```

Agora essa regra está no histórico oficial do projeto e o Copilot pode lê-la.

## ✍️ Regras de Ouro Para Manutenção

### 1. Mudou código? Atualize o Pergaminho NO MESMO commit

❌ **Errado:**
```bash
# Commit 1
git commit -m "feat: aumenta desconto de Ouro para 35%"

# Commit 2 (dias depois)
git commit -m "docs: atualiza regra de desconto"
```

✅ **Correto:**
```bash
# Commit único
git add app/services/pedido.py docs/business-rules/pedido-validacao.md
git commit -m "feat: aumenta desconto de Ouro para 35%

- Atualiza validação em pedido.py
- Atualiza docs/business-rules/pedido-validacao.md"
```

**Por quê?** Se código e documentação divergirem, o Copilot vai sugerir código **inconsistente** (metade com regra antiga, metade com nova).

### 2. Use verbos imperativos e valores exatos

❌ **Vago:**
```markdown
## Desconto
Clientes podem ter desconto dependendo da categoria.
```

✅ **Específico:**
```markdown
## Desconto por categoria
- Bronze: máximo 10%
- Prata: máximo 20%
- Ouro: máximo 30%
- Sem categoria: 0% (sem desconto)
```

### 3. Documente o "não fazer" também

❌ **Incompleto:**
```markdown
## Validação de estoque
Sistema deve reservar itens do estoque ao criar pedido.
```

✅ **Completo:**
```markdown
## Validação de estoque
Sistema deve reservar itens do estoque ao criar pedido.

## O que NÃO fazer
- NÃO bloquear pedido se estoque estiver zerado (permitir backorder)
- NÃO descontar do estoque imediatamente (desconto só no pagamento confirmado)
- NÃO reservar por mais de 30 minutos (liberar automaticamente se não pago)
```

## 📊 Exemplo Comparativo: Antes e Depois

### Cenário: Cálculo de Frete

**ANTES (sem Pergaminho):**

Você pede: *"Crie função de cálculo de frete"*

Copilot gera:
```python
def calcular_frete(cep_destino: str, peso_kg: float) -> float:
    # Supõe: R$ 10 fixo + R$ 2 por kg
    return 10 + (peso_kg * 2)
```

❌ **Problemas:**
- Inventou R$ 10 fixo (não é sua regra)
- Não considera regiões (Sul/Sudeste vs Norte/Nordeste)
- Não trata CEP inválido
- Não aplica frete grátis acima de certo valor

**DEPOIS (com Pergaminho `docs/business-rules/frete-calculo.md`):**

```markdown
# Regra de Negócio — Cálculo de Frete

## Objetivo
Calcular frete conforme região e peso, aplicando frete grátis acima de R$ 200.

## Tabela de preços
| Região | CEP Inicial | Fixa | Por kg |
|--------|-------------|------|--------|
| Sul/Sudeste | 01000-000 a 39999-999, 80000-000 a 99999-999 | R$ 15 | R$ 3 |
| Norte/Nordeste | 40000-000 a 79999-999 | R$ 25 | R$ 5 |

## Frete grátis
Pedidos com subtotal >= R$ 200 têm frete grátis (retornar 0).

## Validação
CEP deve ter formato XXXXX-XXX. Rejeitar com 400 se inválido.

## Edge cases
- CEP desconhecido: usar tabela Norte/Nordeste (mais cara)
- Peso zero: cobrar taxa fixa apenas
```

Você pede a mesma coisa: *"Crie função de cálculo de frete"*

Copilot gera:
```python
import re
from decimal import Decimal

def calcular_frete(cep: str, peso_kg: float, subtotal: Decimal) -> Decimal:
    """Calcula frete conforme docs/business-rules/frete-calculo.md"""
    
    # Validação de formato
    if not re.match(r'^\d{5}-\d{3}$', cep):
        raise ValueError("CEP inválido. Formato esperado: XXXXX-XXX")
    
    # Frete grátis acima de R$ 200
    if subtotal >= Decimal('200'):
        return Decimal('0')
    
    # Extrai código numérico do CEP
    cep_num = int(cep.replace('-', ''))
    
    # Define tabela conforme região
    if (10000 <= cep_num <= 399999999) or (80000000 <= cep_num <= 99999999):
        # Sul/Sudeste
        fixa, por_kg = Decimal('15'), Decimal('3')
    else:
        # Norte/Nordeste ou desconhecido
        fixa, por_kg = Decimal('25'), Decimal('5')
    
    # Calcula frete
    frete = fixa if peso_kg == 0 else fixa + (Decimal(str(peso_kg)) * por_kg)
    return frete
```

✅ **Melhorias:**
- Usa **seus** valores (R$ 15/R$ 25, não R$ 10 inventado)
- Implementa frete grátis acima de R$ 200
- Valida formato do CEP
- Trata peso zero (edge case)
- Docstring referencia o Pergaminho

## 🎯 Quando Criar Um Pergaminho vs Colocar No Código

Use esta tabela de decisão:

| Tipo de Informação | Onde Documentar | Exemplo |
|--------------------|--------------------|---------|
| **Regra de negócio que pode mudar** | 📜 Pergaminho | Limite de desconto, prazo de entrega |
| **Constante do sistema** | 💻 Código (com comentário) | Timeout de API (30s), tamanho máximo de arquivo (10MB) |
| **Cálculo complexo com múltiplas condições** | 📜 Pergaminho + testes | Cálculo de frete, imposto, juros |
| **Validação de campo simples** | 💻 Código | Email válido, CPF com 11 dígitos |
| **Fluxo de estados** | 📜 Pergaminho com diagrama | Pedido: novo → pago → enviado → entregue |
| **Padrão técnico** | 🗂️ Holocron (instruções) | Use HTTPException, siga PEP 8 |

**Regra prática:** Se você teria que explicar a regra para um estagiário novo, crie um Pergaminho. Se é autoexplicativo no código, deixe só no código.

## 💡 Troubleshooting Comum

### Problema: Copilot ignora o Pergaminho

**Diagnóstico:**
Peça ao Copilot explicitamente: *"Que regras de negócio você encontrou sobre pedidos?"*

Se ele não mencionar seu Pergaminho:

**Soluções:**
- ✅ **Arquivo versionado?** Verifique que está commitado no Git (arquivos não salvos ou não commitados podem não ser indexados)
- ✅ **Nome relevante?** `pedido-validacao.md` é melhor que `regras.md` genérico
- ✅ **Pasta indexada?** Use `docs/`, `documentation/`, não pastas como `temp/` ou `rascunhos/`
- ✅ **Conteúdo relevante?** Se você pede sobre pedidos mas o Pergaminho fala só de clientes, Copilot pode não associar

### Problema: Código gerado não segue todas as regras do Pergaminho

**Sintomas:** Copilot implementa 3 de 5 validações documentadas.

**Causa:** Pergaminho grande demais ou com informação misturada (código só pega parte do contexto).

**Solução:**
- ✅ Divida em múltiplos Pergaminhos focados: `pedido-validacao.md`, `pedido-desconto.md`, `pedido-estoque.md`
- ✅ Referencie o Pergaminho explicitamente: *"Implemente validação de pedido conforme docs/business-rules/pedido-validacao.md"*
- ✅ Adicione checklist no final do Pergaminho:
  ```markdown
  ## Checklist de implementação
  - [ ] Validar campos obrigatórios
  - [ ] Verificar limite de desconto por categoria
  - [ ] Tratar edge case de desconto > subtotal
  - [ ] Retornar códigos de erro documentados
  ```

### Problema: Pergaminhos desatualizados (código mudou mas doc não)

**Sintomas:** Code review aponta inconsistência entre código e Pergaminho.

**Prevenção:**
- ✅ Configure CI/CD para alertar se PR modifica código de pedidos mas não modifica `pedido-*.md`
- ✅ Inclua checklist no template de PR:
  ```markdown
  ## Mudanças de regra de negócio
  - [ ] Atualizei Pergaminhos relevantes
  - [ ] Testes refletem as novas regras
  ```
- ✅ Use comentários no código linkando para Pergaminhos:
  ```python
  # Validação conforme docs/business-rules/pedido-validacao.md
  def validar_pedido(pedido, cliente):
      ...
  ```

## 📝 Exercício Prático Completo

**Cenário:** Seu sistema tem funcionalidade de **devolução de produtos** mas as regras não estão documentadas. O Copilot tem gerado validações inconsistentes.

**Tarefa:**

1. **Crie um Pergaminho** `docs/business-rules/devolucao-produto.md` documentando estas regras:
   - Prazo: 30 dias após entrega
   - Condições: produto lacrado, nota fiscal disponível
   - Produtos não devolvíveis: produtos personalizados, alimentos perecíveis
   - Reembolso: 100% para pagamento no crédito, 95% para outros métodos (taxa administrativa)
   - Status do pedido deve mudar para "em_devolucao"
   - Edge cases: 
     - E se produto já foi usado? Rejeitar
     - E se prazo venceu por 1 dia? Rejeitar (sem exceções)
     - E se foram múltiplos itens mas devolve só 1? Permitir devolução parcial

2. **Teste o Pergaminho:**
   - Peça ao Copilot: *"Crie endpoint POST /pedidos/\{id\}/devolucao que processa devolução de produtos"*
   - Verifique se o código gerado:
     - ✅ Valida prazo de 30 dias
     - ✅ Verifica se produto está lacrado
     - ✅ Rejeita produtos não devolvíveis
     - ✅ Calcula reembolso conforme método de pagamento
     - ✅ Trata devolução parcial

3. **Compare antes/depois:**
   - **Antes do Pergaminho:** Peça novamente usando janela anônima/modo incógnito do Copilot (para não usar histórico)
   - **Depois do Pergaminho:** Peça com o arquivo commitado
   - Documente as diferenças

**Critério de sucesso:**
- ✅ Código gerado após Pergaminho implementa TODAS as regras documentadas
- ✅ Edge cases são tratados com validações específicas
- ✅ Mensagens de erro são descritivas (não genéricas "dados inválidos")

## 🎯 Próxima Missão

Você completou o **Módulo 2: Os Holocrons**! Agora você tem:
- ✅ Holocron Principal com regras globais do projeto
- ✅ Holocrons por Território para contextos técnicos específicos
- ✅ Pergaminhos de Domínio com regras de negócio verificáveis

Na próxima missão (**Módulo 3: Técnicas de Sabre**) você aprenderá técnicas avançadas:
- **Movimentos Rápidos:** Atalhos e comandos slash para produtividade máxima
- **Formas de Combate:** Arquivos de prompt reutilizáveis (`.md`, `.prompt`)
- **Poderes Avançados:** Agentes customizados com instruções especializadas
- **Combinando Técnicas:** Skills do Copilot para scaffolding de código

:::tip 🏆 Treinamento Jedi Completo — Módulo 2 Finalizado
Você criou Pergaminhos de domínio e estabeleceu o ciclo de atualização para manter regras e código sempre alinhados. Seu Copilot agora responde com base em **suas regras reais**, não em suposições genéricas.
:::
