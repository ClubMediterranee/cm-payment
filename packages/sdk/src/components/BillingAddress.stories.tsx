import type { Meta, StoryObj } from '@storybook/react-vite';
import { http, HttpResponse } from 'msw';
import { mswLoader } from 'msw-storybook-addon';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { MockedProvider } from '../__fixtures__/MockedProvider';
import { getPaymentProvidersControllerGetPaymentProvidersMockHandler } from '../__generated__/bff/index.msw';
import {
  getGetV0CountriesMockHandler,
  getGetV1PaymentProvidersMockHandler,
  getGetV2CustomersCustomerIdProfileMockHandler,
} from '../__generated__/index.msw';
import {
  PaymentProvider1CategoryPaymentMethod,
  ProfileModelV2,
} from '../__generated__/index.schemas';
import { OidcIssuerTypes } from '../types/CapsSettings';
import { BillingAddress } from './BillingAddress';

const COMPLETE_PROFILE_FR = {
  email: 'jean.dupont@example.com',
  first_name: 'Jean',
  last_name: 'Dupont',
  phones: [{ number: '+33612345678', type: 'MOBILE' }],
  address: {
    number: '42',
    street: 'Avenue des Champs-Élysées',
    city: 'Paris',
    zip_code: '75008',
    country: 'France',
    country_code: 'FR',
  },
  personal_data_usage_allowed: true,
  identity: null,
} as ProfileModelV2;

const FR_SCHEMA = {
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
        first_name: {
          type: 'string',
          maxLength: 50,
        },
        last_name: {
          type: 'string',
          maxLength: 50,
        },
      },
    },
    address: {
      type: 'object',
      required: ['street', 'city', 'zip_code', 'country_code'],
      properties: {
        number: {
          type: 'string',
          maxLength: 10,
        },
        street: {
          type: 'string',
          maxLength: 100,
        },
        city: {
          type: 'string',
          maxLength: 50,
        },
        zip_code: {
          type: 'string',
          maxLength: 5,
          pattern: '^[0-9]{5}$',
        },
        country_code: {
          type: 'string',
          enum: ['FR'],
        },
      },
    },
  },
};

const US_SCHEMA = {
  title: 'Billing Address Schema',
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'billing-address-us',
  type: 'object',
  additionalProperties: false,
  required: ['attendee', 'address'],
  properties: {
    attendee: {
      type: 'object',
      required: ['first_name', 'last_name'],
      properties: {
        first_name: {
          type: 'string',
          maxLength: 50,
        },
        last_name: {
          type: 'string',
          maxLength: 50,
        },
      },
    },
    address: {
      type: 'object',
      required: ['street', 'city', 'state_or_district', 'zip_code', 'country_code'],
      properties: {
        number: {
          type: 'string',
          maxLength: 10,
        },
        street: {
          type: 'string',
          maxLength: 100,
        },
        city: {
          type: 'string',
          maxLength: 50,
        },
        state_or_district: {
          type: 'string',
          'x-choices': [
            { code: 'AL', label: 'Alabama' },
            { code: 'CA', label: 'California' },
            { code: 'NY', label: 'New York' },
            { code: 'TX', label: 'Texas' },
          ],
        },
        zip_code: {
          type: 'string',
          maxLength: 10,
          pattern: '^[0-9]{5}(-[0-9]{4})?$',
        },
        country_code: {
          type: 'string',
          enum: ['US'],
        },
      },
    },
  },
};

const paymentProviders = [
  {
    id: 'CYBERSOURCE',
    label: 'Carte bancaire',
    connection_type: 'E-commerce' as const,
    category_payment_method: PaymentProvider1CategoryPaymentMethod.CreditCard,
    billing_address_form: true,
    required_delay_before_departure: 0,
    configuration: {
      display_type: 'redirect' as const,
      settings: {},
      validation: {
        requires_token: false,
        requires_expiry_date: false,
      },
    },
    payment_conditions: {},
  },
];

const countries = [
  { id: 'FR', label: 'France' },
  { id: 'US', label: 'United States' },
];

const meta = {
  title: 'Components/BillingAddress',
  component: BillingAddress,
  loaders: [mswLoader],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Composant BillingAddress permettant de saisir une adresse de facturation avec validation par pays.',
      },
    },
  },
} satisfies Meta<typeof BillingAddress>;

