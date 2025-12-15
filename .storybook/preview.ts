import './style.css';

import type { Preview } from '@storybook/react-vite';
import { initialize, mswLoader } from 'msw-storybook-addon';
import { INITIAL_VIEWPORTS } from 'storybook/viewport';

import { iconsDecorator } from './icons.js';

initialize({
  onUnhandledRequest: 'bypass',
  serviceWorker: {
    url: '/mockServiceWorker.js',
  },
});

const preview: Preview = {
  loaders: [mswLoader],
  parameters: {
    a11y: {
      test: 'todo',
    },
    docs: {
      codePanel: true,
    },
    viewport: {
      options: {
        ...INITIAL_VIEWPORTS,
      },
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /dates?$/i,
      },
    },

    backgrounds: {
      default: 'white',
      values: [
        { name: 'white', value: 'hsl(var(--color-white))' },
        { name: 'pearl', value: 'hsl(var(--color-pearl))' },
        { name: 'ultramarine', value: 'hsl(var(--color-ultramarine))' },
        { name: 'darkGrey', value: 'hsl(var(--color-darkGrey))' },
      ],
    },
  },

  decorators: [iconsDecorator],
  tags: ['autodocs'],
};

export default preview;
