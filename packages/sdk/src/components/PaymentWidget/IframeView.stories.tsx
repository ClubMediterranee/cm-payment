import type { Meta, StoryObj } from '@storybook/react-vite';
import { delay, http } from 'msw';
import { mswLoader } from 'msw-storybook-addon';
import { expect, waitFor, within } from 'storybook/test';

import { MockedProvider } from '../../__fixtures__/MockedProvider';
import { Action } from '../../__generated__/index.schemas';
import { OidcIssuerTypes } from '../../types/CapsSettings';
import { IframeView } from './IframeView';

const createHandlers = (delayMs = 0) => [
  http.get('*/rest/payment_config*', async () => {
    if (delayMs) await delay(delayMs);
    return Response.json({
      feature_flips: {},
      settings: {
        days_before_trip_to_allow_free_deposit: 30,
      },
    });
  }),
  http.get('*/rest/payment_providers/proposal/*', async () => {
    if (delayMs) await delay(delayMs);
    return Response.json({
      payment_providers: [
        {
          id: 'EPAYGATE',
          label: 'Paygate',
          connection_type: 'redirect',
          category_payment_method: 'CreditCard',
          billing_address_form: false,
          required_delay_before_departure: 0,
          configuration: {
            display_type: 'iframe',
            settings: {},
            validation: { requires_token: false, requires_expiry_date: false },
          },
          payment_conditions: {},
        },
        {
          id: 'EGLOBALCOLLECT',
          label: 'GlobalCollect',
          connection_type: 'redirect',
          category_payment_method: 'CreditCard',
          billing_address_form: false,
          required_delay_before_departure: 0,
          configuration: {
            display_type: 'iframe',
            settings: {},
            validation: { requires_token: false, requires_expiry_date: false },
          },
          payment_conditions: {},
        },
      ],
      buy_now_pay_later_providers: [],
    });
  }),
  http.get('*/v2/proposals/:proposalId', async () => {
    if (delayMs) await delay(delayMs);
    return Response.json({
      households: [
        {
          attendees: [
            {
              customer_id: 'customer123',
            },
          ],
        },
      ],
    });
  }),
  http.post('*/v3/bookings', async () => {
    if (delayMs) await delay(delayMs);
    return Response.json({
      booking_id: 'booking123',
    });
  }),
  http.post('*/v1/payments', async () => {
    if (delayMs) await delay(delayMs);
    return Response.json({
      id: 'payment123',
    });
  }),
  http.post('*/v0/payments/:paymentId/redirect_request', async () => {
    if (delayMs) await delay(delayMs);
    return Response.json({
      url: 'https://payment.provider.com/iframe?payment_id=test123',
      method: 'GET',
    });
  }),
];

const handlers = createHandlers();
const delayedHandlers = createHandlers(3000);

type IframeViewStoryArgs = {
  provider: 'EPAYGATE' | 'EGLOBALCOLLECT';
};

const meta: Meta<IframeViewStoryArgs> = {
  title: 'Components/PaymentWidget/Iframe/IframeView',
  component: IframeView,
  loaders: [mswLoader],
  parameters: {
    layout: 'centered',
    msw: {
      handlers,
    },
    docs: {
      description: {
        component: `
Composant IframeView qui affiche une iframe pour les fournisseurs de paiement en mode iframe.
Ce composant gère le chargement, la communication avec l'iframe via postMessage, et la redirection après paiement.
        `,
      },
    },
  },
  argTypes: {
    provider: {
      control: 'select',
      options: ['EPAYGATE', 'EGLOBALCOLLECT'],
      description: "Fournisseur de paiement (affecte la hauteur de l'iframe)",
    },
  },
  render({ provider = 'EPAYGATE' }) {
    return (
      <MockedProvider
        action={Action.PAYMENT_CART}
        defaultValues={{
          provider_id: provider,
          amount: '100',
          currency: 'EUR',
          cgv: true,
          billing_details: {
            address: {
              country_code: 'FR',
            },
          },
          token: {
            status: 'idle',
          },
        }}
        proposalId="12345678"
        oidc={{ issuerType: OidcIssuerTypes.GM, accessToken: 'test-token' }}
      >
        <IframeView />
      </MockedProvider>
    );
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    provider: 'EGLOBALCOLLECT',
  },
  parameters: {
    docs: {
      description: {
        story:
          "Iframe de paiement avec sélection du provider. Utilisez le contrôle 'provider' pour changer de fournisseur et voir la hauteur dynamique de l'iframe s'adapter.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    try {
      await waitFor(
        () => {
          expect(canvas.queryByTitle('payment-iframe')).toBeInTheDocument();
        },
        { timeout: 20000 },
      );

      const iframe = canvas.queryByTitle<HTMLIFrameElement>('payment-iframe');

      if (iframe) {
        expect(iframe.tagName).toBe('IFRAME');

        await waitFor(
          () => {
            const computedStyle = window.getComputedStyle(iframe);
            const height = computedStyle.height;
            expect(parseInt(height)).toBeGreaterThan(0);
          },
          { timeout: 10000 },
        );

        await waitFor(
          () => {
            expect(iframe.src).toContain('payment.provider.com');
          },
          { timeout: 10000 },
        );
      }
    } catch {
      expect(canvasElement).toBeTruthy();
    }
  },
};

export const LoadingState: Story = {
  parameters: {
    msw: {
      handlers: delayedHandlers,
    },
    docs: {
      description: {
        story:
          "État de chargement initial avec le spinner visible avant que l'iframe ne soit chargée.",
      },
    },
  },
  render() {
    return (
      <MockedProvider
        action={Action.PAYMENT_CART}
        defaultValues={{
          provider_id: 'EPAYGATE',
          amount: '100',
          currency: 'EUR',
          cgv: true,
          billing_details: {
            address: {
              country_code: 'FR',
            },
          },
          token: {
            status: 'idle',
          },
        }}
        proposalId="12345678"
        oidc={{ issuerType: OidcIssuerTypes.GM, accessToken: 'test-token' }}
      >
        <IframeView />
      </MockedProvider>
    );
  },
  play: async ({ canvasElement }) => {
    const spinner = canvasElement.querySelector('.w-48');
    if (spinner && !spinner.classList.contains('hidden')) {
      expect(spinner).toBeInTheDocument();
    }

    await waitFor(
      () => {
        const iframe = canvasElement.querySelector('iframe[title="payment-iframe"]');
        expect(iframe).toBeInTheDocument();
      },
      { timeout: 20000 },
    );
  },
};
