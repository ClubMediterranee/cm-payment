import { PlatformTest } from '@tsed/platform-http/testing';

import { DirectusClient } from './DirectusClient.js';

const requestMock = vi.fn();

vi.mock('@directus/sdk', () => ({
  createDirectus: vi.fn(() => ({
    with: vi.fn().mockReturnThis(),
    request: requestMock,
  })),
  rest: vi.fn(),
  staticToken: vi.fn(),
  readItems: vi.fn((collection: string, query?: unknown) => ({ collection, query })),
}));

describe('DirectusClient', () => {
  let client: DirectusClient;

  beforeEach(async () => {
    requestMock.mockReset();
    await PlatformTest.create({
      DIRECTUS_URL: 'http://localhost',
      DIRECTUS_API_TOKEN: 'test-token',
    });
    client = await PlatformTest.invoke<DirectusClient>(DirectusClient);
  });

  afterEach(() => PlatformTest.reset());

  describe('getConfigurations', () => {
    it('fetches configurations from the caps_configurations collection', async () => {
      const configurations = [
        { key: 'is_free_deposit_enabled', type: 'boolean' as const, value: true },
      ];
      requestMock.mockResolvedValue(configurations);

      const result = await client.getConfigurations();

      expect(result).toEqual(configurations);
      expect(requestMock).toHaveBeenCalledWith(
        expect.objectContaining({ collection: 'caps_configurations' }),
      );
    });
  });

  describe('getProviders', () => {
    it('fetches providers from the caps_providers collection with nested settings', async () => {
      const providers = [
        {
          id: 'MCYBERSOURCE',
          default_display_type: 'hosted_field',
          settings: [
            {
              locale: 'fr-FR',
              status: 'published',
              settings: [{ key: 'merchant_id', type: 'string', value: 'abc' }],
            },
          ],
        },
      ];
      requestMock.mockResolvedValue(providers);

      const result = await client.getProviders();

      expect(result).toEqual(providers);
      expect(requestMock).toHaveBeenCalledWith(
        expect.objectContaining({
          collection: 'caps_providers',
          query: expect.objectContaining({
            fields: expect.arrayContaining([
              'id',
              'default_display_type',
              expect.objectContaining({ settings: expect.any(Array) }),
            ]),
          }),
        }),
      );
    });
  });
});
