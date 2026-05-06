import { PlatformTest } from '@tsed/common';

import { OidcIssuerTypes } from '../../../models/payment_config/OidcIssuerTypes.js';
import { PaymentProvidersService } from '../../../services/payment_providers/PaymentProvidersService.js';
import { PaymentProvidersController } from './PaymentProvidersController.js';

describe('PaymentProvidersController', () => {
  let controller: PaymentProvidersController;
  let service: PaymentProvidersService;

  beforeEach(async () => {
    await PlatformTest.create();

    controller = await PlatformTest.invoke<PaymentProvidersController>(PaymentProvidersController);
    service = await PlatformTest.get<PaymentProvidersService>(PaymentProvidersService);
  });

  afterEach(() => PlatformTest.reset());

  describe('GET /payment_providers/:type/:id', () => {
    const mockResponse = {
      paymentProviders: [
        {
          id: 'MCYBERSOURCE',
          label: 'Cybersource',
          configuration: { is_active: true },
        },
      ],
      buyNowPayLaterProviders: [],
    };

    beforeEach(() => {
      vi.spyOn(service, 'getPaymentProviders').mockResolvedValue(mockResponse as any);
    });

    it('should return payment providers for proposal', async () => {
      const ctx = {
        request: {
          headers: {
            'accept-language': 'fr-FR',
            'x-issuer-type': OidcIssuerTypes.GM,
          },
        },
      } as any;

      const result = await controller.getPaymentProviders('proposal', '123', ctx, undefined);

      expect(result).toEqual(mockResponse);
      expect(service.getPaymentProviders).toHaveBeenCalledWith({
        type: 'proposal',
        id: '123',
        locale: 'fr-FR',
        issuerType: OidcIssuerTypes.GM,
        customerId: undefined,
      });
    });

    it('should return payment providers for booking with customer_id', async () => {
      const ctx = {
        request: {
          headers: {
            'accept-language': 'fr-FR',
            'x-issuer-type': OidcIssuerTypes.GM,
          },
        },
      } as any;

      const result = await controller.getPaymentProviders('booking', '456', ctx, '789');

      expect(result).toEqual(mockResponse);
      expect(service.getPaymentProviders).toHaveBeenCalledWith({
        type: 'booking',
        id: '456',
        locale: 'fr-FR',
        issuerType: OidcIssuerTypes.GM,
        customerId: '789',
      });
    });

    it('should throw error if customer_id is missing for booking', async () => {
      const ctx = {
        request: {
          headers: {
            'accept-language': 'fr-FR',
            'x-issuer-type': OidcIssuerTypes.GM,
          },
        },
      } as any;

      await expect(
        controller.getPaymentProviders('booking', '456', ctx, undefined),
      ).rejects.toThrow('customer_id is required for booking type');
    });
  });
});
