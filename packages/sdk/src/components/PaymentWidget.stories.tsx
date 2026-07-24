import type { Meta, StoryObj } from '@storybook/react-vite';
import { delay, http } from 'msw';
import { mswLoader } from 'msw-storybook-addon';
import type { ReactNode } from 'react';

import { MockedProvider } from '../__fixtures__/MockedProvider';
import { Action } from '../__generated__/index.schemas';
import { OidcIssuerTypes } from '../types/CapsSettings';
import { PspProviders } from '../types/PspProviders';
import { PaymentWidget } from './PaymentWidget';

type IntegrationMode = 'iframe' | 'hosted_field' | 'redirect';

const getProviderByMode = (mode: IntegrationMode): PspProviders => {
  switch (mode) {
    case 'iframe':
      return PspProviders.EPAYGATE;
    case 'hosted_field':
      return PspProviders.HIPAY;
    case 'redirect':
      return PspProviders.EVOXPAY;
  }
};

const createHandlers = (delayMs = 0, integrationMode: IntegrationMode = 'redirect') => {
  const provider = getProviderByMode(integrationMode);

  return [
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
    http.get('*/rest/payment_config*', () => {
      return Response.json({
        feature_flips: {},
        settings: {
          days_before_trip_to_allow_free_deposit: 30,
        },
      });
    }),
    http.get('*/rest/payment_providers/proposal/*', () => {
      return Response.json({
        payment_providers: [
          {
            id: provider,
            label: provider,
            category_payment_method: 'Card',
            configuration: {
              display_type: integrationMode,
              settings: {},
              validation: {
                requires_token: integrationMode === 'hosted_field',
                requires_expiry_date: false,
              },
            },
            payment_conditions: {},
          },
        ],
        buy_now_pay_later_providers: [],
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
};

type PaymentWidgetStoryArgs = {
  integrationMode: IntegrationMode;
  children?: ReactNode;
};

const meta: Meta<PaymentWidgetStoryArgs> = {
  title: 'Components/PaymentWidget',
  component: PaymentWidget,
  loaders: [mswLoader],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
Composant PaymentWidget qui affiche le bon composant de paiement selon le mode d'intégration du provider sélectionné:
- **iframe**: Affiche une iframe pour les providers comme EPAYGATE ou EGLOBALCOLLECT
- **hosted_field**: Affiche un formulaire avec champs sécurisés pour HIPAY
- **redirect**: Mode redirection (pas de composant affiché, redirection directe)
        `,
      },
    },
  },
  argTypes: {
    integrationMode: {
      control: 'select',
      options: ['iframe', 'hosted_field', 'redirect'] as IntegrationMode[],
      description: "Mode d'intégration du fournisseur de paiement",
    },
  },
  render({ integrationMode = 'iframe' }) {
    const provider = getProviderByMode(integrationMode);

    return (
      <MockedProvider
        action={Action.PAYMENT_CART}
        defaultValues={{
          provider_id: provider,
          amount: '100',
          currency: 'EUR',
          cgv: true,
          token: {
            status: 'idle',
          },
        }}
        proposalId="12345678"
        oidc={{ issuerType: OidcIssuerTypes.GM, accessToken: 'test-token' }}
      >
        <PaymentWidget />
      </MockedProvider>
    );
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    integrationMode: 'redirect',
  },
  parameters: {
    msw: {
      handlers: createHandlers(0, 'redirect'),
    },
    docs: {
      description: {
        story:
          "PaymentWidget avec contrôle pour changer le mode d'intégration. Utilisez le contrôle 'integrationMode' pour basculer entre iframe, hosted_field et redirect.",
      },
    },
  },
};

export const HostedField: Story = {
  args: {
    integrationMode: 'hosted_field',
  },
  parameters: {
    msw: {
      handlers: createHandlers(0, 'hosted_field'),
    },
    docs: {
      description: {
        story: 'PaymentWidget en mode hosted_field avec Hipay.',
      },
    },
  },
};

export const Iframe: Story = {
  args: {
    integrationMode: 'iframe',
  },
  parameters: {
    msw: {
      handlers: createHandlers(0, 'iframe'),
    },
    docs: {
      description: {
        story: 'PaymentWidget en mode iframe avec Epaygate.',
      },
    },
  },
};
