import { beforeEach, describe, expect, it, vi } from 'vitest';

import { OidcIssuerTypes } from '../../../types/CapsSettings.js';
import { PaymentConfigController } from './PaymentConfigController.js';

describe('PaymentConfigController', () => {
  let controller: PaymentConfigController;
  let mockPaymentService: any;

  beforeEach(() => {
    mockPaymentService = {
      getPaymentConfig: vi.fn(),
    };

    controller = new PaymentConfigController();

    Object.defineProperty(controller, 'paymentConfigService', {
      get: () => mockPaymentService,
      configurable: true,
    });
  });

  describe('getConfig()', () => {
    it('should fetch config', async () => {
      await controller.getConfig(
        {},
        {
          cms_url: 'https://example.com/cms',
          issuerType: OidcIssuerTypes.GM,
          locale: 'fr-FR',
        },
      );

      expect(mockPaymentService.getPaymentConfig).toHaveBeenCalledWith({
        cms_url: 'https://example.com/cms',
        issuerType: OidcIssuerTypes.GM,
        locale: 'fr-FR',
      });
    });
  });
});
