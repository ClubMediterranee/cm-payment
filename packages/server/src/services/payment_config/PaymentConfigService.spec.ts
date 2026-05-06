import { PlatformTest } from '@tsed/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { HttpClient } from '../../infra/http/HttpClient.js';
import { OidcIssuerTypes } from '../../models/payment_config/OidcIssuerTypes.js';
import { PaymentConfigService } from './PaymentConfigService.js';

describe('PaymentConfigService', () => {
  let service: PaymentConfigService;
  let httpClient: HttpClient;

  beforeEach(async () => {
    await PlatformTest.create({
      CMS_URL: 'https://cms.test.com',
    });

    service = await PlatformTest.invoke<PaymentConfigService>(PaymentConfigService);
    httpClient = await PlatformTest.get<HttpClient>(HttpClient);
  });

  afterEach(() => PlatformTest.reset());

  describe('getPaymentConfig', () => {
    const mockFeatureFlips = {
      keys: [
        { key: 'featureFlipping.psp.cybersource', value: true },
        { key: 'featureFlipping.booking.banking.enableFreeDeposit', value: true },
      ],
    };

    const mockSettings = {
      booking: {
        banking: {
          freeDepositDeadline: 90,
        },
      },
    };

    beforeEach(() => {
      vi.spyOn(httpClient, 'get').mockImplementation(async (url: string) => {
        if (url.includes('feature-flip')) {
          return mockFeatureFlips;
        }
        if (url.includes('b2c-common')) {
          return mockSettings;
        }
        throw new Error('Unexpected URL');
      });
    });

    it('should fetch and map payment config correctly', async () => {
      const result = await service.getPaymentConfig({
        locale: 'fr-FR',
        issuerType: OidcIssuerTypes.GM,
      });

      expect(result).toBeDefined();
      expect(result.featureFlip).toBeDefined();
      expect(result.settings).toBeDefined();
      expect(httpClient.get).toHaveBeenCalledTimes(2);
    });
  });

  describe('getPaymentProvidersConfig', () => {
    const mockFeatureFlips = {
      keys: [
        { key: 'featureFlipping.psp.cybersource', value: true },
        { key: 'featureFlipping.booking.banking.enableFreeDeposit', value: true },
      ],
    };

    const mockSettings = {
      booking: {
        banking: {
          freeDepositDeadline: 90,
        },
      },
    };

    beforeEach(() => {
      vi.spyOn(httpClient, 'get').mockImplementation(async (url: string) => {
        if (url.includes('feature-flip')) {
          return mockFeatureFlips;
        }
        if (url.includes('b2c-common')) {
          return mockSettings;
        }
        throw new Error('Unexpected URL');
      });
    });

    it('should fetch and return providers config', async () => {
      const result = await service.getPaymentProvidersConfig({
        locale: 'fr-FR',
        issuerType: OidcIssuerTypes.GM,
      });

      expect(result).toBeDefined();
      expect(httpClient.get).toHaveBeenCalledTimes(2);
    });
  });
});
