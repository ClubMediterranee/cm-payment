import { ACTION_RESOLVER_QUERY_KEY } from '.';
import { Action } from '../../../__generated__';
import { getCapsConfig } from '../../../providers/CapsConfigProvider';
import { sdkQueryClient } from '../../../providers/QueryClientProvider';
import { daysUntilToday, parseApiDate } from '../../../utils/formatDate';
import { paymentScheduleQueryOptions } from '../usePaymentSchedule';
import { checkFreeDepositAuthorization } from './checkFreeDepositAuthorization';

vi.mock('../../../providers/CapsConfigProvider', () => ({
  getCapsConfig: vi.fn(),
}));

vi.mock('../../../providers/QueryClientProvider', () => ({
  sdkQueryClient: {
    setQueryData: vi.fn(),
    fetchQuery: vi.fn(),
  },
}));

vi.mock('../../../utils/formatDate', () => ({
  parseApiDate: vi.fn(),
  daysUntilToday: vi.fn(),
}));

vi.mock('../usePaymentSchedule', () => ({
  paymentScheduleQueryOptions: vi.fn(),
}));

const mockGetCapsConfig = vi.mocked(getCapsConfig);
const mockSetQueryData = vi.mocked(sdkQueryClient.setQueryData);
const mockFetchQuery = vi.mocked(sdkQueryClient.fetchQuery);
const mockParseApiDate = vi.mocked(parseApiDate);
const mockDaysUntilToday = vi.mocked(daysUntilToday);
const mockPaymentScheduleQueryOptions = vi.mocked(paymentScheduleQueryOptions);

describe('checkFreeDepositAuthorization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCapsConfig.mockReturnValue({
      id: 'booking-123',
      type: 'booking',
      customerId: 'customer-456',
    } as any);
  });

  it('should return false when free deposit is disabled', async () => {
    const result = await checkFreeDepositAuthorization({
      freeDepositConfig: {
        enabled: false,
        daysBeforeTripToAllowFreeDeposit: 30,
      },
      resortArrivalDate: '20261231',
    });

    expect(result).toBe(false);
    expect(mockSetQueryData).not.toHaveBeenCalled();
    expect(mockParseApiDate).not.toHaveBeenCalled();
  });

  it('should return true when free deposit is authorized with configured days', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 60);

    mockParseApiDate.mockReturnValue(futureDate);
    mockDaysUntilToday.mockReturnValue(60);

    const result = await checkFreeDepositAuthorization({
      freeDepositConfig: {
        enabled: true,
        daysBeforeTripToAllowFreeDeposit: 30,
      },
      resortArrivalDate: '20261231',
    });

    expect(result).toBe(true);
    expect(mockSetQueryData).toHaveBeenCalledWith(
      ACTION_RESOLVER_QUERY_KEY('booking-123', 'booking'),
      Action.PAYMENT_PARTIAL,
    );
    expect(mockParseApiDate).toHaveBeenCalledWith('20261231');
    expect(mockDaysUntilToday).toHaveBeenCalledWith(futureDate);
  });

  it('should return false when deadline is too close', async () => {
    const nearDate = new Date();
    nearDate.setDate(nearDate.getDate() + 20);

    mockParseApiDate.mockReturnValue(nearDate);
    mockDaysUntilToday.mockReturnValue(20);

    const result = await checkFreeDepositAuthorization({
      freeDepositConfig: {
        enabled: true,
        daysBeforeTripToAllowFreeDeposit: 30,
      },
      resortArrivalDate: '20260115',
    });

    expect(result).toBe(false);
  });

  it('should use payment schedule deadline when daysBeforeTripToAllowFreeDeposit is null', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 45);

    const mockPaymentSchedule = [
      { deadline: '20260215', amount: 1000 },
      { deadline: '20260315', amount: 2000 },
    ];

    const mockQueryOptions = {
      queryKey: ['paymentSchedule', 'booking-123'],
      queryFn: vi.fn(),
      select: vi.fn(() => mockPaymentSchedule),
    };

    mockPaymentScheduleQueryOptions.mockReturnValue(mockQueryOptions as any);
    mockFetchQuery.mockResolvedValue(mockPaymentSchedule as any);
    mockParseApiDate.mockReturnValue(futureDate);
    mockDaysUntilToday.mockReturnValue(45);

    const result = await checkFreeDepositAuthorization({
      freeDepositConfig: {
        enabled: true,
        daysBeforeTripToAllowFreeDeposit: null,
      },
      resortArrivalDate: '20261231',
    });

    expect(result).toBe(true);
    expect(mockPaymentScheduleQueryOptions).toHaveBeenCalledWith('booking-123');
    expect(mockFetchQuery).toHaveBeenCalledWith({
      queryKey: mockQueryOptions.queryKey,
      queryFn: mockQueryOptions.queryFn,
    });
    expect(mockParseApiDate).toHaveBeenCalledWith('20260215');
  });

  it('should return false when parseApiDate returns null', async () => {
    mockParseApiDate.mockReturnValue(null);

    const result = await checkFreeDepositAuthorization({
      freeDepositConfig: {
        enabled: true,
        daysBeforeTripToAllowFreeDeposit: 30,
      },
      resortArrivalDate: 'invalid-date',
    });

    expect(result).toBeFalsy();
    expect(mockDaysUntilToday).not.toHaveBeenCalled();
  });

  it('should return false when daysUntilToday equals exactly daysBeforeTripToAllowFreeDeposit', async () => {
    const exactDate = new Date();
    exactDate.setDate(exactDate.getDate() + 30);

    mockParseApiDate.mockReturnValue(exactDate);
    mockDaysUntilToday.mockReturnValue(30);

    const result = await checkFreeDepositAuthorization({
      freeDepositConfig: {
        enabled: true,
        daysBeforeTripToAllowFreeDeposit: 30,
      },
      resortArrivalDate: '20260201',
    });

    expect(result).toBe(false);
  });

  it('should handle undefined resortArrivalDate when daysBeforeTripToAllowFreeDeposit is null', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 50);

    const mockPaymentSchedule = [{ deadline: '20260301', amount: 1000 }];

    const mockQueryOptions = {
      queryKey: ['paymentSchedule', 'booking-123'],
      queryFn: vi.fn(),
      select: vi.fn(() => mockPaymentSchedule),
    };

    mockPaymentScheduleQueryOptions.mockReturnValue(mockQueryOptions as any);
    mockFetchQuery.mockResolvedValue(mockPaymentSchedule as any);
    mockParseApiDate.mockReturnValue(futureDate);
    mockDaysUntilToday.mockReturnValue(50);

    const result = await checkFreeDepositAuthorization({
      freeDepositConfig: {
        enabled: true,
        daysBeforeTripToAllowFreeDeposit: null,
      },
    });

    expect(result).toBe(true);
    expect(mockParseApiDate).toHaveBeenCalledWith('20260301');
  });

  it('should use daysBeforeTripToAllowFreeDeposit as 0 when it is null but not fetching payment schedule', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);

    mockParseApiDate.mockReturnValue(futureDate);
    mockDaysUntilToday.mockReturnValue(1);

    const result = await checkFreeDepositAuthorization({
      freeDepositConfig: {
        enabled: true,
        daysBeforeTripToAllowFreeDeposit: 0,
      },
      resortArrivalDate: '20260103',
    });

    expect(result).toBe(true);
  });
});
