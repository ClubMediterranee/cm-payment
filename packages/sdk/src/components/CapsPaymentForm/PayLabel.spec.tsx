import { render } from '@testing-library/react';

import { defaultContent } from '../../content/default';
import { PayLabel } from './PayLabel';

const state = vi.hoisted(() => ({
  redirect: false,
  values: { amount: '1000', donation_amount: 50, currency: 'EUR' } as Record<string, unknown>,
}));

vi.mock('../../hooks/utils/useCapsConfigContext', () => ({
  useCapsConfigContext: () => ({ content: defaultContent, locale: 'en-US' }),
}));
vi.mock('../../hooks/utils/useForm', () => ({
  useWatch: (name: string) => state.values[name],
}));
vi.mock('../../hooks/utils/useProviderIntegrationMode', () => ({
  useProviderIntegrationMode: () => ({ redirect: state.redirect }),
}));

describe('PayLabel', () => {
  beforeEach(() => {
    state.redirect = false;
  });

  it('shows the amount with the donation for providers paid on the page', () => {
    const { container } = render(<PayLabel />);

    expect(container.textContent).toBe('Pay €1,050.00 now');
  });

  it('invites to go to the payment partner for redirect providers', () => {
    state.redirect = true;

    const { container } = render(<PayLabel />);

    expect(container.textContent).toBe('Go to our payment partner');
  });
});
