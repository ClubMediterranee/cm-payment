import { DITest } from '@tsed/di';

import * as api from '../../infra/api/__generated__/index.js';
import { Action, BookingStatus } from '../../infra/api/__generated__/index.js';
import { PaymentConfigService } from '../payment_config/PaymentConfigService.js';
import { OidcIssuerTypes } from '../payment_config/types.js';
import { PaymentSchedulesService } from '../payment_schedules/PaymentSchedulesService.js';
import { ActionResolverService } from './ActionResolverService.js';

vi.mock('../../infra/api/__generated__/index.js', async (importOriginal) => ({
  ...(await importOriginal()),
  getV3CustomersCustomerIdBookingsBookingId: vi.fn(),
  getV0CustomersCustomerIdBookingsBookingIdPaymentSchedules: vi.fn(),
  getV1CustomersCustomerIdBookingsBookingIdCart: vi.fn(),
  getV0CustomersCustomerIdBookingsBookingIdCartAccommodations: vi.fn(),
  getV1ProposalsProposalIdPaymentSchedule: vi.fn(),
}));

const buildPaymentConfig = (
  days: number | null = 30,
): Awaited<ReturnType<PaymentConfigService['getPaymentConfig']>> => ({
  feature_flips: {},
  settings: { days_before_trip_to_allow_free_deposit: days },
});

