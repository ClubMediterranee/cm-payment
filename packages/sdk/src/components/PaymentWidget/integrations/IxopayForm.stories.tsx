import type { Meta, StoryObj } from '@storybook/react-vite';
import { http, HttpResponse } from 'msw';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { beforeAll, vi } from 'vitest';

import { MockedProvider } from '../../../__fixtures__/MockedProvider';
import { IxopayForm } from './IxopayForm';

// Mock the global PaymentJs
const mockPaymentJs = {
  init: (
    _integrationKey: string,
    _numberSelector: string,
    _cvvSelector: string,
    callback: (payment: any) => void,
  ) => {
    const payment = {
      setNumberStyle: vi.fn(),
      setCvvStyle: vi.fn(),
      setNumberPlaceholder: vi.fn(),
      setCvvPlaceholder: vi.fn(),
      numberOn: vi.fn(),
      cvvOn: vi.fn(),
    };
    setTimeout(() => callback(payment), 100);
  },
  tokenize: vi.fn(),
};

beforeAll(() => {
  (window as any).PaymentJs = function PaymentJs() {
    return mockPaymentJs;
  };
});

const ixopayProvider = {
  id: 'IXOPAY',
  label: 'Ixopay',
  connection_type: 'hosted_field',
  category_payment_method: 'CreditCard',
  billing_address_form: false,
  configuration: {
    display_type: 'hosted_field' as const,
    settings: {
      script_url: 'https://mock.clubmed.com/ixopay/payment.js',
      integration_key: 'mock-integration-key',
    },
    validation: {
      requires_token: true,
      requires_expiry_date: true,
      requires_card_holder: true,
    },
  },
  payment_conditions: {},
};

const meta: Meta<typeof IxopayForm> = {
  title: 'Components/PaymentWidget/HostedFields/IxopayForm',
  component: IxopayForm,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
Composant de formulaire Ixopay qui affiche les champs hébergés pour la saisie des informations de carte bancaire.
- 2 champs hosted (number, cvv)
- 2 champs normaux (card holder, expiry date)
        `,
      },
    },
    msw: {
      handlers: [
        http.get('https://mock.clubmed.com/rest/payment_providers/:type/:id', () => {
          return HttpResponse.json({
            payment_providers: [ixopayProvider],
            buy_now_pay_later_providers: [],
          });
        }),
      ],
    },
  },
  render() {
    return (
      <MockedProvider
        defaultValues={{
          token: { value: '', status: 'idle' },
          provider_id: 'IXOPAY',
          creditCard: { cardHolder: '', expiryDate: '' },
        }}
        proposalId="12345678"
      >
        <IxopayForm />
      </MockedProvider>
    );
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: "Test complet du chargement : vérifie l'état de chargement avec animation.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(
      () => {
        const inputs = canvasElement.querySelectorAll('input, #number, #cvv');
        expect(inputs.length).toBeGreaterThan(0);
      },
      { timeout: 5000 },
    );

    const cardNumberDiv = canvasElement.querySelector('#number');
    const cvcDiv = canvasElement.querySelector('#cvv');

    expect(cardNumberDiv).toBeInTheDocument();
    expect(cvcDiv).toBeInTheDocument();

    const cardHolderInput = canvas.getByPlaceholderText('Cardholder name');
    expect(cardHolderInput).toBeInTheDocument();

    await userEvent.type(cardHolderInput, 'John Doe');
    expect(cardHolderInput).toHaveValue('John Doe');
  },
};

export const WithLoadingState: Story = {
  parameters: {
    docs: {
      description: {
        story: 'État de chargement avant que le SDK Ixopay ne soit initialisé.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const loadingFields = canvasElement.querySelectorAll('.animate-pulsation');

    loadingFields.forEach((field) => {
      expect(field).toHaveClass('pointer-events-none');
      expect(field).toHaveClass('bg-lightGrey');
    });
  },
};
