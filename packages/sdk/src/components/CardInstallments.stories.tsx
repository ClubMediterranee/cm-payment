import type { Meta, StoryObj } from '@storybook/react-vite';
import { http } from 'msw';
import { mswLoader } from 'msw-storybook-addon';
import { expect, waitFor, within } from 'storybook/test';

import { MockedProvider } from '../__fixtures__/MockedProvider';
import { Action, PaymentProvider1CategoryPaymentMethod } from '../__generated__/index.schemas';
import { CardInstallments } from './CardInstallments';

const paymentProvidersWithInstallments = [
  {
    id: 'EVOXPAY',
    label: 'Evoxpay',
    connection_type: 'redirect',
    logo: 'https://example.com/evoxpay.png',
    category_payment_method: PaymentProvider1CategoryPaymentMethod.CreditCard,
    billing_address_form: false,
    description: 'Pay by credit card',
    payment_methods: [
      {
        id: 'visa-001',
        label: 'Visa',
        image: 'https://example.com/visa.png',
        currency: 'EUR',
        category: 'card',
        time_payment_conditions: [
          {
            id: 'visa-1x',
            payment_count: 1,
            charge_percentage: 0,
            required_delay_before_departure: 0,
            charge_amount: 0,
          },
          {
            id: 'visa-3x',
            payment_count: 3,
            charge_percentage: 0,
            required_delay_before_departure: 30,
            charge_amount: 0,
          },
          {
            id: 'visa-4x',
            payment_count: 4,
            charge_percentage: 2.5,
            required_delay_before_departure: 45,
            charge_amount: 0,
          },
        ],
      },
      {
        id: 'mastercard-002',
        label: 'Mastercard',
        image: 'https://example.com/mastercard.png',
        currency: 'EUR',
        category: 'card',
        time_payment_conditions: [
          {
            id: 'mc-1x',
            payment_count: 1,
            charge_percentage: 0,
            required_delay_before_departure: 0,
            charge_amount: 0,
          },
          {
            id: 'mc-4x',
            payment_count: 4,
            charge_percentage: 3.0,
            required_delay_before_departure: 45,
            charge_amount: 0,
          },
        ],
      },
    ],
  },
];

const paymentProvidersWithoutInstallments = [
  {
    id: 'PAYPAL',
    label: 'PayPal',
    connection_type: 'redirect',
    logo: 'https://example.com/paypal.png',
    category_payment_method: PaymentProvider1CategoryPaymentMethod.Paypal,
    billing_address_form: false,
    description: 'Pay with PayPal',
    payment_methods: [],
  },
];

const defaultHandlersWithInstallments = [
  http.get('*/rest/payment_config*', () => {
    return Response.json({
      feature_flips: {},
      settings: {},
    });
  }),
  http.get('*/rest/payment_schedules/booking/*', () => {
    return Response.json([
      {
        deadline: '20251231',
        amount: 1000,
        currency: 'EUR',
      },
    ]);
  }),
  http.get('*/v3/customers/test-customer/bookings/test-booking', () => {
    return Response.json({
      stays: [
        {
          product_id: 'PROD123',
          resort_arrival_date: '20251231',
          resort_leaving_date: '20260107',
          attendees: [
            {
              adults_count: 2,
              children_count: 0,
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
  http.get('*/rest/payment_providers/booking/*', () => {
    return Response.json({
      payment_providers: paymentProvidersWithInstallments.map((provider) => ({
        ...provider,
        configuration: {
          display_type: 'redirect',
          settings: {},
          validation: {
            requires_token: false,
            requires_expiry_date: false,
          },
        },
        payment_conditions: Object.fromEntries(
          (provider.payment_methods || []).map((method) => [
            method.label,
            method.time_payment_conditions || [],
          ]),
        ),
      })),
      buy_now_pay_later_providers: [],
    });
  }),
];

const defaultHandlersWithoutInstallments = [
  http.get('*/rest/payment_config*', () => {
    return Response.json({
      feature_flips: {},
      settings: {},
    });
  }),
  http.get('*/rest/payment_schedules/booking/*', () => {
    return Response.json([
      {
        deadline: '20251231',
        amount: 1000,
        currency: 'EUR',
      },
    ]);
  }),
  http.get('*/v3/customers/test-customer/bookings/test-booking', () => {
    return Response.json({
      stays: [
        {
          product_id: 'PROD123',
          resort_arrival_date: '20251231',
          resort_leaving_date: '20260107',
          attendees: [
            {
              adults_count: 2,
              children_count: 0,
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
  http.get('*/rest/payment_providers/booking/*', () => {
    return Response.json({
      payment_providers: paymentProvidersWithoutInstallments.map((provider) => ({
        ...provider,
        configuration: {
          display_type: 'iframe',
          settings: {},
          validation: {
            requires_token: false,
            requires_expiry_date: false,
          },
        },
        payment_conditions: {},
      })),
      buy_now_pay_later_providers: [],
    });
  }),
];

const CardInstallmentsWithProvider = () => {
  return (
    <MockedProvider
      bookingId="test-booking"
      customerId="test-customer"
      action={Action.PAYMENT_OPTION}
      defaultValues={{
        provider_id: 'EVOXPAY',
        amount: '1200',
        payment_method_id: 'visa-001',
        payment_condition_id: 'visa-1x',
      }}
    >
      <CardInstallments />
    </MockedProvider>
  );
};

const meta: Meta<typeof CardInstallments> = {
  title: 'Components/CardInstallments',
  component: CardInstallments,
  parameters: {
    layout: 'centered',
  },
  loaders: [mswLoader],
};

export default meta;
type Story = StoryObj<typeof CardInstallments>;

export const Default: Story = {
  parameters: {
    msw: {
      handlers: defaultHandlersWithInstallments,
    },
    docs: {
      description: {
        story:
          'Affichage par défaut avec sélection automatique de la première méthode de paiement et de la première condition.',
      },
    },
  },
  render() {
    return <CardInstallmentsWithProvider />;
  },
};

export const WithInteractions: Story = {
  parameters: {
    msw: {
      handlers: defaultHandlersWithInstallments,
    },
    docs: {
      description: {
        story: 'Test des interactions : changement de carte et sélection de mensualités.',
      },
    },
  },
  render() {
    return <CardInstallmentsWithProvider />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(
      () => {
        expect(canvas.getByLabelText(/Select your card type/i)).toBeInTheDocument();
      },
      { timeout: 3000 },
    );

    const cardTypeSelect = canvas.getByLabelText(/Select your card type/i) as HTMLSelectElement;

    expect(cardTypeSelect.value).toBe('Visa');

    cardTypeSelect.value = 'Mastercard';
    cardTypeSelect.dispatchEvent(new Event('change', { bubbles: true }));

    await waitFor(() => {
      expect(cardTypeSelect.value).toBe('Mastercard');
    });
  },
};

export const WithoutInstallments: Story = {
  parameters: {
    msw: {
      handlers: defaultHandlersWithoutInstallments,
    },
    docs: {
      description: {
        story:
          "Le composant ne s'affiche pas si le provider sélectionné n'a pas de payment_methods avec time_payment_conditions.",
      },
    },
  },
  render() {
    return (
      <MockedProvider
        bookingId="test-booking"
        customerId="test-customer"
        action={Action.PAYMENT_OPTION}
        defaultValues={{
          provider_id: 'PAYPAL',
        }}
      >
        <CardInstallments />
      </MockedProvider>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(
      () => {
        expect(canvas.queryByText(/Select your card type/i)).not.toBeInTheDocument();
        expect(canvas.queryByText(/Select the number of installments/i)).not.toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  },
};
