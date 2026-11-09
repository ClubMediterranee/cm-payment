import { paymentScheduleQueryOptions } from '.';

vi.mock('../useActionResolver', () => ({ getResolvedAction: () => 'PAYMENT_CART' }));

describe('paymentScheduleQueryOptions', () => {
  it('builds a queryKey scoped to the customerId', () => {
    expect(paymentScheduleQueryOptions('BK1', 'booking', 'customer-1').queryKey).toEqual([
      'paymentSchedule',
      'BK1',
      'PAYMENT_CART',
      'customer-1',
    ]);
  });
});
