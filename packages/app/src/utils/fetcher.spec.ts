import { fetcher as fetchSdk } from '@clubmed/caps';

import { fetcher, setFetcherConfig } from './fetcher';

vi.mock('@clubmed/caps', () => ({ fetcher: vi.fn().mockResolvedValue({ ok: true }) }));

describe('fetcher', () => {
  it('calls the SDK fetcher on /api with the config of the app', async () => {
    const config = {
      locale: 'fr-FR',
      oidc: { issuerType: 'GM', accessToken: 'token' },
      api: { url: 'https://caps.example', apiKey: 'key' },
    } as any;
    setFetcherConfig(config);

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
});
