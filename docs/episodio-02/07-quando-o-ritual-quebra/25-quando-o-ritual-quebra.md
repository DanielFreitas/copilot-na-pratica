---
title: 25 - Quando o Ritual Quebra
sidebar_position: 25
description: Como diagnosticar e recuperar cada tipo de falha do ritual de kickoff — identificar a causa real por trás do sintoma e retornar ao fluxo sem recomeçar do zero.
---

> *"O sistema não quebra de uma vez. Ele degrada sutilmente até virar o caos de antes."*

**Duração estimada:** ~40 min

## Vídeo introdutório

<video controls width="100%" preload="metadata">
	<source src="/copilot-na-pratica/videos/25-quando-o-ritual-quebra.mp4" type="video/mp4" />
	Seu navegador não suporta vídeo HTML5.
</video>

## Por Que o Ritual Quebra

O ritual não quebra de uma vez. Ele quebra por acúmulo de pequenas concessões:

```
Sprint 1: kickoff completo, 6 artefatos ✅
Sprint 2: nova demanda urgente → "faz um discovery rápido, sem o agente"
Sprint 3: mudança de decisão técnica → "vou só adicionar no Slack"
Sprint 4: copilot-instructions.md do projeto não foi atualizado com a nova decisão
Sprint 5: Daniel atualiza o copilot-instructions.md diretamente, sem MR
Sprint 6: o arquivo de Kássia está diferente do de Daniel
Sprint 7: o agente ignora parte das instruções (arquivo ficou grande demais)
Sprint 8: ninguém lembra quando foi o último kickoff
Sprint 9: o Copilot está gerando código sem seguir os padrões
```

Cada etapa parece razoável. O problema é o acúmulo.

## A Regra Universal de Diagnóstico

> **O sintoma sempre aparece depois da causa. Procure a etapa anterior, não a atual.**

Se o spike está genérico → o problema é no discovery (etapa anterior ao spike).  
Se o Copilot está ignorando instruções → o problema é no copilot-instructions.md (etapa anterior Ã  geração de código).  
Se os dois devs têm contextos diferentes → o problema é no processo de atualização do copilot-instructions.md (etapa anterior ao compartilhamento).

## Tabela de Diagnóstico e Recuperação

| Sintoma | Causa Real | Diagnóstico | Recuperação |
|---|---|---|---|
| Spike genérico / sem decisões técnicas reais | DISCOVERY.md vago ou incompleto | Abra o DISCOVERY.md: tem pendências 🔍? Rate limits? Casos de borda? | Volte ao discovery — preencha as seções faltantes antes de reeditar o spike |
| Droid GitLab retornando contexto de branch errado | Branch ou repo configurado errado no `mcp.json` | Valide o campo `source` na config do Droid GitLab | Verifique e corrija o nome do repo e branch no `mcp.json` |
| `copilot-instructions.md` do projeto divergindo do estado real | Mudança feita diretamente no arquivo sem passar por MR | Compare o arquivo local com o último MR merged que tocou nele | Crie um MR que sincroniza o arquivo com o estado atual do spike — processo obrigatório |
| Agente ignora parte das instruções do `copilot-instructions.md` | Arquivo grande demais — Copilot não processa todo o conteúdo | Conte as linhas do arquivo: `wc -l copilot-instructions.md` | Se > 50 linhas: enxugue, mova padrões verbosos para o Confluence e linke |
| Os dois devs têm contextos completamente diferentes | O ritual de kickoff virou opcional — não foi executado em novas demandas | Verifique quando foi o último kickoff executado: existe DISCOVERY.md recente? Spike publicado? | Execute o kickoff.prompt.md de recuperação (versão abaixo) |
| Copilot gera código fora dos padrões da squad | `copilot-instructions.md` da squad não está sendo incluído na sessão | Verifique se o arquivo está na raiz do repo em `.github/copilot-instructions.md` | Mova para a localização correta — o VS Code só inclui automaticamente desse caminho |
| Spike publicado no Confluence está desatualizado | Decisões técnicas evoluíram durante a implementação sem atualizar o spike | Compare o spike com o código atual — o que mudou? | Crie um MR de atualização do spike com as decisões reais implementadas |

## Os 5 Diagnósticos em Detalhe

### 1. Spike Genérico

**Sintoma:** o spike tem seções preenchidas com "conforme o padrão da squad" e nenhuma decisão técnica específica. Tarefas de backlog sem critério de aceite real.

**Diagnóstico:**
```
Abra o DISCOVERY.md correspondente.
Verifique:
□ Há pendências explícitas com 🔍?
  (Se não há nenhuma, o discovery foi superficial)
□ Rate limits estão documentados com valores reais?
□ Campos não óbvios das APIs externas estão mapeados?
□ Casos de borda específicos da demanda estão listados?

Se 2+ ítens estiverem vazios → o discovery precisa ser refeito antes do spike.
```

