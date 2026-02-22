---
title: 21 - Dois Copilots, Um Contexto
sidebar_position: 21
description: O protocolo de sincronização que garante que Daniel e Kássia sempre têm o mesmo contexto antes de começar a trabalhar — verificável em 30 segundos.
---

> *"Dois guerreiros que compartilham a mesma missão precisam compartilhar o mesmo mapa. Senão cada um luta numa batalha diferente."*

**Duração estimada:** ~30 min

## Vídeo introdutório

<video controls width="100%" preload="metadata">
	<source src="/copilot-na-pratica/videos/21-dois-copilots-um-contexto.mp4" type="video/mp4" />
	Seu navegador não suporta vídeo HTML5.
</video>

## O Problema Real: Contexto Divergente Silencioso

A divergência de contexto entre dois devs é diferente de um bug — ela não aparece com erro. Ela aparece como "isso está um pouco diferente do meu código" durante a revisão, depois de horas de desenvolvimento.

O contexto que pode divergir silenciosamente:

```
1. copilot-instructions.md da squad → atualizado via MR mas dev não fez pull
2. squad-prompts/ → novos prompts ou refinamentos adicionados
3. DISCOVERY.md do projeto → pendências resolvidas não sincronizadas
4. copilot-instructions.md do projeto → último alinhamento técnico não propagado
```

Para cada fonte de divergência, o custo típico:

| Fonte | Quando descoberto | Custo |
|---|---|---|
| DNA desatualizado | Revisão de MR | 30-60 min de refatoração |
| Prompt desatualizado | Após execução com resultado diferente | 20-30 min de ajuste |
| DISCOVERY.md desincronizado | Na implementação (bug ou bug evitado) | Variável |
| copilot-instructions.md projeto | Revisão de MR | 30-60 min de refatoração |

## A Cadeia de Sincronização

```
┌─────────────────────────────────────────────────────────────────────┐
│                     CADEIA DE SINCRONIZAÇÃO                         │
│                                                                      │
│  squad-prompts/ (GitLab)                                             │
│  └── clonado em ambas as máquinas                                    │
│  └── pull antes de qualquer sessão que use prompts da biblioteca     │
│                                                                      │
│  .github/copilot-instructions.md (squad, branch main)               │
│  └── pull antes de qualquer sessão de desenvolvimento               │
│  └── Qualquer mudança via MR + aprovação dos dois                   │
│                                                                      │
│  DISCOVERY.md + .github/copilot-instructions.md (projeto)           │
│  └── pull antes de qualquer sessão no projeto                       │
│  └── Pendências resolvidas commitadas imediatamente                 │
└─────────────────────────────────────────────────────────────────────┘
```

## O Protocolo de Início de Sessão

Coloque este protocolo no `copilot-instructions.md` da squad:

```markdown
## Protocolo de Início de Sessão

Antes de qualquer sessão de desenvolvimento, execute em 30 segundos:

```bash
# No repositório do projeto
git pull origin main

# No repositório squad-prompts
cd ~/repos/squad-prompts && git pull

# Verificar se o DNA está atualizado (compare o hash)
git -C ~/repos/shared-context log -1 --format="%H %s" .github/copilot-instructions.md
```

**Sinal de alerta:** se o hash do seu arquivo for diferente do hash do último commit
na branch main (visível no GitLab), você está com versão desatualizada.
```

O protocolo de 30 segundos é o investimento mínimo para garantir que você não vai descobrir divergência 2 horas depois.

## Verificação de Hash em 30 Segundos

O método mais confiável de verificar sincronia:

```bash
# Método 1: hash do arquivo local vs último commit
# Verificar se o arquivo local está na versão mais recente do branch
git log -1 --format="%H" .github/copilot-instructions.md
# Resultado: hash do último commit que tocou esse arquivo

# Se seu working tree tem modificações pendentes:
git status .github/copilot-instructions.md
# Se aparecer "modified" → você tem mudanças não comittadas

# Método 2: diff rápido contra origin
git fetch origin
git diff origin/main -- .github/copilot-instructions.md
# Se não retornar nada: você está sincronizado
```

Para a squad:

```
Daniel roda o comando → obtém hash X
Kássia roda o comando → obtém hash Y

Se X == Y → contextos sincronizados, pode começar
Se X != Y → um dos dois tem versão desatualizada
             → git pull e verificar de novo
```

## Quando a Sincronia Vai Além do Pull

Existem situações onde o pull não resolve — quando o contexto divergiu por mudanças não comittadas:

**Situação:** Daniel está trabalhando numa mudança experimental no `copilot-instructions.md` que não foi para o MR ainda. O Copilot de Daniel está usando esse contexto experimental. O de Kássia não.

**Solução:**
1. Nunca faça mudanças experimentais no `copilot-instructions.md` diretamente no branch de trabalho
2. Se precisar testar uma mudança: crie um arquivo temporário e use `#file:` para carregá-lo explicitamente
3. Quando a mudança estiver pronta: abre MR

