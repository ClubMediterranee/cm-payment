import {
  getV4CustomersCustomerIdBookingsBookingIdTransportDetails,
  getV5ProposalsProposalIdTransportDetails,
} from '../../../__generated__';
import { getTransportDetails } from './getTransportDetails';

vi.mock('../../../__generated__', () => ({
  getV4CustomersCustomerIdBookingsBookingIdTransportDetails: vi.fn(),
  getV5ProposalsProposalIdTransportDetails: vi.fn(),
}));

describe('getTransportDetails', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('proposal type', () => {
    it('should call getV5ProposalsProposalIdTransportDetails for proposal type', async () => {
      // GIVEN
      const mockResponse = {
        transportDetails: [
          {
            id: 'transport-1',
            type: 'flight',
          },
        ],
      };

      vi.mocked(getV5ProposalsProposalIdTransportDetails).mockResolvedValue(mockResponse as any);

      // WHEN
      const result = await getTransportDetails({
        type: 'proposal',
        id: 'proposal-123',
        customerId: undefined,
      });

      // THEN
      expect(getV5ProposalsProposalIdTransportDetails).toHaveBeenCalledWith('proposal-123');
      expect(getV5ProposalsProposalIdTransportDetails).toHaveBeenCalledTimes(1);
      expect(getV4CustomersCustomerIdBookingsBookingIdTransportDetails).not.toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });

    it('should call proposal endpoint even without customerId', async () => {
      // GIVEN
      const mockResponse = { transportDetails: [] };
      vi.mocked(getV5ProposalsProposalIdTransportDetails).mockResolvedValue(mockResponse as any);

      // WHEN
      await getTransportDetails({
        type: 'proposal',
        id: 'proposal-456',
        customerId: undefined,
      });

      // THEN
      expect(getV5ProposalsProposalIdTransportDetails).toHaveBeenCalledWith('proposal-456');
    });
  });

  describe('booking type', () => {
    it('should call getV4CustomersCustomerIdBookingsBookingIdTransportDetails for booking type with customerId', async () => {
      // GIVEN
      const mockResponse = {
        transportDetails: [
          {
            id: 'transport-2',
            type: 'train',
          },
        ],
      };

      vi.mocked(getV4CustomersCustomerIdBookingsBookingIdTransportDetails).mockResolvedValue(
        mockResponse as any,
      );

      // WHEN
      const result = await getTransportDetails({
        type: 'booking',
        id: 'booking-123',
        customerId: 'customer-456',
      });

      // THEN
      expect(getV4CustomersCustomerIdBookingsBookingIdTransportDetails).toHaveBeenCalledWith(
        'customer-456',
        'booking-123',
      );
      expect(getV4CustomersCustomerIdBookingsBookingIdTransportDetails).toHaveBeenCalledTimes(1);
      expect(getV5ProposalsProposalIdTransportDetails).not.toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });

    it('should throw error for booking type without customerId', async () => {
      // WHEN & THEN
      await expect(
        getTransportDetails({
          type: 'booking',
          id: 'booking-789',
          customerId: undefined,
        }),
      ).rejects.toThrow('customerId is required for booking type');

      expect(getV4CustomersCustomerIdBookingsBookingIdTransportDetails).not.toHaveBeenCalled();
    });

    it('should throw error for booking type with empty customerId', async () => {
      // WHEN & THEN
      await expect(
        getTransportDetails({
          type: 'booking',
          id: 'booking-999',
          customerId: '',
        }),
      ).rejects.toThrow('customerId is required for booking type');
    });
  });
});
