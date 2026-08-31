import { PlatformTest } from '@tsed/platform-http/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Action } from '../../../infra/api/__generated__/index.js';
import { OidcIssuerTypes } from '../../../services/payment_config/types.js';
import { PaymentProvidersService } from '../../../services/payment_providers/PaymentProvidersService.js';
import { PaymentProvidersController } from './PaymentProvidersController.js';

describe('PaymentProvidersController', () => {
  let controller: PaymentProvidersController;
  let service: PaymentProvidersService;

  beforeEach(async () => {
    await PlatformTest.create({
      DIRECTUS_URL: 'http://localhost',
      DIRECTUS_API_TOKEN: 'test-token',
    });

    controller = await PlatformTest.invoke<PaymentProvidersController>(PaymentProvidersController);
    service = await PlatformTest.get<PaymentProvidersService>(PaymentProvidersService);
  });

  afterEach(() => PlatformTest.reset());

  describe('GET /payment_providers/:type/:id', () => {
    const mockResponse = {
      payment_providers: [
        {
          id: 'MCYBERSOURCE',
          label: 'Cybersource',
          configuration: { display_type: 'hosted_field', settings: {} },
        },
      ],
      buy_now_pay_later_providers: [],
    };

    beforeEach(() => {
      vi.spyOn(service, 'getPaymentProviders').mockResolvedValue(mockResponse as any);
    });

    it('should return payment providers for a proposal', async () => {
      const result = await controller.getPaymentProviders(
        'proposal',
        '123',
        'fr-FR',
        OidcIssuerTypes.GM,
        undefined,
        undefined,
        Action.PAYMENT_RESA,
      );

      expect(result).toEqual(mockResponse);
      expect(service.getPaymentProviders).toHaveBeenCalledWith({
        type: 'proposal',
        id: '123',
        locale: 'fr-FR',
        issuerType: OidcIssuerTypes.GM,
        customerId: undefined,
        userAgent: undefined,
        action: Action.PAYMENT_RESA,
      });
    });

    it('should return payment providers for a booking with customer_id', async () => {
      const result = await controller.getPaymentProviders(
        'booking',
        '456',
        'fr-FR',
        OidcIssuerTypes.GM,
        'test-user-agent',
        '789',
        Action.PAYMENT_SOLDE,
      );

      expect(result).toEqual(mockResponse);
      expect(service.getPaymentProviders).toHaveBeenCalledWith({
        type: 'booking',
        id: '456',
        locale: 'fr-FR',
        issuerType: OidcIssuerTypes.GM,
        customerId: '789',
        userAgent: 'test-user-agent',
        action: Action.PAYMENT_SOLDE,
      });
    });
  });
});
