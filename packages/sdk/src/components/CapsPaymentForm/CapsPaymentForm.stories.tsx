import type { Meta, StoryObj } from '@storybook/react-vite';
import { delay, http } from 'msw';
import { mswLoader } from 'msw-storybook-addon';
import { expect, userEvent, waitFor, within } from 'storybook/test';

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
