import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import styles from './index.module.css';

const learningOutcomes = [
  {
    title: 'Contexto que gera código útil',
    description:
      'Transforme pedidos vagos em instruções técnicas claras para obter respostas alinhadas ao seu projeto na primeira tentativa.',
  },
  {
    title: 'Holocrons e padrões de time',
    description:
      'Estruture copilot-instructions e arquivos de instrução por domínio para manter consistência entre devs e sessões.',
  },
  {
    title: 'Prompt files para discovery e kickoff',
    description:
      'Crie rituais reutilizáveis para discovery, spike e início de demanda sem depender de memória individual.',
  },
  {
    title: 'Droids com MCP no VS Code',
    description:
      'Conecte o Copilot a GitLab, Confluence, banco e arquivos para decisões baseadas em evidência, não suposição.',
  },
  {
    title: 'Memória operacional da squad',
    description:
      'Organize DISCOVERY, biblioteca viva e artefatos versionados para preservar conhecimento entre sprints.',
  },
  {
    title: 'Entrega com governança técnica',
    description:
      'Saia do modo individual e opere com fluxo de time: revisão, padronização, clareza de responsabilidade e continuidade.',
  },
];

const moduleBlocks = [
  {episode: 'Episódio I', module: 'Prólogo', lessons: '1 lição', focus: 'Um Novo Treinamento'},
  {episode: 'Episódio I', module: 'Cap. 1', lessons: '3 lições', focus: 'O Despertar da Força'},
  {episode: 'Episódio I', module: 'Cap. 2', lessons: '3 lições', focus: 'Os Holocrons'},
  {episode: 'Episódio I', module: 'Cap. 3', lessons: '4 lições', focus: 'Técnicas de Sabre'},
  {episode: 'Episódio I', module: 'Cap. 4', lessons: '3 lições', focus: 'Aliados da Resistência'},
  {episode: 'Episódio I', module: 'Cap. 5', lessons: '4 lições', focus: 'Os Droids'},
  {episode: 'Episódio II', module: 'Prólogo', lessons: '3 lições', focus: 'A Aliança dos Dois Sabres'},
  {episode: 'Episódio II', module: 'Cap. 1-4', lessons: '16 lições', focus: 'Discovery, Droids, Spike e Memória da Squad'},
  {episode: 'Episódio II', module: 'Cap. 5-8', lessons: '7 lições', focus: 'Estilo, Ritual de Início e Missão Final'},
];

const differentiators = [
  'Narrativa técnica com progressão prática, sem perder profundidade de engenharia',
  '44 videoaulas com duração estimada por lição e exercícios aplicáveis no trabalho real',
  'Stack de referência consistente: Python 3.13, FastAPI, Docker, PostgreSQL, MongoDB e Redis',
  'Material complementar no repositório: diagramas, templates, exemplos de skills e configuração MCP',
  'Seções de troubleshooting e checklists para reduzir erro recorrente em execução com IA',
];

const targetAudience = [
  'Devs que já programam e querem sair de prompts genéricos para fluxo profissional com IA',
  'Tech leads e squads que precisam padronizar uso de Copilot entre pessoas e projetos',
  'Times que sofrem com retrabalho por contexto perdido entre discovery, implementação e review',
  'Profissionais que querem incorporar MCP, memória de squad e rituais operacionais ao dia a dia',
];

