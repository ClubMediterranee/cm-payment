import { PlatformTest } from '@tsed/platform-http/testing';

import { DirectusClient } from './DirectusClient.js';
import type { DirectusConfiguration, DirectusProvider } from './types.js';

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
    it('fetches configurations from the configurations collection', async () => {
      const configurations: DirectusConfiguration[] = [
        { key: 'is_free_deposit_enabled', type: 'boolean', value: true },
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
    it('strips Directus system fields from each provider setting', async () => {
      const providers: DirectusProvider[] = [
        {
          id: 'MCYBERSOURCE',
          default_display_type: 'hosted_field',
          settings: [
            {
              locale: 'fr-FR',
              status: 'published',
              settings: [{ key: 'merchant_id', value: 'abc' }],
              // System fields that should be removed
              id: 'sys-1',
              sort: 1,
              user_created: 'u1',
              date_created: '2025-01-01',
              user_updated: 'u2',
              date_updated: '2025-02-01',
              provider_id: 'MCYBERSOURCE',
            } as any,
          ],
        },
      ];
      requestMock.mockResolvedValue(providers);

      const [provider] = await client.getProviders();
      const [setting] = provider.settings as any[];

      expect(setting.locale).toBe('fr-FR');
      expect(setting.status).toBe('published');
      expect(setting.id).toBeUndefined();
      expect(setting.sort).toBeUndefined();
      expect(setting.user_created).toBeUndefined();
      expect(setting.date_created).toBeUndefined();
      expect(setting.user_updated).toBeUndefined();
      expect(setting.date_updated).toBeUndefined();
      expect(setting.provider_id).toBeUndefined();
    });

    it('leaves providers untouched when settings is not an array', async () => {
      const providers = [
        { id: 'MCYBERSOURCE', default_display_type: 'redirect', settings: undefined as any },
      ];
      requestMock.mockResolvedValue(providers);

      const result = await client.getProviders();

      expect(result).toEqual(providers);
    });
  });

  describe('getItems error handling', () => {
    it('wraps SDK errors with the collection name', async () => {
      requestMock.mockRejectedValue(new Error('boom'));

      await expect(client.getConfigurations()).rejects.toThrow(
        'Failed to fetch items from collection "caps_configurations": boom',
      );
    });
  });
});
