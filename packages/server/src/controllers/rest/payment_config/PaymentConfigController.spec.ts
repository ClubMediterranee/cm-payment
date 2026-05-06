import { PlatformTest } from '@tsed/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { OidcIssuerTypes } from '../../../models/payment_config/OidcIssuerTypes.js';
import { PaymentConfigService } from '../../../services/payment_config/PaymentConfigService.js';
import { PaymentConfigController } from './PaymentConfigController.js';

describe('PaymentConfigController', () => {
  let controller: PaymentConfigController;
  let service: PaymentConfigService;

  beforeEach(async () => {
    await PlatformTest.create();

    controller = await PlatformTest.invoke<PaymentConfigController>(PaymentConfigController);
    service = await PlatformTest.get<PaymentConfigService>(PaymentConfigService);
  });

  afterEach(() => PlatformTest.reset());

  describe('GET /payment_config', () => {
    const mockPaymentConfig = {
      featureFlip: {
        isFreeDepositEnabled: true,
      },
      settings: {
        daysBeforeTripToAllowFreeDeposit: 90,
      },
    };

    beforeEach(() => {
      vi.spyOn(service, 'getPaymentConfig').mockResolvedValue(mockPaymentConfig as any);
    });

    it('should return payment config for valid parameters', async () => {
      const ctx = {
        request: {
          headers: {
            'accept-language': 'fr-FR',
            'x-issuer-type': OidcIssuerTypes.GM,
          },
        },
      } as any;

      const result = await controller.getPaymentConfig(ctx);

      expect(result).toEqual(mockPaymentConfig);
      expect(service.getPaymentConfig).toHaveBeenCalledWith({
        locale: 'fr-FR',
        issuerType: OidcIssuerTypes.GM,
      });
    });

    it('should handle GO issuer type', async () => {
      const ctx = {
        request: {
          headers: {
            'accept-language': 'fr-FR',
            'x-issuer-type': OidcIssuerTypes.GO,
          },
        },
      } as any;

      const result = await controller.getPaymentConfig(ctx);

      expect(result).toEqual(mockPaymentConfig);
      expect(service.getPaymentConfig).toHaveBeenCalledWith({
        locale: 'fr-FR',
        issuerType: OidcIssuerTypes.GO,
      });
    });

    it('should handle PARTNERS issuer type', async () => {
      const ctx = {
        request: {
          headers: {
            'accept-language': 'en-US',
            'x-issuer-type': OidcIssuerTypes.PARTNERS,
          },
        },
      } as any;

      const result = await controller.getPaymentConfig(ctx);

      expect(result).toEqual(mockPaymentConfig);
      expect(service.getPaymentConfig).toHaveBeenCalledWith({
        locale: 'en-US',
        issuerType: OidcIssuerTypes.PARTNERS,
      });
    });

    it('should propagate service errors', async () => {
      const error = new Error('CMS error');
      vi.spyOn(service, 'getPaymentConfig').mockRejectedValue(error);

      const ctx = {
        request: {
          headers: {
            'accept-language': 'fr-FR',
            'x-issuer-type': OidcIssuerTypes.GM,
          },
        },
      } as any;

      await expect(controller.getPaymentConfig(ctx)).rejects.toThrow('CMS error');
    });
  });
});
