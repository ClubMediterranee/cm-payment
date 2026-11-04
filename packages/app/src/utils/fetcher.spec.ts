import { fetcher as fetchSdk } from '@clubmed/caps';

import { bffFetcher, fetcher, setFetcherConfig } from './fetcher';

vi.mock('@clubmed/caps', () => ({ fetcher: vi.fn().mockResolvedValue({ ok: true }) }));

const config = {
  locale: 'fr-FR',
  oidc: { issuerType: 'GM', accessToken: 'token' },
  api: { url: 'https://caps.example', apiKey: 'key' },
} as any;

describe('fetcher', () => {
  beforeEach(() => {
    setFetcherConfig(config);
  });

  it('calls the SDK fetcher on /api with the config of the app', async () => {
    const result = await fetcher({ url: '/stay', method: 'GET', params: { id: 1 } });

    expect(result).toEqual({ ok: true });
    expect(fetchSdk).toHaveBeenCalledWith({
      baseUrl: '/api',
      config,
      url: '/stay',
      method: 'GET',
      params: { id: 1 },
    });
  });

  it('calls the SDK fetcher on the CAPS api with the config of the app for the BFF', async () => {
    await bffFetcher({ url: '/rest/payment_config', method: 'GET' });

    expect(fetchSdk).toHaveBeenLastCalledWith({
      config,
      url: '/rest/payment_config',
      method: 'GET',
    });
  });
});
