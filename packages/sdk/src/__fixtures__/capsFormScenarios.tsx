import { delay, http } from 'msw';
import { userEvent, within } from 'storybook/test';

import { Action } from '../__generated__/index.schemas';

export const provider = (id: string, description: string) => ({
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

export const handlers = [
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
    return Response.json({ feature_flips: {}, settings: {} });
  }),
];

export const contactChoiceHandlers = [
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

export const submitButton = (canvasElement: HTMLElement) =>
  canvasElement.querySelector('button[type=submit]');

export const cardTypes = {
  Visa: [
    { id: 'visa-1x', payment_count: 1 },
    { id: 'visa-3x', payment_count: 3 },
  ],
  Mastercard: [
    { id: 'mc-1x', payment_count: 1 },
    { id: 'mc-4x', payment_count: 4 },
  ],
};

export const cardProvider = (id: string, description: string, overrides: object = {}) => ({
  ...provider(id, description),
  category_payment_method: 'CreditCard',
  ...overrides,
});

export const providersHandler = (providers: object[]) =>
  http.get('*/rest/payment_providers/booking/*', () =>
    Response.json({ payment_providers: providers, buy_now_pay_later_providers: [] }),
  );

export const pickSchedule = async (canvas: ReturnType<typeof within>) =>
  userEvent.click((await canvas.findAllByRole('radio'))[0]);

export const pickProvider = async (canvas: ReturnType<typeof within>, description: string) =>
  userEvent.click(await canvas.findByText(description));

export const installmentSelects = (canvasElement: HTMLElement) =>
  within(canvasElement).queryAllByRole('combobox') as HTMLSelectElement[];

export const installmentsHandlers = [
  ...handlers.slice(0, 2),
  providersHandler([
    cardProvider('CARD', 'Pay by card', { payment_conditions: cardTypes }),
    provider('PAYPAL', 'Pay with PayPal'),
  ]),
  handlers[3],
];

export const billingSchema = {
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

export const billingHandlers = [
  ...handlers.slice(0, 2),
  providersHandler([cardProvider('CARD', 'Pay by card', { billing_address_form: true })]),
  handlers[3],
  http.get('*/v3/schemas/billing/*', () => Response.json(billingSchema)),
  http.get('*/v0/countries*', () => Response.json([{ id: 'FR', label: 'France' }])),
];

export const iframeHandlers = [
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

const hostedFieldProvider = (overrides: object = {}) =>
  cardProvider('MHIPAY', 'Pay by card', {
    configuration: {
      display_type: 'hosted_field',
      settings: {
        script_url: 'https://stage-libs.hipay.com/js/sdkjs.js',
        environment: 'stage',
        username: 'storybook',
        password: 'storybook',
      },
      validation: { requires_token: true, requires_expiry_date: false },
    },
    ...overrides,
  });

export const hostedFieldHandlers = [
  ...handlers.slice(0, 2),
  providersHandler([hostedFieldProvider()]),
  handlers[3],
];

export const billingWidgetHandlers = [
  ...billingHandlers.slice(0, 2),
  providersHandler([hostedFieldProvider({ billing_address_form: true })]),
  ...billingHandlers.slice(3),
];

export const donationHandlers = [
  ...handlers.slice(0, 3),
  http.get('*/rest/payment_config', () =>
    Response.json({ feature_flips: { is_donation_enabled: true }, settings: {} }),
  ),
];
