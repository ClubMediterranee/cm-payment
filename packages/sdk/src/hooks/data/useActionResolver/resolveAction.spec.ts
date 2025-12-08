import {
  Action,
  BookingStatus,
  getV3CustomersCustomerIdBookingsBookingId,
} from '../../../__generated__';
import { getCapsConfig } from '../../../providers/CapsConfigProvider';
import { resolveAction } from './resolveAction';

vi.mock('../../../providers/CapsConfigProvider', () => ({
  getCapsConfig: vi.fn(),
}));

vi.mock('../../../utils/paymentConfig', () => ({
  hasFlip: vi.fn(),
}));

vi.mock('../../../__generated__', async () => {
  const actual = await vi.importActual('../../../__generated__');
  return {
    ...actual,
    getV3CustomersCustomerIdBookingsBookingId: vi.fn(),
  };
});

const mockGetCapsConfig = vi.mocked(getCapsConfig);
const mockGetBooking = vi.mocked(getV3CustomersCustomerIdBookingsBookingId);

describe('resolveAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return PAYMENT_RESA when type is proposal', async () => {
    mockGetCapsConfig.mockReturnValue({
      type: 'proposal',
      id: 'proposal-123',
      customerId: 'customer-123',
    } as any);

    const result = await resolveAction({ freeDepositConfig: {} as any });

    expect(result).toBe(Action.PAYMENT_RESA);
    expect(mockGetBooking).not.toHaveBeenCalled();
  });

  it('should return PAYMENT_OPTION when booking status is OPTION', async () => {
    mockGetCapsConfig.mockReturnValue({
      type: 'booking',
      id: 'booking-123',
      customerId: 'customer-456',
    } as any);
    mockGetBooking.mockResolvedValue({
      booking_status: BookingStatus.OPTION,
    } as any);

    const result = await resolveAction({ freeDepositConfig: {} as any });

    expect(result).toBe(Action.PAYMENT_OPTION);
    expect(mockGetBooking).toHaveBeenCalledWith('customer-456', 'booking-123');
  });

  it('should return PAYMENT_OPTION when booking status is EXPIRED', async () => {
    mockGetCapsConfig.mockReturnValue({
      type: 'booking',
      id: 'booking-123',
      customerId: 'customer-456',
    } as any);
    mockGetBooking.mockResolvedValue({
      booking_status: BookingStatus.EXPIRED,
    } as any);

    const result = await resolveAction({ action: undefined, freeDepositConfig: {} as any });

    expect(result).toBe(Action.PAYMENT_OPTION);
  });

  it('should return PAYMENT_PARTIAL when action is PAYMENT_PARTIAL and flip is enabled', async () => {
    mockGetCapsConfig.mockReturnValue({
      type: 'booking',
      id: 'booking-123',
      customerId: 'customer-456',
    } as any);
    mockGetBooking.mockResolvedValue({
      booking_status: BookingStatus.VALIDATED,
      stays: [{ resort_arrival_date: '20261231' }],
    } as any);

    const result = await resolveAction({
      action: Action.PAYMENT_PARTIAL,
      freeDepositConfig: {
        enabled: true,
        daysBeforeTripToAllowFreeDeposit: 30,
      },
    });

    expect(result).toBe(Action.PAYMENT_PARTIAL);
  });

  it('should return PAYMENT_SOLDE when action is PAYMENT_PARTIAL but flip is disabled', async () => {
    mockGetCapsConfig.mockReturnValue({
      type: 'booking',
      id: 'booking-123',
      customerId: 'customer-456',
    } as any);
    mockGetBooking.mockResolvedValue({
      booking_status: BookingStatus.VALIDATED,
    } as any);

    const result = await resolveAction({
      action: Action.PAYMENT_PARTIAL,
      freeDepositConfig: {
        enabled: false,
        daysBeforeTripToAllowFreeDeposit: null,
      },
    });

    expect(result).toBe(Action.PAYMENT_SOLDE);
  });

  it('should return provided action when valid and not PAYMENT_PARTIAL', async () => {
    mockGetCapsConfig.mockReturnValue({
      type: 'booking',
      id: 'booking-123',
      customerId: 'customer-456',
    } as any);
    mockGetBooking.mockResolvedValue({
      booking_status: BookingStatus.VALIDATED,
    } as any);

    const result = await resolveAction({
      action: Action.PAYMENT_CART,
      freeDepositConfig: {} as any,
    });

    expect(result).toBe(Action.PAYMENT_CART);
  });

  it('should return PAYMENT_SOLDE when no action provided', async () => {
    mockGetCapsConfig.mockReturnValue({
      type: 'booking',
      id: 'booking-123',
      customerId: 'customer-456',
    } as any);
    mockGetBooking.mockResolvedValue({
      booking_status: BookingStatus.VALIDATED,
    } as any);

    const result = await resolveAction({ freeDepositConfig: {} as any });

    expect(result).toBe(Action.PAYMENT_SOLDE);
  });

  it('should throw error when API call fails', async () => {
    mockGetCapsConfig.mockReturnValue({
      type: 'booking',
      id: 'booking-123',
      customerId: 'customer-456',
    } as any);

    const apiError = new Error('API Error');
    mockGetBooking.mockRejectedValue(apiError);

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await expect(resolveAction({ freeDepositConfig: {} as any })).rejects.toThrow('API Error');

    expect(consoleSpy).toHaveBeenCalledWith('Failed to resolve booking action:', apiError);

    consoleSpy.mockRestore();
  });
});
