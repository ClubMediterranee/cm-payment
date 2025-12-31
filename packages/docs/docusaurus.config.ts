import type * as Preset from '@docusaurus/preset-classic';
import type { Config } from '@docusaurus/types';
import { themes as prismThemes } from 'prism-react-renderer';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'ClubMed CAPS SDK',
  tagline: 'Centralized Autonomous Payment System - Documentation officielle',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://payment-docs.clubmed.com',
  // Set the /<baseUrl>/ pathname under which your site is served
  baseUrl: '/',

  // Organization config
  organizationName: 'clubmed',
  projectName: 'payment-sdk',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'fr',
    locales: ['fr'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: '/',
          sidebarPath: './sidebars.ts',
        },
        blog: {
          blogSidebarCount: 0,
          path: './blog',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themes: [
    [
      require.resolve('@easyops-cn/docusaurus-search-local'),
      {
        hashed: true,
        language: ['fr'],
        highlightSearchTermsOnTargetPage: true,
        explicitSearchResultPath: true,
      },
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/clubmed.jpeg',
    navbar: {
      title: '',
      logo: {
        alt: 'Club Med',
        src: 'img/clubmed-logo.svg',
        href: '/',
        style: { height: '32px', width: 'auto' },
      },
      items: [
        {
          label: 'CAPS SDK',
          position: 'left',
          to: '/',
        },
        {
          href: 'https://cm-payment-staging-ca98dc5783da.herokuapp.com/storybook/?path=/docs/introduction--docs',
          label: 'Storybook',
          position: 'right',
        },
        {
          href: 'https://scm.clubmed.com/clubmed/ui/cm-payment',
          label: 'GitLab',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      copyright: `Copyright © ${new Date().getFullYear()} Club Med. Tous droits réservés.`,
      links: [],
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
