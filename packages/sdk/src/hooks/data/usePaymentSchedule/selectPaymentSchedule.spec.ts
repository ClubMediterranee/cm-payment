import {
  getGetV0CustomersCustomerIdBookingsBookingIdPaymentSchedulesResponseMock,
  getGetV1ProposalsProposalIdPaymentScheduleResponseMock,
} from '../../../__generated__';
import { selectPaymentSchedule } from './selectPaymentSchedule';

vi.mock('../../../utils/fetcher', () => ({
  fetcher: vi.fn(),
}));

describe('selectPaymentSchedule', () => {
  it('should return empty array when no payment schedules', () => {
    const data = {
      currency: 'EUR',
      total: 500,
      payment_schedules: [],
    };

    const result = selectPaymentSchedule(data);
    expect(result).toEqual([]);
  });

  it('should return first payment when 1 payment schedule', () => {
    const data = {
      currency: 'EUR',
      total: 800,
      payment_schedules: [{ amount: 800, deadline: '2024-01-15' }],
    };

    const result = selectPaymentSchedule(data);
    expect(result).toEqual([{ amount: 800, currency: 'EUR' }]);
  });

  it('should return first payment for proposal with 1 deposit payment', () => {
    const data = {
      currency: 'EUR',
      households: [
        {
          total: 1200,
          deposit_repayment_schedule: [{ expected_payment_amount: 1200, deadline: '2024-01-15' }],
        },
      ],
    };

    const result = selectPaymentSchedule(data);
    expect(result).toEqual([{ amount: 1200, currency: 'EUR' }]);
  });

  it('should return total + first payment when exactly 2 payment schedules', () => {
    const data = getGetV0CustomersCustomerIdBookingsBookingIdPaymentSchedulesResponseMock({
      currency: 'EUR',
      total: 1000,
      payment_schedules: [
        { amount: 600, deadline: '2024-01-15' },
        { amount: 400, deadline: '2024-02-15' },
      ],
    });

    const result = selectPaymentSchedule(data);
    expect(result).toEqual([
      { amount: 1000, currency: 'EUR' },
      { amount: 600, currency: 'EUR', deadline: '2024-01-15' },
    ]);
  });

  it('should return total + first payment for proposal with 2 deposit payments', () => {
    const data = getGetV1ProposalsProposalIdPaymentScheduleResponseMock({
      currency: 'EUR',
      households: [
        {
          total: 1500,
          deposit_repayment_schedule: [
            { expected_payment_amount: 750, deadline: '2024-01-15' },
            { expected_payment_amount: 750, deadline: '2024-02-15' },
          ],
        },
      ],
    });

    const result = selectPaymentSchedule(data);
    expect(result).toEqual([
      { amount: 1500, currency: 'EUR' },
      { amount: 750, currency: 'EUR', deadline: '2024-01-15' },
    ]);
  });

  it('should return single payment for cart upgrade room', () => {
    const data = {
      price: { amount: 250, currency: 'EUR' },
      accommodations: [],
    };

    const result = selectPaymentSchedule(data);
    expect(result).toEqual([{ amount: 250, currency: 'EUR' }]);
  });

  // Test cas > 2 paiements
  it('should return total + first payment when more than 2 payment schedules', () => {
    const data = getGetV0CustomersCustomerIdBookingsBookingIdPaymentSchedulesResponseMock({
      currency: 'EUR',
      total: 1500,
      payment_schedules: [
        { amount: 500, deadline: '2024-01-15' },
        { amount: 500, deadline: '2024-02-15' },
        { amount: 500, deadline: '2024-03-15' },
      ],
    });

    const result = selectPaymentSchedule(data);
    expect(result).toEqual([
      { amount: 1500, currency: 'EUR' },
      { amount: 500, currency: 'EUR', deadline: '2024-01-15' },
    ]);
  });
});
