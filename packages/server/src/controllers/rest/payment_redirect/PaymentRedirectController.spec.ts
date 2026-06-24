import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PaymentRedirectController } from './PaymentRedirectController.js';

describe('PaymentRedirectController', () => {
  let controller: PaymentRedirectController;
  let mockPaymentService: any;
  let mockViews: any;

  beforeEach(() => {
    mockPaymentService = {
      handlePaymentRedirect: vi.fn(),
    };

    mockViews = {
      render: vi.fn(),
    };

    controller = new PaymentRedirectController();

    Object.defineProperty(controller, 'paymentRedirectService', {
      get: () => mockPaymentService,
      configurable: true,
    });

    Object.defineProperty(controller, 'views', {
      get: () => mockViews,
      configurable: true,
    });
  });

  describe('redirect()', () => {
    it('should perform HTTP 302 redirect in default mode', async () => {
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

    it('should perform HTTP 302 redirect when mode is explicitly redirect', async () => {
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
        'payment456',
        { callback_url: 'https://example.com/callback', mode: 'redirect' },
        {},
        mockContext as any,
      );

      expect(mockContext.response.redirect).toHaveBeenCalledWith(
        302,
        'https://example.com/success?status=ok',
      );
    });

    it('should render HTML template in iframe mode', async () => {
      mockPaymentService.handlePaymentRedirect.mockResolvedValue(
        'https://example.com/success?status=ok',
      );
      mockViews.render.mockResolvedValue('<html><body>Redirecting...</body></html>');

      const mockContext = {
        response: {
          redirect: vi.fn(),
          contentType: vi.fn().mockReturnThis(),
          setHeader: vi.fn().mockReturnThis(),
        },
      };

      const result = await controller.redirect(
        'payment789',
        { callback_url: 'https://example.com/callback', mode: 'iframe' },
        {},
        mockContext as any,
      );

      expect(mockViews.render).toHaveBeenCalledWith('iframe-redirect.ejs', {
        redirectUrl: 'https://example.com/success?status=ok',
      });
      expect(mockContext.response.contentType).toHaveBeenCalledWith('text/html; charset=utf-8');
      expect(mockContext.response.setHeader).toHaveBeenCalledWith(
        'Content-Security-Policy',
        "default-src 'none'; script-src 'unsafe-inline'; frame-ancestors 'self' https://*.clubmed.com",
      );
      expect(mockContext.response.redirect).not.toHaveBeenCalled();
      expect(result).toBe('<html><body>Redirecting...</body></html>');
    });

    it('should merge query params and body params', async () => {
      mockPaymentService.handlePaymentRedirect.mockResolvedValue('https://example.com/success');

      const mockContext = {
        response: {
          redirect: vi.fn(),
        },
      };

      await controller.redirect(
        'payment999',
        { callback_url: 'https://example.com/callback', provider_id: 'HIPAY' },
        { transaction_id: 'txn123', status: 'captured' },
        mockContext as any,
      );

      expect(mockPaymentService.handlePaymentRedirect).toHaveBeenCalledWith('payment999', {
        callback_url: 'https://example.com/callback',
        provider_id: 'HIPAY',
        transaction_id: 'txn123',
        status: 'captured',
      });
    });

    it('should set correct CSP header in iframe mode', async () => {
      mockPaymentService.handlePaymentRedirect.mockResolvedValue('https://example.com/success');
      mockViews.render.mockResolvedValue('<html></html>');

      const mockContext = {
        response: {
          contentType: vi.fn().mockReturnThis(),
          setHeader: vi.fn().mockReturnThis(),
        },
      };

      await controller.redirect(
        'payment111',
        { callback_url: 'https://example.com/callback', mode: 'iframe' },
        {},
        mockContext as any,
      );

      expect(mockContext.response.setHeader).toHaveBeenCalledWith(
        'Content-Security-Policy',
        "default-src 'none'; script-src 'unsafe-inline'; frame-ancestors 'self' https://*.clubmed.com",
      );
    });
  });
});
