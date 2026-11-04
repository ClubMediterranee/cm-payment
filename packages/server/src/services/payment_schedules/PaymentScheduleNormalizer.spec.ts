import { DITest } from '@tsed/di';

import {
  CartModel,
  CartUpgradeRoomModel,
  CustomerBookingPaymentScheduleModel,
  ProposalPaymentScheduleModelV1,
  ServicesV3Model,
} from '../../infra/api/__generated__/index.js';
import { PaymentScheduleNormalizer } from './PaymentScheduleNormalizer.js';

describe('PaymentScheduleNormalizer', () => {
  afterEach(() => {
    DITest.reset();
  });

  describe('normalize', () => {
    it('should normalize CartUpgradeRoomModel', async () => {
      const normalizer = await DITest.invoke(PaymentScheduleNormalizer);

      const input: CartUpgradeRoomModel = {
        price: {
          amount: 420,
          currency: 'EUR',
        },
      };

      const result = normalizer.normalize(input);

      expect(result).toEqual({
        currency: 'EUR',
        total: 420,
        payment_schedules: [
          {
            amount: 420,
            deadline: undefined,
          },
        ],
      });
    });

    it('should normalize CartUpgradeRoomModel with missing currency', async () => {
      const normalizer = await DITest.invoke(PaymentScheduleNormalizer);

      const input: CartUpgradeRoomModel = {
        price: {
          amount: 420,
          currency: undefined,
        },
      } as any;

      const result = normalizer.normalize(input);

      expect(result.currency).toBe('');
      expect(result.total).toBe(420);
    });

    it('should normalize CartModel using the cart total', async () => {
      const normalizer = await DITest.invoke(PaymentScheduleNormalizer);

      const input: CartModel = {
        price: {
          total: 250,
          currency: 'EUR',
        },
      };

      const result = normalizer.normalize(input);

      expect(result).toEqual({
        currency: 'EUR',
        total: 250,
        payment_schedules: [
          {
            amount: 250,
            deadline: undefined,
          },
        ],
      });
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

      const result = normalizer.normalize(input);

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

      const result = normalizer.normalize(input);

      expect(result.currency).toBe('EUR');
    });

    it('should normalize ServicesV3Model by summing OPTION services prices', async () => {
      const normalizer = await DITest.invoke(PaymentScheduleNormalizer);

      const input: ServicesV3Model = [
        {
          id: 'service_1',
          type: 'TRANSFER',
          currency: 'EUR',
          stay_index: 0,
          schedules: [
            {
              start_date: '2026-05-01',
              end_date: '2026-05-01',
              attendees: [
                { id: 'A', status: 'OPTION', price: 21, price_without_discount: 21 },
                { id: 'B', status: 'OPTION', price: 21, price_without_discount: 21 },
              ],
            },
          ],
        },
        {
          id: 'service_2',
          type: 'INSURANCE',
          currency: 'EUR',
          stay_index: 0,
          schedules: [
            {
              start_date: '2026-05-02',
              end_date: '2026-05-02',
              attendees: [{ id: 'A', status: 'OPTION', price: 38, price_without_discount: 38 }],
            },
          ],
        },
      ] as any;

      const result = normalizer.normalize(input);

      expect(result).toEqual({
        currency: 'EUR',
        total: 80,
        payment_schedules: [{ amount: 80 }],
      });
    });

    it('should treat missing attendees and prices as zero for ServicesV3Model', async () => {
      const normalizer = await DITest.invoke(PaymentScheduleNormalizer);

      const input: ServicesV3Model = [
        {
          id: 'service_1',
          type: 'TRANSFER',
          currency: 'EUR',
          stay_index: 0,
          schedules: [
            {
              start_date: '2026-05-01',
              end_date: '2026-05-01',
              attendees: [{ id: 'A', status: 'OPTION', price_without_discount: 21 }],
            },
            { start_date: '2026-05-02', end_date: '2026-05-02' },
          ],
        },
      ] as any;

      const result = normalizer.normalize(input);

      expect(result).toEqual({
        currency: 'EUR',
        total: 0,
        payment_schedules: [{ amount: 0 }],
      });
    });

    it('should return an empty-currency zero total for an empty ServicesV3Model', async () => {
      const normalizer = await DITest.invoke(PaymentScheduleNormalizer);

      const result = normalizer.normalize([] as ServicesV3Model);

      expect(result).toEqual({
        currency: '',
        total: 0,
        payment_schedules: [{ amount: 0 }],
      });
    });

    it('should return data as-is for CustomerBookingPaymentScheduleModel', async () => {
      const normalizer = await DITest.invoke(PaymentScheduleNormalizer);

      const input: CustomerBookingPaymentScheduleModel = {
        currency: 'EUR',
        paid: 1200,
        total: 3470,
        payment_schedules: [
          { amount: 1200, deadline: '2026-02-10' },
          { amount: 800, deadline: '2026-03-20' },
        ],
      };

      const result = normalizer.normalize(input);

      expect(result).toEqual(input);
    });
  });
});
