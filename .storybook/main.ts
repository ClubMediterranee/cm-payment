import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: [
    '../doc/**/*.mdx',
    {
      directory: '../packages/sdk/src',
      titlePrefix: 'SDK',
    },
    // {
    //   directory: '../packages/sandbox/src',
    //   titlePrefix: 'Sandbox',
    // },
  ],

  addons: [
    '@storybook/addon-links',
    '@storybook/addon-onboarding',
    '@storybook/addon-docs',
    '@storybook/addon-a11y',
    '@storybook/addon-themes',
    '@storybook/addon-vitest',
  ],
  typescript: {
    reactDocgen: 'react-docgen',
  },
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  core: {
    builder: {
      name: '@storybook/builder-vite',
      options: {
        viteConfigPath: './vite.storybook.config.js',
      },
    },
    disableTelemetry: true,
  },
};
export default config;
