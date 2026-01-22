import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { MockedProvider } from '../__fixtures__/MockedProvider';
import { Action } from '../__generated__/index.schemas';
import { OidcIssuerTypes } from '../types/CapsSettings';
import { PspProviders } from '../types/PspProviders';
import { SubmitButton } from './SubmitButton';

const meta: Meta = {
  title: 'Components/SubmitButton',
  component: SubmitButton,
  parameters: {
    layout: 'centered',
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
            },
          },
          featureFlip: {},
          settings: {
            daysBeforeTripToAllowFreeDeposit: 30,
          },
        }}
        oidc={{ issuerType: OidcIssuerTypes.GM, accessToken: 'test-token' }}
      >
        <SubmitButton>Payer</SubmitButton>
      </MockedProvider>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const button = canvas.getByRole('button', { name: 'Payer' });
    expect(button).toBeInTheDocument();
    expect(button.getAttribute('type')).toBe('submit');
    expect(button.getAttribute('form')).toBe('payment-form');
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
            [PspProviders.EPAYGATE]: {
              is_active: true,
              display_type: 'iframe',
            },
          },
          featureFlip: {},
          settings: {
            daysBeforeTripToAllowFreeDeposit: 30,
          },
        }}
        oidc={{ issuerType: OidcIssuerTypes.GM, accessToken: 'test-token' }}
      >
        <SubmitButton>Payer</SubmitButton>
      </MockedProvider>
    );
  },
  play: async ({ canvasElement }) => {
    expect(canvasElement.textContent).toBe('');
  },
};
