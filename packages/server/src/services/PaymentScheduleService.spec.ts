import { DITest } from '@tsed/di';
import { describe, expect, it, vi } from 'vitest';

import {
  CustomerBookingPaymentScheduleModel,
  HouseholdPaymentScheduleModels,
} from '@/infra/api/__generated__/index.schemas.js';

import * as api from '../infra/api/__generated__/index.js';
import { PaymentSchedulesService } from './PaymentSchedulesService.js';

const Action = {
  PAYMENT_CART: 'PAYMENT_CART',
  PAYMENT_RESA: 'PAYMENT_RESA',
  PAYMENT_OPTION: 'PAYMENT_OPTION',
  PAYMENT_SOLDE: 'PAYMENT_SOLDE',
  PAYMENT_PARTIAL: 'PAYMENT_PARTIAL',
  PAYMENT_UPGRADE_ROOM: 'PAYMENT_UPGRADE_ROOM',
} as const;

vi.mock('../infra/api/__generated__/index.js', () => ({
  getV1ProposalsProposalIdPaymentSchedule: vi.fn(),
  getV0CustomersCustomerIdBookingsBookingIdPaymentSchedules: vi.fn(),
  getV0CustomersCustomerIdBookingsBookingIdCartPaymentSchedule: vi.fn(),
  getV0CustomersCustomerIdBookingsBookingIdCartAccommodations: vi.fn(),
}));

