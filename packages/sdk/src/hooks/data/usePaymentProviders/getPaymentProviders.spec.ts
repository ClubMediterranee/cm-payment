import { getV1PaymentProviders } from '../../../__generated__';
import { sdkQueryClient } from '../../../providers/QueryClientProvider';
import { PaymentConfig } from '../../../types/PaymentConfig';
import { PspProviders } from '../../../types/PspProviders';
import { getPaymentProviders } from './getPaymentProviders';

vi.mock('../../../__generated__', () => ({
  getV1PaymentProviders: vi.fn(),
}));

vi.mock('../../../providers/QueryClientProvider', () => ({
  sdkQueryClient: {
    fetchQuery: vi.fn(),
  },
}));

vi.mock('../useStay', () => ({
  stayQueryOptions: vi.fn((params) => ({
    queryKey: ['stay', params.type, params.id, params.customerId],
    queryFn: vi.fn(),
  })),
}));

const mockGetV1PaymentProviders = vi.mocked(getV1PaymentProviders);
const mockFetchQuery = vi.mocked(sdkQueryClient.fetchQuery);

describe('getPaymentProviders', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockProviderConfig: PaymentConfig['providers'] = {
    [PspProviders.EVOXPAY]: {
      is_active: true,
      display_type: 'redirect',
      settings: {
        max_amount: null,
        min_days_before_departure: null,
      },
    },
    [PspProviders.MHIPAY]: {
      is_active: true,
      display_type: 'hosted_field',
      settings: {
        max_amount: null,
        min_days_before_departure: null,
      },
    },
  };

  it('should return payment providers with configuration', async () => {
    mockGetV1PaymentProviders.mockResolvedValue([
      { id: PspProviders.EVOXPAY, name: 'Evoxpay' } as any,
      { id: PspProviders.MHIPAY, name: 'Hipay' } as any,
    ]);

    const result = await getPaymentProviders({
      providerConfig: mockProviderConfig,
      id: 'booking-123',
      type: 'booking',
    });

    expect(result).toHaveLength(2);
    expect(result[0]).toHaveProperty('id', PspProviders.EVOXPAY);
    expect(result[0]).toHaveProperty('configuration');
    expect(result[0].configuration).toEqual(mockProviderConfig[PspProviders.EVOXPAY]);
  });

  it('should filter out inactive providers', async () => {
    mockGetV1PaymentProviders.mockResolvedValue([
      { id: PspProviders.EVOXPAY, name: 'Evoxpay' } as any,
      { id: PspProviders.HIPAY, name: 'Hipay' } as any,
    ]);

    const configWithInactive: PaymentConfig['providers'] = {
      [PspProviders.EVOXPAY]: {
        is_active: true,
        display_type: 'redirect',
        settings: {},
      },
      [PspProviders.HIPAY]: {
        is_active: false,
        display_type: 'hosted_field',
        settings: {},
      },
    };

    const result = await getPaymentProviders({
      providerConfig: configWithInactive,
      id: 'booking-123',
      type: 'booking',
    });

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(PspProviders.EVOXPAY);
  });

  it('should fetch stay when min_days_before_departure is set', async () => {
    mockGetV1PaymentProviders.mockResolvedValue([
      { id: PspProviders.EHIPAYBNPL, name: 'Oney' } as any,
    ]);

    mockFetchQuery.mockResolvedValue({
      resortArrivalDate: '20261201',
    } as any);

    const configWithMinDays: PaymentConfig['providers'] = {
      [PspProviders.EHIPAYBNPL]: {
        is_active: true,
        display_type: 'redirect',
        settings: {
          min_days_before_departure: '30',
        },
      },
    };

    await getPaymentProviders({
      providerConfig: configWithMinDays,
      id: 'booking-123',
      type: 'booking',
    });

    expect(mockFetchQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ['stay', 'booking', 'booking-123', undefined],
      }),
    );
  });

  it('should not fetch stay when no provider has min_days_before_departure', async () => {
    mockGetV1PaymentProviders.mockResolvedValue([
      { id: PspProviders.EVOXPAY, name: 'Evoxpay' } as any,
    ]);

    await getPaymentProviders({
      providerConfig: mockProviderConfig,
      id: 'booking-123',
      type: 'booking',
    });

    expect(mockFetchQuery).not.toHaveBeenCalled();
  });

  it('should filter providers based on min_days_before_departure', async () => {
    mockGetV1PaymentProviders.mockResolvedValue([
      { id: PspProviders.EHIPAYBNPL, name: 'Oney' } as any,
    ]);

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 25);

    const formattedDate = futureDate.toISOString().split('T')[0].replace(/-/g, '');

    mockFetchQuery.mockResolvedValue({
      resortArrivalDate: formattedDate,
    } as any);

    const configWithMinDays: PaymentConfig['providers'] = {
      [PspProviders.EHIPAYBNPL]: {
        is_active: true,
        display_type: 'redirect',
        settings: {
          min_days_before_departure: '30',
        },
      },
    };

    const result = await getPaymentProviders({
      providerConfig: configWithMinDays,
      id: 'booking-123',
      type: 'booking',
    });

    expect(result).toHaveLength(1);
  });

  it('should handle proposal type', async () => {
    mockGetV1PaymentProviders.mockResolvedValue([
      { id: PspProviders.EVOXPAY, name: 'Evoxpay' } as any,
    ]);

    const result = await getPaymentProviders({
      providerConfig: mockProviderConfig,
      id: 'proposal-456',
      type: 'proposal',
    });

    expect(result).toHaveLength(1);
  });

  it('should pass customerId to fetchQuery when provided', async () => {
    mockGetV1PaymentProviders.mockResolvedValue([
      { id: PspProviders.EHIPAYBNPL, name: 'Oney' } as any,
    ]);

    mockFetchQuery.mockResolvedValue({
      resortArrivalDate: '20261201',
    } as any);

    const configWithMinDays: PaymentConfig['providers'] = {
      [PspProviders.EHIPAYBNPL]: {
        is_active: true,
        display_type: 'redirect',
        settings: {
          min_days_before_departure: '30',
        },
      },
    };

    await getPaymentProviders({
      providerConfig: configWithMinDays,
      id: 'booking-123',
      type: 'booking',
      customerId: 'customer-789',
    });

    expect(mockFetchQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ['stay', 'booking', 'booking-123', 'customer-789'],
      }),
    );
  });
});
