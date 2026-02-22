---
title: 20 - O DNA da Squad
sidebar_position: 20
description: Como construir o copilot-instructions.md compartilhado da squad — o DNA que garante que Daniel e Kássia gerem código consistente e usem o Copilot da mesma forma.
---

> *"Dois Jedis com espadas diferentes ainda precisam compartilhar a mesma doutrina de combate."*

**Duração estimada:** ~40 min

## Vídeo introdutório

<video controls width="100%" preload="metadata">
	<source src="/copilot-na-pratica/videos/20-o-dna-da-squad.mp4" type="video/mp4" />
	Seu navegador não suporta vídeo HTML5.
</video>

## O Problema Real: Dois Copilots Sem Contexto Compartilhado

Sem um DNA compartilhado, cada dev instrui o Copilot com seu próprio contexto acumulado:

```
Sessão de Daniel:
→ Copilot gera retry com tenacity (porque Daniel usou isso antes)
→ Copilot gera logs com loguru
→ Copilot gera testes com unittest

Sessão de Kássia:
→ Copilot gera retry com stamina (padrão da empresa)
→ Copilot gera logs com structlog
→ Copilot gera testes com pytest

Resultado no código de produção:
→ retry inconsistente entre módulos
→ logs com dois formatos diferentes
→ testes com dois estilos diferentes
→ onboarding de novo dev: "qual é o padrão?"
```

O problema não é que os dois padrões sejam ruins — ambos funcionam. O problema é que a divergência tem custo real:
- Revisão de código mais longa (comparar com dois padrões diferentes)
- Onboarding de novo dev mais difícil
- Copilot de um dev "desaprende" o padrão ao trabalhar em módulo do outro

## O DNA da Squad: O que Vai nesse Arquivo

O `copilot-instructions.md` da squad (diferente do de projeto, da Aula 15) fica no repositório compartilhado da squad e define o contexto persistente para **todos os projetos**.

O que vai no DNA:

```
1. Como usamos o Copilot (autonomia do agente por tipo de tarefa)
2. Nomeação de artefatos (convenções de nome para os arquivos do sistema)
3. Padrões técnicos da squad (libs, estrutura, estilo)
4. Quando parar e perguntar (limites de autonomia)
5. Referências para a biblioteca de prompts
```

O que **não** vai no DNA (vai no copilot-instructions.md de projeto):
- Contexto específico de uma demanda
- Links para spikes individuais
- Decisões técnicas de um projeto específico

## O Template do DNA

```markdown
# DNA da Squad — {Nome da Squad}

## Como Usamos o Copilot

### Autonomia do Agente por Tipo de Tarefa

| Tarefa | Comportamento |
|---|---|
| Discovery (discovery.prompt.md) | Deixar rodar sem interrupção até gerar o DISCOVERY.md |
| Geração do spike | Revisar seção por seção antes de aceitar |
| Geração de código novo | Revisar o diff antes de aceitar — não aplicar direto |
| Refatoração | Sempre mostrar diff antes de aplicar — nunca "sim pra tudo" |
| Revisão de MR | Usar como ponto de partida, não como revisão final |
| Publicação no Confluence | Confirmar o espaço antes de publicar |

### Quando Parar e Perguntar

O agente deve parar e pedir confirmação antes de:
- Mudança arquitetural que afeta mais de um serviço
- Alteração em contrato de API existente (breaking change)
- Criação de migration irreversível (DROP, DELETE sem WHERE)
- Publicação em espaço do Confluence fora de Engineering > Squad

---

## Nomeação de Artefatos

| Artefato | Convenção | Exemplo |
|---|---|---|
| Prompt files | `verbo-substantivo.prompt.md` | `mapear-endpoints.prompt.md` |
| Context files de projeto | `CONTEXT-{nome-api}.md` | `CONTEXT-api-pagamentos.md` |
| Templates | `{substantivo}-template.md` | `spike-template.md` |
| Discovery | `DISCOVERY.md` (maiúsculo, raiz do repo) | `DISCOVERY.md` |
| Squad instructions | `copilot-instructions.md` em `.github/` | `.github/copilot-instructions.md` |

---

## Padrões Técnicos

### Python
- **Versão:** 3.13
- **Package manager:** uv
- **HTTP client:** httpx (não requests)
- **Retry:** stamina (não tenacity)
- **Logs:** structlog com output JSON em produção
- **Testes:** pytest + pytest-asyncio para código assíncrono
- **Type hints:** obrigatórios em funções públicas

### FastAPI
- **Estrutura de rotas:** `app/api/v{n}/{recurso}.py`
- **Models:** Pydantic v2 — `model_config` em vez de `class Config`
- **Error handling:** exception handlers globais em `app/core/exceptions.py`
- **Dependências de auth:** `Depends()` com `get_current_user()` padrão

### Testes
- **Cobertura mínima:** 80% em módulos novos
- **Naming:** `test_{método}_{cenário}_{resultado_esperado}`
  - ex: `test_process_payment_when_api_unavailable_raises_retry_exception`
- **Fixtures:** conftest.py no nível mais próximo ao teste
- **Mocks:** `pytest-mock` com `mocker.patch`, não `unittest.mock` diretamente

### Código Assíncrono
- Sempre `async def` para funções que chamam I/O (HTTP, banco, cache)
- Nunca `asyncio.run()` dentro de handler — deixar o framework gerenciar o loop

---

## Biblioteca de Prompts

Repositório: `{namespace}/squad-prompts` no GitLab

**Antes de criar qualquer prompt do zero:**
verifique se existe na biblioteca usando o Droid GitLab:
```
Liste o conteúdo do repositório squad-prompts/ no GitLab
```

**Prompts de uso mais frequente:**
- Discovery: `discovery/discovery.prompt.md`
- Spike: `spikes/spike.prompt.md`
- Client HTTP: `integracao/client-http.prompt.md`
- Revisão de MR: `revisao/revisao-mr.prompt.md`
```

