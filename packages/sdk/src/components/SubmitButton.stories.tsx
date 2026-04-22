import type { Meta, StoryObj } from '@storybook/react-vite';
import { http } from 'msw';
import { mswLoader } from 'msw-storybook-addon';
import { expect, waitFor } from 'storybook/test';

import { MockedProvider } from '../__fixtures__/MockedProvider';
import { Action } from '../__generated__/index.schemas';
import { OidcIssuerTypes } from '../types/CapsSettings';
import { PspProviders } from '../types/PspProviders';
import { SubmitButton } from './SubmitButton';

const handlers = [
  http.get('*/v1/payment_providers', () => {
    return Response.json([
      {
        id: 'MHIPAY',
        label: 'Hipay',
        connection_type: 'E-commerce',
        required_delay_before_departure: 0,
        category_payment_method: 'CreditCard',
        billing_address_form: false,
      },
      {
        id: 'EPAYGATE',
        label: 'Epaygate',
        connection_type: 'E-commerce',
        required_delay_before_departure: 0,
        category_payment_method: 'CreditCard',
        billing_address_form: false,
      },
      {
        id: 'MHIPAYPP',
        label: 'Hipay Paypal',
        connection_type: 'E-commerce',
        required_delay_before_departure: 0,
        category_payment_method: 'Paypal',
        billing_address_form: false,
      },
    ]);
  }),
  http.get('*/v1/contents/feature-flip/locales/fr-FR/releases/live/value', () => {
    return Response.json({
      isFreeDepositEnabled: false,
      isPaypalButtonEnabled: false,
    });
  }),
  http.get('*/v1/contents/b2c-common/locales/*/releases/live/value', () => {
    return Response.json({});
  }),
];

const meta: Meta = {
  title: 'Components/SubmitButton',
  component: SubmitButton,
  loaders: [mswLoader],
  parameters: {
    layout: 'centered',
    msw: {
      handlers,
    },
    docs: {
      description: {
        component: `
Composant SubmitButton qui affiche un bouton de soumission du formulaire de paiement.

**Comportement:**
- En mode iframe, le bouton n'est pas affiché (retourne null) car la soumission se fait directement dans l'iframe
- Pour les autres modes (hosted_field, redirect), le bouton est affiché
        `,
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Bouton de soumission affiché par défaut (mode hosted_field).',
      },
    },
  },
  render() {
    return (
      <MockedProvider
        action={Action.PAYMENT_CART}
        defaultValues={{
          provider_id: PspProviders.HIPAY,
          amount: '100',
          currency: 'EUR',
          cgv: true,
          token: {
            status: 'idle',
          },
        }}
        proposalId="12345678"
        paymentConfig={{
          providers: {
            [PspProviders.HIPAY]: {
              is_active: true,
              display_type: 'hosted_field',
              settings: {},
            },
            [PspProviders.EPAYGATE]: {
              is_active: true,
              display_type: 'redirect',
              settings: {},
            },
            [PspProviders.HIPAY_PAYPAL]: {
              is_active: false,
              display_type: 'redirect',
              settings: {},
            },
          },
          featureFlip: {},
          settings: { daysBeforeTripToAllowFreeDeposit: 30 },
        }}
        oidc={{ issuerType: OidcIssuerTypes.GM, accessToken: 'test-token' }}
      >
        <SubmitButton>Payer</SubmitButton>
      </MockedProvider>
    );
  },
};

export const IframeMode: Story = {
  parameters: {
    docs: {
      description: {
        story: "Mode iframe: le bouton n'est pas affiché car la soumission se fait dans l'iframe.",
      },
    },
  },
  render() {
    return (
      <MockedProvider
        action={Action.PAYMENT_CART}
        defaultValues={{
          provider_id: PspProviders.EPAYGATE,
          amount: '100',
          currency: 'EUR',
          cgv: true,
          token: {
            status: 'idle',
          },
        }}
        proposalId="12345678"
        paymentConfig={{
          providers: {
            [PspProviders.HIPAY]: {
              is_active: true,
              display_type: 'hosted_field',
              settings: {},
            },
            [PspProviders.EPAYGATE]: {
              is_active: true,
              display_type: 'iframe',
              settings: {},
            },
            [PspProviders.HIPAY_PAYPAL]: {
              is_active: false,
              display_type: 'redirect',
              settings: {},
            },
          },
          featureFlip: {},
          settings: { daysBeforeTripToAllowFreeDeposit: 30 },
        }}
        oidc={{ issuerType: OidcIssuerTypes.GM, accessToken: 'test-token' }}
      >
        <SubmitButton>Payer</SubmitButton>
      </MockedProvider>
    );
  },
};

export const PaypalButton: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Mode Paypal: affiche le bouton Paypal Hipay quand le provider Paypal est sélectionné et que le feature flip isPaypalButtonEnabled est activé.',
      },
    },
  },
  render() {
    return (
      <MockedProvider
        action={Action.PAYMENT_CART}
        defaultValues={{
          provider_id: PspProviders.HIPAY_PAYPAL,
          amount: '100',
          currency: 'EUR',
          cgv: true,
          billing_details: { address: { country_code: 'FR' } },
          token: {
            status: 'idle',
          },
        }}
        proposalId="12345678"
        paymentConfig={{
          providers: {
            [PspProviders.HIPAY]: {
              is_active: true,
              display_type: 'hosted_field',
              settings: {},
            },
            [PspProviders.EPAYGATE]: {
              is_active: true,
              display_type: 'redirect',
              settings: {},
            },
            [PspProviders.HIPAY_PAYPAL]: {
              is_active: true,
              display_type: 'redirect',
              settings: {
                script_url: 'https://stage-libs.hipay.com/js/sdkjs.js',
                username: '94685941.stage-secure-gateway.hipay-tpp.com',
                password: 'Test_KDArvJ3iCVesjQj3XRriMkXs',
                environment: 'stage',
              },
            },
          },
          featureFlip: {
            isPaypalButtonEnabled: true,
          },
          settings: { daysBeforeTripToAllowFreeDeposit: 30 },
        }}
        oidc={{ issuerType: OidcIssuerTypes.GM, accessToken: 'test-token' }}
      >
        <SubmitButton>Payer</SubmitButton>
      </MockedProvider>
    );
  },
  play: async ({ canvasElement }) => {
    // Wait for the Paypal button to be rendered
    await waitFor(
      () => {
        const paypalButton = canvasElement.querySelector('#paypal-button');
        expect(paypalButton).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  },
};
