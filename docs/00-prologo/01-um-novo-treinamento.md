---
title: 01 - Um Novo Treinamento
sidebar_position: 1
description: Kássia decide dominar o GitHub Copilot com método, contexto e padrão.
---

> *"Eu achava que sabia lutar. Mas estava usando um sabre de brinquedo numa guerra de verdade."*  
> — Kássia Oliveira, antes do treinamento

**Duração estimada:** ~35 min

## Vídeo introdutório

<video controls width="100%" preload="metadata">
	<source src="/copilot-na-pratica/videos/01-um-novo-treinamento.mp4" type="video/mp4" />
	Seu navegador não suporta vídeo HTML5.
</video>

Kássia pausou a guerra contra o Império por um motivo simples: ela percebeu que **"usar IA"** e **"dominar IA"** são coisas completamente diferentes.

## Modo Padawan vs Modo Jedi

### Como Kássia trabalhava ANTES (Padawan):

Sua rotina típica com IA era assim:

1. **Muitas abas abertas no navegador:**
   - ChatGPT em uma aba
   - VS Code em outra janela
   - Documentação em mais 3 abas
   - Resultado: copiar/colar código entre ferramentas

2. **Perguntas vagas no chat:**
   - "Como fazer autenticação?"
   - "Cria uma API aí"
   - Sem mencionar stack, arquitetura ou requisitos específicos

3. **Respostas genéricas:**
   - Código que funciona em teoria
   - Mas não se encaixa no projeto real
   - Framework errado (Flask quando usa FastAPI)
   - Estrutura diferente da que o time usa

4. **Retrabalho constante:**
   - 30 minutos ajustando código genérico para o projeto
   - Repetir processo para cada arquivo
   - Frustração crescente

### Como o "Han Solo do time" trabalha (Mestre Jedi):

Enquanto Kássia lutava, um colega (conhecido como "Han Solo do time") entregava features muito mais rápido:

- **Trabalha 90% do tempo dentro do VS Code** (não fica trocando de janela)
- **Fornece contexto específico** ("No projeto FastAPI com PostgreSQL, crie endpoint...")
- **Instruções claras** sobre exatamente o que precisa (rota, validações, retorno esperado)
- **Código gerado já segue os padrões do time** (estrutura de pastas, nomenclatura, estilo)

A diferença? **Método.** Han Solo não usa IA "casualmente" — ele usa com intenção e precisão.

## O Mito do Autocomplete Glorificado

Você já ouviu: *"GitHub Copilot é só um autocomplete melhorado."*

❌ **Isso é verdade SE você usar assim:**
```python
# Você digita:
def calcular_  # ← espera o Copilot completar

# Copilot sugere:
def calcular_total():  # função genérica, sem contexto
    pass
```

✅ **Mas com contexto e método, Copilot vira acelerador de execução técnica:**
```python
# Arquivo: app/services/pedido_service.py
# Contexto: Projeto FastAPI, já tem classe Pedido com items[]
# Você no chat: "Crie método para calcular total do pedido aplicando descontos por quantidade"

# Copilot gera (conhecendo seu projeto):
from decimal import Decimal
from app.models.pedido import Pedido

class PedidoService:
    def calcular_total(self, pedido: Pedido) -> Decimal:
        """Calcula total aplicando regra: 10+ itens = 10% desconto."""
        subtotal = sum(
            item.preco * item.quantidade 
            for item in pedido.items
        )
        
        if len(pedido.items) >= 10:
            subtotal *= Decimal('0.9')  # 10% desconto
        
        return subtotal.quantize(Decimal('0.01'))
```

**Percebeu a diferença?**
- Usou classes do SEU projeto (`Pedido`, `PedidoService`)
- Aplicou regra de negócio específica
- Seguiu padrão de código (Decimal para dinheiro, docstring)
- Código pronto para usar, não genérico

💡 **O segredo:** Sem método, a Força (IA) responde com estática (código genérico). Com método, a Força responde com precisão (código específico do projeto).

## O Que os Jedis Fazem Diferente

Desenvolvedores que dominam Copilot (os "Jedis") operam com **três pilares**:

### 1. Contexto Certo no Momento Certo

**Contexto** = informações que orientam a resposta da IA:
- Qual arquivo você está editando
- Código selecionado
- Stack do projeto (Python + FastAPI + PostgreSQL)
- Regras de negócio relevantes

**Exemplo de FALTA de contexto:**
```
Você (sem contexto): "Como validar email?"

Copilot: [Resposta genérica em qualquer linguagem]
```

**Exemplo COM contexto:**
```
Você (com contexto): "No projeto FastAPI, adicione validação de email ao schema Pydantic de Usuario"

Copilot: [Gera código específico usando Pydantic que você já usa]
```

