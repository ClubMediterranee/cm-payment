import { render } from '@testing-library/react';

import { defaultContent } from '../content/default';
import { PspProviders } from '../types/PspProviders';
import { definePspProvider } from '../utils/integrations/definePspProvider';
import { SubmitButton } from './SubmitButton';

const state = vi.hoisted(() => ({
  redirect: false,
  provider: { id: 'MHIPAY', category_payment_method: 'CreditCard' },
  values: { amount: '1000', donation_amount: 50, currency: 'EUR' } as Record<string, unknown>,
}));

vi.mock('../hooks/utils/useCapsConfigContext', () => ({
  useCapsConfigContext: () => ({ content: defaultContent, locale: 'en-US' }),
}));
vi.mock('../hooks/utils/useForm', () => ({
  useWatch: (name: string) => state.values[name],
  useFormContext: () => ({ formState: { isValid: true }, triggerAndTouch: () => {} }),
}));
vi.mock('../hooks/utils/useProviderIntegrationMode', () => ({
  useProviderIntegrationMode: () => ({
    redirect: state.redirect,
    iframe: false,
    thirdPartyIframe: false,
  }),
}));
vi.mock('../hooks/utils/useWatchedPaymentProvider', () => ({
  useWatchedPaymentProvider: () => state.provider,
}));
vi.mock('../hooks/data/usePaymentConfig', () => ({
  usePaymentConfig: () => ({ data: { feature_flips: {} } }),
}));
vi.mock('../integrations/ui.js', () => ({}));
vi.mock('../integrations/hipay-paypal/ui/HipayPaypalButton.js', () => ({
  HipayPaypalButton: () => null,
}));

describe('SubmitButton', () => {
  beforeEach(() => {
    state.redirect = false;
    state.provider = { id: 'MHIPAY', category_payment_method: 'CreditCard' };
  });

  it('shows the amount with the donation for providers paid on the page', () => {
    const { container } = render(<SubmitButton />);

    expect(container.textContent).toBe('Pay €1,050.00 now');
  });

  it('invites to go to the payment partner for redirect providers', () => {
    state.redirect = true;

    const { container } = render(<SubmitButton />);

    expect(container.textContent).toBe('Go to our payment partner');
  });

  it('renders the button registered by the provider', () => {
    definePspProvider({
      id: PspProviders.M99BILLW,
      kind: 'button',
      component: ({ className }) => <button className={className}>Continue</button>,
    });
    state.provider = { id: PspProviders.M99BILLW, category_payment_method: 'Wallet' };

    const { getByRole } = render(<SubmitButton className="self-center" />);

    expect(getByRole('button').outerHTML).toBe('<button class="self-center">Continue</button>');
  });
});