**Recuperação:** complete o DISCOVERY.md com o Droid GitLab e reexecute o `spike.prompt.md`. O spike ruim não é corrigível — precisa ser substituído pelo spike correto.

---

### 2. Droid GitLab com Contexto Errado

**Sintoma:** o Droid retorna endpoints ou código que não correspondem ao que está no repo, ou retorna "repo não encontrado" para repos que existem.

**Diagnóstico:**
```
Verifique o .vscode/mcp.json:
{
  "servers": {
    "gitlab-droid": {
      "env": {
        "GITLAB_URL": "https://gitlab.empresa.com",
        "GITLAB_TOKEN": "...",
        "DEFAULT_PROJECT": "grupo/repo-correto",  ← verifique este
        "DEFAULT_BRANCH": "main"                   ← e este
      }
    }
  }
}

Confirme no GitLab que o repo existe com exatamente esse nome.
Confirme que o token tem acesso de leitura ao grupo.
```

**Recuperação:** corrija o `mcp.json`, reinicie o servidor MCP (botão de restart no VS Code MCP panel), e reexecute a ferramenta de teste (`ler_arquivo` num arquivo simples).

---

### 3. `copilot-instructions.md` Divergindo

**Sintoma:** Daniel e Kássia têm arquivos `copilot-instructions.md` do projeto com conteúdo diferente. Decisões técnicas aparecem em um e não no outro.

**Diagnóstico:**
```bash
# Confirme os hashes dos dois arquivos (Aula 21)
# Dev 1:
sha256sum .github/copilot-instructions.md

# Dev 2:
sha256sum .github/copilot-instructions.md

# Se os hashes são diferentes, os arquivos divergiram.
```

**Diagnóstico adicional:**
```bash
# Veja quem editou o arquivo fora de um MR:
git log --oneline -- .github/copilot-instructions.md

# Se o último commit foi direto na main (não via MR), foi uma edição sem processo.
```

**Recuperação:**
1. Abra o spike no Confluence — esse é o artefato de referência.
2. Crie um MR que atualiza o `copilot-instructions.md` para refletir o spike.
3. Para o dev que estava com o arquivo divergente: faça `git pull` após o MR ser merged.
4. Verifique hashes novamente.

---

### 4. Agente Ignorando Instruções

**Sintoma:** o Copilot claramente não está seguindo o copilot-instructions.md — usa libs erradas, ignora padrões de naming, não inclui type hints onde deveria.

**Diagnóstico:**
```bash
# Conte as linhas do arquivo
$lines = (Get-Content .github/copilot-instructions.md).Count
echo "Linhas: $lines"

# Se > 50: o arquivo está grande demais
# O Copilot não garante que processou tudo em arquivos extensos
```

**Diagnóstico adicional:** verifique se o arquivo está no caminho correto:
```
✅ .github/copilot-instructions.md  ← incluído automaticamente pelo VS Code
❌ copilot-instructions.md           ← pode não ser incluído automaticamente
❌ .vscode/copilot-instructions.md  ← não é o caminho reconhecido
```

**Recuperação:**
1. Se o arquivo está no caminho errado: mova para `.github/copilot-instructions.md`.
2. Se o arquivo está grande demais (> 50 linhas):
   - Identifique as seções extensas (listas longas, exemplos detalhados)
   - Mova para uma página do Confluence
   - Substitua no arquivo por: `- Padrões de autenticação: [link do Confluence]`
3. Teste: peça ao Copilot para gerar um trecho pequeno e verifique se ele seguiu 3 regras do arquivo.

---

### 5. Ritual Virou Opcional

**Sintoma:** ninguém sabe dizer quando foi o último kickoff. Não existe DISCOVERY.md recente para a demanda atual. O spike está desatualizado (algumas semanas).

**Diagnóstico:**
```
□ Existe DISCOVERY.md criado nos últimos 5 dias úteis para a demanda atual?
□ O spike foi publicado no Confluence com status RASCUNHO ou APROVADO?
□ O copilot-instructions.md do projeto tem o link do spike?
□ A divisão de trabalho foi documentada?

Se 2+ ítens faltam → o kickoff não foi executado para a demanda atual.
```

**Recuperação:** execute a versão de recuperação do kickoff (seção abaixo).

## O Kickoff de Recuperação

Quando o ritual foi pulado, não refaça do zero — comece do último artefato confiável.

O spike é o artefato mais durável porque muda apenas via MR. Se o spike foi publicado, ele reflete o que foi decidido no momento em que foi aprovado.