describe('PaymentSchedulesService', () => {
  afterEach(() => {
    DITest.reset();
    vi.clearAllMocks();
  });

  describe('handlePaymentSchedules', () => {
    it('should fail without proposal_id', async () => {
      const service = await DITest.invoke(PaymentSchedulesService);

      await expect(
        service.handlePaymentSchedules({
          type: 'booking',
          proposal_id: undefined,
          customer_id: 123456,
          action: Action.PAYMENT_SOLDE,
        } as any),
      ).rejects.toThrow('proposal id is required for this action');
    });

    it('should fail without customer_id', async () => {
      const service = await DITest.invoke(PaymentSchedulesService);

      await expect(
        service.handlePaymentSchedules({
          type: 'booking',
          proposal_id: 123456,
          customer_id: undefined,
          action: Action.PAYMENT_SOLDE,
        } as any),
      ).rejects.toThrow('customer id is required for this action');
    });

    it('should fail with Invalid action', async () => {
      const service = await DITest.invoke(PaymentSchedulesService);

      await expect(
        service.handlePaymentSchedules({
          type: 'booking',
          proposal_id: 123456,
          customer_id: 123456,
          action: 'OTHER',
        } as any),
      ).rejects.toThrow('Invalid action');
    });

    it('should send proposal id payment schedule', async () => {
      const service = await DITest.invoke(PaymentSchedulesService);

      vi.mocked(api.getV1ProposalsProposalIdPaymentSchedule).mockResolvedValue({
        currency: 'EUR',
        commission_included: false,
        households: [
          {
            // Household 1 : 2 adultes
            attendees: [
              { id: 'ps_attendee_0001', customer_id: '123456789' },
              { id: 'ps_attendee_0002', customer_id: '987654321' },
            ],
            total: 2150,
            deposit_repayment_schedule: [
              { expected_payment_amount: 500, deadline: '2026-03-20' },
              { expected_payment_amount: 800, deadline: '2026-04-20' },
              { expected_payment_amount: 850, deadline: '2026-05-20' },
            ],
          },
          {
            // Household 2 : 1 adulte + 1 enfant (ex)
            attendees: [
              { id: 'ps_attendee_0003', customer_id: '246801357' },
              { id: 'ps_attendee_0004', customer_id: '135792468' },
            ],
            total: 1320,
            deposit_repayment_schedule: [
              { expected_payment_amount: 300, deadline: '2026-03-25' },
              { expected_payment_amount: 520, deadline: '2026-04-25' },
              { expected_payment_amount: 500, deadline: '2026-05-25' },
            ],
          },
        ] as HouseholdPaymentScheduleModels,
      } as any);

      const paymentSchedule = await service.handlePaymentSchedules({
        type: 'proposal',
        proposal_id: 123456,
        customer_id: 123456,
        action: Action.PAYMENT_SOLDE,
      });

      expect(api.getV1ProposalsProposalIdPaymentSchedule).toHaveBeenCalledWith(123456);
      expect(Array.isArray(paymentSchedule)).toBe(true);
      // 1) La sortie finale attendue est un tableau
      expect(Array.isArray(paymentSchedule)).toBe(true);

      // 2) Comme payments.length >= 2 => on doit avoir 2 lignes (total + acompte/future balance)
      expect(paymentSchedule).toHaveLength(2);

      // 3) Ligne 1: total + currency uniquement
      expect(paymentSchedule[0]).toEqual({
        amount: 2150,
        currency: 'EUR',
      });

      // 4) Ligne 2: amount = payments[0].amount, deadline = payments[1].deadline, balance = payments[1].amount
      expect(paymentSchedule[1]).toEqual({
        amount: 500,
        currency: 'EUR',
        deadline: '2026-04-20',
        balance: 800,
      });

      // 5) Vérifs additionnelles (types / présence)
      expect(paymentSchedule[0].deadline).toBeUndefined();
      expect(paymentSchedule[0].balance).toBeUndefined();

      expect(typeof paymentSchedule[0].amount).toBe('number');
      expect(typeof paymentSchedule[0].currency).toBe('string');

      expect(typeof paymentSchedule[1].amount).toBe('number');
      expect(typeof paymentSchedule[1].currency).toBe('string');
      expect(typeof paymentSchedule[1].deadline).toBe('string');
      expect(typeof paymentSchedule[1].balance).toBe('number');
    });

    it('should fallback to EUR when currency is missing', async () => {
      const service = await DITest.invoke(PaymentSchedulesService);

      vi.mocked(api.getV1ProposalsProposalIdPaymentSchedule).mockResolvedValue({
        currency: undefined,
        commission_included: false,
        households: [
          {
            // Household 1 : 2 adultes
            attendees: [
              { id: 'ps_attendee_0001', customer_id: '123456789' },
              { id: 'ps_attendee_0002', customer_id: '987654321' },
            ],
            total: 2150,
            deposit_repayment_schedule: [
              { expected_payment_amount: 500, deadline: '2026-03-20' },
              { expected_payment_amount: 800, deadline: '2026-04-20' },
              { expected_payment_amount: 850, deadline: '2026-05-20' },
            ],
          },
          {
            // Household 2 : 1 adulte + 1 enfant (ex)
            attendees: [
              { id: 'ps_attendee_0003', customer_id: '246801357' },
              { id: 'ps_attendee_0004', customer_id: '135792468' },
            ],
            total: 1320,
            deposit_repayment_schedule: [
              { expected_payment_amount: 300, deadline: '2026-03-25' },
              { expected_payment_amount: 520, deadline: '2026-04-25' },
              { expected_payment_amount: 500, deadline: '2026-05-25' },
            ],
          },
        ] as HouseholdPaymentScheduleModels,
      } as any);
      const paymentSchedule = await service.handlePaymentSchedules({
        type: 'proposal',
        proposal_id: 123456,
        customer_id: 123456,
        action: Action.PAYMENT_SOLDE,
      });

      expect(paymentSchedule[0].currency).toBe('EUR');
      expect(paymentSchedule[1].currency).toBe('EUR');
    });

    it('booking payment schedules: should build merged schedule when >= 2 payments', async () => {
      const service = await DITest.invoke(PaymentSchedulesService);

      vi.mocked(api.getV0CustomersCustomerIdBookingsBookingIdPaymentSchedules).mockResolvedValue({
        currency: 'EUR',
        paid: 1200,
        total: 3470,
        payment_schedules: [
          // Échéance déjà passée / acompte (souvent déjà payé en pratique, mais l’API liste quand même le schedule)
          { amount: 1200, deadline: '2026-02-10' },

          // Prochaine échéance
          { amount: 800, deadline: '2026-03-20' },

          // Solde final
          { amount: 1470, deadline: '2026-04-20' },
        ],
      } as CustomerBookingPaymentScheduleModel);

      const paymentSchedule = await service.handlePaymentSchedules({
        type: 'booking',
        proposal_id: 123456,
        customer_id: 123456,
        action: Action.PAYMENT_SOLDE,
      });

      expect(paymentSchedule[0].currency).toBe('EUR');
      expect(paymentSchedule[1].currency).toBe('EUR');
      expect(paymentSchedule).toEqual([
        { amount: 3470, currency: 'EUR' },
        { amount: 1200, currency: 'EUR', deadline: '2026-03-20', balance: 800 },
      ]);
    });

    it('booking payment schedules: should use 2nd payment deadline and amount as balance', async () => {
      const service = await DITest.invoke(PaymentSchedulesService);

      vi.mocked(api.getV0CustomersCustomerIdBookingsBookingIdPaymentSchedules).mockResolvedValue({
        currency: 'EUR',
        paid: 1200,
        total: 3470,
        payment_schedules: [
          { amount: 1200, deadline: '2026-02-10' }, // deadline du 1er paiement (ne doit PAS être utilisé)
          { amount: 800, deadline: '2026-03-20' }, // deadline utilisé par la ligne 2
          { amount: 1470, deadline: '2026-04-20' },
        ],
      } as any);

      const paymentSchedule = await service.handlePaymentSchedules({
        type: 'booking',
        proposal_id: 123456,
        customer_id: 123456,
        action: Action.PAYMENT_SOLDE,
      } as any);

      expect(paymentSchedule).toHaveLength(2);

      // Ligne 2
      expect(paymentSchedule[1]).toMatchObject({
        amount: 1200, // payments[0].amount
        deadline: '2026-03-20', // payments[1].deadline (PAS 2026-02-10)
        balance: 800, // payments[1].amount
        currency: 'EUR',
      });

      // On s'assure que la deadline du 1er payment n'est pas utilisée
      expect(paymentSchedule[1].deadline).not.toBe('2026-02-10');
    });

    it('cart payment schedule: should build merged schedule when >= 2 payments', async () => {
      const service = await DITest.invoke(PaymentSchedulesService);

      vi.mocked(api.getV0CustomersCustomerIdBookingsBookingIdCartPaymentSchedule).mockResolvedValue(
        {
          currency: 'EUR',
          paid: 1200,
          total: 3470,
          payment_schedules: [
            { amount: 1200, deadline: '2026-02-10' },
            { amount: 800, deadline: '2026-03-20' },
            { amount: 1470, deadline: '2026-04-20' },
          ],
        } as any,
      );

      const schedule = await service.handlePaymentSchedules({
        type: 'booking',
        proposal_id: 123456,
        customer_id: 123456,
        action: Action.PAYMENT_CART,
      } as any);

      expect(schedule).toEqual([
        { amount: 3470, currency: 'EUR' },
        { amount: 1200, currency: 'EUR', deadline: '2026-03-20', balance: 800 },
      ]);
    });

    it('cart payment schedule: should use 2nd payment deadline and amount as balance', async () => {
      const service = await DITest.invoke(PaymentSchedulesService);

      vi.mocked(api.getV0CustomersCustomerIdBookingsBookingIdCartPaymentSchedule).mockResolvedValue(
        {
          currency: 'EUR',
          total: 3470,
          payment_schedules: [
            { amount: 1200, deadline: '2026-02-10' }, // NE DOIT PAS être utilisé comme deadline dans la ligne 2
            { amount: 800, deadline: '2026-03-20' }, // DOIT être utilisé
          ],
        } as any,
      );

      const schedule = await service.handlePaymentSchedules({
        type: 'booking',
        proposal_id: 123456,
        customer_id: 123456,
        action: Action.PAYMENT_CART,
      } as any);

      expect(schedule).toHaveLength(2);

      expect(schedule[1]).toMatchObject({
        amount: 1200,
        currency: 'EUR',
        deadline: '2026-03-20',
        balance: 800,
      });

      expect(schedule[1].deadline).not.toBe('2026-02-10');
    });

    it('upgrade room: should return a single schedule line (payments length < 2)', async () => {
      const service = await DITest.invoke(PaymentSchedulesService);

      vi.mocked(api.getV0CustomersCustomerIdBookingsBookingIdCartAccommodations).mockResolvedValue({
        price: {
          amount: 420,
          currency: 'EUR',
        },
      });

      const schedule = await service.handlePaymentSchedules({
        type: 'booking',
        proposal_id: 123456,
        customer_id: 123456,
        action: Action.PAYMENT_UPGRADE_ROOM,
      } as any);

      expect(schedule).toEqual([
        {
          amount: 420,
          deadline: undefined,
          currency: 'EUR',
        },
      ]);
    });

    it('upgrade room: should fallback to empty currency and never set balance when only one payment', async () => {
      const service = await DITest.invoke(PaymentSchedulesService);

      vi.mocked(api.getV0CustomersCustomerIdBookingsBookingIdCartAccommodations).mockResolvedValue({
        price: { amount: 420, currency: undefined },
      } as any);

      const schedule = await service.handlePaymentSchedules({
        type: 'booking',
        proposal_id: 999001,
        customer_id: 123456,
        action: Action.PAYMENT_UPGRADE_ROOM,
      } as any);

      expect(schedule).toHaveLength(1);
      expect(schedule[0].currency).toBe(''); // selectUpgradeSchedule: data.price?.currency || ''
      expect(schedule[0].amount).toBe(420);

      // Important : pas de merge => pas de "balance", pas de ligne total sans deadline
      expect(schedule[0]).not.toHaveProperty('balance');
    });
  });
});
