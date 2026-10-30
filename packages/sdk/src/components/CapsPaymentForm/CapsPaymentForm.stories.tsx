import type { Meta, StoryObj } from '@storybook/react-vite';
import { delay, http } from 'msw';
import { useState } from 'react';
import { mswLoader } from 'msw-storybook-addon';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { Action } from '../../__generated__/index.schemas';
import { sdkQueryClient } from '../../providers/QueryClientProvider';
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
  },
} satisfies Meta<typeof CapsPaymentForm>;

export default meta;
type Story = StoryObj<typeof meta>;

const provider = (id: string, description: string) => ({
  id,
  label: description,
  description,
  connection_type: 'REDIRECT',
  category_payment_method: 'Paypal',
  billing_address_form: false,
  required_delay_before_departure: 0,
  configuration: {
    display_type: 'redirect',
    settings: {},
    validation: { requires_token: false, requires_expiry_date: false },
  },
  payment_conditions: {},
});

const handlers = [
  http.get('*/rest/action_resolver/*', () => Response.json({ action: Action.PAYMENT_OPTION })),
  http.get('*/rest/payment_schedules/booking/*', () =>
    Response.json([
      { amount: 2000, currency: 'EUR' },
      { amount: 500, deadline: '20251031', balance: 1500, currency: 'EUR' },
    ]),
  ),
  http.get('*/rest/payment_providers/booking/*', () =>
    Response.json({
      payment_providers: [
        provider('PAYPAL', 'Pay with PayPal'),
        provider('ALIPAY', 'Pay with Alipay'),
      ],
      buy_now_pay_later_providers: [],
    }),
  ),
  http.get('*/rest/payment_config', async () => {
    await delay(200);
    return Response.json({ feature_flips: {}, settings: { theme: 'current' } });
  }),
];

const queryHidden = (canvas: ReturnType<typeof within>, name: RegExp) =>
  canvas.queryByRole('button', { name });

export const Stepper: Story = {
  args: { stepper: true },
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

export const WithoutStepper: Story = {
  parameters: { msw: { handlers } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Pay with PayPal')).toBeVisible();
    expect(await canvas.findByRole('checkbox')).not.toBeChecked();
    expect(canvas.getByRole('button', { name: /partner/i })).toBeVisible();
  },
};

export const TrackingEvents: Story = {
  args: { stepper: true, onEvent: fn(), onRedirect: fn((): false => false) },
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

    await userEvent.click((await canvas.findAllByRole('radio'))[0]);
    await userEvent.click(await canvas.findByText('Pay with PayPal'));
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

const contactChoiceHandlers = [
  ...handlers.slice(0, 2),
  http.get('*/rest/payment_providers/booking/*', () =>
    Response.json({
      payment_providers: [
        {
          ...provider('LINK', 'Pay by link'),
          configuration: {
            display_type: 'redirect',
            settings: {},
            requires_contact_choice: true,
            validation: { requires_token: false, requires_expiry_date: false },
          },
        },
      ],
      buy_now_pay_later_providers: [],
    }),
  ),
  handlers[3],
];

const submitButton = (canvasElement: HTMLElement) =>
  canvasElement.querySelector('button[type=submit]');

export const ContactChoiceStepper: Story = {
  args: { stepper: true, issuerType: 'GO' },
  parameters: { msw: { handlers: contactChoiceHandlers } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click((await canvas.findAllByRole('radio'))[0]);
    await userEvent.click(await canvas.findByText('Pay by link'));

    const phone = await canvas.findByTestId('InputFor_mobile_phone');
    expect(canvas.queryByRole('checkbox')).toBeNull();

    await userEvent.type(phone, '+33612345678');
    const cgv = await canvas.findByRole('checkbox');
    expect(submitButton(canvasElement)).toBeNull();

    await userEvent.click(cgv);
    await waitFor(() => expect(submitButton(canvasElement)).not.toBeNull());

    await userEvent.clear(phone);
    await waitFor(() => expect(canvas.queryByRole('checkbox')).toBeNull());
    expect(submitButton(canvasElement)).toBeNull();
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
  args: { stepper: true },
  render: (args) => <DonationSlotHost {...args} />,
  parameters: {
    msw: {
      handlers: [
        ...handlers.slice(0, 3),
        http.get('*/rest/payment_config', () =>
          Response.json({
            feature_flips: { is_donation_enabled: true },
            settings: { theme: 'current' },
          }),
        ),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const slot = canvas.getByTestId('donation-slot');

    await canvas.findAllByRole('radio');
    await waitFor(() => expect(slot.children.length).toBeGreaterThan(0));
    expect(canvas.queryByText('Pay with PayPal')).toBeNull();
  },
};

export const DonationWaitsForProviderWithoutSlot: Story = {
  args: { stepper: true },
  parameters: {
    msw: {
      handlers: [
        ...handlers.slice(0, 3),
        http.get('*/rest/payment_config', () =>
          Response.json({
            feature_flips: { is_donation_enabled: true },
            settings: { theme: 'current' },
          }),
        ),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const donation = () => canvasElement.querySelector('[class*="@container"]');

    const schedules = await canvas.findAllByRole('radio');
    expect(donation()).toBeNull();

    await userEvent.click(schedules[0]);
    await userEvent.click(await canvas.findByText('Pay with PayPal'));

    await waitFor(() => expect(donation()).not.toBeNull());
  },
};
