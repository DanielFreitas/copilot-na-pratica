---
title: 04 - Sentindo a Força
sidebar_position: 4
description: Domínio do contexto implícito e explícito para elevar a precisão das respostas.
---

> *"Quando eu entendi o que a Força realmente sente, tudo mudou."*

**Duração estimada:** ~35 min

## Vídeo introdutório

<video controls width="100%" preload="metadata">
	<source src="/copilot-na-pratica/videos/04-sentindo-a-forca.mp4" type="video/mp4" />
	Seu navegador não suporta vídeo HTML5.
</video>

Esta missão é sobre **contexto** — as informações que o Copilot usa para gerar respostas relevantes ao seu projeto. Sem contexto adequado, você recebe código genérico. Com contexto preciso, você recebe código pronto para produção.

## 🔍 Como o Copilot Processa Contexto

Entender como o Copilot "vê" seu código ajuda a fornecer o contexto certo no momento certo.

### O que acontece quando você faz uma pergunta

1. **Coleta automática:** O Copilot captura automaticamente informações do seu editor (arquivo aberto, código selecionado, arquivos recentes)
2. **Contexto adicional:** Se você mencionou `#file` ou `#selection`, esses são adicionados ao contexto
3. **Busca semântica:** Para `#codebase`, o Copilot pesquisa em todo o repositório buscando código similar ao que você pediu
4. **Geração de resposta:** Com todo o contexto reunido, o Copilot gera código específico para seu projeto

```
┌─────────────┐
│ Sua pergunta│
└──────┬──────┘
       │
       ├─→ [Contexto Implícito]  Arquivo ativo, seleção, editor
       │
       ├─→ [Contexto Explícito]  #file, #selection, #codebase
       │
       ├─→ [Busca]              Encontra exemplos no repositório  
       │
       └─→ [Resposta]           Código específico do seu projeto
```

### Precedência de Contexto

Quando múltiplas fontes de contexto existem, o Copilot prioriza:

1. ✅ **Contexto explícito com `#file` ou `#selection`** — você indicou exatamente o que importa
2. ⚠️ **Seleção ativa no editor** — código destacado tem prioridade sobre arquivo completo
3. ⚠️ **Arquivo ativo** — o arquivo que você está visualizando
4. ⏸️ **Arquivos recentes e workspace** — contexto amplo, menos específico

**Exemplo prático:**
- Se você selecionar uma função e adicionar `#selection` no chat, o Copilot foca APENAS naquela função
- Se não selecionar nada, ele considera o arquivo inteiro — pode gerar resposta menos focada

## Contexto Implícito

**Contexto implícito** é capturado automaticamente pelo VS Code sem você precisar fazer nada. O Copilot observa:

- **Arquivo ativo:** O arquivo que você está visualizando
- **Trecho selecionado:** Código que você destacou com o mouse
- **Editor visível:** Outros arquivos abertos em abas visíveis
- **Estrutura do repositório:** Pastas, arquivos principais, padrões de organização

**Por que isso importa:** A mesma pergunta gera respostas diferentes dependendo do arquivo aberto.

### Exemplo: Como Contexto Implícito Muda a Resposta

**Cenário 1: Nenhum arquivo aberto**
```
Você: "Como valido email?"

Copilot: [Resposta genérica]
"Use regex ou biblioteca de validação. Exemplo:
import re
def validar_email(email):
    return re.match(r'[^@]+@[^@]+\.[^@]+', email)
```

**Cenário 2: Arquivo `app/models/usuario.py` aberto**
```python
# app/models/usuario.py (ativo no editor)
from pydantic import BaseModel

class Usuario(BaseModel):
    nome: str
    cpf: str
```

```
Você: "Como valido email?"

Copilot: [Resposta específica do projeto]
"Adicione campo email ao schema Pydantic com validação:

from pydantic import BaseModel, EmailStr

class Usuario(BaseModel):
    nome: str
    cpf: str
    email: EmailStr  # Valida formato automaticamente
```

💡 **Percebeu a diferença?** Com o arquivo aberto, o Copilot sugeriu usar Pydantic (que já está no projeto) em vez de regex genérico.

## Contexto Explícito no Chat

