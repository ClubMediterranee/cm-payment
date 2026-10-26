import type { Meta, StoryObj } from '@storybook/react-vite';
import { http } from 'msw';
import { useState } from 'react';
import { mswLoader } from 'msw-storybook-addon';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { Action } from '../../__generated__/index.schemas';
import { sdkQueryClient } from '../../providers/QueryClientProvider';
import {
  billingHandlers,
  contactChoiceHandlers,
  donationHandlers,
  handlers,
  hostedFieldHandlers,
  iframeHandlers,
  installmentSelects,
  installmentsHandlers,
  pickProvider,
  pickSchedule,
  submitButton,
} from '../../__fixtures__/capsFormScenarios';
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

const queryHidden = (canvas: ReturnType<typeof within>, name: RegExp) =>
  canvas.queryByRole('button', { name });

export const StepByStep: Story = {
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

export const Legacy: Story = {
  args: { theme: 'legacy' },
  parameters: { msw: { handlers } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Pay with PayPal')).toBeVisible();
    expect(await canvas.findByRole('checkbox')).not.toBeChecked();
    expect(submitButton(canvasElement)).not.toBeNull();
  },
};

export const TrackingEvents: Story = {
  args: { onEvent: fn(), onRedirect: fn((): false => false) },
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

    await pickSchedule(canvas);
    await pickProvider(canvas, 'Pay with PayPal');
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

export const LegacySellerContactChoice: Story = {
  args: { theme: 'legacy', issuerType: 'GO' },
  parameters: { msw: { handlers: contactChoiceHandlers } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(await canvas.findByTestId('radio-4'));
    const phone = await canvas.findByTestId('InputFor_mobile_phone');

    await userEvent.type(phone, '+33612345678');
    await userEvent.click(await canvas.findByRole('checkbox'));

    expect(submitButton(canvasElement)).not.toBeNull();
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
  render: (args) => <DonationSlotHost {...args} />,
  parameters: { msw: { handlers: donationHandlers } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const slot = canvas.getByTestId('donation-slot');

    await canvas.findAllByRole('radio');
    await waitFor(() => expect(slot.children.length).toBeGreaterThan(0));
    expect(canvas.queryByText('Pay with PayPal')).toBeNull();
  },
};

export const DonationWaitsForBillingAddressStep: Story = {
  parameters: { msw: { handlers: donationHandlers } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const donation = () => canvasElement.querySelector('[class*="@container"]');

    await pickSchedule(canvas);
    expect(donation()).toBeNull();

    await pickProvider(canvas, 'Pay with PayPal');
    await waitFor(() => expect(donation()).not.toBeNull());
  },
};

export const DonationRequiresItsOwnTerms: Story = {
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

export const InstallmentsAreChosen: Story = {
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

export const BillingAddressRevealsTheNextSteps: Story = {
  args: { locale: 'fr-FR' },
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

export const IframeWidgetAppearsOnceTheFormIsValid: Story = {
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

export const HostedFieldsWidget: Story = {
  parameters: { msw: { handlers: hostedFieldHandlers } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await pickSchedule(canvas);
    await canvas.findByText('Card number', { exact: false }, { timeout: 10000 });
    expect(canvas.getByText('Expiry date', { exact: false })).toBeInTheDocument();
  },
};
