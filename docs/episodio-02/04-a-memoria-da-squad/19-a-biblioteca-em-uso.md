---
title: 19 - A Biblioteca em Uso
sidebar_position: 19
description: Como o efeito composto da biblioteca transforma cada novo projeto — e como usar os prompts da biblioteca como ponto de partida ao invés de criar do zero.
---

> *"No terceiro projeto, você para de criar. Você começa a compor."*

**Duração estimada:** ~40 min

## Vídeo introdutório

<video controls width="100%" preload="metadata">
	<source src="/copilot-na-pratica/videos/19-a-biblioteca-em-uso.mp4" type="video/mp4" />
	Seu navegador não suporta vídeo HTML5.
</video>

## O Efeito Composto

A biblioteca de prompts tem um comportamento diferente de qualquer outra ferramenta: ela melhora com o uso, não deprecia.

```
┌─────────────────────────────────────────────────────────────────────┐
│                      EFEITO COMPOSTO                                │
│                                                                      │
│  Projeto 1:                                                          │
│  → Discovery: 45 min (criando do zero)                              │
│  → Adicionados Ã  biblioteca: 3 prompts                              │
│                                                                      │
│  Projeto 5:                                                          │
│  → Discovery: 20 min (executando prompts existentes)                │
│  → Adicionados: 2 prompts novos (domínio diferente)                 │
│  → Biblioteca: 13 prompts                                            │
│                                                                      │
│  Projeto 10:                                                         │
│  → Discovery: 15 min (todos os prompts maduros)                     │
│  → Adicionados: 1 prompt (refinamento de um existente)              │
│  → Biblioteca: 20 prompts estáveis                                  │
│                                                                      │
│  O que foi economizado:                                              │
│  Projeto 1: 0 min economizados (linha de base)                      │
│  Projeto 5: ~90 min economizados (vs criar do zero)                 │
│  Projeto 10: ~150 min economizados por projeto                      │
└─────────────────────────────────────────────────────────────────────┘
```

O tempo economizado não é linear — é exponencial, porque cada prompt que entra na biblioteca também torna os outros mais fáceis de encontrar e combinar.

## Como o Agente Navega a Biblioteca

Com o Droid GitLab e o repositório `squad-prompts/` configurado, o agente pode navegar a biblioteca autonomamente:

```
Instrução: "Preciso começar a trabalhar na demanda de integração com
            o gateway de pagamento. Qual é o melhor ponto de partida
            na nossa biblioteca de prompts?"

Agente:
  → Chamando: listar_repos("squad-prompts")
  → Resultado: pastas discovery/, spikes/, integracao/, revisao/
  
  → Chamando: ler_arquivo("squad-prompts", "integracao/README.md")
     ou listando arquivos de integracao/
  → Resultado: client-http.prompt.md, autenticacao-oauth.prompt.md
  
  → Chamando: ler_arquivo("squad-prompts", "integracao/client-http.prompt.md")
  → Resultado: [cabeçalho completo com "quando usar"]

Agente: "Para essa demanda, recomendo começar com:
  1. `discovery/discovery.prompt.md` — para o levantamento inicial
  2. `integracao/autenticacao-oauth.prompt.md` — para a autenticação do gateway
  3. `spikes/spike.prompt.md` — após o discovery para gerar o spike
  
  Quer que eu execute o discovery agora?"
```

O agente encontrou os prompts certos, leu a documentação de cada um, e recomendou a sequência. Sem você precisar lembrar o que existe na biblioteca.

## Referenciando a Biblioteca no copilot-instructions.md

Para que o agente saiba que a biblioteca existe e como acessar, adicione ao `copilot-instructions.md` da squad:

```markdown
## Biblioteca de Prompts

Nossa biblioteca de prompts está em: squad-pagamentos/squad-prompts (GitLab)

**Antes de criar qualquer prompt do zero:**
1. Verifique se existe um prompt na biblioteca para a tarefa
2. Use o Droid GitLab para listar o conteúdo de squad-prompts/

**Para executar um prompt da biblioteca:**
Use `#file:{prompt da biblioteca}` seguido da sua instrução.

**Prompts de uso frequente:**
- Discovery: `discovery/discovery.prompt.md`
- Spike: `spikes/spike.prompt.md`
- Revisão de MR: `revisao/revisao-mr.prompt.md`
```

## Demo: Fluxo Completo Usando Exclusivamente a Biblioteca

Demanda nova: **Integração com sistema de notificações por SMS**.

**Sem a biblioteca:**
```
Daniel: [escreve prompt de discovery do zero — 20 min]
[escreve prompt de análise de APIs do zero — 10 min]
[escreve spike do zero — 15 min]
Total de setup: 45 min antes de qualquer código
```

**Com a biblioteca:**
```
Daniel: [busca discovery.prompt.md — 30 seg]
[executa — 30 min para o DISCOVERY.md ficar pronto]

Daniel: [busca integracao/autenticacao-oauth.prompt.md — 30 seg]
[ajusta para o contexto do SMS — 2 min]
[executa — 10 min para ter o template de integração]