describe('ActionResolverService', () => {
  const baseParams = {
    locale: 'fr-FR',
    issuerType: OidcIssuerTypes.GM,
  } as const;

  afterEach(async () => {
    await DITest.reset();
    vi.clearAllMocks();
  });

  it('throws when id is missing', async () => {
    const service = await DITest.invoke<ActionResolverService>(ActionResolverService, []);

    await expect(
      service.resolveAction({ ...baseParams, type: 'booking', id: '', customerId: 'c-1' }),
    ).rejects.toThrow('id is required');
  });

  it('returns PAYMENT_RESA for a proposal', async () => {
    const service = await DITest.invoke<ActionResolverService>(ActionResolverService, []);

    const result = await service.resolveAction({
      ...baseParams,
      type: 'proposal',
      id: 'proposal-1',
    });

    expect(result).toBe(Action.PAYMENT_RESA);
    expect(api.getV3CustomersCustomerIdBookingsBookingId).not.toHaveBeenCalled();
  });

  it('throws for a booking when customerId is missing', async () => {
    const service = await DITest.invoke<ActionResolverService>(ActionResolverService, []);

    await expect(
      service.resolveAction({ ...baseParams, type: 'booking', id: 'b-1' }),
    ).rejects.toThrow('customer id is required');
  });

  it('returns PAYMENT_OPTION when booking_status is OPTION', async () => {
    vi.mocked(api.getV3CustomersCustomerIdBookingsBookingId).mockResolvedValue({
      booking_status: BookingStatus.OPTION,
    } as any);
    const service = await DITest.invoke<ActionResolverService>(ActionResolverService, []);

    const result = await service.resolveAction({
      ...baseParams,
      type: 'booking',
      id: 'b-1',
      customerId: 'c-1',
    });

    expect(result).toBe(Action.PAYMENT_OPTION);
    expect(api.getV3CustomersCustomerIdBookingsBookingId).toHaveBeenCalledWith('c-1', 'b-1');
  });

  it('returns PAYMENT_OPTION when booking_status is EXPIRED', async () => {
    vi.mocked(api.getV3CustomersCustomerIdBookingsBookingId).mockResolvedValue({
      booking_status: BookingStatus.EXPIRED,
    } as any);
    const service = await DITest.invoke<ActionResolverService>(ActionResolverService, []);

    const result = await service.resolveAction({
      ...baseParams,
      type: 'booking',
      id: 'b-1',
      customerId: 'c-1',
    });

    expect(result).toBe(Action.PAYMENT_OPTION);
  });

  it('returns PAYMENT_SOLDE when no action provided on a VALIDATED booking', async () => {
    vi.mocked(api.getV3CustomersCustomerIdBookingsBookingId).mockResolvedValue({
      booking_status: BookingStatus.VALIDATED,
    } as any);
    const service = await DITest.invoke<ActionResolverService>(ActionResolverService, []);

    const result = await service.resolveAction({
      ...baseParams,
      type: 'booking',
      id: 'b-1',
      customerId: 'c-1',
    });

    expect(result).toBe(Action.PAYMENT_SOLDE);
  });

  it('returns the provided action when valid and not PAYMENT_PARTIAL', async () => {
    vi.mocked(api.getV3CustomersCustomerIdBookingsBookingId).mockResolvedValue({
      booking_status: BookingStatus.VALIDATED,
    } as any);
    const service = await DITest.invoke<ActionResolverService>(ActionResolverService, []);

    const result = await service.resolveAction({
      ...baseParams,
      type: 'booking',
      id: 'b-1',
      customerId: 'c-1',
      action: Action.PAYMENT_CART,
    });

    expect(result).toBe(Action.PAYMENT_CART);
  });

  it('returns PAYMENT_PARTIAL when free deposit allowed via configured days', async () => {
    const arrival = new Date();
    arrival.setDate(arrival.getDate() + 60);
    const arrivalApi =
      `${arrival.getFullYear()}` +
      String(arrival.getMonth() + 1).padStart(2, '0') +
      String(arrival.getDate()).padStart(2, '0');

    vi.mocked(api.getV3CustomersCustomerIdBookingsBookingId).mockResolvedValue({
      booking_status: BookingStatus.VALIDATED,
      stays: [{ resort_arrival_date: arrivalApi }],
    } as any);
    const paymentConfigService = {
      getPaymentConfig: vi.fn().mockResolvedValue(buildPaymentConfig(30)),
    };
    const service = await DITest.invoke<ActionResolverService>(ActionResolverService, [
      { token: PaymentConfigService, use: paymentConfigService },
    ]);

    const result = await service.resolveAction({
      ...baseParams,
      type: 'booking',
      id: 'b-1',
      customerId: 'c-1',
      action: Action.PAYMENT_PARTIAL,
    });

    expect(result).toBe(Action.PAYMENT_PARTIAL);
  });

  it('returns PAYMENT_SOLDE when arrival is too close vs days_before_trip', async () => {
    const arrival = new Date();
    arrival.setDate(arrival.getDate() + 20);
    const arrivalApi =
      `${arrival.getFullYear()}` +
      String(arrival.getMonth() + 1).padStart(2, '0') +
      String(arrival.getDate()).padStart(2, '0');

    vi.mocked(api.getV3CustomersCustomerIdBookingsBookingId).mockResolvedValue({
      booking_status: BookingStatus.VALIDATED,
      stays: [{ resort_arrival_date: arrivalApi }],
    } as any);
    const paymentConfigService = {
      getPaymentConfig: vi.fn().mockResolvedValue(buildPaymentConfig(30)),
    };
    const service = await DITest.invoke<ActionResolverService>(ActionResolverService, [
      { token: PaymentConfigService, use: paymentConfigService },
    ]);

    const result = await service.resolveAction({
      ...baseParams,
      type: 'booking',
      id: 'b-1',
      customerId: 'c-1',
      action: Action.PAYMENT_PARTIAL,
    });

    expect(result).toBe(Action.PAYMENT_SOLDE);
  });

  it('falls back to payment schedule deadline when days_before_trip is null', async () => {
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 45);
    const deadlineApi =
      `${deadline.getFullYear()}` +
      String(deadline.getMonth() + 1).padStart(2, '0') +
      String(deadline.getDate()).padStart(2, '0');

    vi.mocked(api.getV3CustomersCustomerIdBookingsBookingId).mockResolvedValue({
      booking_status: BookingStatus.VALIDATED,
      stays: [{ resort_arrival_date: '20991231' }],
    } as any);
    const paymentConfigService = {
      getPaymentConfig: vi.fn().mockResolvedValue(buildPaymentConfig(null)),
    };
    const paymentSchedulesService = {
      handlePaymentSchedules: vi.fn().mockResolvedValue([{ deadline: deadlineApi }]),
    };
    const service = await DITest.invoke<ActionResolverService>(ActionResolverService, [
      { token: PaymentConfigService, use: paymentConfigService },
      { token: PaymentSchedulesService, use: paymentSchedulesService },
    ]);

    const result = await service.resolveAction({
      ...baseParams,
      type: 'booking',
      id: 'b-1',
      customerId: 'c-1',
      action: Action.PAYMENT_PARTIAL,
    });

    expect(result).toBe(Action.PAYMENT_PARTIAL);
    expect(paymentSchedulesService.handlePaymentSchedules).toHaveBeenCalledWith({
      type: 'booking',
      id: 'b-1',
      customer_id: 'c-1',
      action: Action.PAYMENT_PARTIAL,
    });
  });

  it('falls back to payment schedule deadline when days_before_trip is the no-limit sentinel (999)', async () => {
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 10);
    const deadlineApi =
      `${deadline.getFullYear()}` +
      String(deadline.getMonth() + 1).padStart(2, '0') +
      String(deadline.getDate()).padStart(2, '0');

    vi.mocked(api.getV3CustomersCustomerIdBookingsBookingId).mockResolvedValue({
      booking_status: BookingStatus.VALIDATED,
      stays: [{ resort_arrival_date: '20991231' }],
    } as any);
    const paymentConfigService = {
      getPaymentConfig: vi.fn().mockResolvedValue(buildPaymentConfig(999)),
    };
    const paymentSchedulesService = {
      handlePaymentSchedules: vi.fn().mockResolvedValue([{ deadline: deadlineApi }]),
    };
    const service = await DITest.invoke<ActionResolverService>(ActionResolverService, [
      { token: PaymentConfigService, use: paymentConfigService },
      { token: PaymentSchedulesService, use: paymentSchedulesService },
    ]);

    const result = await service.resolveAction({
      ...baseParams,
      type: 'booking',
      id: 'b-1',
      customerId: 'c-1',
      action: Action.PAYMENT_PARTIAL,
    });

    expect(result).toBe(Action.PAYMENT_PARTIAL);
    expect(paymentSchedulesService.handlePaymentSchedules).toHaveBeenCalled();
  });

  it('returns PAYMENT_SOLDE when deadline cannot be parsed', async () => {
    vi.mocked(api.getV3CustomersCustomerIdBookingsBookingId).mockResolvedValue({
      booking_status: BookingStatus.VALIDATED,
      stays: [{ resort_arrival_date: 'not-a-date' }],
    } as any);
    const paymentConfigService = {
      getPaymentConfig: vi.fn().mockResolvedValue(buildPaymentConfig(30)),
    };
    const service = await DITest.invoke<ActionResolverService>(ActionResolverService, [
      { token: PaymentConfigService, use: paymentConfigService },
    ]);

    const result = await service.resolveAction({
      ...baseParams,
      type: 'booking',
      id: 'b-1',
      customerId: 'c-1',
      action: Action.PAYMENT_PARTIAL,
    });

    expect(result).toBe(Action.PAYMENT_SOLDE);
  });
});
