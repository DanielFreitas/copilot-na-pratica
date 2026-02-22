# Copilot na Pratica

Treinamento narrativo e tecnico sobre uso profissional do GitHub Copilot no VS Code, com foco em execucao real de time.

## Visao geral

Este repositorio concentra o conteudo do curso em formato Docusaurus, com aulas em markdown, videos, diagramas e materiais de apoio para aplicar o metodo no trabalho diario.

Contexto editorial:
- narrativa guiada por Kassia Oliveira
- foco em contexto, prompt files, MCP (droids), memoria de squad e governanca
- aplicacao pratica para devs, tech leads e squads

## Status atual (Fev/2026)

- Episodio I publicado: `18` licoes
- Episodio II publicado: `26` licoes
- Total publicado: `44` licoes

Trilha atual:
- Episodio I: fundamentos, holocrons, tecnicas, aliados e droids
- Episodio II: ritual de discovery, droids da squad, spike, memoria, estilo e missao final

## Stack e plataforma de referencia

- Editor: VS Code
- IA: GitHub Copilot
- Site: Docusaurus
- Stack tecnica usada nos exemplos: Python 3.13, FastAPI, Docker, PostgreSQL, MongoDB e Redis

## Como rodar local

Pre-requisitos:
- Node.js `>= 20`
- npm

Instalacao:

```bash
npm install
```

Desenvolvimento local:

```bash
npm start
```

Build de producao:

```bash
npm run build
```

Servir build localmente:

```bash
npm run serve
```

## Estrutura principal

- `docs/`: conteudo das aulas por episodio e capitulo
- `static/`: videos, diagramas, skills e materiais estaticos
- `src/pages/`: home e paginas customizadas
- `src/css/custom.css`: estilos globais do site
- `.vscode/`: configuracoes locais (incluindo MCP, quando aplicavel)

## Fluxo recomendado de manutencao editorial

1. Atualizar conteudo em `docs/` e assets em `static/`.
2. Rodar `npm start` para revisao visual.
3. Rodar `npm run build` para validar compilacao antes de merge.
4. Revisar links, rotas e coerencia da trilha no sidebar.

## Objetivo do repositorio

Este projeto nao e apenas um site de curso. Ele tambem funciona como base de referencia para:
- padroes de trabalho com Copilot em squad
- exemplos de artefatos de discovery e spike
- estrutura de memoria operacional reaproveitavel entre demandas
