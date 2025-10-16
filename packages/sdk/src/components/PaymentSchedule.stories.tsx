import type { Meta, StoryObj } from '@storybook/react-vite';
import { http } from 'msw';
import { initialize, mswLoader } from 'msw-storybook-addon';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { MockedProvider } from '../__fixtures__/MockedProvider';
import {
  Action,
  getGetV0CustomersCustomerIdBookingsBookingIdCartAccommodationsResponseMock,
  getGetV0CustomersCustomerIdBookingsBookingIdCartPaymentScheduleResponseMock,
  getGetV0CustomersCustomerIdBookingsBookingIdPaymentSchedulesResponseMock,
  getGetV1ProposalsProposalIdPaymentScheduleResponseMock,
} from '../__generated__';
import { PaymentSchedule } from './PaymentSchedule';

initialize();

const handlers = {
  total: [
    http.get('*/v0/customers/*/bookings/*/payment_schedules', () => {
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
    http.get('*/v1/proposals/*/payment_schedule', () => {
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
  ],
  deposit: [
    http.get('*/v0/customers/*/bookings/*/payment_schedules', () => {
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
    http.get('*/v1/proposals/*/payment_schedule', () => {
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
  ],
  paid: [
    http.get('*/v0/customers/*/bookings/*/payment_schedules', () => {
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
  ],
  cart: [
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
  ],
  upgradeRoom: [
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
  ],
};

const meta: Meta<typeof PaymentSchedule> = {
  title: 'Components/PaymentSchedule',
  component: PaymentSchedule,
  loaders: [mswLoader],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const ProposalTotalAmountTest: Story = {
  parameters: {
    msw: {
      handlers: handlers.total,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByText('2808 EUR')).toBeInTheDocument());
  },
  render(args: any) {
    return (
      <MockedProvider
        key="proposal-total"
        proposalId="test-proposal-123"
        action={Action.PAYMENT_RESA}
      >
        <PaymentSchedule {...args} />
      </MockedProvider>
    );
  },
};

export const BookingTotalAmountTest: Story = {
  parameters: {
    msw: {
      handlers: handlers.total,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByText('3079 EUR')).toBeInTheDocument());
  },
  render(args: any) {
    return (
      <MockedProvider
        key="booking-total"
        action={Action.PAYMENT_OPTION}
        bookingId="booking-total-789"
        customerId="customer-total-123"
      >
        <PaymentSchedule {...args} />
      </MockedProvider>
    );
  },
};

export const ProposalDepositAmountTest: Story = {
  parameters: {
    msw: {
      handlers: handlers.deposit,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByText('2584 EUR')).toBeInTheDocument());
    await waitFor(() => expect(canvas.getByText('790 EUR')).toBeInTheDocument());
  },
  render(args: any) {
    return (
      <MockedProvider
        key="proposal-deposit"
        proposalId="test-proposal-456"
        action={Action.PAYMENT_RESA}
      >
        <PaymentSchedule {...args} />
      </MockedProvider>
    );
  },
};

export const BookingDepositAmountTest: Story = {
  parameters: {
    msw: {
      handlers: handlers.deposit,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByText('2000 EUR')).toBeInTheDocument());
    await waitFor(() => expect(canvas.getByText('500 EUR')).toBeInTheDocument());
  },
  render(args: any) {
    return (
      <MockedProvider
        key="booking-deposit"
        action={Action.PAYMENT_OPTION}
        bookingId="booking-deposit-456"
        customerId="customer-deposit-789"
      >
        <PaymentSchedule {...args} />
      </MockedProvider>
    );
  },
};

export const BookingPaidAmountTest: Story = {
  parameters: {
    msw: {
      handlers: handlers.paid,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByText('1794 EUR')).toBeInTheDocument());
  },
  render(args: any) {
    return (
      <MockedProvider
        key="booking-paid"
        action={Action.PAYMENT_SOLDE}
        bookingId="booking-paid-999"
        customerId="customer-paid-111"
      >
        <PaymentSchedule {...args} />
      </MockedProvider>
    );
  },
};

export const BookingCartAmountTest: Story = {
  parameters: {
    msw: {
      handlers: handlers.cart,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByText('1500 EUR')).toBeInTheDocument());
  },
  render(args: any) {
    return (
      <MockedProvider
        key="booking-cart"
        action={Action.PAYMENT_CART}
        bookingId="booking-cart-555"
        customerId="customer-cart-777"
      >
        <PaymentSchedule {...args} />
      </MockedProvider>
    );
  },
};

export const BookingUpgradeRoomAmountTest: Story = {
  parameters: {
    msw: {
      handlers: handlers.upgradeRoom,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByText('800 EUR')).toBeInTheDocument());
  },
  render(args: any) {
    return (
      <MockedProvider
        key="booking-upgrade-room"
        action={Action.PAYMENT_UPGRADE_ROOM}
        bookingId="booking-upgrade-888"
        customerId="customer-upgrade-999"
      >
        <PaymentSchedule {...args} />
      </MockedProvider>
    );
  },
};

export const MultiRadioTest: Story = {
  parameters: {
    msw: {
      handlers: handlers.deposit,
    },
  },
  play: async ({ canvasElement }) => {
    await waitFor(() => {
      const radios = canvasElement.querySelectorAll('input[type="radio"]');
      expect(radios).toHaveLength(2);
    });

    const radios = canvasElement.querySelectorAll('input[type="radio"]');
    const firstRadio = radios[0] as HTMLInputElement;
    const secondRadio = radios[1] as HTMLInputElement;

    expect(firstRadio).toBeChecked();
    expect(secondRadio).not.toBeChecked();

    await userEvent.click(secondRadio);

    expect(secondRadio).toBeChecked();
    expect(firstRadio).not.toBeChecked();

    await userEvent.click(firstRadio);

    expect(firstRadio).toBeChecked();
    expect(secondRadio).not.toBeChecked();
  },
  render(args: any) {
    return (
      <MockedProvider
        key="multi-radio"
        action={Action.PAYMENT_OPTION}
        bookingId="multi-radio-222"
        customerId="customer-multi-333"
      >
        <PaymentSchedule {...args} />
      </MockedProvider>
    );
  },
};
