import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero', styles.heroBanner)}>
      <div className={styles.heroBackground}></div>
      <div className="container">
        <div className={styles.heroContent}>
          <div className={styles.badge}>
            <span className={styles.badgeIcon}>✨</span>
            <span className={styles.badgeText}>Episódio I · Fevereiro/2026</span>
          </div>
          <h1 className={styles.heroTitle}>{siteConfig.title}</h1>
          <p className={styles.heroTagline}>
            7 módulos · 26 lições · ~16h
          </p>
          <p className={styles.heroDescription}>
            Acompanhe Kássia Oliveira, uma padawan que pausa a guerra contra o Império para dominar GitHub Copilot no VS Code com método, contexto e padrão de time.
          </p>
          <div className={styles.heroButtons}>
            <Link
              className={clsx('button button--lg', styles.primaryButton)}
              to="/prologo/um-novo-treinamento">
              <span className={styles.buttonIcon}>🚀</span>
              Iniciar Treinamento
            </Link>
            <Link
              className={clsx('button button--lg', styles.secondaryButton)}
              to="/prologo/um-novo-treinamento">
              <span className={styles.buttonIcon}>📦</span>
              Abrir Prólogo
            </Link>
          </div>
          <div className={styles.statsBar}>
            <div className={styles.stat}>
              <div className={styles.statValue}>7</div>
              <div className={styles.statLabel}>Módulos</div>
            </div>
            <div className={styles.statDivider}></div>
            <div className={styles.stat}>
              <div className={styles.statValue}>26</div>
              <div className={styles.statLabel}>Lições</div>
            </div>
            <div className={styles.statDivider}></div>
            <div className={styles.stat}>
              <div className={styles.statValue}>~16h</div>
              <div className={styles.statLabel}>Carga total</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function FeatureList() {
  const features = [
    {
      title: 'Contexto com Precisão',
      emoji: '⚡',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      description: 'Aprenda a usar contexto implícito e explícito para sair de respostas genéricas e chegar em execução técnica previsível.',
    },
    {
      title: 'Padrões Reutilizáveis',
      emoji: '🏢',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      description: 'Holocrons, Prompt Files, Agents e Skills para transformar práticas individuais em rotina consistente de equipe.',
    },
    {
      title: 'Fluxo Completo com MCP',
      emoji: '📊',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      description: 'Conecte Droids ao workspace, combine fontes de verdade e execute mudanças com revisão e governança até o merge.',
    },
  ];

  return (
    <section className={styles.features}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Por que este treinamento?</h2>
          <p className={styles.sectionSubtitle}>
            Um método completo para dominar GitHub Copilot no fluxo real de desenvolvimento
          </p>
        </div>
        <div className={styles.featuresGrid}>
          {features.map((feature, idx) => (
            <div key={idx} className={styles.featureCard}>
              <div 
                className={styles.featureHeader}
                style={{background: feature.gradient}}
              >
                <div className={styles.featureEmoji}>{feature.emoji}</div>
              </div>
              <div className={styles.featureBody}>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureDescription}>{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CourseStructure() {
  const sections = [
    { title: 'Prólogo', description: 'Um Novo Treinamento', icon: '🎬' },
    { title: 'Cap. 1', description: 'O Despertar da Força', icon: '⚡' },
    { title: 'Cap. 2', description: 'Os Holocrons', icon: '📜' },
    { title: 'Cap. 3', description: 'Técnicas de Sabre', icon: '🗡️' },
    { title: 'Cap. 4', description: 'Aliados da Resistência', icon: '🤝' },
    { title: 'Cap. 5', description: 'Os Droids', icon: '🤖' },
    { title: 'Cap. 6', description: 'O Conselho Jedi', icon: '🏛️' },
    { title: 'Cap. 7', description: 'A Missão Final', icon: '🎯' },
    { title: 'Epílogo', description: 'Mestre Jedi', icon: '🏆' },
  ];

  return (
    <section className={styles.structure}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Estrutura da Jornada</h2>
          <p className={styles.sectionSubtitle}>
            Uma trilha progressiva para transformar uso casual de IA em domínio operacional
          </p>
        </div>
        <div className={styles.structureGrid}>
          {sections.map((section, idx) => (
            <div key={idx} className={styles.structureCard}>
              <div className={styles.structureIcon}>{section.icon}</div>
              <h4 className={styles.structureTitle}>{section.title}</h4>
              <p className={styles.structureDescription}>{section.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className={styles.finalCTA}>
      <div className="container">
        <div className={styles.ctaCard}>
          <div className={styles.ctaContent}>
            <h2 className={styles.ctaTitle}>Que o Copilot esteja com você.</h2>
            <p className={styles.ctaDescription}>
              Entre no Templo Jedi e execute o curso completo com base em contexto, padrões e governança de time.
            </p>
            <div className={styles.ctaButtons}>
              <Link
                className={clsx('button button--lg', styles.primaryButton)}
                to="/prologo/um-novo-treinamento">
                <span className={styles.buttonIcon}>🚀</span>
                Iniciar Treinamento
              </Link>
            </div>
          </div>
          <div className={styles.ctaHighlights}>
            <div className={styles.highlight}>
              <span className={styles.highlightIcon}>✓</span>
              <span>7 módulos e 26 lições</span>
            </div>
            <div className={styles.highlight}>
              <span className={styles.highlightIcon}>✓</span>
              <span>Stack fixa: Python 3.13 + FastAPI + Docker</span>
            </div>
            <div className={styles.highlight}>
              <span className={styles.highlightIcon}>✓</span>
              <span>Lore Star Wars com técnica profissional</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title}`}
      description="Curso narrativo completo para dominar GitHub Copilot no VS Code com método de time">
      <HomepageHeader />
      <main>
        <FeatureList />
        <CourseStructure />
        <FinalCTA />
      </main>
    </Layout>
  );
}