**Contexto explícito** é quando você diz exatamente ao Copilot o que olhar usando **menções** — referências que começam com `#`.

### Menções Disponíveis

#### `#selection` — Código selecionado
Referência ao trecho de código que você destacou no editor.

**Quando usar:**
- ✅ Refatorar função específica
- ✅ Adicionar documentação a um método
- ✅ Corrigir bug em trecho isolado

**Exemplo:**
```python
# Você selecionou esta função no editor:
def calcular_total(itens):
    total = 0
    for item in itens:
        total += item['preco'] * item['qtd']
    return total
```

No chat:
```
Você: "Refatore #selection usando list comprehension"

Copilot:
def calcular_total(itens):
    return sum(item['preco'] * item['qtd'] for item in itens)
```

💡 **Se não funcionar:** Verifique se o código está realmente selecionado (destacado em azul) antes de enviar a mensagem.

---

#### `#file` — Arquivo específico
Referência a um arquivo do projeto (mesmo que não esteja aberto).

**Quando usar:**
- ✅ Analisar arquivo sem abri-lo
- ✅ Comparar com código que você está escrevendo
- ✅ Buscar padrão de outro arquivo para replicar

**Exemplo:**
```
Você: "Crie schema Pydantic para Produto seguindo o padrão de #file:app/models/usuario.py"

Copilot: [Analisa usuario.py e replica o estilo]
from pydantic import BaseModel
from decimal import Decimal

class Produto(BaseModel):
    nome: str
    preco: Decimal
    estoque: int
    
    class Config:
        # Replica configuração encontrada em usuario.py
        orm_mode = True
```

💡 **Se não funcionar:** Digite `#file:` e aguarde o autocomplete mostrar os arquivos disponíveis. Se o arquivo não aparecer, ele pode não estar no workspace aberto.

---

#### `#editor` — Arquivo visível no editor
Referência ao arquivo que está atualmente visível (mesmo que não seja o ativo).

**Quando usar:**
- ✅ Comparar dois arquivos lado a lado
- ✅ Mesclar lógica de arquivo visível com o atual

---

#### `#codebase` — Repositório completo
Pesquisa semântica em TODOS os arquivos do repositório para encontrar exemplos.

**Quando usar:**
- ✅ Encontrar como algo já foi feito no projeto
- ✅ Descobrir padrões existentes
- ✅ Replicar estrutura de código similar

**Exemplo:**
```
Você: "Como criar endpoint REST? Use padrão de #codebase"

Copilot: [Busca endpoints existentes e replica estrutura]
# Encontrou app/routers/usuarios.py e replicou:

from fastapi import APIRouter
from app.schemas.produto import ProdutoCreate, ProdutoResponse
from app.services.produto import ProdutoService

router = APIRouter(prefix="/produtos", tags=["produtos"])

@router.post("/", response_model=ProdutoResponse)
def criar_produto(dados: ProdutoCreate):
    return ProdutoService().criar(dados)
```

**⚠️ Cuidado com #codebase:**
- Pode deixar a resposta mais lenta (pesquisa em muitos arquivos)
- Nem sempre encontra o que você espera (depende da qualidade da busca semântica)
- Para repositórios muito grandes (>1000 arquivos), pode atingir limites de contexto

💡 **Se a resposta piorar com #codebase:** O contexto ficou grande demais e confuso. Remova `#codebase` e use `#file` apontando para o arquivo específico que contém o padrão.

---

#### `#git` — Mudanças Git
Referência aos arquivos modificados (staged ou unstaged).

**Quando usar:**
- ✅ Gerar mensagem de commit descritiva
- ✅ Revisar mudanças antes de commitar
- ✅ Identificar impactos das modificações

---

#### `#terminalLastCommand` — Último comando do faz mais lenta (pesquisa em muitos arquivos)
terminal (apenas no participante @terminal)
Referência ao último comando executado e sua saída.

**Quando usar:**
- ✅ Entender erro de comando que falhou
- ✅ Interpretar saída complexa

---

### Combinando Menções

Você pode usar múltiplas menções na mesma pergunta:

```
Você: "Adicione validação de CPF em #selection seguindo padrão de #file:app/validators/email_validator.py"
```

O Copilot vai:
1. Ler o código selecionado
2. Ler o arquivo de validação de email
3. Replicar a estrutura para validação de CPF

