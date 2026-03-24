import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PaymentConfirmationService } from '../../../services/PaymentConfirmationService.js';
import { PaymentConfigController } from './PaymentConfigController.js';

describe('PaymentConfigController', () => {
  let controller: PaymentConfigController;
  let mockPaymentService: any;
  let mockViews: any;

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
      mockPaymentService.handlePaymentRedirect.mockResolvedValue(
        'https://example.com/success?status=ok',
      );

      const mockContext = {
        response: {
          redirect: vi.fn(),
          contentType: vi.fn(),
          setHeader: vi.fn(),
        },
      };

      await controller.redirect(
        'payment123',
        { callback_url: 'https://example.com/callback', provider_id: 'HIPAY' },
        {},
        mockContext as any,
      );

      expect(mockPaymentService.handlePaymentRedirect).toHaveBeenCalledWith('payment123', {
        callback_url: 'https://example.com/callback',
        provider_id: 'HIPAY',
      });
      expect(mockContext.response.redirect).toHaveBeenCalledWith(
        302,
        'https://example.com/success?status=ok',
      );
      expect(mockContext.response.contentType).not.toHaveBeenCalled();
    });
  });
});
