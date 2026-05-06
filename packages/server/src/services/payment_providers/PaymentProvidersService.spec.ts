import { PlatformTest } from '@tsed/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as generatedApi from '../../infra/api/__generated__/index.js';
import { OidcIssuerTypes } from '../../models/payment_config/OidcIssuerTypes.js';
import { PaymentConfigService } from '../payment_config/PaymentConfigService.js';
import { PaymentProvidersService } from './PaymentProvidersService.js';

describe('PaymentProvidersService', () => {
  let service: PaymentProvidersService;
  let paymentConfigService: PaymentConfigService;

  beforeEach(async () => {
    await PlatformTest.create();

    service = await PlatformTest.invoke<PaymentProvidersService>(PaymentProvidersService);
    paymentConfigService = await PlatformTest.get<PaymentConfigService>(PaymentConfigService);
  });

  afterEach(() => PlatformTest.reset());

  describe('getPaymentProviders', () => {
    const mockProvidersConfig = {
      MCYBERSOURCE: {
        is_active: true,
        display_type: 'hosted_field',
        settings: {},
      },
      MHIPAY: {
        is_active: false,
        display_type: 'hosted_field',
        settings: {},
      },
    };

    const mockProviders = [
      {
        id: 'MCYBERSOURCE',
        label: 'Cybersource',
        category_payment_method: 'CreditCard',
        payment_methods: [],
      },
      {
        id: 'MHIPAY',
        label: 'HiPay',
        category_payment_method: 'CreditCard',
        payment_methods: [],
      },
    ];

    beforeEach(() => {
      vi.spyOn(paymentConfigService, 'getPaymentProvidersConfig').mockResolvedValue(
        mockProvidersConfig as any,
      );
      vi.spyOn(generatedApi, 'getV1PaymentProviders').mockResolvedValue(mockProviders as any);
    });

    it('should fetch and filter payment providers', async () => {
      const result = await service.getPaymentProviders({
        type: 'proposal',
        id: '123',
        locale: 'fr-FR',
        issuerType: OidcIssuerTypes.GM,
      });

      expect(result.paymentProviders).toHaveLength(1);
      expect(result.paymentProviders[0].id).toBe('MCYBERSOURCE');
      expect(result.buyNowPayLaterProviders).toHaveLength(0);
    });

    it('should enrich providers with configuration', async () => {
      const result = await service.getPaymentProviders({
        type: 'proposal',
        id: '123',
        locale: 'fr-FR',
        issuerType: OidcIssuerTypes.GM,
      });

      expect(result.paymentProviders[0].configuration).toBeDefined();
      expect(result.paymentProviders[0].configuration.is_active).toBe(true);
    });

    it('should filter inactive providers', async () => {
      const result = await service.getPaymentProviders({
        type: 'proposal',
        id: '123',
        locale: 'fr-FR',
        issuerType: OidcIssuerTypes.GM,
      });

      const hipayProvider = result.paymentProviders.find((p: any) => p.id === 'MHIPAY');
      expect(hipayProvider).toBeUndefined();
    });
  });
});
