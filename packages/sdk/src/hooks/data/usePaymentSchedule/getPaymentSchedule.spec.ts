import {
  getV0CustomersCustomerIdBookingsBookingIdPaymentSchedules,
  getV1ProposalsProposalIdPaymentSchedule,
} from '../../../__generated__';
import { getPaymentSchedule } from './getPaymentSchedule';

vi.mock('../../../utils/fetcher', () => ({
  fetcher: vi.fn(),
}));

// Mock les vraies fonctions
vi.mock('../../../__generated__', () => ({
  getV0CustomersCustomerIdBookingsBookingIdPaymentSchedules: vi.fn(),
  getV1ProposalsProposalIdPaymentSchedule: vi.fn(),
}));

const mockGetV0 = vi.mocked(getV0CustomersCustomerIdBookingsBookingIdPaymentSchedules);
const mockGetV1 = vi.mocked(getV1ProposalsProposalIdPaymentSchedule);

describe('getPaymentSchedule', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should call V0 API when bookingId is provided', () => {
    const params = {
      bookingId: 'booking-123',
      customerId: 'customer-456',
      proposalId: 'proposal-789',
    };

    getPaymentSchedule(params);

    expect(mockGetV0).toHaveBeenCalledWith('customer-456', 'booking-123', { withAuth: true });
    expect(mockGetV1).not.toHaveBeenCalled();
  });

  it('should call V1 API when only proposalId is provided', () => {
    const params = {
      proposalId: 'proposal-789',
      customerId: 'customer-456',
    };

    getPaymentSchedule(params);

    expect(mockGetV1).toHaveBeenCalledWith('proposal-789');
    expect(mockGetV0).not.toHaveBeenCalled();
  });

  it('should prioritize bookingId over proposalId when both are provided', () => {
    const params = {
      bookingId: 'booking-123',
      proposalId: 'proposal-789',
      customerId: 'customer-456',
    };

    getPaymentSchedule(params);

    expect(mockGetV0).toHaveBeenCalledWith('customer-456', 'booking-123', { withAuth: true });
    expect(mockGetV1).not.toHaveBeenCalled();
  });

  it('should throw error when neither bookingId nor proposalId is provided', () => {
    const params = {
      customerId: 'customer-456',
    };

    expect(() => getPaymentSchedule(params)).toThrow(
      'Either bookingId or proposalId must be provided',
    );
    expect(mockGetV0).not.toHaveBeenCalled();
    expect(mockGetV1).not.toHaveBeenCalled();
  });

  it('should throw error when proposalId is empty string', () => {
    const params = {
      proposalId: '',
      customerId: 'customer-456',
    };

    expect(() => getPaymentSchedule(params)).toThrow(
      'Either bookingId or proposalId must be provided',
    );
    expect(mockGetV0).not.toHaveBeenCalled();
    expect(mockGetV1).not.toHaveBeenCalled();
  });

  it('should return data from V0 API with mock', async () => {
    const mockData = { currency: 'EUR', total: 1000 };
    mockGetV0.mockResolvedValue(mockData);

    const params = {
      bookingId: 'booking-123',
      customerId: 'customer-456',
    };

    const result = await getPaymentSchedule(params);

    expect(result).toBeDefined();
    expect(result).toEqual(mockData);
    expect(mockGetV0).toHaveBeenCalledWith('customer-456', 'booking-123', { withAuth: true });
  });

  it('should return data from V1 API with mock', async () => {
    const mockData = { currency: 'EUR', households: [{ total: 500 }] };
    mockGetV1.mockResolvedValue(mockData);

    const params = {
      proposalId: 'proposal-789',
      customerId: 'customer-456',
    };

    const result = await getPaymentSchedule(params);

    expect(result).toBeDefined();
    expect(result).toEqual(mockData);
    expect(mockGetV1).toHaveBeenCalledWith('proposal-789');
  });
});
