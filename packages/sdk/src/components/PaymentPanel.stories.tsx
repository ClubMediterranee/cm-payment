import type { Meta, StoryObj } from '@storybook/react-vite';
import { mswLoader } from 'msw-storybook-addon';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import {
  billingWidgetHandlers,
  contactChoiceHandlers,
  handlers,
  installmentSelects,
  installmentsHandlers,
  pickProvider,
  pickSchedule,
  submitButton,
} from '../__fixtures__/capsFormScenarios';
import { Action } from '../__generated__/index.schemas';
import { CapsForm } from '../providers/CapsForm';
import { PaymentConfigProvider } from '../providers/PaymentConfigProvider';
import { sdkQueryClient } from '../providers/QueryClientProvider';
import { OidcIssuerTypes } from '../types/CapsSettings';
import { PaymentPanel } from './PaymentPanel';
import { PaymentSchedule } from './PaymentSchedule';

type PaymentPanelStoryArgs = {
  issuerType: `${OidcIssuerTypes}`;
  locale: string;
};

const meta: Meta<PaymentPanelStoryArgs> = {
  title: 'Current/PaymentPanel',
  loaders: [mswLoader],
  beforeEach: () => sdkQueryClient.clear(),
  args: { issuerType: 'GM', locale: 'en-US' },
  argTypes: {
    issuerType: { control: 'inline-radio', options: ['GM', 'GO', 'PARTNERS'] },
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Composition du thème current : `<CapsForm><PaymentSchedule /><PaymentPanel /></CapsForm>`. Le panel regroupe les moyens de paiement, le panneau du moyen choisi (échéances, adresse, widget, contact, commentaires, CGV, bouton) et la donation.',
      },
    },
  },
  render: ({ issuerType, locale }) => (
    <PaymentConfigProvider
      theme="current"
      locale={locale}
      bookingId="booking-123"
      customerId="customer-456"
      callbackUrl="http://localhost:3000/callback"
      api={{ url: 'https://mock.clubmed.com', apiKey: 'test-api-key' }}
      oidc={{ issuerType: issuerType as OidcIssuerTypes, accessToken: 'test-token' }}
    >
      <CapsForm action={Action.PAYMENT_OPTION}>
        <PaymentSchedule />
        <PaymentPanel />
      </CapsForm>
    </PaymentConfigProvider>
  ),
};

export default meta;
type Story = StoryObj<PaymentPanelStoryArgs>;

export const StepByStep: Story = {
  parameters: { msw: { handlers } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await pickSchedule(canvas);
    await pickProvider(canvas, 'Pay with PayPal');
    expect(submitButton(canvasElement)).toBeNull();

    await userEvent.click(await canvas.findByRole('checkbox'));
    await waitFor(() => expect(submitButton(canvasElement)).not.toBeNull());
  },
};

export const BillingAddressAndPaymentWidget: Story = {
  args: { locale: 'fr-FR' },
  parameters: { msw: { handlers: billingWidgetHandlers } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await pickSchedule(canvas);
    const [firstName, lastName, number, street, zipCode, city] =
      await canvas.findAllByRole<HTMLInputElement>('textbox', {}, { timeout: 10000 });
    expect(canvas.queryByText('Card number', { exact: false })).toBeNull();

    await userEvent.type(firstName, 'Jean');
    await userEvent.type(lastName, 'Dupont');
    await userEvent.type(number, '42');
    await userEvent.type(street, 'Rue de la Paix');
    await userEvent.type(zipCode, '75008');
    expect(canvas.queryByText('Card number', { exact: false })).toBeNull();

    await userEvent.type(city, 'Paris');
    await canvas.findByText('Card number', { exact: false }, { timeout: 10000 });
  },
};

export const InstallmentsToChoose: Story = {
  parameters: { msw: { handlers: installmentsHandlers } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await pickSchedule(canvas);
    await pickProvider(canvas, 'Pay by card');
    await waitFor(() => expect(installmentSelects(canvasElement)).toHaveLength(2));
    const [cardType, installments] = installmentSelects(canvasElement);
    expect(canvas.queryByRole('checkbox')).toBeNull();

    await userEvent.selectOptions(cardType, 'Visa');
    await userEvent.selectOptions(installments, 'visa-3x');
    await canvas.findByRole('checkbox');
  },
};

export const SellerContactChoice: Story = {
  args: { issuerType: 'GO' },
  parameters: { msw: { handlers: contactChoiceHandlers } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await pickSchedule(canvas);
    await pickProvider(canvas, 'Pay by link');

    const phone = await canvas.findByTestId('InputFor_mobile_phone');
    expect(canvas.queryByRole('checkbox')).toBeNull();

    await userEvent.type(phone, '+33612345678');
    await userEvent.click(await canvas.findByRole('checkbox'));
    await waitFor(() => expect(submitButton(canvasElement)).not.toBeNull());
  },
};
