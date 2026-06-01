import { PlatformTest } from '@tsed/platform-http/testing';

import { DirectusClient } from '../../infra/directus/DirectusClient.js';
import type { DirectusConfiguration, DirectusProvider } from '../../infra/directus/types.js';
import { PaymentConfigService } from './PaymentConfigService.js';
import { OidcIssuerTypes } from './types.js';

function getPrivateMethod<T>(service: PaymentConfigService, methodName: string): T {
  return (service as any)[methodName].bind(service) as T;
}

describe('PaymentConfigService', () => {
  let service: PaymentConfigService;
  let directusClient: DirectusClient;

  beforeEach(async () => {
    await PlatformTest.create({
      DIRECTUS_URL: 'http://localhost',
      DIRECTUS_API_TOKEN: 'test-token',
    });

    service = await PlatformTest.invoke<PaymentConfigService>(PaymentConfigService);
    directusClient = await PlatformTest.get<DirectusClient>(DirectusClient);
  });

  afterEach(() => PlatformTest.reset());

  describe('getPaymentConfig', () => {
    it('should split boolean configs into feature_flips and the rest into settings', async () => {
      const configurations: DirectusConfiguration[] = [
        { key: 'is_free_deposit_enabled', type: 'boolean', value: true },
        { key: 'days_before_trip_to_allow_free_deposit', type: 'number', value: 90 },
      ];
      vi.spyOn(directusClient, 'getConfigurations').mockResolvedValue(configurations);

      const result = await service.getPaymentConfig({
        locale: 'fr-FR',
        issuerType: OidcIssuerTypes.GM,
      });

      expect(result.feature_flips).toEqual({ is_free_deposit_enabled: true });
      expect(result.settings).toEqual({ days_before_trip_to_allow_free_deposit: 90 });
    });

    it('should resolve override values by locale and issuer', async () => {
      const configurations: DirectusConfiguration[] = [
        {
          key: 'days_before_trip_to_allow_free_deposit',
          type: 'number',
          value: 90,
          overrides: [{ locale: 'en-US', issuer: 'GM', value: 30 }],
        },
      ];
      vi.spyOn(directusClient, 'getConfigurations').mockResolvedValue(configurations);

      const result = await service.getPaymentConfig({
        locale: 'en-US',
        issuerType: OidcIssuerTypes.GM,
      });

      expect(result.settings.days_before_trip_to_allow_free_deposit).toBe(30);
    });
  });

  describe('getPaymentProvidersConfig', () => {
    it('should exclude inactive providers and never expose is_active', async () => {
      const providers: DirectusProvider[] = [
        {
          id: 'MCYBERSOURCE',
          default_display_type: 'hosted_field',
          settings: [{ locale: '*', status: 'published', settings: [] }],
        },
        {
          id: 'MHIPAY',
          default_display_type: 'redirect',
          settings: [{ locale: '*', status: 'archived', settings: [] }],
        },
      ];
      vi.spyOn(directusClient, 'getProviders').mockResolvedValue(providers);

      const result = await service.getPaymentProvidersConfig({ locale: 'fr-FR' });

      expect(Object.keys(result)).toEqual(['MCYBERSOURCE']);
      expect(result.MCYBERSOURCE).toEqual({ display_type: 'hosted_field', settings: {} });
      expect(result.MHIPAY).toBeUndefined();
      expect('is_active' in result.MCYBERSOURCE).toBe(false);
    });

    it('should resolve settings from the settings[] array (global + locale)', async () => {
      const providers: DirectusProvider[] = [
        {
          id: 'MHIPAY',
          default_display_type: 'hosted_field',
          settings: [
            {
              locale: '*',
              status: 'published',
              settings: [{ key: 'script_url', type: 'string', value: 'https://global/s.js' }],
            },
            {
              locale: 'fr-FR',
              status: 'published',
              settings: [{ key: 'username', type: 'string', value: 'user-fr' }],
            },
          ],
        },
      ];
      vi.spyOn(directusClient, 'getProviders').mockResolvedValue(providers);

      const result = await service.getPaymentProvidersConfig({ locale: 'fr-FR' });

      expect(result.MHIPAY.settings).toEqual({
        script_url: 'https://global/s.js',
        username: 'user-fr',
      });
    });
  });

  describe('isProviderActive (private method)', () => {
    let isProviderActive: (provider: DirectusProvider, locale: string) => boolean;

    beforeEach(() => {
      isProviderActive = getPrivateMethod(service, 'isProviderActive');
    });

    it('should return false when no settings', () => {
      const provider: DirectusProvider = {
        id: 'MHIPAY',
        default_display_type: 'hosted_field',
        settings: [],
      };
      expect(isProviderActive(provider, 'fr-FR')).toBe(false);
    });

    it('should return false when no status defined', () => {
      const provider: DirectusProvider = {
        id: 'MHIPAY',
        default_display_type: 'hosted_field',
        settings: [{ locale: '*', settings: [] }],
      };
      expect(isProviderActive(provider, 'fr-FR')).toBe(false);
    });

    it('should use locale-specific status over global', () => {
      const provider: DirectusProvider = {
        id: 'MCYBERSOURCE',
        default_display_type: 'hosted_field',
        settings: [
          { locale: '*', status: 'archived', settings: [] },
          { locale: 'en-US', status: 'published', settings: [] },
        ],
      };
      expect(isProviderActive(provider, 'en-US')).toBe(true);
      expect(isProviderActive(provider, 'fr-FR')).toBe(false);
    });

    it('should use global status when no locale match', () => {
      const provider: DirectusProvider = {
        id: 'EHIPAY',
        default_display_type: 'redirect',
        settings: [{ locale: '*', status: 'archived', settings: [] }],
      };
      expect(isProviderActive(provider, 'fr-FR')).toBe(false);
      expect(isProviderActive(provider, 'en-US')).toBe(false);
    });

    it('should handle archived locale override on published global', () => {
      const provider: DirectusProvider = {
        id: 'MHIPAYVW',
        default_display_type: 'redirect',
        settings: [
          { locale: '*', status: 'published', settings: [] },
          { locale: 'fr-CH', status: 'archived', settings: [] },
        ],
      };
      expect(isProviderActive(provider, 'fr-FR')).toBe(true);
      expect(isProviderActive(provider, 'fr-CH')).toBe(false);
      expect(isProviderActive(provider, 'en-US')).toBe(true);
    });

    it('should handle archived global with multiple published locales', () => {
      const provider: DirectusProvider = {
        id: 'EHIPAYBNPL',
        default_display_type: 'redirect',
        settings: [
          { locale: '*', status: 'archived', settings: [] },
          { locale: 'fr-FR', status: 'published', settings: [] },
          { locale: 'fr-BE', status: 'published', settings: [] },
          { locale: 'nl-BE', status: 'published', settings: [] },
        ],
      };
      expect(isProviderActive(provider, 'fr-FR')).toBe(true);
      expect(isProviderActive(provider, 'fr-BE')).toBe(true);
      expect(isProviderActive(provider, 'nl-BE')).toBe(true);
      expect(isProviderActive(provider, 'en-US')).toBe(false);
      expect(isProviderActive(provider, 'de-DE')).toBe(false);
    });
  });

  describe('buildProviderConfig (private method)', () => {
    let buildProviderConfig: (
      provider: DirectusProvider,
      locale: string,
    ) => Record<string, unknown>;

    beforeEach(() => {
      buildProviderConfig = getPrivateMethod(service, 'buildProviderConfig');
    });

    it('should convert the settings[] array to an object', () => {
      const provider: DirectusProvider = {
        id: 'MHIPAY',
        default_display_type: 'hosted_field',
        settings: [
          {
            locale: '*',
            status: 'published',
            settings: [{ key: 'script_url', type: 'string', value: 'https://example.com/s.js' }],
          },
        ],
      };
      expect(buildProviderConfig(provider, 'fr-FR')).toEqual({
        display_type: 'hosted_field',
        settings: {
          script_url: 'https://example.com/s.js',
        },
      });
    });

    it('should merge global and locale settings, locale taking precedence', () => {
      const provider: DirectusProvider = {
        id: 'MHIPAY',
        default_display_type: 'hosted_field',
        settings: [
          {
            locale: '*',
            status: 'published',
            settings: [
              { key: 'script_url', type: 'string', value: 'https://global/s.js' },
              { key: 'environment', type: 'string', value: 'stage' },
            ],
          },
          {
            locale: 'fr-FR',
            status: 'published',
            settings: [{ key: 'script_url', type: 'string', value: 'https://fr/s.js' }],
          },
        ],
      };
      expect(buildProviderConfig(provider, 'fr-FR')).toEqual({
        display_type: 'hosted_field',
        settings: {
          script_url: 'https://fr/s.js',
          environment: 'stage',
        },
      });
    });

    it('should not spread arbitrary top-level keys from the locale-settings object', () => {
      const provider = {
        id: 'MHIPAY',
        default_display_type: 'hosted_field',
        settings: [
          {
            locale: '*',
            status: 'published',
            sort: 1,
            user_created: 'someone',
            settings: [{ key: 'script_url', type: 'string', value: 'https://example.com/s.js' }],
          },
        ],
      } as unknown as DirectusProvider;

      const result = buildProviderConfig(provider, 'fr-FR');

      expect(result.display_type).toBe('hosted_field');
      expect(result.settings).toEqual({
        script_url: 'https://example.com/s.js',
      });
      expect(result.sort).toBe(1);
      expect(result.user_created).toBe('someone');
    });
  });
});
