import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, waitFor, within } from 'storybook/test';

import { CapsFormWebComponent } from './CapsFormWebComponent';

/**
 * Loads the federated CAPS form from a running CAPS server (`pnpm --filter @clubmed/server start`, with
 * `CAPS_ALLOWED_ORIGINS` containing the Storybook origin). Override the server with `STORYBOOK_CAPS_URL`.
 */
const CAPS_URL = import.meta.env.STORYBOOK_CAPS_URL || 'http://localhost:8083';

const meta: Meta<typeof CapsFormWebComponent> = {
  title: 'Embed/CapsFormWebComponent',
  component: CapsFormWebComponent,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          '`@clubmed/caps/webcomponent`: loads the CAPS form at runtime from the CAPS server (Module Federation, React shared), rendered in a `<caps-form>` shadow root. See `packages/sdk/docs/embed.md`.',
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
    fallback: <p>Loading CAPS…</p>,
    onRedirect: () => false,
  },
  argTypes: {
    env: { control: 'select', options: [undefined, 'integration', 'staging', 'production'] },
    issuerType: { control: 'select', options: ['GM', 'GO', 'PARTNERS'] },
    type: { control: 'select', options: ['proposal', 'booking'] },
    accessToken: { control: 'text' },
    onReady: { action: 'ready' },
    onLoadingChange: { action: 'loadingChange' },
    onError: { action: 'error' },
  },
};

export default meta;

type Story = StoryObj<typeof CapsFormWebComponent>;

export const GmProposal: Story = {
  play: async ({ canvasElement }) => {
    // The fallback is rendered until the remote is loaded (or fails when no CAPS server runs).
    await expect(within(canvasElement).getByText('Loading CAPS…')).toBeInTheDocument();
  },
};

export const GoProposal: Story = {
  args: {
    issuerType: 'GO',
    customerId: '123456',
  },
};

export const UnknownEnvironment: Story = {
  args: {
    url: undefined,
    env: 'qa' as never,
    onError: fn(),
  },
  play: async ({ args, canvasElement }) => {
    await waitFor(() =>
      expect(args.onError).toHaveBeenCalledWith(
        expect.objectContaining({ code: 'REMOTE_LOAD_FAILED' }),
      ),
    );
    await expect(canvasElement.querySelector('caps-form')).toBeNull();
  },
};
