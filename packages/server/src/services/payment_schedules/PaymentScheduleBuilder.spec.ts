import { DITest } from '@tsed/di';

import { PaymentScheduleBuilder } from './PaymentScheduleBuilder.js';
import { PaymentSchedule } from './types.js';

describe('PaymentScheduleBuilder', () => {
  afterEach(() => {
    DITest.reset();
  });

  describe('build', () => {
    it('should return empty array when no payment schedules', async () => {
      const builder = await DITest.invoke(PaymentScheduleBuilder);

      const input: PaymentSchedule = {
        currency: 'EUR',
        total: 0,
        payment_schedules: [],
      };

      const result = builder.build(input);

      expect(result).toEqual([]);
    });

    it('should build single payment schedule', async () => {
      const builder = await DITest.invoke(PaymentScheduleBuilder);

      const input: PaymentSchedule = {
        currency: 'EUR',
        total: 420,
        payment_schedules: [{ amount: 420, deadline: undefined }],
      };

      const result = builder.build(input);

      expect(result).toEqual([
        {
          amount: 420,
          deadline: undefined,
          currency: 'EUR',
        },
      ]);
    });

    it('should return empty array when single payment has no amount', async () => {
      const builder = await DITest.invoke(PaymentScheduleBuilder);

      const input: PaymentSchedule = {
        currency: 'EUR',
        total: 0,
        payment_schedules: [{ amount: undefined, deadline: '2026-03-20' }],
      };

      const result = builder.build(input);

      expect(result).toEqual([]);
    });

    it('should build multiple payments with total and first payment details', async () => {
      const builder = await DITest.invoke(PaymentScheduleBuilder);

      const input: PaymentSchedule = {
        currency: 'EUR',
        total: 3470,
        payment_schedules: [
          { amount: 1200, deadline: '2026-02-10' },
          { amount: 800, deadline: '2026-03-20' },
          { amount: 1470, deadline: '2026-04-20' },
        ],
      };

      const result = builder.build(input);

      expect(result).toEqual([
        { amount: 3470, currency: 'EUR' },
        { amount: 1200, currency: 'EUR', deadline: '2026-03-20', balance: 800 },
      ]);
    });

    it('should use second payment deadline and amount as balance', async () => {
      const builder = await DITest.invoke(PaymentScheduleBuilder);

      const input: PaymentSchedule = {
        currency: 'EUR',
        total: 2000,
        payment_schedules: [
          { amount: 1200, deadline: '2026-02-10' },
          { amount: 800, deadline: '2026-03-20' },
        ],
      };

      const result = builder.build(input);

      expect(result).toHaveLength(2);
      expect(result[1]).toMatchObject({
        amount: 1200,
        deadline: '2026-03-20',
        balance: 800,
      });
      expect(result[1].deadline).not.toBe('2026-02-10');
    });

    it('should handle missing currency with empty string', async () => {
      const builder = await DITest.invoke(PaymentScheduleBuilder);

      const input: PaymentSchedule = {
        currency: '',
        total: 420,
        payment_schedules: [{ amount: 420, deadline: undefined }],
      };

      const result = builder.build(input);

      expect(result[0].currency).toBe('');
    });

    it('should not add balance to single payment', async () => {
      const builder = await DITest.invoke(PaymentScheduleBuilder);

      const input: PaymentSchedule = {
        currency: 'EUR',
        total: 420,
        payment_schedules: [{ amount: 420, deadline: '2026-03-20' }],
      };

      const result = builder.build(input);

      expect(result).toHaveLength(1);
      expect(result[0]).not.toHaveProperty('balance');
      expect(result[0]).toEqual({
        amount: 420,
        deadline: '2026-03-20',
        currency: 'EUR',
      });
    });
  });
});
