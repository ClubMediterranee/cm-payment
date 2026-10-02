import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor, within } from 'storybook/test';

import { CapsFormIFrame } from './CapsFormIFrame';

/**
 * Frames the CAPS app served by a running CAPS server (`CAPS_ALLOWED_ORIGINS` must contain the Storybook
 * origin). Override the server with `STORYBOOK_CAPS_URL`.
 */
const CAPS_URL = import.meta.env.STORYBOOK_CAPS_URL || 'http://localhost:8083';

const meta: Meta<typeof CapsFormIFrame> = {
  title: 'Embed/CapsFormIFrame',
  component: CapsFormIFrame,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          '`@clubmed/caps/iframe`: frames the CAPS app in embedded mode (token handshake, auto-resize, redirects forwarded to the host). See `packages/sdk/docs/embed.md`.',
      },
    },
  },
  args: {
    url: CAPS_URL,
    issuerType: 'GM',
    type: 'proposal',
    id: '2057923',
    locale: 'fr-FR',
    callbackUrl: 'https://host.example/payment/confirmation',
    onRedirect: () => false,
  },
  argTypes: {
    env: { control: 'select', options: [undefined, 'integration', 'staging', 'production'] },
    issuerType: { control: 'select', options: ['GM', 'GO', 'PARTNERS'] },
    type: { control: 'select', options: ['proposal', 'booking'] },
    accessToken: { control: 'text' },
    height: { control: 'number' },
    onReady: { action: 'ready' },
    onLoadingChange: { action: 'loadingChange' },
    onError: { action: 'error' },
  },
};

export default meta;

type Story = StoryObj<typeof CapsFormIFrame>;

export const GmProposal: Story = {
  args: {
    accessToken: 'secret-token',
  },
  play: async ({ canvasElement }) => {
    const iframe = await waitFor(() =>
      within(canvasElement).getByTitle<HTMLIFrameElement>('Club Med payment'),
    );
    const src = new URL(iframe.src);

    await expect(src.pathname).toBe('/gm/proposal/2057923');
    await expect(src.searchParams.get('embedded')).toBe('1');
    await expect(src.searchParams.get('parent_origin')).toBe(window.location.origin);
    // The token is sent through postMessage, never in the url.
    await expect(iframe.src).not.toContain('secret-token');
  },
};

export const FixedHeight: Story = {
  args: {
    height: 400,
  },
  play: async ({ canvasElement }) => {
    const iframe = await waitFor(() =>
      within(canvasElement).getByTitle<HTMLIFrameElement>('Club Med payment'),
    );

    await expect(iframe.style.height).toBe('400px');
  },
};
