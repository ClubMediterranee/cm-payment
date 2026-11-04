import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { type PropsWithChildren, Suspense } from 'react';

import { useTheme } from './useTheme';

const getPaymentConfig = vi.hoisted(() => vi.fn());

vi.mock('../__generated__/bff', () => ({
  paymentConfigControllerGetPaymentConfig: getPaymentConfig,
}));

const api = { url: 'https://caps.example', apiKey: 'key' };
const oidc = { issuerType: 'GM', accessToken: 'token' };

vi.mock('../providers/AppProvider', () => ({
  useAppContext: () => ({ api, oidc, values: { locale: 'fr-FR' } }),
}));

const renderTheme = () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={client}>
      <Suspense fallback={null}>{children}</Suspense>
    </QueryClientProvider>
  );

  return renderHook(() => useTheme(), { wrapper });
};

describe('useTheme', () => {
  it('resolves the theme from the payment configuration', async () => {
    getPaymentConfig.mockResolvedValue({ settings: { theme: 'current' } });

    const { result } = renderTheme();

    await waitFor(() => expect(result.current).toBe('current'));
  });

  it('falls back to the legacy theme when the configuration has no theme', async () => {
    getPaymentConfig.mockResolvedValue({ settings: {} });

    const { result } = renderTheme();

    await waitFor(() => expect(result.current).toBe('legacy'));
  });
});
