import { PlatformTest } from '@tsed/platform-http/testing';

import { DirectusClient } from '../../infra/directus/DirectusClient.js';
import { PaymentConfigRepository } from './PaymentConfigRepository.js';

describe('PaymentConfigRepository', () => {
  let repository: PaymentConfigRepository;
  let directusClient: DirectusClient;

  beforeEach(async () => {
    await PlatformTest.create({
      DIRECTUS_URL: 'http://localhost',
      DIRECTUS_API_TOKEN: 'test-token',
    });

    repository = await PlatformTest.invoke<PaymentConfigRepository>(PaymentConfigRepository);
    directusClient = await PlatformTest.get<DirectusClient>(DirectusClient);
  });

  afterEach(() => PlatformTest.reset());

  describe('getConfigurations', () => {
    it("translates Directus '*' locale to null in overrides", async () => {
      vi.spyOn(directusClient, 'getConfigurations').mockResolvedValue([
        {
          key: 'days_before_trip',
          type: 'number',
          value: 90,
          overrides: [
            { locale: '*', issuer: 'GM', value: '60' },
            { locale: 'fr-FR', issuer: 'GM', value: '30' },
          ],
        },
      ] as never);

      const [configuration] = await repository.getConfigurations();

      expect(configuration.overrides).toEqual([
        { locale: null, issuer: 'GM', value: '60' },
        { locale: 'fr-FR', issuer: 'GM', value: '30' },
      ]);
    });

    it('returns empty overrides when Directus returns null', async () => {
      vi.spyOn(directusClient, 'getConfigurations').mockResolvedValue([
        { key: 'is_enabled', type: 'boolean', value: true, overrides: null },
      ] as never);

      const [configuration] = await repository.getConfigurations();

      expect(configuration.overrides).toEqual([]);
    });

    it('preserves scalar configuration fields', async () => {
      vi.spyOn(directusClient, 'getConfigurations').mockResolvedValue([
        { key: 'is_enabled', type: 'boolean', value: true, overrides: [] },
      ] as never);

      const [configuration] = await repository.getConfigurations();

      expect(configuration.key).toBe('is_enabled');
      expect(configuration.type).toBe('boolean');
      expect(configuration.value).toBe(true);
    });
  });

  describe('getProviders', () => {
    it("translates Directus '*' locale to null in variants and exposes allowed_actions", async () => {
      vi.spyOn(directusClient, 'getProviders').mockResolvedValue([
        {
          id: 'MHIPAY',
          default_display_type: 'hosted_field',
          settings: [
            { locale: '*', allowed_actions: ['PAYMENT_RESA'], settings: [] },
            { locale: 'fr-FR', allowed_actions: null, settings: [] },
            { locale: 'en-US', settings: [] },
          ],
        },
      ] as never);

      const [provider] = await repository.getProviders();

      expect(provider.variants).toEqual([
        expect.objectContaining({ locale: null, allowed_actions: ['PAYMENT_RESA'] }),
        expect.objectContaining({ locale: 'fr-FR', allowed_actions: [] }),
        expect.objectContaining({ locale: 'en-US', allowed_actions: [] }),
      ]);
    });

    it('renames Directus settings collection to variants', async () => {
      vi.spyOn(directusClient, 'getProviders').mockResolvedValue([
        { id: 'MHIPAY', default_display_type: 'redirect', settings: [] },
      ] as never);

      const [provider] = await repository.getProviders();

      expect(provider.variants).toEqual([]);
      expect(provider.id).toBe('MHIPAY');
      expect(provider.default_display_type).toBe('redirect');
    });

    it('returns empty variants when Directus settings is null', async () => {
      vi.spyOn(directusClient, 'getProviders').mockResolvedValue([
        { id: 'MHIPAY', default_display_type: 'redirect', settings: null },
      ] as never);

      const [provider] = await repository.getProviders();

      expect(provider.variants).toEqual([]);
    });

    it('extracts validation fields from each variant (excluding locale/settings/allowed_actions)', async () => {
      vi.spyOn(directusClient, 'getProviders').mockResolvedValue([
        {
          id: 'MHIPAY',
          default_display_type: 'hosted_field',
          settings: [
            {
              locale: '*',
              allowed_actions: ['PAYMENT_RESA'],
              settings: [{ key: 'script_url', type: 'string', value: 'https://x.io' }],
              display_type: 'iframe',
              requires_token: true,
              requires_expiry_date: false,
            },
          ],
        },
      ] as never);

      const [provider] = await repository.getProviders();

      expect(provider.variants[0].validation).toEqual({
        display_type: 'iframe',
        requires_token: true,
        requires_expiry_date: false,
      });
      expect(provider.variants[0].settings).toEqual([
        { key: 'script_url', type: 'string', value: 'https://x.io' },
      ]);
    });

    it('returns empty settings array when variant settings is null', async () => {
      vi.spyOn(directusClient, 'getProviders').mockResolvedValue([
        {
          id: 'MHIPAY',
          default_display_type: 'redirect',
          settings: [{ locale: '*', settings: null }],
        },
      ] as never);

      const [provider] = await repository.getProviders();

      expect(provider.variants[0].settings).toEqual([]);
    });
  });
});