## Como o DNA Evolui: O Processo de MR

O DNA da squad é um documento vivo — mas muda via processo, não por capricho.

**Regra fundamental: nenhuma mudança unilateral.**

Qualquer mudança no DNA:
1. Abre MR com título: `[DNA] Mudança descritiva`
2. Descreve o que muda e por que
3. Inclui antes e depois do padrão
4. Os dois devs revisam (não só um)
5. Merge apenas com aprovação dos dois

**Por que esse rigor?** Porque uma mudança unilateral no DNA vai afetar o Copilot de todo mundo. Se Daniel muda o padrão de retry sem avisar Kássia, o Copilot de Kássia vai começar a gerar código incompatível com o que ela esperava.

## Divergência de DNA: Como Detectar e Corrigir

Às vezes a divergência acontece silenciosamente:

**Sintoma:** O Copilot de Daniel e o de Kássia geram código com estruturas diferentes para o mesmo problema.

**Diagnóstico:**
```bash
# Verificar se os dois têm o mesmo arquivo
# No terminal de cada um:
sha256sum .github/copilot-instructions.md
```

Se os hashes forem diferentes → o DNA divergiu. Alguém fez mudança sem MR.

**Remediação:**
1. Compare os dois arquivos (git diff)
2. Identifique as mudanças não controladas
3. Decida qual versão é a correta (ou uma combinação dos dois)
4. Abre MR formalizando a mudança
5. Os dois fazem pull após o merge

## Exercício Prático

**Missão:** Criar o `copilot-instructions.md` da squad — versão 1.0.

1. **Preparação (10 min):**
   Daniel e Kássia listam separadamente os padrões que cada um usa atualmente no Copilot. Incluindo: lib de retry preferida, structure de logs, framework de testes, style de nomeação.

2. **Alinhamento (15 min):**
   Comparam as listas. Para cada divergência, decidem o padrão da squad (com critério: qual está mais alinhado com o padrão da empresa?).

3. **Escrita (15 min):**
   Criam o arquivo usando o template acima com as decisões acordadas.

4. **Teste (10 min):**
   Os dois, em máquinas separadas, pedem ao Copilot:
   ```
   Implemente um cliente HTTP para uma API externa com retry automático.
   ```
   O código gerado deve usar `stamina` (ou o padrão que escolheram) nos dois casos.

5. **Avalie:**

| Critério | Daniel | Kássia |
|---|---|---|
| Código gerou retry com a lib correta | | |
| Código usou httpx (não requests) | | |
| Estrutura de diretórios seguiu o padrão | | |
| Type hints presentes nas funções públicas | | |

**Critério de sucesso:** os dois geraram código com a mesma lib de retry, mesma estrutura, sem precisar se consultar.

## Troubleshooting

### 💡 Problema: O Copilot de um dev está ignorando partes do copilot-instructions.md

**Causa:** o arquivo pode ter mais de 100 linhas e o Copilot não prioriza o arquivo inteiro.

**Solução:**
1. Mantenha o DNA enxuto — use o mesmo critério de < 50-70 linhas
2. Coloque as preferências mais importantes no início do arquivo
3. Mova detalhes de padrão para a biblioteca de prompts e referencie no DNA

### 💡 Problema: Um dos devs fez mudança direta no DNA sem MR

**Situação:** às vezes acontece por urgência ou descuido.

**Solução:** normalize o processo sem julgamento:
1. "Vi uma mudança no DNA sem MR — vamos formalizar?"
2. Cria MR retroativo com a mudança já feita
3. Revisa formalmente
4. Merge como se fosse o processo correto desde o início

O objetivo não é punir quem falhou — é garantir que os dois estejam cientes da mudança.

:::tip 🏆 Treinamento Jedi Completo
Você está pronto para a próxima aula se:

- [ ] O `copilot-instructions.md` da squad existe no repositório compartilhado
- [ ] Os dois devs geraram código para o mesmo problema e o resultado convergiu (mesma lib, mesma estrutura)
- [ ] Existe branch protection que exige aprovação dos dois para mudar o `.github/copilot-instructions.md`
- [ ] Sei a diferença entre o DNA da squad e o `copilot-instructions.md` de projeto
:::

---

O DNA da squad existe. Mas ele precisa estar sincronizado entre as duas máquinas para funcionar — e a sincronização pode quebrar. Na **Aula 21 — Dois Copilots, Um Contexto**, você vai definir o protocolo de sincronização: como garantir que os dois sempre têm o mesmo contexto antes de começar a trabalhar, e como verificar isso em 30 segundos.

