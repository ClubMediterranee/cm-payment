import type { Meta, StoryObj } from '@storybook/react-vite';
import { http } from 'msw';
import { mswLoader } from 'msw-storybook-addon';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { MockedProvider } from '../__fixtures__/MockedProvider';
import {
  getGetV0CustomersCustomerIdBookingsBookingIdCartAccommodationsResponseMock,
  getGetV0CustomersCustomerIdBookingsBookingIdCartPaymentScheduleResponseMock,
  getGetV0CustomersCustomerIdBookingsBookingIdPaymentSchedulesResponseMock,
  getGetV1ProposalsProposalIdPaymentScheduleResponseMock,
} from '../__generated__/index.msw';
import { Action } from '../__generated__/index.schemas';
import { PaymentSchedule } from './PaymentSchedule';

const handlers = [
  http.get('*/v0/customers/*/bookings/booking-total/payment_schedules', () => {
    return Response.json(
      getGetV0CustomersCustomerIdBookingsBookingIdPaymentSchedulesResponseMock({
        currency: 'EUR',
        total: 3079,
        paid: 0,
        payment_schedules: [
          {
            deadline: '20251006',
            amount: 3079,
          },
        ],
      }),
    );
  }),
  http.get('*/v0/customers/*/bookings/booking-free-deposit/payment_schedules', () => {
    return Response.json(
      getGetV0CustomersCustomerIdBookingsBookingIdPaymentSchedulesResponseMock({
        currency: 'EUR',
        total: 500,
        paid: 0,
        payment_schedules: [
          {
            deadline: '20251031',
            amount: 500,
          },
        ],
      }),
    );
  }),
  http.get('*/v1/proposals/proposal-total/payment_schedule', () => {
    return Response.json(
      getGetV1ProposalsProposalIdPaymentScheduleResponseMock({
        currency: 'EUR',
        commission_included: true,
        households: [
          {
            attendees: [
              {
                id: 'A',
                customer_id: '152773840',
              },
            ],
            total: 2808,
            deposit_repayment_schedule: [
              {
                expected_payment_amount: 2808,
                deadline: '20251006',
              },
            ],
          },
        ],
      }),
    );
  }),
  http.get('*/v0/customers/*/bookings/booking-deposit/payment_schedules', () => {
    return Response.json(
      getGetV0CustomersCustomerIdBookingsBookingIdPaymentSchedulesResponseMock({
        currency: 'EUR',
        total: 2000,
        paid: 0,
        payment_schedules: [
          {
            deadline: '20251006',
            amount: 500,
          },
          {
            deadline: '20251031',
            amount: 1500,
          },
        ],
      }),
    );
  }),
  http.get('*/v1/proposals/proposal-deposit/payment_schedule', () => {
    return Response.json(
      getGetV1ProposalsProposalIdPaymentScheduleResponseMock({
        currency: 'EUR',
        commission_included: true,
        households: [
          {
            attendees: [
              {
                id: 'A',
                customer_id: '152773842',
              },
            ],
            total: 2584,
            deposit_repayment_schedule: [
              {
                expected_payment_amount: 790,
                deadline: '20251027',
              },
              {
                expected_payment_amount: 1794,
                deadline: '20251031',
              },
            ],
          },
        ],
      }),
    );
  }),
  http.get('*/v0/customers/*/bookings/booking-paid/payment_schedules', () => {
    return Response.json(
      getGetV0CustomersCustomerIdBookingsBookingIdPaymentSchedulesResponseMock({
        currency: 'EUR',
        total: 2584,
        paid: 790,
        payment_schedules: [
          {
            deadline: '20251031',
            amount: 1794,
          },
        ],
      }),
    );
  }),
  http.get('*/v0/customers/*/bookings/*/cart/payment_schedule', () => {
    return Response.json(
      getGetV0CustomersCustomerIdBookingsBookingIdCartPaymentScheduleResponseMock({
        currency: 'EUR',
        total: 1500,
        paid: 0,
        payment_schedules: [
          {
            deadline: '20251020',
            amount: 1500,
          },
        ],
      }),
    );
  }),
  http.get('*/v0/customers/*/bookings/*/cart/accommodations', () => {
    return Response.json(
      getGetV0CustomersCustomerIdBookingsBookingIdCartAccommodationsResponseMock({
        price: {
          amount: 800,
          currency: 'EUR',
        },
      }),
    );
  }),
];

