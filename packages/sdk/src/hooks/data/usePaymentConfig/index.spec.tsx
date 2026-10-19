import { renderHook, waitFor } from '@testing-library/react';

import { sdkQueryClient } from '../../../providers/QueryClientProvider';
import { OidcIssuerTypes } from '../../../types/CapsSettings';
import { fetcher } from '../../../utils/fetcher';
import { paymentConfigQueryOptions, useCapsTheme } from './index';

vi.mock('../../../utils/fetcher', () => ({ fetcher: vi.fn() }));

const config = {
  locale: 'fr-FR',
  oidc: { accessToken: 'token', issuerType: OidcIssuerTypes.GM },
  api: { url: 'https://caps.example', apiKey: 'api-key' },
};

describe('useCapsTheme', () => {
  afterEach(() => {
    sdkQueryClient.clear();
    vi.clearAllMocks();
  });

  it('returns the theme of the payment configuration', async () => {
    vi.mocked(fetcher).mockResolvedValue({ settings: { theme: 'current' } });

    const { result } = renderHook(() => useCapsTheme(config));

    await waitFor(() => expect(result.current).toBe('current'));
    expect(fetcher).toHaveBeenCalledWith({ url: '/rest/payment_config', method: 'GET', config });
  });

  it('falls back to legacy when the configuration has no theme', async () => {
    vi.mocked(fetcher).mockResolvedValue({ settings: {} });

    const { result } = renderHook(() => useCapsTheme(config));

    await waitFor(() => expect(result.current).toBe('legacy'));
  });

  it('shares the SDK cache so the form does not fetch the configuration again', async () => {
    vi.mocked(fetcher).mockResolvedValue({ settings: { theme: 'current' } });

    const { result } = renderHook(() => useCapsTheme(config));
    await waitFor(() => expect(result.current).toBe('current'));

    expect(sdkQueryClient.getQueryData(paymentConfigQueryOptions(config).queryKey)).toEqual({
      settings: { theme: 'current' },
    });
  });

  it('scopes the cache key by API url, locale and issuer', () => {
    expect(paymentConfigQueryOptions(config).queryKey).toEqual([
      'paymentConfig',
      'https://caps.example',
      'fr-FR',
      'GM',
    ]);
  });
});