export default meta;
type Story = StoryObj<typeof meta>;

const billingSchemaHandlers = [
  http.get('*/rest/payment_config*', () => {
    return HttpResponse.json({
      feature_flips: {},
      settings: {
        days_before_trip_to_allow_free_deposit: 30,
      },
    });
  }),
  http.get('*/v3/schemas/billing/:localeOrCountry', ({ params }) => {
    const { localeOrCountry } = params;
    const schema = localeOrCountry === 'US' ? US_SCHEMA : FR_SCHEMA;
    return HttpResponse.json(schema);
  }),
  getGetV0CountriesMockHandler(countries),
  getGetV1PaymentProvidersMockHandler(paymentProviders),
  getPaymentProvidersControllerGetPaymentProvidersMockHandler({
    payment_providers: paymentProviders,
    buy_now_pay_later_providers: [],
  }),
];

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Formulaire vide - le schéma change selon la locale (FR ou US)',
      },
    },
    msw: {
      handlers: billingSchemaHandlers,
    },
  },
  render: () => (
    <MockedProvider
      bookingId="123"
      defaultValues={{
        provider_id: 'CYBERSOURCE',
        billing_details: {
          address: {
            country_code: 'FR',
          },
        },
      }}
    >
      <BillingAddress />
    </MockedProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(
      () => {
        expect(canvas.getByText('First Name', { exact: false })).toBeInTheDocument();
      },
      { timeout: 10000 },
    );

    expect(canvas.getByText('Last Name', { exact: false })).toBeInTheDocument();

    const streetElements = canvas.getAllByText('Street', { exact: false });
    expect(streetElements.length).toBeGreaterThan(0);

    expect(canvas.getByText('City', { exact: false })).toBeInTheDocument();
    expect(canvas.getByText('Postal Code', { exact: false })).toBeInTheDocument();

    await waitFor(
      () => {
        const inputs = canvas.getAllByRole('textbox');
        expect(inputs.length).toBeGreaterThan(0);
      },
      { timeout: 10000 },
    );

    const inputs = canvas.getAllByRole('textbox');
    const firstNameInput = inputs[0];
    expect(firstNameInput).toHaveValue('');

    await userEvent.type(firstNameInput, 'John');
    expect(firstNameInput).toHaveValue('John');

    const lastNameInput = inputs[1];
    await userEvent.type(lastNameInput, 'Doe');
    expect(lastNameInput).toHaveValue('Doe');
  },
};

export const WithProfilePrefill: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Formulaire avec profil prefillé - le schéma et le profil s'adaptent selon la locale",
      },
    },
    msw: {
      handlers: [
        ...billingSchemaHandlers,
        getGetV2CustomersCustomerIdProfileMockHandler(COMPLETE_PROFILE_FR),
      ],
    },
  },
  render: () => (
    <MockedProvider
      bookingId="123"
      customerId="789"
      oidc={{ issuerType: OidcIssuerTypes.GM, accessToken: 'test-token' }}
      defaultValues={{
        provider_id: 'CYBERSOURCE',
        billing_details: {
          address: {
            country_code: 'FR',
          },
        },
      }}
    >
      <BillingAddress />
    </MockedProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('First Name', { exact: false }, { timeout: 10000 });

    await waitFor(
      () => {
        const inputs = canvas.getAllByRole('textbox', { hidden: true });
        expect(inputs.length).toBeGreaterThan(5);
      },
      { timeout: 10000 },
    );

    const inputs = canvas.getAllByRole<HTMLInputElement>('textbox', { hidden: true });
    const firstNameInput = inputs[0];
    const lastNameInput = inputs[1];

    await waitFor(
      () => {
        expect(firstNameInput.value).toBe('Jean');
        expect(lastNameInput.value).toBe('Dupont');
      },
      { timeout: 10000 },
    );

    const inputsWithStreet = inputs.filter((input) =>
      input.value.includes('Avenue des Champs-Élysées'),
    );
    expect(inputsWithStreet.length).toBeGreaterThan(0);

    const inputsWithParis = inputs.filter((input) => input.value === 'Paris');
    expect(inputsWithParis.length).toBeGreaterThan(0);

    const inputsWithPostalCode = inputs.filter((input) => input.value === '75008');
    expect(inputsWithPostalCode.length).toBeGreaterThan(0);
  },
};