function HomepageHeader({siteTitle}) {
  return (
    <header className={clsx('hero', styles.heroBanner)}>
      <div className={styles.heroBackdrop} aria-hidden="true" />
      <div className="container">
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <span className={styles.badgePill}>Fevereiro/2026</span>
            <span className={styles.badgePill}>44 lições publicadas</span>
            <span className={styles.badgePill}>Formato multimídia</span>
          </div>
          <h1 className={styles.heroTitle}>{siteTitle}</h1>
          <p className={styles.heroSubtitle}>Do uso casual ao fluxo profissional com GitHub Copilot no VS Code.</p>
          <p className={styles.heroDescription}>
            Acompanhe Kássia Oliveira em uma trilha prática para dominar contexto, instruções, droids e governança de squad com uma abordagem técnica aplicável em projetos reais.
          </p>
          <div className={styles.heroActions}>
            <Link
              className={clsx('button button--lg', styles.primaryButton)}
              to="/episodio-01/prologo/um-novo-treinamento">
              Começar pelo Episódio I
            </Link>
            <Link
              className={clsx('button button--lg', styles.secondaryButton)}
              to="/episodio-02/prologo/dois-jedis-nao-sao-uma-squad">
              Explorar Episódio II
            </Link>
          </div>
          <div className={styles.kpiGrid} role="list" aria-label="Indicadores do curso">
            <div className={styles.stat}>
              <p className={styles.statValue}>44</p>
              <p className={styles.statLabel}>Lições totais</p>
            </div>
            <div className={styles.stat}>
              <p className={styles.statValue}>15</p>
              <p className={styles.statLabel}>Módulos narrativos</p>
            </div>
            <div className={styles.stat}>
              <p className={styles.statValue}>100%</p>
              <p className={styles.statLabel}>Foco em VS Code + Copilot</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function AboutCourse() {
  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.sectionHeading}>
          <h2>Sobre o curso</h2>
          <p>
            Um treinamento narrativo e técnico para equipes que precisam transformar IA em produtividade com previsibilidade.
          </p>
        </div>
        <div className={styles.aboutGrid}>
          <article className={styles.infoCard}>
            <h3>Proposta</h3>
            <p>
              O curso mostra como sair do improviso para um sistema de trabalho com contexto, instruções e padrões de time.
              O foco esta em execucao real com VS Code e GitHub Copilot.
            </p>
          </article>
          <article className={styles.infoCard}>
            <h3>Formato</h3>
            <p>
              As aulas combinam video, explicacao em markdown, exercicios praticos, troubleshooting e checklists para consolidar
              aplicacao no ambiente profissional.
            </p>
          </article>
          <article className={styles.infoCard}>
            <h3>Recursos</h3>
            <p>
              O repositório inclui diagramas de fluxo, materiais em `static/skills`, exemplos de MCP e assets de apoio para estudar
              e reaplicar com a squad.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}

function LearnSection() {
  return (
    <section className={clsx(styles.section, styles.surfaceSection)}>
      <div className="container">
        <div className={styles.sectionHeading}>
          <h2>O que voce vai aprender</h2>
          <p>Beneficios concretos para reduzir retrabalho e aumentar consistencia na entrega com IA.</p>
        </div>
        <div className={styles.learnGrid}>
          {learningOutcomes.map((item) => (
            <article key={item.title} className={styles.learnCard}>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ModulesSection() {
  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.sectionHeading}>
          <h2>Estrutura de modulos e episodios</h2>
          <p>Resumo real da trilha publicada no projeto, com progressao do fundamento a operacao de squad.</p>
        </div>
        <div className={styles.moduleGrid}>
          {moduleBlocks.map((item) => (
            <article key={`${item.episode}-${item.module}`} className={styles.moduleCard}>
              <p className={styles.moduleMeta}>{item.episode}</p>
              <h3>{item.module}</h3>
              <p className={styles.moduleFocus}>{item.focus}</p>
              <p className={styles.moduleLessons}>{item.lessons}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function DifferentialsSection() {
  return (
    <section className={clsx(styles.section, styles.surfaceSection)}>
      <div className="container">
        <div className={styles.sectionHeading}>
          <h2>Diferenciais do treinamento</h2>
          <p>Elementos que aumentam percepcao de valor para quem busca aplicacao profissional imediata.</p>
        </div>
        <ul className={styles.cleanList}>
          {differentiators.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function AudienceSection() {
  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.sectionHeading}>
          <h2>Para quem este curso e indicado</h2>
          <p>Perfil ideal para aproveitar a trilha e converter aprendizado em melhoria de fluxo no trabalho.</p>
        </div>
        <div className={styles.audienceGrid}>
          {targetAudience.map((item) => (
            <article key={item} className={styles.audienceCard}>
              <p>{item}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className={clsx(styles.section, styles.finalSection)}>
      <div className="container">
        <div className={styles.ctaCard}>
          <div className={styles.ctaBody}>
            <h2>Pronto para sair do modo tentativa e erro?</h2>
            <p>
              Inicie a jornada pelo Prologo do Episodio I e use o repositório como base para aplicar o metodo no seu contexto de equipe.
            </p>
          </div>
          <div className={styles.ctaActions}>
            <Link className={clsx('button button--lg', styles.primaryButton)} to="/episodio-01/prologo/um-novo-treinamento">
              Comecar agora
            </Link>
            <Link className={clsx('button button--lg', styles.secondaryButton)} to="/episodio-01/o-despertar-da-forca/montando-o-sabre">
              Ver primeira trilha pratica
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function HomeFooter() {
  return (
    <footer className={styles.homeFooter}>
      <div className="container">
        <p>
          Copilot na Pratica | Curso narrativo para execucao tecnica com IA no VS Code | Conteudo de referencia: Fevereiro/2026
        </p>
        <Link className={styles.footerLink} to="/episodio-01/prologo/um-novo-treinamento">
          Acessar conteudo
        </Link>
      </div>
    </footer>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title} | Domine GitHub Copilot no VS Code`}
      description="Landing page do curso Copilot na Pratica: trilha com 44 licoes sobre contexto, prompt files, MCP e padroes de squad para uso profissional de IA.">
      <HomepageHeader siteTitle={siteConfig.title} />
      <main>
        <AboutCourse />
        <LearnSection />
        <ModulesSection />
        <DifferentialsSection />
        <AudienceSection />
        <FinalCTA />
      </main>
      <HomeFooter />
    </Layout>
  );
}
