import { DITest } from '@tsed/di';

import {
  Action,
  GetPaymentSchedulesV1Model,
  ProposalPaymentScheduleModelV1,
} from '../../infra/api/__generated__/index.js';
import { PaymentScheduleNormalizer } from './PaymentScheduleNormalizer.js';

describe('PaymentScheduleNormalizer', () => {
  afterEach(() => {
    DITest.reset();
  });

  describe('normalize', () => {
    it('should keep the booking schedule for booking payment actions', async () => {
      const normalizer = await DITest.invoke(PaymentScheduleNormalizer);

      const input: GetPaymentSchedulesV1Model = {
        currency: 'EUR',
        amount: 3470,
        paid: 1200,
        payment_schedules: [
          { amount: 1200, deadline: '2026-02-10' },
          { amount: 800, deadline: null },
        ],
      };

      const result = normalizer.normalize(input, Action.PAYMENT_SOLDE);

      expect(result).toEqual({
        currency: 'EUR',
        total: 3470,
        payment_schedules: [
          { amount: 1200, deadline: '2026-02-10' },
          { amount: 800, deadline: undefined },
        ],
      });
    });

    it.each([Action.PAYMENT_CART, Action.PAYMENT_UPGRADE_ROOM])(
      'should collapse the schedule to the amount for %s',
      async (action) => {
        const normalizer = await DITest.invoke(PaymentScheduleNormalizer);

        const input: GetPaymentSchedulesV1Model = {
          currency: 'EUR',
          amount: 420,
          payment_schedules: [{ amount: 900, deadline: '2026-09-30' }],
        };

        expect(normalizer.normalize(input, action)).toEqual({
          currency: 'EUR',
          total: 420,
          payment_schedules: [{ amount: 420 }],
        });
      },
    );

    it('should use the total for PAYMENT_SERVICES_IN_OPTION', async () => {
      const normalizer = await DITest.invoke(PaymentScheduleNormalizer);

      const input: GetPaymentSchedulesV1Model = {
        currency: 'EUR',
        total: 80,
        payment_schedules: [{ amount: 80, deadline: null }],
      };

      expect(normalizer.normalize(input, Action.PAYMENT_SERVICES_IN_OPTION)).toEqual({
        currency: 'EUR',
        total: 80,
        payment_schedules: [{ amount: 80 }],
      });
    });

    it('should expose the net amount and ignore the gross amount', async () => {
      const normalizer = await DITest.invoke(PaymentScheduleNormalizer);

      const input: GetPaymentSchedulesV1Model = {
        currency: 'AUD',
        amount: 300,
        gross_amount: 350,
        payment_schedules: [{ amount: 300, deadline: '2026-09-30' }],
      };

      expect(normalizer.normalize(input, Action.PAYMENT_CART).total).toBe(300);
    });

    it('should normalize ProposalPaymentScheduleModelV1', async () => {
      const normalizer = await DITest.invoke(PaymentScheduleNormalizer);

      const input: ProposalPaymentScheduleModelV1 = {
        currency: 'EUR',
        commission_included: false,
        households: [
          {
            attendees: [{ id: 'ps_attendee_0001', customer_id: '123456789' }],
            total: 2150,
            deposit_repayment_schedule: [
              { expected_payment_amount: 500, deadline: '2026-03-20' },
              { expected_payment_amount: 800, deadline: '2026-04-20' },
            ],
          },
        ],
      };

      const result = normalizer.normalize(input, Action.PAYMENT_SOLDE);

      expect(result).toEqual({
        currency: 'EUR',
        total: 2150,
        payment_schedules: [
          { amount: 500, deadline: '2026-03-20' },
          { amount: 800, deadline: '2026-04-20' },
        ],
      });
    });

    it('should normalize ProposalPaymentScheduleModelV1 with missing currency', async () => {
      const normalizer = await DITest.invoke(PaymentScheduleNormalizer);

      const input: ProposalPaymentScheduleModelV1 = {
        currency: undefined,
        commission_included: false,
        households: [
          {
            attendees: [{ id: 'ps_attendee_0001', customer_id: '123456789' }],
            total: 2150,
            deposit_repayment_schedule: [{ expected_payment_amount: 500, deadline: '2026-03-20' }],
          },
        ],
      } as any;

      const result = normalizer.normalize(input, Action.PAYMENT_SOLDE);

      expect(result.currency).toBe('EUR');
    });
  });
});
