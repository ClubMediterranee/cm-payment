import type { Meta, StoryObj } from '@storybook/react-vite';
import { mswLoader } from 'msw-storybook-addon';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import {
  billingWidgetHandlers,
  contactChoiceHandlers,
  donationHandlers,
  freeDepositHandlers,
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
  action: Action;
  issuerType: `${OidcIssuerTypes}`;
  locale: string;
};

const meta: Meta<PaymentPanelStoryArgs> = {
  title: 'Current/PaymentPanel',
  loaders: [mswLoader],
  beforeEach: () => sdkQueryClient.clear(),
  args: { action: Action.PAYMENT_OPTION, issuerType: 'GM', locale: 'en-US' },
  argTypes: {
    issuerType: { control: 'inline-radio', options: ['GM', 'GO', 'PARTNERS'] },
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Composition du thème current : `<CapsForm><PaymentSchedule /><PaymentPanel /></CapsForm>`. Le panel regroupe les moyens de paiement, le panneau du moyen choisi (free deposit en paiement partiel, échéances, adresse, widget, contact, commentaires, CGV, bouton) et la donation. En paiement partiel, `PaymentSchedule` ne rend rien.',
      },
    },
  },
  render: ({ action, issuerType, locale }) => (
    <PaymentConfigProvider
      theme="current"
      locale={locale}
      bookingId="booking-123"
      customerId="customer-456"
      callbackUrl="http://localhost:3000/callback"
      api={{ url: 'https://mock.clubmed.com', apiKey: 'test-api-key' }}
      oidc={{ issuerType: issuerType as OidcIssuerTypes, accessToken: 'test-token' }}
    >
      <div className="mx-auto w-full max-w-784 px-16 py-40">
        <CapsForm action={action}>
          <PaymentSchedule />
          <PaymentPanel />
        </CapsForm>
      </div>
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

export const FreeDeposit: Story = {
  args: { action: Action.PAYMENT_PARTIAL, issuerType: 'GO' },
  parameters: { msw: { handlers: freeDepositHandlers } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const input = await canvas.findByLabelText<HTMLInputElement>(/Amount desired by the client/i);
    expect(canvas.queryByText('Choose the payment schedule')).toBeNull();
    expect(input.closest('.border-black')).toHaveTextContent('Pay by link');
    expect(input.value).toBe('');

    await userEvent.type(input, '0');
    await userEvent.tab();
    await canvas.findByText(/The amount must be greater than 0/i);

    await userEvent.clear(input);
    await userEvent.type(input, '1000');
    await userEvent.tab();
    await canvas.findByText(/The amount cannot exceed the remaining total/i);

    await userEvent.clear(input);
    await userEvent.type(input, '250');
    await userEvent.tab();
    await waitFor(() => {
      expect(canvas.queryByText(/The amount must be greater than 0/i)).toBeNull();
      expect(canvas.queryByText(/The amount cannot exceed the remaining total/i)).toBeNull();
    });
    await canvas.findByTestId('InputFor_mobile_phone');
  },
};

export const InstallmentsClearedOnProviderChange: Story = {
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

export const Donation: Story = {
  parameters: { msw: { handlers: donationHandlers } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const donation = () => canvasElement.querySelector('[class*="@container"]');

    await pickSchedule(canvas);
    expect(donation()).toBeNull();

    await pickProvider(canvas, 'Pay with PayPal');
    await waitFor(() => expect(donation()).not.toBeNull());

    await userEvent.click(await canvas.findByRole('button', { name: /Make a donation/i }));
    await userEvent.click(await canvas.findByRole('radio', { name: /€20\.00/ }));
    await waitFor(() => expect(canvas.getAllByRole('checkbox')).toHaveLength(2));
    expect(submitButton(canvasElement)).toBeNull();
  },
};
