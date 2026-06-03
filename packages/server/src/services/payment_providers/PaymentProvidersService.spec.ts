import { PlatformTest } from '@tsed/platform-http/testing';

import * as generatedApi from '../../infra/api/__generated__/index.js';
import { PaymentConfigService } from '../payment_config/PaymentConfigService.js';
import { OidcIssuerTypes } from '../payment_config/types.js';
import { StayService } from '../stay/StayService.js';
import { PaymentProvidersService } from './PaymentProvidersService.js';

describe('PaymentProvidersService', () => {
  let service: PaymentProvidersService;
  let paymentConfigService: PaymentConfigService;
  let stayService: StayService;

  beforeEach(async () => {
    await PlatformTest.create({
      DIRECTUS_URL: 'http://localhost',
      DIRECTUS_API_TOKEN: 'test-token',
    });

    service = await PlatformTest.invoke<PaymentProvidersService>(PaymentProvidersService);
    paymentConfigService = await PlatformTest.get<PaymentConfigService>(PaymentConfigService);
    stayService = await PlatformTest.get<StayService>(StayService);
  });

  afterEach(() => PlatformTest.reset());

  const setup = (providers: unknown[], config: Record<string, unknown>) => {
    vi.spyOn(generatedApi, 'getV1PaymentProviders').mockResolvedValue(providers as any);
    vi.spyOn(paymentConfigService, 'getPaymentProvidersConfig').mockResolvedValue(config as any);
  };

  describe('getPaymentProviders', () => {
    it('should keep only providers present in config and enrich them', async () => {
      setup(
        [
          {
            id: 'MCYBERSOURCE',
            label: 'Cybersource',
            category_payment_method: 'CreditCard',
            connection_type: 'E-commerce',
            payment_methods: [],
          },
          {
            id: 'MHIPAY',
            label: 'HiPay',
            category_payment_method: 'CreditCard',
            connection_type: 'E-commerce',
            payment_methods: [],
          },
        ],
        {
          // MHIPAY absent from config => inactive => filtered out
          MCYBERSOURCE: { display_type: 'hosted_field', settings: {} },
        },
      );

      const result = await service.getPaymentProviders({
        type: 'proposal',
        id: '123',
        locale: 'fr-FR',
        issuerType: OidcIssuerTypes.GM,
      });

      expect(result.payment_providers).toHaveLength(1);
      expect(result.payment_providers[0].id).toBe('MCYBERSOURCE');
      expect(result.payment_providers[0].configuration).toEqual({
        display_type: 'hosted_field',
        settings: {},
      });
      expect(result.buy_now_pay_later_providers).toHaveLength(0);
      expect(result.payment_providers.find((p: any) => p.id === 'MHIPAY')).toBeUndefined();
    });

    it('should derive payment_conditions keyed by label/id and sorted by payment_count', async () => {
      setup(
        [
          {
            id: 'MCYBERSOURCE',
            label: 'Cybersource',
            category_payment_method: 'CreditCard',
            connection_type: 'E-commerce',
            payment_methods: [
              {
                id: 'METHOD_1',
                label: 'Credit Card',
                time_payment_conditions: [
                  { payment_count: 12 },
                  { payment_count: 3 },
                  { payment_count: 6 },
                ],
              },
              {
                id: 'METHOD_2',
                time_payment_conditions: [{ payment_count: 1 }],
              },
            ],
          },
        ],
        {
          MCYBERSOURCE: { display_type: 'hosted_field', settings: {} },
        },
      );

      const result = await service.getPaymentProviders({
        type: 'proposal',
        id: '123',
        locale: 'fr-FR',
        issuerType: OidcIssuerTypes.GM,
      });

      const provider = result.payment_providers[0];
      expect(provider.payment_conditions['Credit Card']).toEqual([
        { payment_count: 3 },
        { payment_count: 6 },
        { payment_count: 12 },
      ]);
      // pas de label => clé = id
      expect(provider.payment_conditions.METHOD_2).toEqual([{ payment_count: 1 }]);
      // payment_methods triés aussi
      expect(provider.payment_methods?.[0]?.time_payment_conditions).toEqual([
        { payment_count: 3 },
        { payment_count: 6 },
        { payment_count: 12 },
      ]);
    });

    it('should filter out Manual connection_type providers when issuerType is GM', async () => {
      setup(
        [
          {
            id: 'MCYBERSOURCE',
            label: 'Cybersource',
            category_payment_method: 'CreditCard',
            connection_type: 'E-commerce',
            payment_methods: [],
          },
          {
            id: 'MMANUAL',
            label: 'Manual Provider',
            category_payment_method: 'CreditCard',
            connection_type: 'Manual',
            payment_methods: [],
          },
        ],
        {
          MCYBERSOURCE: { display_type: 'hosted_field', settings: {} },
          MMANUAL: { display_type: 'hosted_field', settings: {} },
        },
      );

      const result = await service.getPaymentProviders({
        type: 'proposal',
        id: '123',
        locale: 'fr-FR',
        issuerType: OidcIssuerTypes.GM,
      });

      expect(result.payment_providers).toHaveLength(1);
      expect(result.payment_providers[0].id).toBe('MCYBERSOURCE');
      expect(result.payment_providers.find((p: any) => p.id === 'MMANUAL')).toBeUndefined();
    });

    it('should include Manual connection_type providers when issuerType is GO', async () => {
      setup(
        [
          {
            id: 'MCYBERSOURCE',
            label: 'Cybersource',
            category_payment_method: 'CreditCard',
            connection_type: 'E-commerce',
            payment_methods: [],
          },
          {
            id: 'MMANUAL',
            label: 'Manual Provider',
            category_payment_method: 'CreditCard',
            connection_type: 'Manual',
            payment_methods: [],
          },
        ],
        {
          MCYBERSOURCE: { display_type: 'hosted_field', settings: {} },
          MMANUAL: { display_type: 'hosted_field', settings: {} },
        },
      );

      const result = await service.getPaymentProviders({
        type: 'proposal',
        id: '123',
        locale: 'fr-FR',
        issuerType: OidcIssuerTypes.GO,
      });

      expect(result.payment_providers).toHaveLength(2);
      expect(result.payment_providers.find((p: any) => p.id === 'MMANUAL')).toBeDefined();
    });

    it('should include Manual connection_type providers when issuerType is PARTNERS', async () => {
      setup(
        [
          {
            id: 'MMANUAL',
            label: 'Manual Provider',
            category_payment_method: 'CreditCard',
            connection_type: 'Manual',
            payment_methods: [],
          },
        ],
        {
          MMANUAL: { display_type: 'hosted_field', settings: {} },
        },
      );

      const result = await service.getPaymentProviders({
        type: 'proposal',
        id: '123',
        locale: 'fr-FR',
        issuerType: OidcIssuerTypes.PARTNERS,
      });

      expect(result.payment_providers).toHaveLength(1);
      expect(result.payment_providers[0].id).toBe('MMANUAL');
    });

    it('should keep all non-Manual connection_type providers for GM issuerType', async () => {
      setup(
        [
          {
            id: 'MECOMMERCE',
            label: 'E-commerce Provider',
            category_payment_method: 'CreditCard',
            connection_type: 'E-commerce',
            payment_methods: [],
          },
          {
            id: 'MDIRECTLINK',
            label: 'Direct Link Provider',
            category_payment_method: 'CreditCard',
            connection_type: 'Direct-Link',
            payment_methods: [],
          },
          {
            id: 'MMANUAL',
            label: 'Manual Provider',
            category_payment_method: 'CreditCard',
            connection_type: 'Manual',
            payment_methods: [],
          },
        ],
        {
          MECOMMERCE: { display_type: 'hosted_field', settings: {} },
          MDIRECTLINK: { display_type: 'hosted_field', settings: {} },
          MMANUAL: { display_type: 'hosted_field', settings: {} },
        },
      );

      const result = await service.getPaymentProviders({
        type: 'proposal',
        id: '123',
        locale: 'fr-FR',
        issuerType: OidcIssuerTypes.GM,
      });

      expect(result.payment_providers).toHaveLength(2);
      expect(result.payment_providers.map((p: any) => p.id)).toEqual(['MECOMMERCE', 'MDIRECTLINK']);
    });
  });

  describe('min_days_before_departure filtering', () => {
    const daysFromNow = (n: number) => {
      const d = new Date(Date.now() + n * 24 * 60 * 60 * 1000);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}${m}${day}`;
    };

    const setupWithMinDays = (arrivalDate: string) => {
      setup(
        [
          {
            id: 'MCYBERSOURCE',
            label: 'Cybersource',
            category_payment_method: 'CreditCard',
            connection_type: 'E-commerce',
            payment_methods: [],
          },
        ],
        {
          MCYBERSOURCE: {
            display_type: 'hosted_field',
            settings: { min_days_before_departure: '45' },
          },
        },
      );
      vi.spyOn(stayService, 'getStay').mockResolvedValue({ resortArrivalDate: arrivalDate } as any);
    };

    it('should keep the provider when departure is within min_days_before_departure', async () => {
      setupWithMinDays(daysFromNow(10));

      const result = await service.getPaymentProviders({
        type: 'booking',
        id: '123',
        customerId: '456',
        locale: 'fr-FR',
        issuerType: OidcIssuerTypes.GM,
      });

      expect(result.payment_providers).toHaveLength(1);
      expect(stayService.getStay).toHaveBeenCalled();
    });

    it('should filter out the provider when departure is beyond min_days_before_departure', async () => {
      setupWithMinDays(daysFromNow(100));

      const result = await service.getPaymentProviders({
        type: 'booking',
        id: '123',
        customerId: '456',
        locale: 'fr-FR',
        issuerType: OidcIssuerTypes.GM,
      });

      expect(result.payment_providers).toHaveLength(0);
    });
  });
});
