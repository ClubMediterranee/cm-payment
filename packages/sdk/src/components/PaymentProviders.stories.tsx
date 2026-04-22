import type { Meta, StoryObj } from '@storybook/react-vite';
import { http } from 'msw';
import { mswLoader } from 'msw-storybook-addon';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { MockedProvider } from '../__fixtures__/MockedProvider';
import { Action } from '../__generated__/index.schemas';
import { PaymentProviders } from './PaymentProviders';

const commonHandlers = [
  http.get('*/rest/payment_schedules/booking/*', () => {
    return Response.json([
      {
        deadline: '20251006',
        amount: 3079,
        currency: 'EUR',
      },
    ]);
  }),
  http.get('*/v3/customers/customer-456/bookings/booking-123', () => {
    return Response.json({
      stays: [
        {
          product_id: 'PROD123',
          resort_arrival_date: '20251001',
          resort_leaving_date: '20251008',
          attendees: [
            {
              adults_count: 2,
              children_count: 1,
            },
          ],
          accommodations: [
            {
              quantity: 1,
            },
          ],
          outward_trip: {
            transportation: ['PLANE'],
          },
        },
      ],
    });
  }),
];

const commonMockedProviderProps = {
  action: Action.PAYMENT_OPTION,
  bookingId: 'booking-123',
  customerId: 'customer-456',
  paymentConfig: {
    providers: {
      PROVIDER_1: { is_active: true, settings: {} },
      PROVIDER_2: { is_active: true, settings: {} },
      PROVIDER_3: { is_active: true, settings: {} },
      PROVIDER_4: { is_active: false, settings: {} },
    },
    featureFlip: {},
  },
};
const handlers = {
  creditCard: [
    ...commonHandlers,
    http.get('*/v1/payment_providers', () => {
      return Response.json([
        {
          id: 'PROVIDER_1',
          label: 'Carte bancaire',
          description: 'Payer par carte bancaire',
          connection_type: 'REDIRECT',
          category_payment_method: 'CreditCard',
          billing_address_form: true,
          required_delay_before_departure: 0,
        },
      ]);
    }),
  ],
  bankTransfer: [
    ...commonHandlers,
    http.get('*/v1/payment_providers', () => {
      return Response.json([
        {
          id: 'PROVIDER_2',
          label: 'Virement bancaire',
          description: 'Payer par virement bancaire',
          connection_type: 'OFFLINE',
          category_payment_method: 'BankTransfer',
          billing_address_form: false,
          required_delay_before_departure: 0,
        },
      ]);
    }),
  ],
  paypal: [
    ...commonHandlers,
    http.get('*/v1/payment_providers', () => {
      return Response.json([
        {
          id: 'PROVIDER_3',
          label: 'Paypal',
          description: 'Payer avec Paypal',
          connection_type: 'REDIRECT',
          category_payment_method: 'Paypal',
          billing_address_form: true,
          required_delay_before_departure: 0,
        },
      ]);
    }),
  ],
  multipleProviders: [
    ...commonHandlers,
    http.get('*/v1/payment_providers', () => {
      return Response.json([
        {
          id: 'PROVIDER_1',
          label: 'Moyen de paiement 1',
          description: 'Provider 1',
          connection_type: 'REDIRECT',
          category_payment_method: '',
          billing_address_form: true,
          required_delay_before_departure: 0,
        },
        {
          id: 'PROVIDER_2',
          label: 'Moyen de paiement 2',
          description: 'Provider 2',
          connection_type: 'OFFLINE',
          category_payment_method: '',
          billing_address_form: false,
          required_delay_before_departure: 0,
        },
        {
          id: 'PROVIDER_3',
          label: 'Moyen de paiement 3',
          description: '',
          connection_type: 'REDIRECT',
          category_payment_method: '',
          billing_address_form: true,
          required_delay_before_departure: 0,
        },
        {
          id: 'PROVIDER_4',
          label: 'Moyen de paiement 4',
          description: 'Par autre moyen',
          connection_type: 'REDIRECT',
          category_payment_method: '',
          billing_address_form: true,
          required_delay_before_departure: 0,
        },
      ]);
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

export const CreditCard: Story = {
  parameters: {
    msw: {
      handlers: handlers.creditCard,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => {
      const radios = canvasElement.querySelectorAll('input[type="radio"]');
      expect(radios.length).toBe(1);
      expect(canvas.getByText('Payer par carte bancaire')).toBeInTheDocument();

      expect(canvas.getByTestId('icon-CreditCard')).toBeInTheDocument();
    });
  },
  render(args: any) {
    return (
      <MockedProvider
        key="credit-card"
        {...commonMockedProviderProps}
        defaultValues={{
          amount: '2500',
        }}
      >
        <PaymentProviders {...args} />
      </MockedProvider>
    );
  },
};

export const BankTransfer: Story = {
  parameters: {
    msw: {
      handlers: handlers.bankTransfer,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => {
      const radios = canvasElement.querySelectorAll('input[type="radio"]');
      expect(radios.length).toBe(1);
      expect(canvas.getByText('Payer par virement bancaire')).toBeInTheDocument();

      expect(
        canvas.getByText('Secure 100% payment (direct connection with your bank)'),
      ).toBeInTheDocument();
      expect(canvas.getByText('No payment limit for standard bank transfers')).toBeInTheDocument();

      const creditCardIcon = canvasElement.querySelector('svg[data-icon-name="CreditCard"]');
      expect(creditCardIcon).not.toBeInTheDocument();
    });
  },
  render(args: any) {
    return (
      <MockedProvider
        key="bank-transfer"
        {...commonMockedProviderProps}
        defaultValues={{
          amount: '1800',
        }}
      >
        <PaymentProviders {...args} />
      </MockedProvider>
    );
  },
};

export const Paypal: Story = {
  parameters: {
    msw: {
      handlers: handlers.paypal,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => {
      const radios = canvasElement.querySelectorAll('input[type="radio"]');
      expect(radios.length).toBe(1);
      expect(canvas.getByText('Payer avec Paypal')).toBeInTheDocument();
    });
  },
  render(args: any) {
    return (
      <MockedProvider
        key="paypal"
        {...commonMockedProviderProps}
        defaultValues={{
          amount: '3200',
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
      handlers: handlers.multipleProviders,
    },
  },
  play: async ({ canvasElement }) => {
    const radios = await waitFor(() => {
      const radioElements = canvasElement.querySelectorAll('input[type="radio"]');
      expect(radioElements).toHaveLength(3);
      return radioElements;
    });

    const firstRadio = radios[0] as HTMLInputElement;
    const secondRadio = radios[1] as HTMLInputElement;
    const thirdRadio = radios[2] as HTMLInputElement;

    await waitFor(() => {
      expect(firstRadio).toBeChecked();
    });
    expect(secondRadio).not.toBeChecked();
    expect(thirdRadio).not.toBeChecked();

    await userEvent.click(secondRadio);

    await waitFor(() => {
      expect(secondRadio).toBeChecked();
    });
    expect(firstRadio).not.toBeChecked();
    expect(thirdRadio).not.toBeChecked();

    await userEvent.click(thirdRadio);

    await waitFor(() => {
      expect(thirdRadio).toBeChecked();
    });
    expect(firstRadio).not.toBeChecked();
    expect(secondRadio).not.toBeChecked();
  },
  render(args: any) {
    return (
      <MockedProvider
        key="radio-selection"
        {...commonMockedProviderProps}
        bookingId="12345678"
        customerId="123456789"
        defaultValues={{
          amount: '3000',
          provider_id: 'PROVIDER_1',
        }}
      >
        <PaymentProviders {...args} />
      </MockedProvider>
    );
  },
};
