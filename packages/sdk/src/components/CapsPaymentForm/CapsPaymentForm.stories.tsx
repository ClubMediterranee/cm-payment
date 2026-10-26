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
    await canvas.findByRole('checkbox');

    await userEvent.clear(phone);
    await waitFor(() => expect(canvas.queryByRole('checkbox')).toBeNull());
    expect(submitButton(canvasElement)).toBeNull();

    await userEvent.type(phone, '+33612345678');
    const cgv = await canvas.findByRole('checkbox');
    expect(submitButton(canvasElement)).toBeNull();

    await userEvent.click(cgv);
    await waitFor(() => expect(submitButton(canvasElement)).not.toBeNull());
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

export const DonationWaitsForBillingAddressStep: Story = {
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

const cardTypes = {
  Visa: [
    { id: 'visa-1x', payment_count: 1 },
    { id: 'visa-3x', payment_count: 3 },
  ],
  Mastercard: [
    { id: 'mc-1x', payment_count: 1 },
    { id: 'mc-4x', payment_count: 4 },
  ],
};

const cardProvider = (id: string, description: string, overrides: object = {}) => ({
  ...provider(id, description),
  category_payment_method: 'CreditCard',
  ...overrides,
});

const providersHandler = (providers: object[]) =>
  http.get('*/rest/payment_providers/booking/*', () =>
    Response.json({ payment_providers: providers, buy_now_pay_later_providers: [] }),
  );

const pickSchedule = async (canvas: ReturnType<typeof within>) =>
  userEvent.click((await canvas.findAllByRole('radio'))[0]);

const pickProvider = async (canvas: ReturnType<typeof within>, description: string) =>
  userEvent.click(await canvas.findByText(description));

const installmentSelects = (canvasElement: HTMLElement) =>
  within(canvasElement).queryAllByRole('combobox') as HTMLSelectElement[];

const installmentsHandlers = [
  ...handlers.slice(0, 2),
  providersHandler([
    cardProvider('CARD', 'Pay by card', { payment_conditions: cardTypes }),
    provider('PAYPAL', 'Pay with PayPal'),
  ]),
  handlers[3],
];

export const InstallmentsAreChosen: Story = {
  args: { stepper: true },
  parameters: { msw: { handlers: installmentsHandlers } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await pickSchedule(canvas);
    await pickProvider(canvas, 'Pay by card');

    await waitFor(() => expect(installmentSelects(canvasElement)).toHaveLength(2));
    const [cardType, installments] = installmentSelects(canvasElement);
    expect(cardType).toHaveValue('');
    expect(installments).toHaveValue('');
    expect(canvas.queryByRole('checkbox')).toBeNull();

    await userEvent.selectOptions(cardType, 'Visa');
    expect(canvas.queryByRole('checkbox')).toBeNull();

    await userEvent.selectOptions(installments, 'visa-3x');
    await canvas.findByRole('checkbox');
  },
};

export const InstallmentsAreClearedWhenProviderChanges: Story = {
  args: { stepper: true },
  parameters: { msw: { handlers: installmentsHandlers } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await pickSchedule(canvas);
    await pickProvider(canvas, 'Pay by card');
    await waitFor(() => expect(installmentSelects(canvasElement)).toHaveLength(2));
    const [cardType, installments] = installmentSelects(canvasElement);
    await userEvent.selectOptions(cardType, 'Visa');
    await userEvent.selectOptions(installments, 'visa-3x');
    await canvas.findByRole('checkbox');

    await pickProvider(canvas, 'Pay with PayPal');
    await waitFor(() => expect(installmentSelects(canvasElement)).toHaveLength(0));

    await pickProvider(canvas, 'Pay by card');
    await waitFor(() => expect(installmentSelects(canvasElement)).toHaveLength(2));
    expect(installmentSelects(canvasElement).map(({ value }) => value)).toEqual(['', '']);
    expect(canvas.queryByRole('checkbox')).toBeNull();
  },
};

export const InstallmentsKeepTheCountWhenChangingCardType: Story = {
  args: { stepper: true },
  parameters: { msw: { handlers: installmentsHandlers } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await pickSchedule(canvas);
    await pickProvider(canvas, 'Pay by card');
    await waitFor(() => expect(installmentSelects(canvasElement)).toHaveLength(2));
    const [cardType, installments] = installmentSelects(canvasElement);

    await userEvent.selectOptions(cardType, 'Visa');
    await userEvent.selectOptions(installments, 'visa-1x');
    await userEvent.selectOptions(cardType, 'Mastercard');
    await waitFor(() => expect(installments).toHaveValue('mc-1x'));

    await userEvent.selectOptions(cardType, 'Visa');
    await userEvent.selectOptions(installments, 'visa-3x');
    await userEvent.selectOptions(cardType, 'Mastercard');
    await waitFor(() => expect(installments).toHaveValue(''));
  },
};

export const InstallmentsArePreselectedInLegacy: Story = {
  args: { theme: 'legacy' },
  parameters: { msw: { handlers: installmentsHandlers } },
  play: async ({ canvasElement }) => {
    await waitFor(() => expect(installmentSelects(canvasElement)).toHaveLength(2), {
      timeout: 10000,
    });
    const [cardType, installments] = installmentSelects(canvasElement);

    expect(cardType).toHaveValue('Visa');
    expect(installments).toHaveValue('visa-1x');
  },
};

const billingSchema = {
  title: 'Billing Address Schema',
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'billing-address-fr',
  type: 'object',
  additionalProperties: false,
  required: ['attendee', 'address'],
  properties: {
    attendee: {
      type: 'object',
      required: ['first_name', 'last_name'],
      properties: {
        first_name: { type: 'string', maxLength: 50 },
        last_name: { type: 'string', maxLength: 50 },
      },
    },
    address: {
      type: 'object',
      required: ['street', 'city', 'zip_code', 'country_code'],
      properties: {
        number: { type: 'string', maxLength: 10 },
        street: { type: 'string', maxLength: 100 },
        city: { type: 'string', maxLength: 50 },
        zip_code: { type: 'string', maxLength: 5, pattern: '^[0-9]{5}$' },
        country_code: { type: 'string', enum: ['FR'] },
      },
    },
  },
};

const billingHandlers = [
  ...handlers.slice(0, 2),
  providersHandler([cardProvider('CARD', 'Pay by card', { billing_address_form: true })]),
  handlers[3],
  http.get('*/v3/schemas/billing/*', () => Response.json(billingSchema)),
  http.get('*/v0/countries*', () => Response.json([{ id: 'FR', label: 'France' }])),
];

export const BillingAddressRevealsTheNextSteps: Story = {
  args: { stepper: true, locale: 'fr-FR' },
  parameters: { msw: { handlers: billingHandlers } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await pickSchedule(canvas);
    const [firstName, lastName, number, street, zipCode, city] =
      await canvas.findAllByRole<HTMLInputElement>('textbox', {}, { timeout: 10000 });
    expect(canvas.queryByRole('checkbox')).toBeNull();

    await userEvent.type(firstName, 'Jean');
    await userEvent.type(lastName, 'Dupont');
    await userEvent.type(number, '42');
    await userEvent.type(street, 'Rue de la Paix');
    await userEvent.type(zipCode, '75008');
    expect(canvas.queryByRole('checkbox')).toBeNull();

    await userEvent.type(city, 'Paris');
    await canvas.findByRole('checkbox');
  },
};

const iframeHandlers = [
  ...handlers.slice(0, 2),
  providersHandler([
    cardProvider('EPAYGATE', 'Pay by card', {
      configuration: {
        display_type: 'iframe',
        settings: {},
        validation: { requires_token: false, requires_expiry_date: false },
      },
    }),
  ]),
  handlers[3],
];

export const IframeWidgetAppearsOnceTheFormIsValid: Story = {
  args: { stepper: true },
  parameters: { msw: { handlers: iframeHandlers } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const iframe = () => canvasElement.querySelector('iframe[title="payment-iframe"]');

    await pickSchedule(canvas);
    const cgv = await canvas.findByRole('checkbox');
    expect(iframe()).toBeNull();
    expect(submitButton(canvasElement)).toBeNull();

    await userEvent.click(cgv);
    await waitFor(() => expect(iframe()).not.toBeNull(), { timeout: 10000 });
  },
};

const hostedFieldHandlers = [
  ...handlers.slice(0, 2),
  providersHandler([
    cardProvider('MHIPAY', 'Pay by card', {
      configuration: {
        display_type: 'hosted_field',
        settings: {
          script_url: 'https://stage-libs.hipay.com/js/sdkjs.js',
          environment: 'stage',
        },
        validation: { requires_token: true, requires_expiry_date: false },
      },
    }),
  ]),
  handlers[3],
];

export const HostedFieldsWidget: Story = {
  args: { stepper: true },
  parameters: { msw: { handlers: hostedFieldHandlers } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await pickSchedule(canvas);
    await canvas.findByText('Card number', { exact: false }, { timeout: 10000 });
    expect(canvas.getByText('Expiry date', { exact: false })).toBeInTheDocument();
  },
};

const donationHandlers = [
  ...handlers.slice(0, 3),
  http.get('*/rest/payment_config', () =>
    Response.json({ feature_flips: { is_donation_enabled: true }, settings: { theme: 'current' } }),
  ),
];

export const DonationRequiresItsOwnTerms: Story = {
  args: { stepper: true },
  parameters: { msw: { handlers: donationHandlers } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await pickSchedule(canvas);
    await pickProvider(canvas, 'Pay with PayPal');

    await userEvent.click(await canvas.findByRole('button', { name: /Make a donation/i }));
    await userEvent.click(await canvas.findByRole('radio', { name: /€20\.00/ }));

    await waitFor(() => expect(canvas.getAllByRole('checkbox')).toHaveLength(2));
    expect(submitButton(canvasElement)).toBeNull();
  },
};
