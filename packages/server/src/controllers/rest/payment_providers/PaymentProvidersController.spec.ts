import { PlatformTest } from '@tsed/platform-http/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

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
      );

      expect(result).toEqual(mockResponse);
      expect(service.getPaymentProviders).toHaveBeenCalledWith({
        type: 'proposal',
        id: '123',
        locale: 'fr-FR',
        issuerType: OidcIssuerTypes.GM,
        customerId: undefined,
      });
    });

    it('should return payment providers for a booking with customer_id', async () => {
      const result = await controller.getPaymentProviders(
        'booking',
        '456',
        'fr-FR',
        OidcIssuerTypes.GM,
        '789',
      );

      expect(result).toEqual(mockResponse);
      expect(service.getPaymentProviders).toHaveBeenCalledWith({
        type: 'booking',
        id: '456',
        locale: 'fr-FR',
        issuerType: OidcIssuerTypes.GM,
        customerId: '789',
      });
    });
  });
});
