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
    it('should throw when type is booking and customerId is missing', async () => {
      await expect(
        service.getPaymentProviders({
          type: 'booking',
          id: '456',
          locale: 'fr-FR',
          issuerType: OidcIssuerTypes.GM,
        }),
      ).rejects.toThrow('customer_id is required for booking type');
    });

    it('should keep only providers present in config and enrich them', async () => {
      setup(
        [
          {
            id: 'MCYBERSOURCE',
            label: 'Cybersource',
            category_payment_method: 'CreditCard',
            connection_type: 'E-commerce',
            required_delay_before_departure: 0,
            payment_methods: [],
          },
          {
            id: 'MHIPAY',
            label: 'HiPay',
            category_payment_method: 'CreditCard',
            connection_type: 'E-commerce',
            required_delay_before_departure: 0,
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
            required_delay_before_departure: 0,
            payment_methods: [
              {
                id: 'METHOD_1',
                label: 'Credit Card',
                time_payment_conditions: [
                  { payment_count: 12, required_delay_before_departure: 0 },
                  { payment_count: 3, required_delay_before_departure: 0 },
                  { payment_count: 6, required_delay_before_departure: 0 },
                ],
              },
              {
                id: 'METHOD_2',
                time_payment_conditions: [{ payment_count: 1, required_delay_before_departure: 0 }],
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
        { payment_count: 3, required_delay_before_departure: 0 },
        { payment_count: 6, required_delay_before_departure: 0 },
        { payment_count: 12, required_delay_before_departure: 0 },
      ]);
      // pas de label => clé = id
      expect(provider.payment_conditions.METHOD_2).toEqual([
        { payment_count: 1, required_delay_before_departure: 0 },
      ]);
      // payment_methods triés aussi
      expect(provider.payment_methods?.[0]?.time_payment_conditions).toEqual([
        { payment_count: 3, required_delay_before_departure: 0 },
        { payment_count: 6, required_delay_before_departure: 0 },
        { payment_count: 12, required_delay_before_departure: 0 },
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
            required_delay_before_departure: 0,
            payment_methods: [],
          },
          {
            id: 'MMANUAL',
            label: 'Manual Provider',
            category_payment_method: 'CreditCard',
            connection_type: 'Manual',
            required_delay_before_departure: 0,
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
            required_delay_before_departure: 0,
            payment_methods: [],
          },
          {
            id: 'MMANUAL',
            label: 'Manual Provider',
            category_payment_method: 'CreditCard',
            connection_type: 'Manual',
            required_delay_before_departure: 0,
            payment_methods: [{ id: 'WD', label: 'Wire transfers' }],
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
      expect(result.payment_providers.find((p: any) => p.id === 'WD')).toBeDefined();
    });

    it('should include Manual connection_type providers when issuerType is PARTNERS', async () => {
      setup(
        [
          {
            id: 'MMANUAL',
            label: 'Manual Provider',
            category_payment_method: 'CreditCard',
            connection_type: 'Manual',
            required_delay_before_departure: 0,
            payment_methods: [{ id: 'WD', label: 'Wire transfers' }],
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
      expect(result.payment_providers[0].id).toBe('WD');
    });

    it('should drop a Manual provider that has no payment_methods', async () => {
      setup(
        [
          {
            id: 'MMANUAL',
            label: 'Manual Provider',
            category_payment_method: 'CreditCard',
            connection_type: 'Manual',
            required_delay_before_departure: 0,
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
        issuerType: OidcIssuerTypes.GO,
      });

      expect(result.payment_providers).toHaveLength(0);
    });

    it('should flatten a Manual provider into one entry per payment_method', async () => {
      setup(
        [
          {
            id: 'MCYBERSOURCE',
            label: 'Cybersource',
            category_payment_method: 'CreditCard',
            connection_type: 'E-commerce',
            required_delay_before_departure: 0,
            payment_methods: [],
          },
          {
            id: 'MCLUBMED',
            label: 'CLUBMED',
            category_payment_method: 'BankTransfer',
            connection_type: 'Manual',
            required_delay_before_departure: 0,
            payment_methods: [
              { id: 'WD', label: 'Wire transfers' },
              { id: 'CH', label: 'Cheque' },
            ],
          },
        ],
        {
          MCYBERSOURCE: { display_type: 'hosted_field', settings: {} },
          MCLUBMED: { display_type: 'redirect', settings: {} },
        },
      );

      const result = await service.getPaymentProviders({
        type: 'proposal',
        id: '123',
        locale: 'fr-FR',
        issuerType: OidcIssuerTypes.GO,
      });

      const psp = result.payment_providers.find((p: any) => p.id === 'MCYBERSOURCE');
      expect(psp?.connection_type).toBe('E-commerce');

      const wd = result.payment_providers.find((p: any) => p.id === 'WD');
      const ch = result.payment_providers.find((p: any) => p.id === 'CH');
      expect(result.payment_providers.find((p: any) => p.id === 'MCLUBMED')).toBeUndefined();
      expect(wd).toMatchObject({
        id: 'WD',
        description: 'Wire transfers',
        connection_type: 'Manual',
        payment_methods: [],
        label: 'CLUBMED',
      });
      expect(ch).toMatchObject({
        id: 'CH',
        description: 'Cheque',
        connection_type: 'Manual',
        payment_methods: [],
      });
    });

    it('should keep all non-Manual connection_type providers for GM issuerType', async () => {
      setup(
        [
          {
            id: 'MECOMMERCE',
            label: 'E-commerce Provider',
            category_payment_method: 'CreditCard',
            connection_type: 'E-commerce',
            required_delay_before_departure: 0,
            payment_methods: [],
          },
          {
            id: 'MDIRECTLINK',
            label: 'Direct Link Provider',
            category_payment_method: 'CreditCard',
            connection_type: 'Direct-Link',
            required_delay_before_departure: 0,
            payment_methods: [],
          },
          {
            id: 'MMANUAL',
            label: 'Manual Provider',
            category_payment_method: 'CreditCard',
            connection_type: 'Manual',
            required_delay_before_departure: 0,
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
            required_delay_before_departure: 0,
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

  describe('required_delay_before_departure filtering', () => {
    const daysFromNow = (n: number) => {
      const d = new Date(Date.now() + n * 24 * 60 * 60 * 1000);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}${m}${day}`;
    };

    const mockStay = (arrivalDate: string) => {
      vi.spyOn(stayService, 'getStay').mockResolvedValue({ resortArrivalDate: arrivalDate } as any);
    };

    const call = () =>
      service.getPaymentProviders({
        type: 'booking',
        id: '123',
        customerId: '456',
        locale: 'fr-FR',
        issuerType: OidcIssuerTypes.GM,
      });

    it('should filter out the provider when departure is not beyond required_delay_before_departure', async () => {
      setup(
        [
          {
            id: 'MCYBERSOURCE',
            label: 'Cybersource',
            category_payment_method: 'CreditCard',
            connection_type: 'E-commerce',
            required_delay_before_departure: 30,
            payment_methods: [],
          },
        ],
        { MCYBERSOURCE: { display_type: 'hosted_field', settings: {} } },
      );
      mockStay(daysFromNow(10));

      const result = await call();

      expect(result.payment_providers).toHaveLength(0);
    });

    it('should keep the provider when departure is strictly beyond required_delay_before_departure', async () => {
      setup(
        [
          {
            id: 'MCYBERSOURCE',
            label: 'Cybersource',
            category_payment_method: 'CreditCard',
            connection_type: 'E-commerce',
            required_delay_before_departure: 30,
            payment_methods: [],
          },
        ],
        { MCYBERSOURCE: { display_type: 'hosted_field', settings: {} } },
      );
      mockStay(daysFromNow(40));

      const result = await call();

      expect(result.payment_providers).toHaveLength(1);
    });

    it('should drop time_payment_conditions not beyond required_delay_before_departure', async () => {
      setup(
        [
          {
            id: 'MCYBERSOURCE',
            label: 'Cybersource',
            category_payment_method: 'CreditCard',
            connection_type: 'E-commerce',
            required_delay_before_departure: 0,
            payment_methods: [
              {
                id: 'METHOD_1',
                label: 'Credit Card',
                time_payment_conditions: [
                  { payment_count: 1, required_delay_before_departure: 0 },
                  { payment_count: 3, required_delay_before_departure: 60 },
                ],
              },
            ],
          },
        ],
        { MCYBERSOURCE: { display_type: 'hosted_field', settings: {} } },
      );
      mockStay(daysFromNow(20));

      const result = await call();

      expect(result.payment_providers[0].payment_conditions['Credit Card']).toEqual([
        { payment_count: 1, required_delay_before_departure: 0 },
      ]);
    });

    it('should drop a payment_method when all its time_payment_conditions are filtered out', async () => {
      setup(
        [
          {
            id: 'MCYBERSOURCE',
            label: 'Cybersource',
            category_payment_method: 'CreditCard',
            connection_type: 'E-commerce',
            required_delay_before_departure: 0,
            payment_methods: [
              {
                id: 'METHOD_1',
                label: 'Credit Card',
                time_payment_conditions: [
                  { payment_count: 3, required_delay_before_departure: 60 },
                ],
              },
              {
                id: 'METHOD_2',
                label: 'Full',
                time_payment_conditions: [{ payment_count: 1, required_delay_before_departure: 0 }],
              },
            ],
          },
        ],
        { MCYBERSOURCE: { display_type: 'hosted_field', settings: {} } },
      );
      mockStay(daysFromNow(20));

      const result = await call();

      const provider = result.payment_providers[0];
      expect(provider.payment_methods?.map((m: any) => m.id)).toEqual(['METHOD_2']);
    });

    it('should keep a payment_method that has no time_payment_conditions', async () => {
      setup(
        [
          {
            id: 'MCYBERSOURCE',
            label: 'Cybersource',
            category_payment_method: 'CreditCard',
            connection_type: 'E-commerce',
            required_delay_before_departure: 0,
            payment_methods: [{ id: 'METHOD_1', label: 'Credit Card' }],
          },
        ],
        { MCYBERSOURCE: { display_type: 'hosted_field', settings: {} } },
      );
      mockStay(daysFromNow(20));

      const result = await call();

      const provider = result.payment_providers[0];
      expect(provider.payment_methods?.map((m: any) => m.id)).toEqual(['METHOD_1']);
    });

    it('should not filter anything when there is no stay to derive the departure date', async () => {
      setup(
        [
          {
            id: 'MCYBERSOURCE',
            label: 'Cybersource',
            category_payment_method: 'CreditCard',
            connection_type: 'E-commerce',
            required_delay_before_departure: 30,
            payment_methods: [],
          },
        ],
        { MCYBERSOURCE: { display_type: 'hosted_field', settings: {} } },
      );
      vi.spyOn(stayService, 'getStay').mockResolvedValue({ resortArrivalDate: null } as any);

      const result = await call();

      expect(result.payment_providers).toHaveLength(1);
    });
  });

  describe('blocked_user_agent_pattern filtering', () => {
    const MOBILE_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15';
    const MICROMESSENGER_UA = `${MOBILE_UA} MicroMessenger/8.0`;

    const setupSingle = (settings: Record<string, unknown>) => {
      setup(
        [
          {
            id: 'M99BILLW',
            label: 'WeChat',
            category_payment_method: 'CreditCard',
            connection_type: 'E-commerce',
            required_delay_before_departure: 0,
            payment_methods: [],
          },
        ],
        {
          M99BILLW: { display_type: 'custom', settings },
        },
      );
    };

    it('should filter out provider when the user agent matches blocked_user_agent_pattern', async () => {
      setupSingle({ blocked_user_agent_pattern: 'MicroMessenger' });

      const result = await service.getPaymentProviders({
        type: 'proposal',
        id: '123',
        locale: 'zh-CN',
        issuerType: OidcIssuerTypes.GM,
        userAgent: MICROMESSENGER_UA,
      });

      expect(result.payment_providers).toHaveLength(0);
    });

    it('should keep provider when the user agent does not match the pattern', async () => {
      setupSingle({ blocked_user_agent_pattern: 'MicroMessenger' });

      const result = await service.getPaymentProviders({
        type: 'proposal',
        id: '123',
        locale: 'zh-CN',
        issuerType: OidcIssuerTypes.GM,
        userAgent: MOBILE_UA,
      });

      expect(result.payment_providers).toHaveLength(1);
    });

    it('should keep provider when no pattern is configured', async () => {
      setupSingle({});

      const result = await service.getPaymentProviders({
        type: 'proposal',
        id: '123',
        locale: 'zh-CN',
        issuerType: OidcIssuerTypes.GM,
        userAgent: MICROMESSENGER_UA,
      });

      expect(result.payment_providers).toHaveLength(1);
    });

    it('should keep provider with a configured pattern when no user agent is provided', async () => {
      setupSingle({ blocked_user_agent_pattern: 'MicroMessenger' });

      const result = await service.getPaymentProviders({
        type: 'proposal',
        id: '123',
        locale: 'zh-CN',
        issuerType: OidcIssuerTypes.GM,
      });

      expect(result.payment_providers).toHaveLength(1);
    });
  });
});