Daniel: [executa spike.prompt.md — 15 min para o spike]

Total de setup: 30 min de discovery + 15 min de spike = 45 min
Mas: setup de prompts = 3 min (vs 45 min)
A diferença de 42 min foi pura execução, não criação.
```

O tempo total pode ser parecido no projeto 1 — mas a qualidade é diferente. Os prompts da biblioteca já foram testados, refinados, e documentados. O resultado é mais consistente.

## Curadoria Pós-Projeto: O Ritual Final

Ao final de cada projeto, antes do merge final, a squad executa o ritual de curadoria (Aula 17) e adiciona o resultado Ã  biblioteca. O padrão:

```
1. (5 min) Listar prompts criados para este projeto
2. (8 min) Aplicar as 3 perguntas de curadoria
3. (5 min) Generalizar os aprovados (remover contexto específico)
4. (2 min) Criar MR para squad-prompts/
Total: 20 minutos

Retorno: prompts na biblioteca para o próximo projeto
```

Também é o momento de verificar o que ficou obsoleto:

```markdown
## Perguntas de obsolescência
- Algum prompt da biblioteca parou de funcionar com a nova versão do Copilot?
- Algum prompt está usando padrões que a squad não usa mais?
- Algum prompt foi substituído por outro melhor?

→ Abre MR de remoção com título: [DEPRECATE] nome-do-prompt.prompt.md
   Justificativa: por que foi depreciado e o que substituiu (se houver)
```

## Exercício Prático

**Missão:** Executar um fluxo completo de discovery usando exclusivamente prompts da biblioteca.

1. Escolha uma demanda real ou planejada para este exercício.
2. Identifique os prompts da biblioteca que são o ponto de partida:
   - Discovery: `discovery/discovery.prompt.md`
   - Se tem integração com API: `integracao/client-http.prompt.md` ou `autenticacao-oauth.prompt.md`
   - Após o discovery: `spikes/spike.prompt.md`
3. Execute o fluxo completo sem criar nenhum prompt do zero.
4. Ao final, avalie:

| Critério | Status |
|---|---|
| Executei o discovery sem criar prompt novo | |
| O DISCOVERY.md foi gerado a partir do prompt da biblioteca | |
| O spike foi gerado a partir do prompt da biblioteca | |
| Identifiquei pelo menos 1 prompt que melhorei durante o uso | |
| Abri MR de atualização para a versão melhorada | |

5. Se encontrar um caso onde a biblioteca não tinha o prompt certo: documente o gap e crie o novo prompt seguindo o processo de MR da Aula 18.

**Critério de sucesso:** discovery e spike gerados usando exclusivamente prompts da biblioteca, e pelo menos 1 refinamento proposto via MR.

## Troubleshooting

### 💡 Problema: A biblioteca tem muitos prompts e fica difícil encontrar o certo

**Causa:** a biblioteca cresceu sem critério de estrutura ou os cabeçalhos estão vagos demais.

**Solução:**
1. Revise os cabeçalhos dos prompts vagos — a seção "quando usar" precisa ser específica
2. Se tem mais de 20 prompts, considere adicionar tags ou subpastas
3. O arquivo `README.md` deve ter o índice completo e atualizado — se não estiver, atualize

### 💡 Problema: O agente executa o prompt da biblioteca mas o resultado está inconsistente com os anteriores

**Causa:** o prompt foi atualizado na biblioteca mas você tinha uma versão antiga em cache.

**Solução:**
1. Sempre use `#file:` para carregar o prompt — nunca copie o conteúdo manualmente
2. Se atualizou o prompt e o resultado mudou: verifique o histórico de commits do prompt no GitLab para entender o que mudou
3. Para mudanças significativas no comportamento do prompt, documente no commit message e no cabeçalho do prompt (`**Versão:** x.y`)

:::tip 🏆 Treinamento Jedi Completo
Você está pronto para a próxima aula se:

- [ ] Executei um discovery completo usando exclusivamente prompts da biblioteca (sem criar do zero)
- [ ] Identifiquei o efeito composto: cada projeto que usa a biblioteca torna o próximo mais rápido
- [ ] O agente consegue navegar a biblioteca e recomendar prompts para uma nova demanda
- [ ] Fiz ao menos 1 MR de adição ou refinamento de prompt após o exercício
:::

---

O Capítulo 4 está completo. A memória da squad está estruturada: critério de curadoria, repositório organizado, efeito composto em operação. Mas cada dev da squad ainda pode usar o Copilot de forma diferente — gerar código em estilos divergentes, usar padrões incompatíveis, criar contextos que não funcionam juntos. O **Capítulo 5 — O Estilo da Squad** resolve isso. Na **Aula 20 — O DNA da Squad**, você vai construir o `copilot-instructions.md` compartilhado que define como os dois devs operam com o Copilot: quando deixar rodar, quando intervir, e como o código gerado pelos dois fica consistente.


