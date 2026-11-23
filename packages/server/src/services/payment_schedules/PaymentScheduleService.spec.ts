import { DITest } from '@tsed/di';

import * as api from '../../infra/api/__generated__/index.js';
import {
  GetPaymentSchedulesV1Model,
  HouseholdPaymentScheduleModels,
} from '../../infra/api/__generated__/index.js';
import { PaymentSchedulesService } from './PaymentSchedulesService.js';

const Action = {
  PAYMENT_CART: 'PAYMENT_CART',
  PAYMENT_RESA: 'PAYMENT_RESA',
  PAYMENT_OPTION: 'PAYMENT_OPTION',
  PAYMENT_SOLDE: 'PAYMENT_SOLDE',
  PAYMENT_PARTIAL: 'PAYMENT_PARTIAL',
  PAYMENT_UPGRADE_ROOM: 'PAYMENT_UPGRADE_ROOM',
  PAYMENT_SERVICES_IN_OPTION: 'PAYMENT_SERVICES_IN_OPTION',
} as const;

vi.mock('../../infra/api/__generated__/index.js', async (importOriginal) => ({
  ...(await importOriginal()),
  getV1ProposalsProposalIdPaymentSchedule: vi.fn(),
  getV1CustomersCustomerIdBookingsBookingIdPaymentSchedules: vi.fn(),
}));

