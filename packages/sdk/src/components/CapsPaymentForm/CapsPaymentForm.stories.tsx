import type { Meta, StoryObj } from '@storybook/react-vite';
import { http } from 'msw';
import { useState } from 'react';
import { mswLoader } from 'msw-storybook-addon';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { Action } from '../../__generated__/index.schemas';
import { sdkQueryClient } from '../../providers/QueryClientProvider';
import {
  donationHandlers,
  handlers,
  installmentSelects,
  installmentsHandlers,
  pickProvider,
  pickSchedule,
  submitButton,
} from '../../__fixtures__/capsFormScenarios';
import { CapsPaymentForm } from './CapsPaymentForm';

const meta = {
  title: 'Flows/CapsPaymentForm',
  component: CapsPaymentForm,
  loaders: [mswLoader],
  beforeEach: () => sdkQueryClient.clear(),
  args: {
    capsUrl: 'https://mock.clubmed.com',
    apiKey: 'test-api-key',
    issuerType: 'GM',
    type: 'booking',
    id: 'booking-123',
    customerId: 'customer-456',
    locale: 'en-US',
    action: Action.PAYMENT_OPTION,
    accessToken: 'test-token',
    callbackUrl: 'http://localhost:3000/callback',
    theme: 'current',
  },
  argTypes: {
    theme: {
      control: 'inline-radio',
      options: ['legacy', 'current'],
      description: "Thème du formulaire : le rendu historique ('legacy') ou le nouveau ('current')",
    },
  },
} satisfies Meta<typeof CapsPaymentForm>;

export default meta;
type Story = StoryObj<typeof meta>;

const queryHidden = (canvas: ReturnType<typeof within>, name: RegExp) =>
  canvas.queryByRole('button', { name });

export const StepByStep: Story = {
  parameters: { msw: { handlers } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const schedules = await canvas.findAllByRole('radio');
    expect(schedules).toHaveLength(2);
    schedules.forEach((schedule) => expect(schedule).not.toBeChecked());
    expect(canvas.queryByText('Pay with PayPal')).toBeNull();

    await userEvent.click(schedules[0]);

    const payPal = await canvas.findByText('Pay with PayPal');
    expect(canvas.queryByRole('checkbox')).toBeNull();

    const group = schedules[0].closest('[role=radiogroup]') as HTMLElement;
    let hidden = false;
    const timer = setInterval(() => (hidden ||= group.offsetParent === null), 10);

    await userEvent.click(payPal);

    const cgv = await canvas.findByRole('checkbox');
    clearInterval(timer);
    expect(hidden).toBe(false);
    expect(queryHidden(canvas, /partner/i)).toBeNull();

    await userEvent.click(cgv);

    await waitFor(() => expect(canvas.getByRole('button', { name: /partner/i })).toBeVisible());

    await userEvent.click(cgv);

    await waitFor(() => expect(queryHidden(canvas, /partner/i)).toBeNull());
  },
};

export const Legacy: Story = {
  args: { theme: 'legacy' },
  parameters: { msw: { handlers: installmentsHandlers } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Pay with PayPal')).toBeVisible();
    await waitFor(() => expect(installmentSelects(canvasElement)).toHaveLength(2), {
      timeout: 10000,
    });
    const [cardType, installments] = installmentSelects(canvasElement);
    expect(cardType).toHaveValue('Visa');
    expect(installments).toHaveValue('visa-1x');
    expect(await canvas.findByRole('checkbox')).not.toBeChecked();
    expect(submitButton(canvasElement)).not.toBeNull();
  },
};

export const TrackingEvents: Story = {
  args: { onEvent: fn(), onRedirect: fn((): false => false) },
  parameters: {
    msw: {
      handlers: [
        ...handlers,
        http.post('*/rest/payment_redirect', () =>
          Response.json({ redirect: { url: 'https://psp.example/pay', method: 'GET' } }),
        ),
      ],
    },
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await pickSchedule(canvas);
    await pickProvider(canvas, 'Pay with PayPal');
    await userEvent.click(await canvas.findByRole('checkbox'));

    expect(args.onEvent).not.toHaveBeenCalledWith(expect.objectContaining({ name: 'submit' }));

    await userEvent.click(await canvas.findByRole('button', { name: /partner/i }));

    await waitFor(() =>
      expect(args.onEvent).toHaveBeenCalledWith({
        action: 'click',
        name: 'submit',
        data: { provider_id: 'PAYPAL', amount: 2000, currency: 'EUR' },
      }),
    );
    await waitFor(() => expect(args.onRedirect).toHaveBeenCalledWith('https://psp.example/pay'));
    expect(args.onEvent).toHaveBeenCalledWith({ action: '', name: 'load' });
  },
};

const DonationSlotHost = (args: React.ComponentProps<typeof CapsPaymentForm>) => {
  const [slot, setSlot] = useState<HTMLElement | null>(null);

  return (
    <>
      <div data-testid="donation-slot" ref={setSlot} />
      <CapsPaymentForm {...args} slots={{ donation: slot }} />
    </>
  );
};

export const DonationInSlot: Story = {
  render: (args) => <DonationSlotHost {...args} />,
  parameters: { msw: { handlers: donationHandlers } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const slot = canvas.getByTestId('donation-slot');

    await canvas.findAllByRole('radio');
    await waitFor(() => expect(slot.children.length).toBeGreaterThan(0));
    expect(canvas.queryByText('Pay with PayPal')).toBeNull();
  },
};
