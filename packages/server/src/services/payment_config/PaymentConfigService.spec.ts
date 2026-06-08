import { PlatformTest } from '@tsed/platform-http/testing';

import type { ConfigurationModel, ProviderModel, ProviderVariantModel } from './models.js';
import { PaymentConfigRepository } from './PaymentConfigRepository.js';
import { PaymentConfigService } from './PaymentConfigService.js';
import { OidcIssuerTypes } from './types.js';

function getPrivateMethod<T>(service: PaymentConfigService, methodName: string): T {
  return (service as any)[methodName].bind(service) as T;
}

describe('PaymentConfigService', () => {
  let service: PaymentConfigService;
  let paymentConfigRepository: PaymentConfigRepository;

  beforeEach(async () => {
    await PlatformTest.create({
      DIRECTUS_URL: 'http://localhost',
      DIRECTUS_API_TOKEN: 'test-token',
    });

    service = await PlatformTest.invoke<PaymentConfigService>(PaymentConfigService);
    paymentConfigRepository =
      await PlatformTest.get<PaymentConfigRepository>(PaymentConfigRepository);
  });

  afterEach(() => PlatformTest.reset());

  describe('getPaymentConfig', () => {
    it('should split boolean configs into feature_flips and the rest into settings', async () => {
      const configurations = [
        { key: 'is_paypal_button_enabled', type: 'boolean', value: true, overrides: [] },
        {
          key: 'days_before_trip_to_allow_free_deposit',
          type: 'number',
          value: 90,
          overrides: [],
        },
      ] as ConfigurationModel[];
      vi.spyOn(paymentConfigRepository, 'getConfigurations').mockResolvedValue(configurations);

      const result = await service.getPaymentConfig({
        locale: 'fr-FR',
        issuerType: OidcIssuerTypes.GM,
      });

      expect(result.feature_flips).toEqual({ is_paypal_button_enabled: true });
      expect(result.settings).toEqual({ days_before_trip_to_allow_free_deposit: 90 });
    });

    it('should resolve override values by locale and issuer', async () => {
      const configurations = [
        {
          key: 'days_before_trip_to_allow_free_deposit',
          type: 'number',
          value: 90,
          overrides: [{ locale: 'en-US', issuer: 'GM', value: 30 }],
        },
      ] as ConfigurationModel[];
      vi.spyOn(paymentConfigRepository, 'getConfigurations').mockResolvedValue(configurations);

      const result = await service.getPaymentConfig({
        locale: 'en-US',
        issuerType: OidcIssuerTypes.GM,
      });

      expect(
        (result.settings as Record<string, unknown>).days_before_trip_to_allow_free_deposit,
      ).toBe(30);
    });
  });

  describe('getPaymentProvidersConfig', () => {
    it('should exclude inactive providers and never expose is_active', async () => {
      const providers = [
        {
          id: 'MCYBERSOURCE',
          default_display_type: 'hosted_field',
          variants: [{ locale: null, active: true, settings: [], validation: {} }],
        },
        {
          id: 'MHIPAY',
          default_display_type: 'redirect',
          variants: [{ locale: null, active: false, settings: [], validation: {} }],
        },
      ] as ProviderModel[];
      vi.spyOn(paymentConfigRepository, 'getProviders').mockResolvedValue(providers);

      const result = await service.getPaymentProvidersConfig({ locale: 'fr-FR' });

      expect(Object.keys(result)).toEqual(['MCYBERSOURCE']);
      expect(result.MCYBERSOURCE).toEqual({
        display_type: 'hosted_field',
        confirmation_strategy: 'status',
        settings: {},
      });
      expect(result.MHIPAY).toBeUndefined();
      expect('is_active' in result.MCYBERSOURCE).toBe(false);
    });

    it('should resolve settings from the variants array (global + locale)', async () => {
      const providers = [
        {
          id: 'MHIPAY',
          default_display_type: 'hosted_field',
          variants: [
            {
              locale: null,
              active: true,
              settings: [{ key: 'script_url', value: 'https://global/s.js' }],
              validation: {},
            },
            {
              locale: 'fr-FR',
              active: true,
              settings: [{ key: 'username', value: 'user-fr' }],
              validation: {},
            },
          ],
        },
      ] as ProviderModel[];
      vi.spyOn(paymentConfigRepository, 'getProviders').mockResolvedValue(providers);

      const result = await service.getPaymentProvidersConfig({ locale: 'fr-FR' });

      expect(result.MHIPAY.settings).toEqual({
        script_url: 'https://global/s.js',
        username: 'user-fr',
      });
    });
  });

  describe('isProviderActive (private method)', () => {
    let isProviderActive: (provider: ProviderModel, locale: string) => boolean;

    beforeEach(() => {
      isProviderActive = getPrivateMethod(service, 'isProviderActive');
    });

    const provider = (variants: ProviderVariantModel[]): ProviderModel => ({
      id: 'MHIPAY',
      default_display_type: 'hosted_field',
      variants,
    });

    it('should return false when no variants', () => {
      expect(isProviderActive(provider([]), 'fr-FR')).toBe(false);
    });

    it('should return false when no matching active variant', () => {
      expect(
        isProviderActive(
          provider([{ locale: null, active: false, settings: [], validation: {} }]),
          'fr-FR',
        ),
      ).toBe(false);
    });

    it('should use locale-specific variant over global', () => {
      expect(
        isProviderActive(
          provider([
            { locale: null, active: false, settings: [], validation: {} },
            { locale: 'en-US', active: true, settings: [], validation: {} },
          ]),
          'en-US',
        ),
      ).toBe(true);
      expect(
        isProviderActive(
          provider([
            { locale: null, active: false, settings: [], validation: {} },
            { locale: 'en-US', active: true, settings: [], validation: {} },
          ]),
          'fr-FR',
        ),
      ).toBe(false);
    });

    it('should use global variant when no locale match', () => {
      const p = provider([{ locale: null, active: false, settings: [], validation: {} }]);
      expect(isProviderActive(p, 'fr-FR')).toBe(false);
      expect(isProviderActive(p, 'en-US')).toBe(false);
    });

    it('should handle inactive locale override on active global', () => {
      const p = provider([
        { locale: null, active: true, settings: [], validation: {} },
        { locale: 'fr-CH', active: false, settings: [], validation: {} },
      ]);
      expect(isProviderActive(p, 'fr-FR')).toBe(true);
      expect(isProviderActive(p, 'fr-CH')).toBe(false);
      expect(isProviderActive(p, 'en-US')).toBe(true);
    });

    it('should handle inactive global with multiple active locales', () => {
      const p = provider([
        { locale: null, active: false, settings: [], validation: {} },
        { locale: 'fr-FR', active: true, settings: [], validation: {} },
        { locale: 'fr-BE', active: true, settings: [], validation: {} },
        { locale: 'nl-BE', active: true, settings: [], validation: {} },
      ]);
      expect(isProviderActive(p, 'fr-FR')).toBe(true);
      expect(isProviderActive(p, 'fr-BE')).toBe(true);
      expect(isProviderActive(p, 'nl-BE')).toBe(true);
      expect(isProviderActive(p, 'en-US')).toBe(false);
      expect(isProviderActive(p, 'de-DE')).toBe(false);
    });
  });

  describe('buildProviderConfig (private method)', () => {
    let buildProviderConfig: (provider: ProviderModel, locale: string) => Record<string, unknown>;

    beforeEach(() => {
      buildProviderConfig = getPrivateMethod(service, 'buildProviderConfig');
    });

    it('should convert the settings array to an object', () => {
      const provider: ProviderModel = {
        id: 'MHIPAY',
        default_display_type: 'hosted_field',
        variants: [
          {
            locale: null,
            active: true,
            settings: [{ key: 'script_url', value: 'https://example.com/s.js' }],
            validation: {},
          },
        ],
      };
      expect(buildProviderConfig(provider, 'fr-FR')).toEqual({
        display_type: 'hosted_field',
        confirmation_strategy: 'status',
        settings: {
          script_url: 'https://example.com/s.js',
        },
      });
    });

    it('should merge global and locale settings, locale taking precedence', () => {
      const provider: ProviderModel = {
        id: 'MHIPAY',
        default_display_type: 'hosted_field',
        variants: [
          {
            locale: null,
            active: true,
            settings: [
              { key: 'script_url', value: 'https://global/s.js' },
              { key: 'environment', value: 'stage' },
            ],
            validation: {},
          },
          {
            locale: 'fr-FR',
            active: true,
            settings: [{ key: 'script_url', value: 'https://fr/s.js' }],
            validation: {},
          },
        ],
      };
      expect(buildProviderConfig(provider, 'fr-FR')).toEqual({
        display_type: 'hosted_field',
        confirmation_strategy: 'status',
        settings: {
          script_url: 'https://fr/s.js',
          environment: 'stage',
        },
      });
    });

    it('should default confirmation_strategy to status when provider has none', () => {
      const provider: ProviderModel = {
        id: 'MHIPAY',
        default_display_type: 'redirect',
        variants: [{ locale: null, active: true, settings: [], validation: {} }],
      };

      expect(buildProviderConfig(provider, 'fr-FR').confirmation_strategy).toBe('status');
    });

    it('should expose confirmation_strategy from the provider', () => {
      const provider: ProviderModel = {
        id: 'MHIPAY',
        default_display_type: 'redirect',
        confirmation_strategy: 'notify',
        variants: [{ locale: null, active: true, settings: [], validation: {} }],
      };

      expect(buildProviderConfig(provider, 'fr-FR').confirmation_strategy).toBe('notify');
    });

    it('should expose validation fields from variants', () => {
      const provider: ProviderModel = {
        id: 'MHIPAY',
        default_display_type: 'hosted_field',
        variants: [
          {
            locale: null,
            active: true,
            settings: [{ key: 'script_url', value: 'https://example.com/s.js' }],
            validation: { requires_token: true },
          },
        ],
      };

      const result = buildProviderConfig(provider, 'fr-FR');

      expect(result.display_type).toBe('hosted_field');
      expect(result.settings).toEqual({ script_url: 'https://example.com/s.js' });
      expect(result.requires_token).toBe(true);
    });
  });
});
