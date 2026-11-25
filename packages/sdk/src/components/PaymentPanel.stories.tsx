import type { Meta, StoryObj } from '@storybook/react-vite';
import { mswLoader } from 'msw-storybook-addon';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

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
  singleChoiceHandlers,
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
          'Composition du thème current : `<CapsForm><PaymentSchedule /><PaymentPanel /></CapsForm>`. Le panel apparaît une fois une échéance choisie, puis affiche tout en même temps : les moyens de paiement (sans radio quand il y en a un seul, sauf si `children` est passé), le panneau du moyen choisi (free deposit en paiement partiel, échéances, adresse, widget, contact, commentaires, CGV, bouton) et la donation. En paiement partiel, `PaymentSchedule` ne rend rien.',
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

export const AllAtOnce: Story = {
  parameters: { msw: { handlers } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findAllByRole('button', { name: 'Select this option' });
    expect(canvas.queryByText('Pay with PayPal')).toBeNull();

    await pickSchedule(canvas);
    expect(await canvas.findByText('Pay with PayPal')).toBeVisible();
    expect(canvas.getByText('Pay with Alipay')).toBeVisible();
    expect(canvas.queryByRole('checkbox')).toBeNull();

    await pickProvider(canvas, 'Pay with PayPal');

    await userEvent.click(await canvas.findByRole('checkbox'));
    await waitFor(() => expect(submitButton(canvasElement)).not.toBeNull());
  },
};

export const ScheduleInfoPopin: Story = {
  parameters: { msw: { handlers } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(canvas.queryByRole('dialog')).toBeNull();

    await userEvent.click(await canvas.findByRole('button', { name: /More information/i }));
    const dialog = await canvas.findByRole('dialog');
    expect(dialog).toHaveTextContent(/due date for the balance/i);

    expect(dialog).toHaveAccessibleName(/due date for the balance/i);
    expect(within(dialog).getByRole('button', { name: 'Close' })).toHaveFocus();
    await userEvent.click(within(dialog).getByRole('button', { name: 'Close' }));
    expect(canvas.queryByRole('dialog')).toBeNull();

    await userEvent.click(canvas.getByRole('button', { name: /More information/i }));
    (await canvas.findByRole('dialog')).dispatchEvent(new Event('cancel', { cancelable: true }));
    await waitFor(() => expect(canvas.queryByRole('dialog')).toBeNull());
  },
};

export const ScrollsAndFocusesTheFirstError: Story = {
  parameters: { msw: { handlers } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const original = Element.prototype.scrollIntoView;
    const scrollIntoView = fn();
    Element.prototype.scrollIntoView = scrollIntoView;

    try {
      await pickSchedule(canvas);
      expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });

      await pickProvider(canvas, 'Pay with PayPal');
      scrollIntoView.mockClear();
      await userEvent.click(await canvas.findByRole('button', { name: /partner/i }));

      const cgv = await canvas.findByRole('checkbox');
      await waitFor(() => expect(cgv).toHaveFocus());
      expect(await canvas.findByTestId('FormControlError')).toBeVisible();
    } finally {
      Element.prototype.scrollIntoView = original;
    }
  },
};

export const SingleScheduleAndProvider: Story = {
  parameters: { msw: { handlers: singleChoiceHandlers } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Pay with PayPal')).toBeVisible();
    expect(canvas.queryAllByRole('radio')).toHaveLength(0);
    expect(canvas.queryByRole('button', { name: /select/i })).toBeNull();

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
    await canvas.findByText('Card number', { exact: false }, { timeout: 10000 });

    await userEvent.type(firstName, 'Jean');
    await userEvent.type(lastName, 'Dupont');
    await userEvent.type(number, '42');
    await userEvent.type(street, 'Rue de la Paix');
    await userEvent.type(zipCode, '75008');
    await userEvent.type(city, 'Paris');
    expect(canvas.getByText('Card number', { exact: false })).toBeInTheDocument();
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

    await userEvent.selectOptions(cardType, 'Visa');
    await userEvent.selectOptions(installments, 'visa-3x');
    expect(installments).toHaveValue('visa-3x');
  },
};

export const SellerContactChoice: Story = {
  args: { issuerType: 'GO' },
  parameters: { msw: { handlers: contactChoiceHandlers } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await pickSchedule(canvas);
    await pickProvider(canvas, 'Pay by link');

    const email = await canvas.findByTestId('InputFor_email');

    await userEvent.type(email, 'client@email.com');
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
    expect(input.closest('.inset-ring-black')).toHaveTextContent('Pay by link');
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
  },
};

export const Donation: Story = {
  parameters: { msw: { handlers: donationHandlers } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const donation = () => canvasElement.querySelector('[class*="@container"]');

    await pickSchedule(canvas);
    await waitFor(() => expect(donation()).not.toBeNull());

    await pickProvider(canvas, 'Pay with PayPal');

    await userEvent.click(await canvas.findByRole('switch', { name: /Make a donation/i }));
    await userEvent.click(await canvas.findByRole('button', { name: /€20/ }));
    await userEvent.click(await canvas.findByRole('checkbox', { name: /my donation/i }));
    await userEvent.click(await canvas.findByRole('button', { name: 'Confirm' }));
    await canvas.findByRole('button', { name: /Remove -€20/ });
  },
};
