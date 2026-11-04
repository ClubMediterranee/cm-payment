import { render } from '@testing-library/react';

import { BillingAddress } from './BillingAddress';

const useBillingSchema = vi.hoisted(() => vi.fn());
const profile = vi.hoisted(() => ({ current: null as object | null }));

vi.mock('../hooks/data/useBillingSchema', () => ({ useBillingSchema }));
vi.mock('../hooks/utils/useCapsConfigContext', () => ({
  useCapsConfigContext: () => ({ customerId: '1', oidc: { accessToken: 'token' } }),
}));
vi.mock('@tanstack/react-query', async () => ({
  ...(await vi.importActual('@tanstack/react-query')),
  useSuspenseQuery: () => ({ data: profile.current }),
}));

describe('BillingAddress.Preload', () => {
  afterEach(() => {
    vi.clearAllMocks();
    profile.current = null;
  });

  it('loads the billing schema of the country of the locale', () => {
    render(<BillingAddress.Preload countryCode="FR" />);

    expect(useBillingSchema).toHaveBeenCalledWith('FR');
  });

  it('loads the billing schema of the country of the profile first', () => {
    profile.current = { address: { country_code: 'CA' } };

    render(<BillingAddress.Preload countryCode="FR" />);

    expect(useBillingSchema).toHaveBeenCalledWith('CA');
  });
});
