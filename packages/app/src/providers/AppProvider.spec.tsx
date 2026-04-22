import { render, screen } from '@testing-library/react';

import { AppProvider } from './AppProvider';

vi.mock('@clubmed/caps', () => ({
  PaymentConfigProvider: ({ children, ...props }: any) => (
    <div data-testid="payment-config-provider" data-props={JSON.stringify(props)}>
      {children}
    </div>
  ),
}));

vi.mock('../hooks/useAppParams.js', () => ({
  useAppParams: vi.fn(),
}));

vi.mock('../pages/LoadingPage.js', () => ({
  LoadingPage: () => <div data-testid="loading-page">Loading</div>,
}));

import { useAppParams } from '../hooks/useAppParams.js';

describe('AppProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the loading page when values are missing', () => {
    vi.mocked(useAppParams).mockReturnValue({
      paymentGatewayUrl: undefined,
      values: undefined,
      api: undefined,
      oidc: undefined,
    } as any);

    render(
      <AppProvider>
        <div>child</div>
      </AppProvider>,
    );

    expect(screen.getByTestId('loading-page')).toBeTruthy();
    expect(screen.queryByText('child')).toBeNull();
  });

  it('passes app params to PaymentConfigProvider and renders children', () => {
    vi.mocked(useAppParams).mockReturnValue({
      paymentGatewayUrl: 'https://gateway.example.com',
      values: {
        locale: 'fr-FR',
        proposalId: 'proposal-1',
        bookingId: 'booking-1',
        customerId: 'customer-1',
        callbackUrl: 'https://example.com/callback',
        callbackUrlSeller: 'https://example.com/seller-callback',
      },
      api: {
        cms: 'https://cms.example.com',
      },
      oidc: {
        issuerType: 'GM',
      },
    } as any);

    render(
      <AppProvider>
        <div>child</div>
      </AppProvider>,
    );

    const provider = screen.getByTestId('payment-config-provider');

    expect(screen.getByText('child')).toBeTruthy();
    expect(provider.getAttribute('data-props')).toBe(
      JSON.stringify({
        paymentGatewayUrl: 'https://gateway.example.com',
        locale: 'fr-FR',
        proposalId: 'proposal-1',
        bookingId: 'booking-1',
        customerId: 'customer-1',
        api: {
          cms: 'https://cms.example.com',
        },
        oidc: {
          issuerType: 'GM',
        },
        callbackUrl: 'https://example.com/callback',
        callbackUrlSeller: 'https://example.com/seller-callback',
      }),
    );
  });
});
