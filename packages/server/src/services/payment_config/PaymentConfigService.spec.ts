import { PlatformTest } from '@tsed/platform-http/testing';

import { PaymentConfigRepository } from './PaymentConfigRepository.js';
import { PaymentConfigService } from './PaymentConfigService.js';
import { OidcIssuerTypes } from './types.js';

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
      ] as never;
      vi.spyOn(paymentConfigRepository, 'getConfigurations').mockResolvedValue(configurations);

      const result = await service.getPaymentConfig({
        locale: 'fr-FR',
        issuerType: OidcIssuerTypes.GM,
      });

      expect(result.feature_flips).toEqual({ is_paypal_button_enabled: true });
      expect(result.settings).toEqual({ days_before_trip_to_allow_free_deposit: 90 });
    });

    it('should return default config values when called without locale or issuer', async () => {
      const configurations = [
        {
          key: 'days_before_trip_to_allow_free_deposit',
          type: 'number',
          value: 90,
          overrides: [{ locale: 'en-US', issuer: 'GM', value: 30 }],
        },
      ] as never;
      vi.spyOn(paymentConfigRepository, 'getConfigurations').mockResolvedValue(configurations);

      const result = await service.getPaymentConfig();

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
      ] as never;
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
    it('returns all providers and exposes allowed_actions from the resolved variant', async () => {
      const providers = [
        {
          id: 'MCYBERSOURCE',
          default_display_type: 'hosted_field',
          variants: [
            { locale: null, allowed_actions: ['PAYMENT_RESA'], settings: [], validation: {} },
          ],
        },
        {
          id: 'MHIPAY',
          default_display_type: 'redirect',
          variants: [{ locale: null, allowed_actions: [], settings: [], validation: {} }],
        },
      ] as never;
      vi.spyOn(paymentConfigRepository, 'getProviders').mockResolvedValue(providers);

      const result = await service.getPaymentProvidersConfig({ locale: 'fr-FR' });

      expect(Object.keys(result)).toEqual(['MCYBERSOURCE', 'MHIPAY']);
      expect(result.MCYBERSOURCE.allowed_actions).toEqual(['PAYMENT_RESA']);
      expect(result.MHIPAY.allowed_actions).toEqual([]);
      expect('is_active' in result.MCYBERSOURCE).toBe(false);
    });

    it('resolves the locale-specific variant settings over the global one', async () => {
      const providers = [
        {
          id: 'MHIPAY',
          default_display_type: 'hosted_field',
          variants: [
            {
              locale: null,
              allowed_actions: ['PAYMENT_RESA'],
              settings: [{ key: 'script_url', value: 'https://global/s.js' }],
              validation: {},
            },
            {
              locale: 'fr-FR',
              allowed_actions: ['PAYMENT_RESA', 'PAYMENT_SOLDE'],
              settings: [{ key: 'username', value: 'user-fr' }],
              validation: {},
            },
          ],
        },
      ] as never;
      vi.spyOn(paymentConfigRepository, 'getProviders').mockResolvedValue(providers);

      const result = await service.getPaymentProvidersConfig({ locale: 'fr-FR' });

      expect(result.MHIPAY.settings).toEqual({
        script_url: 'https://global/s.js',
        username: 'user-fr',
      });
      expect(result.MHIPAY.allowed_actions).toEqual(['PAYMENT_RESA', 'PAYMENT_SOLDE']);
    });

    it('falls back to the global variant when no locale-specific variant exists', async () => {
      const providers = [
        {
          id: 'MHIPAY',
          default_display_type: 'hosted_field',
          variants: [
            {
              locale: null,
              allowed_actions: ['PAYMENT_RESA'],
              settings: [{ key: 'script_url', value: 'https://global/s.js' }],
              validation: {},
            },
          ],
        },
      ] as never;
      vi.spyOn(paymentConfigRepository, 'getProviders').mockResolvedValue(providers);

      const result = await service.getPaymentProvidersConfig({ locale: 'fr-FR' });

      expect(result.MHIPAY.settings).toEqual({ script_url: 'https://global/s.js' });
      expect(result.MHIPAY.allowed_actions).toEqual(['PAYMENT_RESA']);
    });

    it('returns empty allowed_actions when no variant matches the locale', async () => {
      const providers = [
        {
          id: 'MHIPAY',
          default_display_type: 'hosted_field',
          variants: [
            {
              locale: 'en-US',
              allowed_actions: ['PAYMENT_RESA'],
              settings: [],
              validation: {},
            },
          ],
        },
      ] as never;
      vi.spyOn(paymentConfigRepository, 'getProviders').mockResolvedValue(providers);

      const result = await service.getPaymentProvidersConfig({ locale: 'fr-FR' });

      expect(result.MHIPAY.allowed_actions).toEqual([]);
    });
  });

  describe('getPaymentProvidersConfig - provider configuration', () => {
    const buildConfig = async (provider: unknown, locale: string, issuerType?: OidcIssuerTypes) => {
      vi.spyOn(paymentConfigRepository, 'getProviders').mockResolvedValue([provider] as never);
      const result = await service.getPaymentProvidersConfig({ locale, issuerType });
      return result[(provider as { id: string }).id];
    };

    it('converts the settings array to an object', async () => {
      const config = await buildConfig(
        {
          id: 'MHIPAY',
          default_display_type: 'hosted_field',
          variants: [
            {
              locale: null,
              allowed_actions: ['PAYMENT_RESA'],
              settings: [{ key: 'script_url', value: 'https://example.com/s.js' }],
              validation: {},
            },
          ],
        },
        'fr-FR',
      );

      expect(config).toEqual({
        display_type: 'hosted_field',
        confirmation_strategy: 'status',
        requires_contact_choice: false,
        allowed_actions: ['PAYMENT_RESA'],
        settings: { script_url: 'https://example.com/s.js' },
      });
    });

    it('defaults confirmation_strategy to status when the provider has none', async () => {
      const config = await buildConfig(
        {
          id: 'MHIPAY',
          default_display_type: 'redirect',
          variants: [
            { locale: null, allowed_actions: ['PAYMENT_RESA'], settings: [], validation: {} },
          ],
        },
        'fr-FR',
      );

      expect(config.confirmation_strategy).toBe('status');
    });

    it('exposes confirmation_strategy from the provider', async () => {
      const config = await buildConfig(
        {
          id: 'MHIPAY',
          default_display_type: 'redirect',
          confirmation_strategy: 'notify',
          variants: [
            { locale: null, allowed_actions: ['PAYMENT_RESA'], settings: [], validation: {} },
          ],
        },
        'fr-FR',
      );

      expect(config.confirmation_strategy).toBe('notify');
    });

    it('exposes validation fields from variants', async () => {
      const config = await buildConfig(
        {
          id: 'MHIPAY',
          default_display_type: 'hosted_field',
          variants: [
            {
              locale: null,
              allowed_actions: ['PAYMENT_RESA'],
              settings: [{ key: 'script_url', value: 'https://example.com/s.js' }],
              validation: { requires_token: true },
            },
          ],
        },
        'fr-FR',
      );

      expect(config.display_type).toBe('hosted_field');
      expect(config.settings).toEqual({ script_url: 'https://example.com/s.js' });
      expect(config.requires_token).toBe(true);
    });

    it('resolves requires_contact_choice to true when the issuer is in the configured list', async () => {
      const provider = {
        id: 'EVOXPAY',
        default_display_type: 'redirect',
        variants: [
          {
            locale: null,
            allowed_actions: ['PAYMENT_RESA'],
            settings: [],
            validation: { requires_contact_choice: ['GO', 'PARTNERS'] },
          },
        ],
      };

      expect(
        (await buildConfig(provider, 'fr-FR', OidcIssuerTypes.GO)).requires_contact_choice,
      ).toBe(true);
      expect(
        (await buildConfig(provider, 'fr-FR', OidcIssuerTypes.PARTNERS)).requires_contact_choice,
      ).toBe(true);
    });

    it('resolves requires_contact_choice to false when the issuer is not listed or absent', async () => {
      const provider = {
        id: 'EVOXPAY',
        default_display_type: 'redirect',
        variants: [
          {
            locale: null,
            allowed_actions: ['PAYMENT_RESA'],
            settings: [],
            validation: { requires_contact_choice: ['GO', 'PARTNERS'] },
          },
        ],
      };

      expect(
        (await buildConfig(provider, 'fr-FR', OidcIssuerTypes.GM)).requires_contact_choice,
      ).toBe(false);
      expect((await buildConfig(provider, 'fr-FR')).requires_contact_choice).toBe(false);
    });

    it('resolves requires_contact_choice to false when no list is configured', async () => {
      const provider = {
        id: 'EVOXPAY',
        default_display_type: 'redirect',
        variants: [
          { locale: null, allowed_actions: ['PAYMENT_RESA'], settings: [], validation: {} },
        ],
      };

      expect(
        (await buildConfig(provider, 'fr-FR', OidcIssuerTypes.GO)).requires_contact_choice,
      ).toBe(false);
    });
  });
});
