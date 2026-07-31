import { beforeEach, describe, it, vi } from 'vitest';

import { OidcIssuerTypes } from '../../../services/payment_config/types.js';
import { PaymentScheduleController } from './PaymentScheduleController.js';

describe('PaymentScheduleController', () => {
  let controller: PaymentScheduleController;
  let mockPaymentService: any;
  let mockOverpaymentService: any;

  const Action = {
    PAYMENT_CART: 'PAYMENT_CART',
    PAYMENT_RESA: 'PAYMENT_RESA',
    PAYMENT_OPTION: 'PAYMENT_OPTION',
    PAYMENT_SOLDE: 'PAYMENT_SOLDE',
    PAYMENT_PARTIAL: 'PAYMENT_PARTIAL',
    PAYMENT_UPGRADE_ROOM: 'PAYMENT_UPGRADE_ROOM',
  } as const;

  beforeEach(() => {
    mockPaymentService = {
      handlePaymentSchedules: vi.fn(),
    };
    mockOverpaymentService = {
      getOverpaymentAllowance: vi.fn().mockResolvedValue({ amount: 100 }),
    };

    controller = new PaymentScheduleController();

    Object.defineProperty(controller, 'paymentSchedulesService', {
      get: () => mockPaymentService,
      configurable: true,
    });
    Object.defineProperty(controller, 'overpaymentAllowanceService', {
      get: () => mockOverpaymentService,
      configurable: true,
    });
  });

  describe('getPaymentSchedules()', () => {
    it('should perform', async () => {
      await controller.getPaymentSchedules('proposal', '123456', Action.PAYMENT_SOLDE, '123456');

      expect(mockPaymentService.handlePaymentSchedules).toHaveBeenCalledWith({
        type: 'proposal',
        id: '123456',
        action: Action.PAYMENT_SOLDE,
        customer_id: '123456',
      });
    });
  });

  describe('getOverpaymentAllowance()', () => {
    it('should delegate to paymentMaxAmountService with correct params', async () => {
      await controller.getOverpaymentAllowance(
        'booking-123',
        'customer-456',
        OidcIssuerTypes.GO,
        'fr-CA',
      );

      expect(mockOverpaymentService.getOverpaymentAllowance).toHaveBeenCalledWith({
        bookingId: 'booking-123',
        customerId: 'customer-456',
        issuerType: OidcIssuerTypes.GO,
        locale: 'fr-CA',
      });
    });

    it('should return the amount from the service', async () => {
      mockOverpaymentService.getOverpaymentAllowance.mockResolvedValue({
        amount: 100000,
      });

      const result = await controller.getOverpaymentAllowance(
        'booking-123',
        'customer-456',
        OidcIssuerTypes.GO,
        'fr-CA',
      );

      expect(result).toEqual({ amount: 100000 });
    });
  });
});
