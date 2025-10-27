import {
  Action,
  getV0CustomersCustomerIdBookingsBookingIdCartAccommodations,
  getV0CustomersCustomerIdBookingsBookingIdCartPaymentSchedule,
  getV0CustomersCustomerIdBookingsBookingIdPaymentSchedules,
  getV1ProposalsProposalIdPaymentSchedule,
} from '../../../__generated__';
import { getSDKPaymentOptions } from '../../../providers/SDKConfigProvider';
import { getPaymentSchedule } from './getPaymentSchedule';

vi.mock('../../../utils/fetcher', () => ({
  fetcher: vi.fn(),
}));

vi.mock('../../../providers/SDKConfigProvider', () => ({
  getSDKPaymentOptions: vi.fn(),
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
const mockGetSDKPaymentOptions = vi.mocked(getSDKPaymentOptions);

describe('getPaymentSchedule', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should call V1 API for PAYMENT_RESA action', () => {
    mockGetSDKPaymentOptions.mockReturnValue({
      action: Action.PAYMENT_RESA,
      proposalId: 'proposal-789',
      customerId: 'customer-456',
      bookingId: 'booking-123',
    });

    getPaymentSchedule();

    expect(mockGetV1).toHaveBeenCalledWith('proposal-789');
    expect(mockGetV0).not.toHaveBeenCalled();
    expect(mockGetCartPaymentSchedule).not.toHaveBeenCalled();
    expect(mockGetCartAccommodations).not.toHaveBeenCalled();
  });

  it('should call V0 API for PAYMENT_OPTION action with bookingId', () => {
    mockGetSDKPaymentOptions.mockReturnValue({
      action: Action.PAYMENT_OPTION,
      bookingId: 'booking-123',
      customerId: 'customer-456',
      proposalId: 'proposal-789',
    });

    getPaymentSchedule();

    expect(mockGetV0).toHaveBeenCalledWith('customer-456', 'booking-123', { withAuth: true });
    expect(mockGetV1).not.toHaveBeenCalled();
    expect(mockGetCartPaymentSchedule).not.toHaveBeenCalled();
    expect(mockGetCartAccommodations).not.toHaveBeenCalled();
  });

  it('should call V0 API for PAYMENT_SOLDE action with bookingId', () => {
    mockGetSDKPaymentOptions.mockReturnValue({
      action: Action.PAYMENT_SOLDE,
      bookingId: 'booking-123',
      customerId: 'customer-456',
      proposalId: 'proposal-789',
    });

    getPaymentSchedule();

    expect(mockGetV0).toHaveBeenCalledWith('customer-456', 'booking-123', { withAuth: true });
    expect(mockGetV1).not.toHaveBeenCalled();
    expect(mockGetCartPaymentSchedule).not.toHaveBeenCalled();
    expect(mockGetCartAccommodations).not.toHaveBeenCalled();
  });

  it('should call V0 API for PAYMENT_PARTIAL action with bookingId', () => {
    mockGetSDKPaymentOptions.mockReturnValue({
      action: Action.PAYMENT_PARTIAL,
      bookingId: 'booking-123',
      customerId: 'customer-456',
      proposalId: 'proposal-789',
    });

    getPaymentSchedule();

    expect(mockGetV0).toHaveBeenCalledWith('customer-456', 'booking-123', { withAuth: true });
    expect(mockGetV1).not.toHaveBeenCalled();
    expect(mockGetCartPaymentSchedule).not.toHaveBeenCalled();
    expect(mockGetCartAccommodations).not.toHaveBeenCalled();
  });

  it('should call cart payment schedule API for PAYMENT_CART action', () => {
    mockGetSDKPaymentOptions.mockReturnValue({
      action: Action.PAYMENT_CART,
      bookingId: 'booking-123',
      customerId: 'customer-456',
      proposalId: 'proposal-789',
    });

    getPaymentSchedule();

    expect(mockGetCartPaymentSchedule).toHaveBeenCalledWith('customer-456', 'booking-123', {
      withAuth: true,
    });
    expect(mockGetV0).not.toHaveBeenCalled();
    expect(mockGetV1).not.toHaveBeenCalled();
    expect(mockGetCartAccommodations).not.toHaveBeenCalled();
  });

  it('should call cart accommodations API for PAYMENT_UPGRADE_ROOM action', () => {
    mockGetSDKPaymentOptions.mockReturnValue({
      action: Action.PAYMENT_UPGRADE_ROOM,
      bookingId: 'booking-123',
      customerId: 'customer-456',
      proposalId: 'proposal-789',
    });

    getPaymentSchedule();

    expect(mockGetCartAccommodations).toHaveBeenCalledWith('customer-456', 'booking-123', {
      withAuth: true,
    });
    expect(mockGetV0).not.toHaveBeenCalled();
    expect(mockGetV1).not.toHaveBeenCalled();
    expect(mockGetCartPaymentSchedule).not.toHaveBeenCalled();
  });

  it('should throw error for PAYMENT_OPTION action without bookingId', () => {
    mockGetSDKPaymentOptions.mockReturnValue({
      action: Action.PAYMENT_OPTION,
      bookingId: undefined,
      customerId: 'customer-456',
      proposalId: 'proposal-789',
    });

    expect(() => getPaymentSchedule()).toThrow('bookingId is required for this action');
    expect(mockGetV0).not.toHaveBeenCalled();
    expect(mockGetV1).not.toHaveBeenCalled();
  });

  it('should throw error for unknown action', () => {
    mockGetSDKPaymentOptions.mockReturnValue({
      action: 'UNKNOWN_ACTION' as any,
      bookingId: 'booking-123',
      customerId: 'customer-456',
      proposalId: 'proposal-789',
    });

    expect(() => getPaymentSchedule()).toThrow('Invalid action');
    expect(mockGetV0).not.toHaveBeenCalled();
    expect(mockGetV1).not.toHaveBeenCalled();
  });

  it('should return data from V1 API with mock', async () => {
    const mockData = { currency: 'EUR', households: [{ total: 500 }] };
    mockGetV1.mockResolvedValue(mockData);
    mockGetSDKPaymentOptions.mockReturnValue({
      action: Action.PAYMENT_RESA,

      proposalId: 'proposal-789',
    });

    const result = await getPaymentSchedule();

    expect(result).toBeDefined();
    expect(result).toEqual(mockData);
    expect(mockGetV1).toHaveBeenCalledWith('proposal-789');
  });

  it('should throw error for PAYMENT_CART without bookingId', () => {
    mockGetSDKPaymentOptions.mockReturnValue({
      action: Action.PAYMENT_CART,
      bookingId: null,
      customerId: 'customer-456',
      proposalId: 'proposal-789',
    });

    expect(() => getPaymentSchedule()).toThrow('bookingId is required for this action');
    expect(mockGetCartPaymentSchedule).not.toHaveBeenCalled();
  });

  it('should throw error for PAYMENT_UPGRADE_ROOM without bookingId', () => {
    mockGetSDKPaymentOptions.mockReturnValue({
      action: Action.PAYMENT_UPGRADE_ROOM,
      bookingId: undefined,
      customerId: 'customer-456',
      proposalId: 'proposal-789',
    });

    expect(() => getPaymentSchedule()).toThrow('bookingId is required for this action');
    expect(mockGetCartAccommodations).not.toHaveBeenCalled();
  });

  it('should call V1 API for PAYMENT_RESA even without bookingId', () => {
    mockGetSDKPaymentOptions.mockReturnValue({
      action: Action.PAYMENT_RESA,
      proposalId: 'proposal-789',
      customerId: 'customer-456',
      bookingId: undefined,
    });

    getPaymentSchedule();

    expect(mockGetV1).toHaveBeenCalledWith('proposal-789');
    expect(mockGetV0).not.toHaveBeenCalled();
  });

  it('should throw error for PAYMENT_SOLDE with null bookingId', () => {
    mockGetSDKPaymentOptions.mockReturnValue({
      action: Action.PAYMENT_SOLDE,
      bookingId: null,
      customerId: 'customer-456',
      proposalId: 'proposal-789',
    });

    expect(() => getPaymentSchedule()).toThrow('bookingId is required for this action');
    expect(mockGetV0).not.toHaveBeenCalled();
  });

  it('should throw error for PAYMENT_RESA without proposalId', () => {
    mockGetSDKPaymentOptions.mockReturnValue({
      action: Action.PAYMENT_RESA,
      proposalId: undefined,
      customerId: 'customer-456',
      bookingId: 'booking-123',
    });

    expect(() => getPaymentSchedule()).toThrow('proposalId is required for PAYMENT_RESA action');
    expect(mockGetV1).not.toHaveBeenCalled();
  });

  it('should throw error for PAYMENT_RESA with null proposalId', () => {
    mockGetSDKPaymentOptions.mockReturnValue({
      action: Action.PAYMENT_RESA,
      proposalId: null,
      customerId: 'customer-456',
      bookingId: 'booking-123',
    });

    expect(() => getPaymentSchedule()).toThrow('proposalId is required for PAYMENT_RESA action');
    expect(mockGetV1).not.toHaveBeenCalled();
  });
});