**Situação:** o DISCOVERY.md recebeu informação nova (uma pendência foi resolvida) mas ninguém commitou.

**Solução:**
1. Pendência resolvida → commit no mesmo dia
2. Regra: informação no DISCOVERY.md que está só na cabeça de alguém não existe para o sistema

## Anti-padrões vs Padrão Correto

❌ **"Depois eu faço pull":**
```
Daniel começa a sessão sem pull
Trabalha 2 horas
Kássia tinha atualizado o padrão de logs na semana passada
Daniel gera código com structlog sem JSON formatter (padrão antigo)
Kássia revisa: "você não viu o MR que fizemos?"
Daniel: 40 minutos de refatoração
```

⚠️ **Pull só do projeto, esqueceu o squad-prompts:**
```
Daniel faz pull do projeto ✅
Esquece squad-prompts
Executa discovery.prompt.md (versão antiga — Kássia refinou semana passada)
DISCOVERY.md gerado está OK mas sem as novas perguntas de libs internas
Resultado: discovery incompleto que vai aparecer como bug na implementação
```

✅ **Protocolo de 30 segundos antes de qualquer sessão:**
```
30 segundos: pull dos 3 repositórios
→ copilot-instructions.md sincronizado
→ squad-prompts sincronizado
→ DISCOVERY.md do projeto sincronizado
Sessão começa com contexto idêntico entre os dois devs
```

## Branch Protection como Mecanismo de Sincronização

Configure no GitLab do repositório compartilhado:

```
Settings → Repository → Protected branches
Branch: main
Allowed to merge: Developers + Maintainers (mínimo 2 approvals)
Allowed to push: No one (push direto proibido)
```

Com essa configuração:
- Qualquer mudança no DNA passa por MR
- MR exige aprovação dos dois
- Quando aprovado e feito merge, os dois são notificados pelo GitLab
- Notificação é o gatilho para fazer pull

## Exercício Prático

**Missão:** Implementar o protocolo de sincronização e verificar a sincronia atual.

1. Configure a branch protection nos repositórios compartilhados (squad-prompts, shared-context ou onde o DNA está).
2. Adicione o protocolo de início de sessão ao `copilot-instructions.md` da squad.
3. Verifique a sincronia atual: compare o hash do `copilot-instructions.md` nas duas máquinas.
4. Se houver divergência, remedie (pull + verificação).
5. Crie um alias ou script para o protocolo de 30 segundos:

```bash
# Adicione ao .bashrc ou .zshrc
alias squad-sync='
  echo "Sincronizando contexto da squad..."
  git -C ~/repos/squad-prompts pull
  git -C ~/repos/shared-context pull
  echo "Verificando DNA..."
  git -C ~/repos/shared-context log -1 --format="%H %s " .github/copilot-instructions.md
  echo "Sincronizado."
'
```

**Critério de sucesso:** protocolo documentado, branch protection configurada, e os dois devs com o mesmo hash do DNA antes de começar a próxima sessão.

## Troubleshooting

### 💡 Problema: Um dev fez pull mas o hash ainda é diferente

**Causa:** pode haver um branch separado onde o DNA foi modificado, ou o repositório certo não foi clonado.

**Solução:**
1. Verifique se ambos estão no branch `main` (não em um feature branch)
2. Confirme que o `git remote` aponta pro mesmo repositório: `git remote -v`
3. Se um dos devs tem clone antigo: `git fetch --all && git reset --hard origin/main`

### 💡 Problema: A sincronia manual é esquecida frequentemente

**Causa:** o protocolo existe na documentação mas não é parte do workflow natural.

**Solução:** incorpore ao ritual de kickoff (Capítulo 6). O kickoff.prompt.md vai incluir a verificação de sincronia como primeira etapa — tornando invisível: você não lembra de sincronizar porque o kickoff faz por você.

:::tip 🏆 Treinamento Jedi Completo
Você está pronto para a próxima aula se:

- [ ] Branch protection está configurada nos repositórios compartilhados
- [ ] O protocolo de sincronização está no `copilot-instructions.md` da squad
- [ ] Os dois devs têm o mesmo hash do DNA (verificado)
- [ ] Criei ou documentei um atalho para o protocolo de 30 segundos
:::

---

Os dois devs têm o mesmo contexto. O próximo passo é garantir que o código produzido pelos dois também seja consistente — não só nos padrões, mas na revisão. Na **Aula 22 — Revisão Cruzada Assíncrona**, você vai construir o `revisao-mr.prompt.md` que permite ao Copilot fazer a pré-revisão de um MR com o contexto completo do spike e do discovery carregados. E vai aprender como o revisor humano usa essa pré-revisão como ponto de partida, tornando a revisão mais rápida e mais focada.


