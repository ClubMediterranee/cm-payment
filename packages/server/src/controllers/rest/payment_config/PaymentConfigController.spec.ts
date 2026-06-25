import { PlatformTest } from '@tsed/platform-http/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PaymentConfigService } from '../../../services/payment_config/PaymentConfigService.js';
import { OidcIssuerTypes } from '../../../services/payment_config/types.js';
import { PaymentConfigController } from './PaymentConfigController.js';

describe('PaymentConfigController', () => {
  let controller: PaymentConfigController;
  let service: PaymentConfigService;

  beforeEach(async () => {
    await PlatformTest.create({
      envs: {
        DIRECTUS_URL: 'http://localhost',
        DIRECTUS_API_TOKEN: 'test-token',
      },
    });

    controller = await PlatformTest.invoke<PaymentConfigController>(PaymentConfigController);
    service = await PlatformTest.get<PaymentConfigService>(PaymentConfigService);
  });

  afterEach(() => PlatformTest.reset());

  describe('GET /payment_config', () => {
    const mockPaymentConfig = {
      feature_flips: { is_paypal_button_enabled: true },
      settings: { days_before_trip_to_allow_free_deposit: 90 },
    };

    beforeEach(() => {
      vi.spyOn(service, 'getPaymentConfig').mockResolvedValue(mockPaymentConfig as any);
    });

    it('should delegate to the service with locale and issuer type', async () => {
      const result = await controller.getPaymentConfig('fr-FR', OidcIssuerTypes.GM);

      expect(result).toEqual(mockPaymentConfig);
      expect(service.getPaymentConfig).toHaveBeenCalledWith({
        locale: 'fr-FR',
        issuerType: OidcIssuerTypes.GM,
      });
    });

    it('should pass through GO and PARTNERS issuer types', async () => {
      await controller.getPaymentConfig('fr-FR', OidcIssuerTypes.GO);
      expect(service.getPaymentConfig).toHaveBeenCalledWith({
        locale: 'fr-FR',
        issuerType: OidcIssuerTypes.GO,
      });

      await controller.getPaymentConfig('en-US', OidcIssuerTypes.PARTNERS);
      expect(service.getPaymentConfig).toHaveBeenCalledWith({
        locale: 'en-US',
        issuerType: OidcIssuerTypes.PARTNERS,
      });
    });
  });
});