describe('PaymentSchedulesService', () => {
  afterEach(() => {
    DITest.reset();
    vi.clearAllMocks();
  });

  describe('handlePaymentSchedules', () => {
    it('should fail without id', async () => {
      const service = await DITest.invoke(PaymentSchedulesService);

      await expect(
        service.handlePaymentSchedules({
          type: 'booking',
          id: undefined,
          customer_id: 123456,
          action: Action.PAYMENT_SOLDE,
        } as any),
      ).rejects.toThrow('id is required');
    });

    it('should fail without customer_id', async () => {
      const service = await DITest.invoke(PaymentSchedulesService);

      await expect(
        service.handlePaymentSchedules({
          type: 'booking',
          id: 123456,
          customer_id: undefined,
          action: Action.PAYMENT_SOLDE,
        } as any),
      ).rejects.toThrow('customer id is required');
    });

    it('should fail with unsupported action', async () => {
      const service = await DITest.invoke(PaymentSchedulesService);

      await expect(
        service.handlePaymentSchedules({
          type: 'booking',
          id: 123456,
          customer_id: 123456,
          action: 'OTHER',
        } as any),
      ).rejects.toThrow('Unsupported action');
    });

    it('should send proposal id payment schedule', async () => {
      const service = await DITest.invoke(PaymentSchedulesService);

      vi.mocked(api.getV1ProposalsProposalIdPaymentSchedule).mockResolvedValue({
        currency: 'EUR',
        commission_included: false,
        households: [
          {
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
        id: 123456,
        customer_id: 123456,
        action: Action.PAYMENT_SOLDE,
      });

      expect(api.getV1ProposalsProposalIdPaymentSchedule).toHaveBeenCalledWith('123456');
      expect(Array.isArray(paymentSchedule)).toBe(true);
      expect(Array.isArray(paymentSchedule)).toBe(true);

      expect(paymentSchedule).toHaveLength(2);

      expect(paymentSchedule[0]).toEqual({
        amount: 2150,
        currency: 'EUR',
      });

      expect(paymentSchedule[1]).toEqual({
        amount: 500,
        currency: 'EUR',
        deadline: '2026-04-20',
        balance: 800,
      });

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
        id: 123456,
        customer_id: 123456,
        action: Action.PAYMENT_SOLDE,
      });

      expect(paymentSchedule[0].currency).toBe('EUR');
      expect(paymentSchedule[1].currency).toBe('EUR');
    });

    it('booking payment schedules: should build merged schedule when >= 2 payments', async () => {
      const service = await DITest.invoke(PaymentSchedulesService);

      vi.mocked(api.getV1CustomersCustomerIdBookingsBookingIdPaymentSchedules).mockResolvedValue({
        currency: 'EUR',
        paid: 1200,
        amount: 3470,
        payment_schedules: [
          { amount: 1200, deadline: '2026-02-10' },
          { amount: 800, deadline: '2026-03-20' },
          { amount: 1470, deadline: '2026-04-20' },
        ],
      } as GetPaymentSchedulesV1Model);

      const paymentSchedule = await service.handlePaymentSchedules({
        type: 'booking',
        id: 123456,
        customer_id: 123456,
        action: Action.PAYMENT_SOLDE,
      });

      expect(api.getV1CustomersCustomerIdBookingsBookingIdPaymentSchedules).toHaveBeenCalledWith(
        '123456',
        '123456',
        { action: 'PAYMENT_SOLDE' },
      );
      expect(paymentSchedule).toEqual([
        { amount: 3470, currency: 'EUR' },
        { amount: 1200, currency: 'EUR', deadline: '2026-03-20', balance: 800 },
      ]);
    });

    it('booking payment schedules: should use 2nd payment deadline and amount as balance', async () => {
      const service = await DITest.invoke(PaymentSchedulesService);

      vi.mocked(api.getV1CustomersCustomerIdBookingsBookingIdPaymentSchedules).mockResolvedValue({
        currency: 'EUR',
        paid: 1200,
        amount: 3470,
        payment_schedules: [
          { amount: 1200, deadline: '2026-02-10' },
          { amount: 800, deadline: '2026-03-20' },
          { amount: 1470, deadline: '2026-04-20' },
        ],
      } as GetPaymentSchedulesV1Model);

      const paymentSchedule = await service.handlePaymentSchedules({
        type: 'booking',
        id: 123456,
        customer_id: 123456,
        action: Action.PAYMENT_SOLDE,
      });

      expect(paymentSchedule).toHaveLength(2);
      expect(paymentSchedule[1]).toMatchObject({
        amount: 1200,
        deadline: '2026-03-20',
        balance: 800,
        currency: 'EUR',
      });
    });

    it('booking payment schedules: should expose the net amount returned by the API', async () => {
      const service = await DITest.invoke(PaymentSchedulesService);

      vi.mocked(api.getV1CustomersCustomerIdBookingsBookingIdPaymentSchedules).mockResolvedValue({
        currency: 'AUD',
        amount: 3000,
        gross_amount: 3470,
        payment_schedules: [{ amount: 3000, deadline: '2026-02-10' }],
      } as GetPaymentSchedulesV1Model);

      const paymentSchedule = await service.handlePaymentSchedules({
        type: 'booking',
        id: 123456,
        customer_id: 123456,
        action: Action.PAYMENT_OPTION,
      });

      expect(paymentSchedule).toEqual([{ amount: 3000, currency: 'AUD', deadline: '2026-02-10' }]);
    });

    it('cart: should return a single schedule line with the cart amount', async () => {
      const service = await DITest.invoke(PaymentSchedulesService);

      vi.mocked(api.getV1CustomersCustomerIdBookingsBookingIdPaymentSchedules).mockResolvedValue({
        currency: 'EUR',
        amount: 70,
        paid: 0,
        payment_schedules: [
          { amount: 30, deadline: '2026-09-30' },
          { amount: 40, deadline: '2026-10-30' },
        ],
        services: [],
      } as GetPaymentSchedulesV1Model);

      const schedule = await service.handlePaymentSchedules({
        type: 'booking',
        id: 123456,
        customer_id: 123456,
        action: Action.PAYMENT_CART,
      });

      expect(api.getV1CustomersCustomerIdBookingsBookingIdPaymentSchedules).toHaveBeenCalledWith(
        '123456',
        '123456',
        { action: 'PAYMENT_CART' },
      );
      expect(schedule).toEqual([{ amount: 70, deadline: undefined, currency: 'EUR' }]);
    });

    it('upgrade room: should return the upgrade amount rather than the booking schedule', async () => {
      const service = await DITest.invoke(PaymentSchedulesService);

      vi.mocked(api.getV1CustomersCustomerIdBookingsBookingIdPaymentSchedules).mockResolvedValue({
        currency: 'USD',
        amount: 75,
        paid: 50,
        payment_schedules: [{ amount: 150, deadline: '2026-09-30' }],
        accommodations: [],
      } as GetPaymentSchedulesV1Model);

      const schedule = await service.handlePaymentSchedules({
        type: 'booking',
        id: 123456,
        customer_id: 123456,
        action: Action.PAYMENT_UPGRADE_ROOM,
      });

      expect(schedule).toEqual([{ amount: 75, deadline: undefined, currency: 'USD' }]);
    });

    it('services in option: should return the total as a single schedule line', async () => {
      const service = await DITest.invoke(PaymentSchedulesService);

      vi.mocked(api.getV1CustomersCustomerIdBookingsBookingIdPaymentSchedules).mockResolvedValue({
        currency: 'EUR',
        total: 80,
        paid: null,
        payment_schedules: [{ amount: 80, deadline: null }],
      } as GetPaymentSchedulesV1Model);

      const schedule = await service.handlePaymentSchedules({
        type: 'booking',
        id: 123456,
        customer_id: 123456,
        action: Action.PAYMENT_SERVICES_IN_OPTION,
      });

      expect(api.getV1CustomersCustomerIdBookingsBookingIdPaymentSchedules).toHaveBeenCalledWith(
        '123456',
        '123456',
        { action: 'PAYMENT_SERVICES_IN_OPTION' },
      );
      expect(schedule).toEqual([{ amount: 80, deadline: undefined, currency: 'EUR' }]);
    });

    it('services in option: should throw not found when the total is zero', async () => {
      const service = await DITest.invoke(PaymentSchedulesService);

      vi.mocked(api.getV1CustomersCustomerIdBookingsBookingIdPaymentSchedules).mockResolvedValue({
        currency: 'EUR',
        total: 0,
        paid: null,
        payment_schedules: [{ amount: 0, deadline: null }],
      } as GetPaymentSchedulesV1Model);

      await expect(
        service.handlePaymentSchedules({
          type: 'booking',
          id: 123456,
          customer_id: 123456,
          action: Action.PAYMENT_SERVICES_IN_OPTION,
        }),
      ).rejects.toThrow('No payment schedule found for id: 123456');
    });
  });
});