**Instrução para o kickoff de recuperação:**
```
Contexto: estamos no meio de uma implementação de {demanda}.
O spike está em: {URL do Confluence}.
O DISCOVERY.md está em: {caminho ou "inexistente"}.
O copilot-instructions.md do projeto está em: {caminho}.

Problema: o ritual foi interrompido ou nunca foi concluído completamente.

Execute as etapas de recuperação:
1. Leia o spike e extraia as decisões técnicas atuais (DT-xx)
2. Verifique se o DISCOVERY.md existe e está completo:
   - Se não existe: crie baseado no spike + análise do Droid GitLab
   - Se existe mas está incompleto: complete as seções faltantes
3. Verifique o copilot-instructions.md do projeto:
   - Tem o link do spike?
   - Reflete as DTs do spike?
   - Se não: atualize via MR
4. Verifique se a divisão de trabalho está documentada:
   - Se não: produza baseado nas tarefas de backlog do spike
```

## A Versão Mínima do Kickoff Sob Pressão

Quando a pressão é alta e não há tempo para o kickoff completo, existe uma versão mínima:

```
Versão mínima: Etapas 1, 3 e 5 — o essencial que não pode ser pulado

Etapa 1 (Discovery): 15 min — DISCOVERY.md com rate limits e casos de borda principais
Etapa 3 (Spike): 10 min — spike mínimo com as DTs principais e tarefas de backlog
Etapa 5 (Ponte): 5 min — copilot-instructions.md com o link do spike e os padrões críticos

Total: 30 min

O que você abre mão:
  - Etapa 2 (análise do Droid GitLab): pode causar redescoberta durante a implementação
  - Etapa 4 (publicação Confluence): crie o arquivo local, publique depois
  - Etapa 6 (alinhamento): divida as tarefas verbalmente e documente logo em seguida
```

A versão mínima é aceitável sob pressão. O que não é aceitável é pular o ritual completamente — porque o que você "ganha" em velocidade hoje vai ser pago em contexto fragmentado nas próximas 2 semanas.

## Quais Etapas São Inegociáveis

| Etapa | Inegociável? | Motivo |
|---|---|---|
| Discovery | ✅ Sim | Sem discovery, o spike vai ser genérico |
| Análise GitLab | ⚠️ Negociável | Pode ser parcial ou feita depois |
| Spike | ✅ Sim | Sem spike, as decisões técnicas não existem |
| Publicação Confluence | ⚠️ Negociável | Pode ser publicado depois, mas o artefato precisa existir localmente |
| Ponte (copilot-instructions.md) | ✅ Sim | Sem isso, os dois Copilots não têm o contexto do spike |
| Alinhamento | ⚠️ Negociável | Pode ser feito verbalmente se documentado logo em seguida |

## Exercício Prático

**Missão:** Diagnosticar o estado atual do ritual na sua squad.

1. Responda estas perguntas:

| Pergunta | Resposta |
|---|---|
| Quando foi o último kickoff completo? | |
| O DISCOVERY.md da demanda atual está completo? | |
| O spike está publicado e atualizado? | |
| O copilot-instructions.md do projeto tem o link do spike? | |
| Os dois devs têm o mesmo hash no copilot-instructions.md? | |
| O copilot-instructions.md tem menos de 50 linhas? | |

2. Para cada item "Não" ou "Não sei": identifique a causa usando a tabela de diagnóstico.
3. Execute a recuperação necessária para o item mais crítico.
4. Defina quais etapas são inegociáveis para a sua squad a partir de agora.

**Critério de sucesso:** diagnóstico completo do estado atual + pelo menos 1 recuperação executada.

## Troubleshooting

### 💡 Problema: A recuperação do kickoff também ficou genérica

**Causa:** o spike de referência que você usou na recuperação já estava genérico.

**Solução:** não há atalho — um spike genérico precisa ser substituído. Execute o discovery completo e reescreva o spike. O custo de um spike correto no início sempre é menor que o custo da ambiguidade na implementação.

### 💡 Problema: O time resiste ao kickoff por considerar "burocracia"

**Causa:** o ritual foi apresentado como obrigação, não como acelerador.

**Solução:** mostre o diff. Na próxima demanda, execute o kickoff e apresente os 6 artefatos ao time. Pergunte: "Sem esses artefatos, vocês teriam chegado às mesmas conclusões? Em quanto tempo?"

:::tip 🏆 Treinamento Jedi Completo
Você está pronto para a missão final se:

- [ ] Sei usar a regra universal: procuro a etapa anterior ao sintoma
- [ ] Consigo diagnosticar cada falha na tabela sem precisar consultá-la
- [ ] Defini quais etapas são inegociáveis para a minha squad
- [ ] Sei executar o kickoff de recuperação quando o ritual foi pulado
- [ ] Sei qual é o tamanho máximo do copilot-instructions.md (50 linhas)
:::

---

Você conhece o ritual, sabe quando ele funciona e sabe como recuperar quando ele quebra. Na **Aula 26 — A Squad em Campo**, você vai executar o sistema completo numa demanda real end-to-end — os dois Droids ativos, a biblioteca em uso, o DNA aplicado, o kickoff conduzindo. Sem roteiro visível. Como em campo real.


