import type { Meta, StoryObj } from '@storybook/react-vite';
import { http } from 'msw';
import { initialize, mswLoader } from 'msw-storybook-addon';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { MockedProvider } from '../__fixtures__/MockedProvider';
import { Action, type PaymentProviderListModel2 } from '../__generated__';
import { PaymentProviders } from './PaymentProviders';

initialize();

const featureFlipsHandler = http.get(
  '*/v1/contents/feature-flip/locales/*/releases/*/value',
  () => {
    return Response.json({
      keys: [
        { key: 'featureFlipping.psp.provider_1', value: true },
        { key: 'featureFlipping.psp.provider_2', value: true },
        { key: 'featureFlipping.psp.credit_card', value: true },
        { key: 'featureFlipping.psp.bank_transfer', value: true },
      ],
    });
  },
);

const handlers = {
  multipleProviders: [
    featureFlipsHandler,
    http.get('*/v1/payment_providers', () => {
      const providers: PaymentProviderListModel2 = [
        {
          id: 'PROVIDER_1',
          label: 'Moyen de paiement 1',
          description: 'Payer avec le moyen 1',
          connection_type: 'REDIRECT',
          category_payment_method: 'CARD',
          billing_address_form: true,
          required_delay_before_departure: 0,
        },
        {
          id: 'PROVIDER_2',
          label: 'Moyen de paiement 2',
          description: 'Payer avec le moyen 2',
          connection_type: 'OFFLINE',
          category_payment_method: 'TRANSFER',
          billing_address_form: false,
          required_delay_before_departure: 0,
        },
      ];
      return Response.json(providers);
    }),
  ],
  singleProvider: [
    featureFlipsHandler,
    http.get('*/v1/payment_providers', () => {
      const providers: PaymentProviderListModel2 = [
        {
          id: 'CREDIT_CARD',
          label: 'Carte bancaire',
          description: 'Payer par carte bancaire',
          connection_type: 'REDIRECT',
          category_payment_method: 'CARD',
          billing_address_form: true,
          required_delay_before_departure: 0,
        },
      ];
      return Response.json(providers);
    }),
  ],
};

const meta: Meta<typeof PaymentProviders> = {
  title: 'Components/PaymentProviders',
  component: PaymentProviders,
  loaders: [mswLoader],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
Composant qui affiche les moyens de paiement disponibles, filtrés selon les feature flips actifs.

## Filtrage par feature flips

Le composant filtre automatiquement les moyens de paiement selon les feature flips CMS.

**Convention** : \`featureFlipping.psp.{provider_id_lowercase}\`

**Exemples** :
- Provider \`CREDIT_CARD\` → Feature flip \`featureFlipping.psp.credit_card\`
- Provider \`PAYPAL\` → Feature flip \`featureFlipping.psp.paypal\`

## API

Endpoint : \`GET /v1/payment_providers\`

📖 [Documentation complète des workflows](http://localhost:3000/docs/workflows/overview)
        `,
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const MultipleProvidersTest: Story = {
  parameters: {
    msw: {
      handlers: handlers.multipleProviders,
    },
  },
  play: async ({ canvasElement }) => {
    await waitFor(() => {
      const radios = canvasElement.querySelectorAll('input[type="radio"]');
      expect(radios.length).toBeGreaterThan(1);
    });
  },
  render(args: any) {
    return (
      <MockedProvider
        key="multiple-providers"
        action={Action.PAYMENT_RESA}
        proposalId="test-proposal-123"
        formDefaultValues={{
          amount: '1500 EUR',
          provider_id: '',
        }}
      >
        <PaymentProviders {...args} />
      </MockedProvider>
    );
  },
};

export const SingleProviderTest: Story = {
  parameters: {
    msw: {
      handlers: handlers.singleProvider,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByText('Payer par carte bancaire')).toBeInTheDocument());
  },
  render(args: any) {
    return (
      <MockedProvider
        key="single-provider"
        action={Action.PAYMENT_OPTION}
        bookingId="booking-123"
        customerId="customer-456"
        formDefaultValues={{
          amount: '2500 EUR',
          provider_id: '',
          template_id: '',
          cgv: false,
          billing_details: {
            email: '',
            mobile_phone: '',
          },
        }}
      >
        <PaymentProviders {...args} />
      </MockedProvider>
    );
  },
};

export const RadioSelectionTest: Story = {
  parameters: {
    msw: {
      handlers: [
        featureFlipsHandler,
        http.get('*/v1/payment_providers', () => {
          const providers: PaymentProviderListModel2 = [
            {
              id: 'CREDIT_CARD',
              label: 'Carte bancaire',
              description: 'Payer par carte bancaire',
              connection_type: 'REDIRECT',
              category_payment_method: 'CARD',
              billing_address_form: true,
              required_delay_before_departure: 0,
            },
            {
              id: 'BANK_TRANSFER',
              label: 'Virement bancaire',
              description: 'Payer par virement',
              connection_type: 'CLUBMED',
              category_payment_method: 'TRANSFER',
              billing_address_form: false,
              required_delay_before_departure: 0,
            },
            {
              id: 'PAYPAL',
              label: 'Paypal',
              description: 'Payer par Paypal',
              connection_type: 'CLUBMED',
              category_payment_method: 'TRANSFER',
              billing_address_form: false,
              required_delay_before_departure: 0,
            },
          ];
          return Response.json(providers);
        }),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() => {
      const radios = canvasElement.querySelectorAll('input[type="radio"]');
      expect(radios).toHaveLength(2);
    });

    expect(canvas.queryByText('Payer par Paypal')).not.toBeInTheDocument();

    const radios = canvasElement.querySelectorAll('input[type="radio"]');
    const firstRadio = radios[0] as HTMLInputElement;
    const secondRadio = radios[1] as HTMLInputElement;

    expect(firstRadio).toBeChecked();
    expect(secondRadio).not.toBeChecked();

    await userEvent.click(secondRadio);

    expect(secondRadio).toBeChecked();
    expect(firstRadio).not.toBeChecked();
  },
  render(args: any) {
    return (
      <MockedProvider
        key="radio-selection"
        action={Action.PAYMENT_RESA}
        proposalId="test-proposal-789"
        formDefaultValues={{
          amount: '3000 EUR',
          provider_id: '',
          template_id: '',
          cgv: false,
          billing_details: {
            email: '',
            mobile_phone: '',
          },
        }}
      >
        <PaymentProviders {...args} />
      </MockedProvider>
    );
  },
};
