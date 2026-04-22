import { beforeEach, describe, it, vi } from 'vitest';

import { PaymentScheduleController } from './PaymentScheduleController.ts';

describe('PaymentScheduleController', () => {
  let controller: PaymentScheduleController;
  let mockPaymentService: any;

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

    controller = new PaymentScheduleController();

    Object.defineProperty(controller, 'paymentSchedulesService', {
      get: () => mockPaymentService,
      configurable: true,
    });
  });

  describe('schedule()', () => {
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
});
