import type { Meta, StoryObj } from '@storybook/react-vite';
import { http } from 'msw';
import { mswLoader } from 'msw-storybook-addon';
import { expect, userEvent, waitFor, within } from 'storybook/test';

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
        payment_condition_id: 'visa-1x',
      }}
    >
      <CardInstallments />
    </MockedProvider>
  );
};

const meta: Meta<typeof CardInstallments> = {
  title: 'Current/Internals/CardInstallments',
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

const InstallmentsWithDefaults = ({
  defaultValues,
}: {
  defaultValues: React.ComponentProps<typeof MockedProvider>['defaultValues'];
}) => (
  <MockedProvider
    bookingId="test-booking"
    customerId="test-customer"
    action={Action.PAYMENT_OPTION}
    defaultValues={{ provider_id: 'EVOXPAY', amount: '1200', ...defaultValues }}
  >
    <CardInstallments />
  </MockedProvider>
);

const selectsOf = async (canvasElement: HTMLElement) => {
  const canvas = within(canvasElement);

  await waitFor(() => expect(canvas.getAllByRole('combobox')).toHaveLength(2), { timeout: 5000 });

  return canvas.getAllByRole('combobox') as HTMLSelectElement[];
};

export const WithoutPreselection: Story = {
  parameters: {
    msw: { handlers: defaultHandlersWithInstallments },
    docs: {
      description: {
        story: 'Sans valeur par défaut, le type de carte et les mensualités sont à choisir.',
      },
    },
  },
  render: () => <InstallmentsWithDefaults defaultValues={{}} />,
  play: async ({ canvasElement }) => {
    const [cardType, installments] = await selectsOf(canvasElement);

    expect(cardType).toHaveValue('');
    expect(installments).toHaveValue('');
    expect(installments).toBeDisabled();
  },
};

export const ChoosingCardTypeThenInstallments: Story = {
  parameters: {
    msw: { handlers: defaultHandlersWithInstallments },
    docs: {
      description: {
        story:
          "Les mensualités restent désactivées tant qu'aucun type de carte n'est choisi, puis listent celles du type choisi.",
      },
    },
  },
  render: () => <InstallmentsWithDefaults defaultValues={{}} />,
  play: async ({ canvasElement }) => {
    const [cardType, installments] = await selectsOf(canvasElement);

    expect(cardType).toHaveDisplayValue('Choose');
    expect(installments).toBeDisabled();

    await userEvent.selectOptions(cardType, 'Visa');
    await waitFor(() => expect(installments).toBeEnabled());
    expect(installments).toHaveDisplayValue('Choose');

    const labels = within(installments)
      .getAllByRole('option')
      .map((option) => option.textContent ?? '');
    expect(labels).toHaveLength(4);
    expect(labels.slice(1)).toEqual([
      expect.stringMatching(/^1 X of/),
      expect.stringMatching(/^3 X of/),
      expect.stringMatching(/^4 X of/),
    ]);

    await userEvent.selectOptions(installments, 'visa-3x');
    expect(installments).toHaveValue('visa-3x');
  },
};

export const KeepsInstallmentCountWhenChangingCardType: Story = {
  parameters: {
    msw: { handlers: defaultHandlersWithInstallments },
    docs: {
      description: {
        story:
          'Changer de type de carte garde le même nombre de mensualités quand le nouveau type le propose (Visa 4x → Mastercard 4x), sinon le choix est vidé (Visa 3x → Mastercard).',
      },
    },
  },
  render: () => <InstallmentsWithDefaults defaultValues={{ payment_condition_id: 'visa-4x' }} />,
  play: async ({ canvasElement }) => {
    const [cardType, installments] = await selectsOf(canvasElement);

    expect(cardType).toHaveValue('Visa');
    expect(installments).toHaveValue('visa-4x');

    await userEvent.selectOptions(cardType, 'Mastercard');
    await waitFor(() => expect(installments).toHaveValue('mc-4x'));

    await userEvent.selectOptions(cardType, 'Visa');
    await userEvent.selectOptions(installments, 'visa-3x');
    await userEvent.selectOptions(cardType, 'Mastercard');
    await waitFor(() => expect(installments).toHaveValue(''));
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
        const selects = canvas.getAllByRole('combobox');
        expect(selects.length).toBeGreaterThan(0);
      },
      { timeout: 5000 },
    );

    const selects = canvas.getAllByRole('combobox');
    const cardTypeSelect = selects[0] as HTMLSelectElement;

    await waitFor(() => {
      expect(cardTypeSelect.value).toBeTruthy();
    });

    const options = Array.from(cardTypeSelect.options).map((opt) => opt.value);
    if (options.length > 1) {
      cardTypeSelect.value = options[1];
      cardTypeSelect.dispatchEvent(new Event('change', { bubbles: true }));

      await waitFor(() => {
        expect(cardTypeSelect.value).toBe(options[1]);
      });
    }
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
