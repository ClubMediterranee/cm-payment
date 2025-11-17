import {
  Action,
  getV0CustomersCustomerIdBookingsBookingIdCartAccommodations,
  getV0CustomersCustomerIdBookingsBookingIdCartPaymentSchedule,
  getV0CustomersCustomerIdBookingsBookingIdPaymentSchedules,
  getV1ProposalsProposalIdPaymentSchedule,
} from '../../../__generated__';
import { getCapsConfig } from '../../../providers/CapsConfigProvider';
import { getResolvedAction } from '../useActionResolver';
import { getPaymentSchedule } from './getPaymentSchedule';

vi.mock('../../../providers/CapsConfigProvider', () => ({
  getCapsConfig: vi.fn(),
}));

vi.mock('../useActionResolver', () => ({
  getResolvedAction: vi.fn(),
}));

vi.mock('../../../__generated__', async () => {
  const actual = await vi.importActual('../../../__generated__');
  return {
    ...actual,
    getV0CustomersCustomerIdBookingsBookingIdPaymentSchedules: vi.fn(),
    getV1ProposalsProposalIdPaymentSchedule: vi.fn(),
    getV0CustomersCustomerIdBookingsBookingIdCartAccommodations: vi.fn(),
    getV0CustomersCustomerIdBookingsBookingIdCartPaymentSchedule: vi.fn(),
  };
});

const mockGetV0 = vi.mocked(getV0CustomersCustomerIdBookingsBookingIdPaymentSchedules);
const mockGetV1 = vi.mocked(getV1ProposalsProposalIdPaymentSchedule);
const mockGetCartPaymentSchedule = vi.mocked(
  getV0CustomersCustomerIdBookingsBookingIdCartPaymentSchedule,
);
const mockGetCartAccommodations = vi.mocked(
  getV0CustomersCustomerIdBookingsBookingIdCartAccommodations,
);
const mockGetCapsConfig = vi.mocked(getCapsConfig);
const mockGetResolvedAction = vi.mocked(getResolvedAction);

describe('getPaymentSchedule', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should call V1 API when type is proposal', () => {
    mockGetCapsConfig.mockReturnValue({
      type: 'proposal',
      id: 'proposal-789',
      customerId: 'customer-456',
    });

    getPaymentSchedule();

    expect(mockGetV1).toHaveBeenCalledWith('proposal-789');
    expect(mockGetV0).not.toHaveBeenCalled();
    expect(mockGetCartPaymentSchedule).not.toHaveBeenCalled();
    expect(mockGetCartAccommodations).not.toHaveBeenCalled();
  });

  it('should call V0 API for PAYMENT_OPTION action', () => {
    mockGetCapsConfig.mockReturnValue({
      type: 'booking',
      id: 'booking-123',
      customerId: 'customer-456',
    });
    mockGetResolvedAction.mockReturnValue(Action.PAYMENT_OPTION);

    getPaymentSchedule();

    expect(mockGetV0).toHaveBeenCalledWith('customer-456', 'booking-123');
    expect(mockGetV1).not.toHaveBeenCalled();
    expect(mockGetCartPaymentSchedule).not.toHaveBeenCalled();
    expect(mockGetCartAccommodations).not.toHaveBeenCalled();
  });

  it('should call V0 API for PAYMENT_SOLDE action', () => {
    mockGetCapsConfig.mockReturnValue({
      type: 'booking',
      id: 'booking-123',
      customerId: 'customer-456',
    });
    mockGetResolvedAction.mockReturnValue(Action.PAYMENT_SOLDE);

    getPaymentSchedule();

    expect(mockGetV0).toHaveBeenCalledWith('customer-456', 'booking-123');
    expect(mockGetV1).not.toHaveBeenCalled();
  });

  it('should call V0 API for PAYMENT_PARTIAL action', () => {
    mockGetCapsConfig.mockReturnValue({
      type: 'booking',
      id: 'booking-123',
      customerId: 'customer-456',
    });
    mockGetResolvedAction.mockReturnValue(Action.PAYMENT_PARTIAL);

    getPaymentSchedule();

    expect(mockGetV0).toHaveBeenCalledWith('customer-456', 'booking-123');
    expect(mockGetV1).not.toHaveBeenCalled();
  });

  it('should call cart payment schedule API for PAYMENT_CART action', () => {
    mockGetCapsConfig.mockReturnValue({
      type: 'booking',
      id: 'booking-123',
      customerId: 'customer-456',
    });
    mockGetResolvedAction.mockReturnValue(Action.PAYMENT_CART);

    getPaymentSchedule();

    expect(mockGetCartPaymentSchedule).toHaveBeenCalledWith('customer-456', 'booking-123');
    expect(mockGetV0).not.toHaveBeenCalled();
    expect(mockGetV1).not.toHaveBeenCalled();
    expect(mockGetCartAccommodations).not.toHaveBeenCalled();
  });

  it('should call cart accommodations API for PAYMENT_UPGRADE_ROOM action', () => {
    mockGetCapsConfig.mockReturnValue({
      type: 'booking',
      id: 'booking-123',
      customerId: 'customer-456',
    });
    mockGetResolvedAction.mockReturnValue(Action.PAYMENT_UPGRADE_ROOM);

    getPaymentSchedule();

    expect(mockGetCartAccommodations).toHaveBeenCalledWith('customer-456', 'booking-123');
    expect(mockGetV0).not.toHaveBeenCalled();
    expect(mockGetV1).not.toHaveBeenCalled();
    expect(mockGetCartPaymentSchedule).not.toHaveBeenCalled();
  });

  it('should throw error when id is missing for non-proposal type', () => {
    mockGetCapsConfig.mockReturnValue({
      type: 'booking',
      id: undefined,
      customerId: 'customer-456',
    });

    expect(() => getPaymentSchedule()).toThrow('id is required for this action');
  });

  it('should throw error for unknown action', () => {
    mockGetCapsConfig.mockReturnValue({
      type: 'booking',
      id: 'booking-123',
      customerId: 'customer-456',
    });
    mockGetResolvedAction.mockReturnValue('UNKNOWN_ACTION' as any);

    expect(() => getPaymentSchedule()).toThrow('Invalid action');
  });

  it('should return data from V1 API', async () => {
    const mockData = { currency: 'EUR', households: [{ total: 500 }] };
    mockGetV1.mockResolvedValue(mockData);
    mockGetCapsConfig.mockReturnValue({
      type: 'proposal',
      id: 'proposal-789',
      customerId: 'customer-456',
    });

    const result = await getPaymentSchedule();

    expect(result).toEqual(mockData);
    expect(mockGetV1).toHaveBeenCalledWith('proposal-789');
  });
});
