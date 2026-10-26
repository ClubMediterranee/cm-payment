import { constant, inject } from '@tsed/di';

import { oneyFetcher } from './fetcher.js';

vi.mock('@tsed/di', async (importOriginal: () => Promise<any>) => ({
  ...(await importOriginal()),
  constant: vi.fn(),
  inject: vi.fn(),
}));

describe('oneyFetcher', () => {
  const httpClient = { fetch: vi.fn() };

  beforeEach(() => {
    vi.clearAllMocks();
    httpClient.fetch.mockResolvedValue({ ok: true });
    vi.mocked(constant).mockImplementation((_key, defaultValue) => defaultValue as never);
    vi.mocked(inject).mockReturnValue(httpClient as never);
  });

  it('calls the Oney API with the partner headers', async () => {
    const result = await oneyFetcher(
      { url: '/simulation', method: 'GET', params: { payment_amount: 300 } },
      { apiKey: 'api-key', countryCode: 'FR' },
    );

    expect(result).toEqual({ ok: true });
    expect(httpClient.fetch).toHaveBeenCalledWith({
      callee: 'ONEY',
      url: 'https://api-staging.oney.io/simulation',
      method: 'GET',
      params: { payment_amount: 300 },
      headers: {
        'X-Oney-Authorization': 'api-key',
        'X-Oney-Partner-Country-Code': 'FR',
      },
      data: undefined,
    });
  });

  it('omits the partner headers and keeps request headers when no options are given', async () => {
    vi.mocked(constant).mockReturnValue('https://oney.test');

    await oneyFetcher({ url: '/catalog', method: 'GET', headers: { Accept: 'application/json' } });

    expect(httpClient.fetch).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'https://oney.test/catalog',
        params: {},
        headers: { Accept: 'application/json' },
      }),
    );
  });
});
