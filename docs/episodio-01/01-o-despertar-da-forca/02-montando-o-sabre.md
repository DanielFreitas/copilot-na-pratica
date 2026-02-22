---
title: 02 - Montando o Sabre
sidebar_position: 2
description: Instalação do Copilot no VS Code e domínio das três superfícies principais.
---

> *"Todo Jedi precisa montar seu próprio sabre. O meu é o VS Code com Copilot."*

**Duração estimada:** ~30 min

## Vídeo introdutório

<video controls width="100%" preload="metadata">
  <source src="/copilot-na-pratica/videos/02-montando-o-sabre.mp4" type="video/mp4" />
  Seu navegador não suporta vídeo HTML5.
</video>

## Setup Mínimo da Missão

Antes de começar suas missões Jedi com o Copilot, você precisa:

### 1. Conta GitHub com Copilot Ativa

**GitHub Copilot** é uma ferramenta paga (com trial grátis). Você precisa de uma assinatura ativa.

**Como verificar se você tem acesso:**
1. Acesse [github.com/settings/copilot](https://github.com/settings/copilot)
2. Verifique se o status mostra "Active" ou "Trial"
3. Se não tiver, inicie o trial ou assine mensalmente

💡 **Se você é estudante:** GitHub Copilot é **gratuito** para estudantes verificados através do GitHub Student Developer Pack.

---

### 2. Extensões Instaladas no VS Code

Você precisa de **duas extensões** oficiais da Microsoft:

#### **GitHub Copilot** (extensão principal)
- **O que faz:** Fornece sugestões de código inline enquanto você digita
- **Como instalar:**
  1. Abra VS Code
  2. Pressione `Ctrl+Shift+X` (abre painel de extensões)
  3. Busque "GitHub Copilot"
  4. Clique em "Install" na extensão publicada por "GitHub"

#### **GitHub Copilot Chat** (extensão de conversa)
- **O que faz:** Adiciona painel de chat para conversas com o Copilot
- **Como instalar:**
  1. No mesmo painel de extensões (`Ctrl+Shift+X`)
  2. Busque "GitHub Copilot Chat"
  3. Instale a extensão publicada por "GitHub"

💡 **Se as extensões não aparecerem:** Verifique se você está logado com sua conta GitHub no VS Code. Clique no ícone de conta (canto inferior esquerdo) → "Sign in with GitHub".

💡 **Se o Copilot não ativar após instalar:** 
- Reinicie o VS Code completamente
- Verifique status no canto inferior direito (ícone do Copilot)
- Se mostrar "Copilot Error", clique e siga as instruções de autenticação

---

## As Três Superfícies de Combate

No VS Code, você interage com o Copilot de **três formas diferentes**. Cada uma tem um propósito específico:

### Chat View (`Ctrl+Alt+I`) — Conversas Completas

**Chat view** é um painel lateral dedicado a conversas contínuas com o Copilot.

**Quando usar:**
- ✅ Planejar arquitetura de feature antes de implementar
- ✅ Diagnosticar problemas complexos (debug de erro, análise de logs)
- ✅ Executar tarefas multi-etapa (criar endpoint + testes + documentação)
- ✅ Fazer perguntas que precisam de contexto amplo (projeto inteiro)

**Como funciona:**
1. Pressione `Ctrl+Alt+I` (Windows/Linux) ou `Cmd+Alt+I` (Mac)
2. Painel abre no lado direitoO do editor
3. Digite sua pergunta ou tarefa
4. Conversa fica salva — você pode continuar na mesma thread

**Exemplo de uso:**
```
Você: "Preciso criar endpoint REST para produtos. Quais arquivos devo criar?"

Copilot: "Para seguir arquitetura FastAPI com separação de camadas:
1. app/routers/produtos.py - Define as rotas HTTP
2. app/schemas/produto.py - Schema Pydantic para validação
3. app/services/produto_service.py - Lógica de negócio
4. tests/test_produtos.py - Testes automatizados"

Você: "Perfeito. Crie o router com operações CRUD básicas."

[Copilot gera código completo]
```

**📍 Vantagens da Chat View:**
- Mantém histórico da conversa
- Pode referenciar mensagens anteriores
- Ideal para iteração (você refina o código através de múltiplas mensagens)

---

### Inline Chat (`Ctrl+I`) — Edição no Próprio Código

**Inline chat** abre uma caixa de texto diretamente no arquivo que você está editando.

**Quando usar:**
- ✅ Refatorar função específica
- ✅ Adicionar documentação a método existente
- ✅ Corrigir bug em trecho de código
- ✅ Transformar código sem sair do editor

**Como funciona:**
1. **Selecione** o código que você quer modificar (ou posicione cursor onde quer inserir)
2. Pressione `Ctrl+I`
3. Caixa de texto aparece inline, no próprio editor
4. Digite o que você quer fazer (ex: "adicione docstring")
5. Copilot modifica o código selecionado
6. Você aceita (`Ctrl+Enter`) ou rejeita (`Esc`)

**Exemplo de uso:**
```python
# Você seleciona esta função:
def calcular_total(itens):
    total = 0
    for item in itens:
        total += item['preco'] * item['qtd']
    return total
```

Pressiona `Ctrl+I` e digita: `"refatore usando list comprehension"`

```python
# Copilot transforma em:
def calcular_total(itens):
    """Calcula total de itens usando comprehension."""
    return sum(item['preco'] * item['qtd'] for item in itens)
```

**📍 Vantagens do Inline Chat:**
- Não precisa trocar de painel (permanece focado no código)
- Edição precisa no local exato
- Ver mudanças antes de aceitar (modo diff)

💡 **Se o inline chat não aparecer:** Verifique se você selecionou código ou posicionou o cursor. Inline chat precisa de localização específica no arquivo.

---

### Quick Chat (`Ctrl+Shift+Alt+L`) — Perguntas Rápidas

**Quick chat** é uma janela pop-up pequena para perguntas rápidas que não precisam de contexto.

**Quando usar:**
- ✅ Perguntas conceituais rápidas ("O que é middleware?")
- ✅ Tirar dúvidas sem abrir painel lateral
- ✅ Consultar sintaxe ("Como fazer try/except em Python?")
- ✅ Fluxo não-interruptivo (você não quer perder foco do código)

**Como funciona:**
1. Pressione `Ctrl+Shift+Alt+L`
2. Janela pequena aparece sobreposta ao editor
3. Digite pergunta curta
4. Resposta aparece na mesma janela
5. Janela fecha automaticamente quando você volta ao código

**Exemplo de uso:**
```
Você digita no Quick Chat: "sintaxe de list comprehension Python"

Copilot responde: 
[elemento for elemento in lista if condição]
Exemplo: quadrados = [x**2 for x in range(10) if x % 2 == 0]

Você pressiona Esc e volta ao código com a informação.
```

**📍 Vantagens do Quick Chat:**
- Mínima interrupção do fluxo de trabalho
- Não ocupa espaço permanente na tela
- Ideal para "micro-dúvidas"

---

### Resumo: Qual Superfície Usar?

| Situação | Use |
|----------|-----|
| Planejar feature complexa | **Chat View** (`Ctrl+Alt+I`) |
| Refatorar função existente | **Inline Chat** (`Ctrl+I`) |
| Dúvida rápida sobre sintaxe | **Quick Chat** (`Ctrl+Shift+Alt+L`) |
| Criar múltiplos arquivos | **Chat View** |
| Adicionar docstring | **Inline Chat** |
| "Como fazer X em Python?" | **Quick Chat** |

---

## Configurações Iniciais Úteis

Para melhorar a qualidade das respostas do Copilot:

### 1. Idioma de Resposta: Português (pt-BR)

Por padrão, o Copilot responde em inglês. Para respostas em português:

**Opção A: Perguntar em português**
- O Copilot detecta automaticamente o idioma da sua pergunta
- Se você escrever em português, ele responde em português

**Opção B: Configurar nas instruções do projeto (recomendado)**
- Adicione ao arquivo `.github/copilot-instructions.md` (veremos em lições futuras):
  ```markdown
  Sempre responda em português do Brasil (pt-BR).
  ```

---

### 2. Stack Padrão Explícita

Para evitar que o Copilot sugira tecnologias erradas, informe a **stack** (conjunto de tecnologias) do projeto.

**Stack padrão usada neste curso:**
- **Python 3.13:** Linguagem principal
- **FastAPI:** Framework para APIs REST
- **Docker local:** Containers rodando na sua máquina
- **Bancos de dados:** PostgreSQL (relacional), Redis (cache), MongoDB (documentos)

**Como informar a stack:**

Nas suas perguntas, sempre mencione:" contexto:
```
"No projeto FastAPI com Python 3.13 rodando em Docker local..."
```

Ou configure globalmente em `.github/copilot-instructions.md` (aprenderá em próximas lições):
```markdown
Stack padrão do projeto:
- Python 3.13
- FastAPI (framework web)
- Docker Compose (orquestração local)
- PostgreSQL 15 (banco principal)
- Redis (cache)
- MongoDB (logs e eventos)
```

**Por que isso importa:** Sem saber sua stack, o Copilot pode sugerir Flask quando você usa FastAPI, SQLite quando você usa PostgreSQL, etc.

---

## Teste de Verificação

Antes de prosseguir, confirme que tudo está funcionando:

### Teste 1: Sugestão Inline

1. Crie arquivo `teste.py` no VS Code
2. Digite o comentário: `# endpoint fastapi para listar usuarios`
3. Aguarde 1-2 segundos
4. O Copilot deve sugerir código (texto em cinza)
5. Pressione `Tab` para aceitar a sugestão

**Exemplo do que deve aparecer:**
```python
# endpoint fastapi para listar usuarios
@router.get("/usuarios")  # ← sugestão em cinza do Copilot
def listar_usuarios():
    return []
```

💡 **Se não aparecer sugestão:**
- Verifique ícone do Copilot no canto inferior direito (pode estar desabilitado)
- Aguarde mais 2-3 segundos (primeira sugestão pode ser lenta)
- Verifique se extensão "GitHub Copilot" está instalada E ativa

---

### Teste 2: Chat View

1. Pressione `Ctrl+Alt+I` para abrir o chat
2. Digite: `"Como validar payload em FastAPI e retornar erro HTTP 422?"`
3. Aguarde resposta
4. Copilot deve explicar e mostrar código usando `HTTPException`

**Resposta esperada (exemplo):**
```python
from fastapi import HTTPException, status
from pydantic import BaseModel

class Usuario(BaseModel):
    nome: str
    email: str

@router.post("/usuarios")
def criar_usuario(dados: Usuario):
    if not dados.email:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Email obrigató rio"
        )
    return {"mensagem": "Usuário criado"}
```

💡 **Se o chat não abrir:**
- Extensão "GitHub Copilot Chat" instalada?
- Reinicie VS Code
- Verifique painel lateral (pode estar minimizado)

---

## Sabre Montado ✅

Se os dois testes funcionaram, você está pronto! Seu ambiente está configurado para as próximas missões.

Luke latiu na primeira resposta útil do Copilot e exigiu petisco de celebração.

:::tip 🏆 Treinamento Jedi Completo
Você montou seu sabre: Copilot instalado, três superfícies dominadas (Chat View, Inline Chat, Quick Chat) e ambiente testado. Agora está pronto para missões reais com IA.
:::