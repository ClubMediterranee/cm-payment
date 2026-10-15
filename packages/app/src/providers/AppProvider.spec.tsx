import { render, screen } from '@testing-library/react';

import { AppProvider, useAppContext } from './AppProvider';

vi.mock('../hooks/useAppParams.js', () => ({
  useAppParams: vi.fn(),
}));

vi.mock('../pages/LoadingPage.js', () => ({
  LoadingPage: () => <div data-testid="loading-page">Loading</div>,
}));

vi.mock('../utils/fetcher.js', () => ({
  setFetcherConfig: vi.fn(),
}));

import { useAppParams } from '../hooks/useAppParams.js';
import { setFetcherConfig } from '../utils/fetcher.js';

const Consumer = () => {
  const { id, type, values } = useAppContext();

  return (
    <span data-testid="consumer">
      {type}:{id}:{values.customerId}
    </span>
  );
};

const params = (values: Record<string, string>) =>
  ({
    values: { locale: 'fr-FR', customerId: 'customer-1', ...values },
    api: { url: 'https://caps.example', apiKey: 'key' },
    oidc: { issuerType: 'GM', accessToken: 'token' },
  }) as any;

describe('AppProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the loading page when values are missing', () => {
    vi.mocked(useAppParams).mockReturnValue(null);

    render(
      <AppProvider>
        <div>child</div>
      </AppProvider>,
    );

    expect(screen.getByTestId('loading-page')).toBeTruthy();
    expect(screen.queryByText('child')).toBeNull();
  });

  it('shares the app params, with the booking as flow', () => {
    vi.mocked(useAppParams).mockReturnValue(params({ bookingId: 'booking-1' }));

    render(
      <AppProvider>
        <Consumer />
      </AppProvider>,
    );

    expect(screen.getByTestId('consumer').textContent).toBe('booking:booking-1:customer-1');
  });

  it('shares the proposal as flow when there is no booking', () => {
    vi.mocked(useAppParams).mockReturnValue(params({ proposalId: 'proposal-1' }));

    render(
      <AppProvider>
        <Consumer />
      </AppProvider>,
    );

    expect(screen.getByTestId('consumer').textContent).toBe('proposal:proposal-1:customer-1');
  });

  it('configures the fetcher with the locale, the oidc and the api of the app', () => {
    const value = params({ proposalId: 'proposal-1' });
    vi.mocked(useAppParams).mockReturnValue(value);

    render(
      <AppProvider>
        <div>child</div>
      </AppProvider>,
    );

    expect(setFetcherConfig).toHaveBeenCalledWith({
      locale: 'fr-FR',
      oidc: value.oidc,
      api: value.api,
    });
  });

  it('refuses to be used outside of the provider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => render(<Consumer />)).toThrow('useAppContext must be used within an AppProvider');
  });
});