**Por que contexto importa:** IA não "sabe" sobre seu projeto automaticamente. Você precisa informar a stack, arquitetura e padrões para receber código útil.

---

### 2. Instruções Claras para Reduzir Ambiguidade

**Instruções** = regras explícitas sobre como a IA deve responder:

**Ambíguo (❌):**
```
"Faz validação de CPF aí"
```
**Resultado:** Código genérico, sem saber onde colocar, como retornar erro, etc.

**Claro (✅):**
```
"Crie função validar_cpf() no arquivo app/validators/cpf.py. 
Validar formato (11 dígitos) e dígitos verificadores. 
Retornar True/False."
```
**Resultado:** Função exatamente onde você precisa, com regra específica.

**Por que instruções importam:** Ambiguidade gera múltiplas interpretações. Ser específico garante que IA gere exatamente o que você precisa.

---

### 3. Padrões do Time para Manter Consistência

**Padrões** = convenções compartilhadas que o time usa:
- Estrutura de pastas (`routers/`, `services/`, `models/`)
- Nomenclatura (snake_case, verbos em inglês)
- Estilo de código (docstrings, type hints, tratamento de erros)
- Ferramentas (pytest, pydantic, alembic)

**Sem padrões definidos:**
- Cada dev usa estrutura diferente
- Código inconsistente dificulta manutenção
- Reviews demoram (precisa alinhar padrão a cada PR)

**Com padrões + Copilot configurado:**
- IA gera código já seguindo convenções do time
- Consistência automática
- Onboarding mais rápido (novos devs seguem padrão desde dia 1)

**Como você define padrões:** Através de arquivos de instruções que você configurará nas próximas lições (`.github/copilot-instructions.md`, arquivos `.instructions. md` por pasta).

---

## O Templo Jedi

Este repositório é o **Templo da sua jornada** — onde você vai de Padawan a Mestre Jedi do Copilot.

**O que você encontrará:**
- **Trilha completa:** 7 módulos, 26 lições (~16 horas)
- **Exemplos práticos:** Código real em Python 3.13 + FastAPI + Docker
- **Cenários variados:** APIs REST, validação, testes, arquitetura
- **Bancos de dados:** PostgreSQL (relacional), MongoDB (documentos), Redis (cache)

**Estrutura do treinamento:**
1. **Prólogo (você está aqui):** Entender o problema
2. **O Despertar da Força:** Setup e primeiros comandos
3. **Os Holocrons:** Instruções persistentes e contexto
4. **Técnicas de Sabre:** Automações avançadas
5. **Aliados da Resistência:** Documentação e diagramas
6. **Os Droids:** Integração com sistemas externos (MCP)
7. **O Conselho Jedi:** Governança e padrões de time
8. **A Missão Final:** Workflow completo de feature
9. **Epílogo:** Consolidação e próximos passos

Luke, o Consultor Sênior de Pausas Estratégicas, latiu em aprovação quando Kássia finalmente trocou improviso por treinamento sistemático.

---

## Pré-Requisitos para Treinar

Antes de começar sua jornada Jedi, verifique se você tem:

### ✅ VS Code Instalado
- Editor principal que usaremos em TODO o curso
- Download: [code.visualstudio.com](https://code.visualstudio.com)

### ✅ GitHub Copilot Ativo
- Assinatura paga ou trial gratuito
- Para estudantes: gratuito via GitHub Student Developer Pack
- Verifique: [github.com/settings/copilot](https://github.com/settings/copilot)

### ✅ Familiaridade com Python
- Você precisa **saber ler e editar código Python**
- Não precisa ser expert, mas deve entender:
  - Funções, classes, imports
  - Estruturas básicas (if/for/try)
  - Como rodar programas Python

💡 **Importante:** Este NÃO é um curso de programação. Se Python é totalmente novo para você, faça um tutorial básico antes de continuar.

### ✅ Mentalidade Certa
- **Disposição para praticar:** Cada lição tem exercícios — faça-os!
- **Paciência para experimentar:** Você vai testar, errar, ajustar
- **Abertura para mudar hábitos:** Se você sempre usou IA de um jeito, vai precisar desaprender alguns hábitos

---

Kássia fechou o caderno com uma única frase:

> **"Eu vou me tornar Mestre Jedi do Copilot."**

E você?

:::tip 🏆 Treinamento Jedi Completo
Você identificou o gap entre usar IA de forma casual (Padawan) e dominar IA com método, contexto e padrão (Mestre Jedi). Próxima missão: montar seu sabre (configurar ambiente).
:::