const meta: Meta<typeof PaymentSchedule> = {
  title: 'Components/PaymentSchedule',
  component: PaymentSchedule,
  loaders: [mswLoader],
  parameters: {
    layout: 'fullscreen',
    msw: {
      handlers,
    },
    docs: {
      description: {
        component: `Affiche les options de paiement (total ou acompte) selon l'action de paiement`,
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  argTypes: {
    action: {
      control: 'select',
      options: Object.values(Action),
      description: 'Type de workflow à tester',
    },
    proposalId: {
      control: 'select',
      description: 'ID de proposition (requis pour PAYMENT_RESA)',
      options: [undefined, 'proposal-deposit', 'proposal-total'],
      mapping: {
        None: undefined,
        'Proposal Deposit': 'proposal-deposit',
        'Proposal Total': 'proposal-total',
      },
    },
    bookingId: {
      control: 'select',
      description: 'ID de réservation (requis pour workflows booking)',
      options: [
        undefined,
        'booking-deposit',
        'booking-paid',
        'booking-total',
        'booking-free-deposit',
      ],
      mapping: {
        None: undefined,
        'Booking Deposit': 'booking-deposit',
        'Booking Paid': 'booking-paid',
        'Booking Total': 'booking-total',
        'Booking Free Deposit': 'booking-free-deposit',
      },
    },
    customerId: { control: 'text', description: 'ID client (requis pour workflows booking)' },
  },
  args: {
    action: Action.PAYMENT_RESA,
    proposalId: 'proposal-total',
    bookingId: undefined,
    customerId: '45678901',
  },
  render({ action, proposalId, bookingId, customerId }) {
    return (
      <MockedProvider
        key={`${action}-${proposalId}-${bookingId}-${customerId}`}
        action={action}
        defaultValues={{ currency: 'EUR' }}
        proposalId={proposalId}
        bookingId={bookingId}
        customerId={customerId}
      >
        <PaymentSchedule />
      </MockedProvider>
    );
  },
};

export const SinglePayment: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => {
      const radios = canvasElement.querySelectorAll('input[type="radio"]');
      expect(radios).toHaveLength(1);
      expect(canvas.getByText(/3\s?079.*€/)).toBeInTheDocument();
    });
  },
  render(args: any) {
    return (
      <MockedProvider
        key="single-payment"
        action={Action.PAYMENT_OPTION}
        bookingId="booking-total"
        customerId="123456789"
      >
        <PaymentSchedule {...args} />
      </MockedProvider>
    );
  },
};

export const DepositChoice: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => {
      const radios = canvasElement.querySelectorAll('input[type="radio"]');
      expect(radios).toHaveLength(2);
      expect(canvas.getByText(/2\s?000.*€/)).toBeInTheDocument();
      expect(canvas.getByText(/^500,00\s?€$/)).toBeInTheDocument();
      expect(canvas.getByText(/1\s?500.*€/)).toBeInTheDocument();
    });
  },
  render(args: any) {
    return (
      <MockedProvider
        key="deposit-choice"
        action={Action.PAYMENT_OPTION}
        bookingId="booking-deposit"
        customerId="customer-789"
      >
        <PaymentSchedule {...args} />
      </MockedProvider>
    );
  },
};

export const DepositInteraction: Story = {
  play: async ({ canvasElement }) => {
    await waitFor(() => {
      const radios = canvasElement.querySelectorAll('input[type="radio"]');
      expect(radios).toHaveLength(2);
    });

    const radios = canvasElement.querySelectorAll('input[type="radio"]');
    const firstRadio = radios[0] as HTMLInputElement;
    const secondRadio = radios[1] as HTMLInputElement;

    await waitFor(() => {
      expect(firstRadio).toBeChecked();
    });

    expect(secondRadio).not.toBeChecked();

    await userEvent.click(secondRadio);

    await waitFor(() => {
      expect(secondRadio).toBeChecked();
    });

    expect(firstRadio).not.toBeChecked();

    await userEvent.click(firstRadio);

    await waitFor(() => {
      expect(firstRadio).toBeChecked();
    });

    expect(secondRadio).not.toBeChecked();
  },
  render(args: any) {
    return (
      <MockedProvider
        key="deposit-interaction"
        action={Action.PAYMENT_RESA}
        proposalId="proposal-deposit"
        defaultValues={{
          amount: '2584',
        }}
      >
        <PaymentSchedule {...args} />
      </MockedProvider>
    );
  },
};

export const FreeDepositInteraction: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(
      () => {
        const input = canvas.getByLabelText(/I pay now/i);
        expect(input).toBeInTheDocument();
      },
      { timeout: 3000 },
    );

    const input = canvas.getByLabelText(/I pay now/i) as HTMLInputElement;

    await userEvent.click(input);
    await userEvent.type(input, '0');
    await userEvent.tab();

    await waitFor(() => {
      expect(canvas.getByText(/The amount must be greater than 0/i)).toBeInTheDocument();
    });

    await userEvent.click(input);
    await userEvent.clear(input);
    await userEvent.type(input, '1000');
    await userEvent.tab();

    await waitFor(() => {
      expect(canvas.getByText(/The amount cannot exceed the remaining total/i)).toBeInTheDocument();
    });

    await userEvent.click(input);
    await userEvent.clear(input);
    await userEvent.type(input, '250');
    await userEvent.tab();

    await waitFor(() => {
      expect(canvas.queryByText(/The amount must be greater than 0/i)).not.toBeInTheDocument();
      expect(
        canvas.queryByText(/The amount cannot exceed the remaining total/i),
      ).not.toBeInTheDocument();
    });
  },
  render(args: any) {
    return (
      <MockedProvider
        key="free-deposit-validation"
        action={Action.PAYMENT_PARTIAL}
        bookingId="booking-free-deposit"
        customerId="customer-validation"
        maxAmount={500}
        defaultValues={{
          currency: 'EUR',
        }}
      >
        <PaymentSchedule {...args} />
      </MockedProvider>
    );
  },
};
