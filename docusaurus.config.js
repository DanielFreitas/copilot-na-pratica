// @ts-check

const {themes} = require('prism-react-renderer');
const lightCodeTheme = themes.github;
const darkCodeTheme = themes.dracula;

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Copilot na Prática — Episódio I',
  tagline: 'Que o Copilot esteja com você.',
  favicon: 'img/favicon.ico',

  url: 'https://danielfreitas.github.io',
  baseUrl: '/copilot-na-pratica/',

  organizationName: 'DanielFreitas',
  projectName: 'copilot-na-pratica',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'pt-BR',
    locales: ['pt-BR'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          routeBasePath: '/',
          sidebarPath: require.resolve('./sidebars.js'),
        },
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/docusaurus-social-card.jpg',
      navbar: {
        title: 'Copilot na Prática — Ep. I',
        logo: {
          alt: 'Copilot na Prática Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            to: '/episodio-01/prologo/um-novo-treinamento',
            position: 'left',
            label: 'O Caminho Jedi',
          },
          {
            href: 'https://github.com/DanielFreitas/copilot-na-pratica',
            label: 'Templo (GitHub)',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [],
        copyright: `Episódio I da saga de Kássia Oliveira · Data de referência: Fevereiro/2026 · Feito com Docusaurus · © ${new Date().getFullYear()}`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
        additionalLanguages: ['bash', 'json', 'yaml', 'markdown'],
      },
      colorMode: {
        defaultMode: 'dark',
        disableSwitch: false,
        respectPrefersColorScheme: false,
      },
    }),
};

module.exports = config;