## Estratégia de Foco

Para manter conversas organizadas e respostas precisas:

### Uma conversa por missão
**Thread de conversa** é o histórico de mensagens no chat. Cada thread deve ter um objetivo único.

✅ **Bom:**
- Thread 1: "Criar endpoint de produtos"
- Thread 2: "Corrigir validação de CPF"
- Thread 3: "Adicionar testes de integração"

❌ **Ruim:**
- Thread 1: "Criar endpoint" → "Ah, e arruma o CPF também" → "Aliás, preciso de testes" → "Esqueci de pedir documentação"

**Por que isso importa:** Quando você mistura assuntos, o Copilot perde o foco e pode gerar código que não se encaixa bem.

### Objetivo claro por thread

Comece cada thread deixando claro o que você quer alcançar:

```
✅ "Vou criar endpoint REST para produtos. Preciso de router, schema Pydantic e testes."

❌ "Preciso fazer umas coisas aqui..."
```

### Evite misturar demandas diferentes

Se você terminou uma tarefa e vai começar outra, **inicie nova thread** (botão "➕" no chat).

## Limite de Contexto

O Copilot tem um **limite de tokens** — quantidade máxima de texto que consegue processar de uma vez. Threads muito longas podem:
- Fazer o Copilot "esquecer" informações do início
- Gerar respostas menos precisas
- Ignorar parte do contexto fornecido

### Sinais de que você atingiu o limite

- Respostas começam a ignorar instruções anteriores
- Copilot repete código que você já forneceu
- Respostas ficam mais genéricas e menos específicas

### Como lidar com threads longas

Quando a conversa ficar extensa:

1. **Resuma o estado atual:**
   ```
   Você: "Até agora criamos: endpoint POST /produtos, schema Pydantic com validações, testes básicos. 
   Próximo passo: adicionar paginação."
   ```

2. **Reinicie com contexto essencial:**
   - Abra nova thread (➕)
   - Cole o código atual como contexto
   - Continue de onde parou

3. **Use instruções curtas e precisas:**
   ```
   ✅ "Adicione paginação ao endpoint usando skip/limit"
   
   ❌ "Agora eu queria que você pegasse esse endpoint e melhorasse ele com paginação 
   porque a lista pode ficar muito grande e também seria legal ter filtros..."
   ```

💡 **Regra prática:** Se a thread tem mais de 10-15 mensagens, considere iniciar nova thread com resumo.

## Exercício Prático

Vamos testar como contexto afeta respostas. Escolha um arquivo Python do seu projeto (ou use um exemplo simples).

### Teste 1: Sem contexto
1. Feche todos os arquivos no VS Code
2. Abra o chat (`Ctrl+Alt+I`)
3. Pergunte: "Como adiciono validação de email?"
4. Observe a resposta (provavelmente genérica)

### Teste 2: Com seleção
1. Abra um arquivo com uma classe ou função
2. Selecione uma função específica
3. No chat: "Como adiciono validação de email em #selection?"
4. Observe a resposta (deve ser específica para o código selecionado)

### Teste 3: Com menção de arquivo
1. Mantenha seleção do teste anterior
2. No chat: "Como adiciono validação de email em #selection seguindo padrão de #file:[escolha um arquivo do projeto]?"
3. Observe a resposta (deve combinar o contexto selecionado com padrão do outro arquivo)

### Compare os resultados

| Critério | Sem contexto | Com seleção | Com seleção + arquivo |
|----------|--------------|-------------|----------------------|
| **Objetividade** | Genérica | Focada | Muito focada |
| **Aderência ao projeto** | Baixa | Média | Alta |
| **Taxa de retrabalho** | Alta | Média | Baixa |

**Conclusão esperada:** Quanto mais contexto específico você fornece, melhor a qualidade do código gerado.

Luke bocejou na quarta explicação longa seguida e encerrou a reunião com um latido democrático.

:::tip 🏆 Treinamento Jedi Completo
Você domina o uso de contexto implícito (automático) e explícito (menções) para reduzir ambiguidade e melhorar drasticamente a qualidade das respostas. Agora sabe quando usar `#selection`, `#file`, `#codebase` e como organizar threads de conversa.
:::