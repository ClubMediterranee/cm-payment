import {
  getV2ProposalsProposalId,
  getV3CustomersCustomerIdBookingsBookingId,
} from '../../../__generated__';
import { getStay } from './getStay';

vi.mock('../../../__generated__', () => ({
  getV2ProposalsProposalId: vi.fn(),
  getV3CustomersCustomerIdBookingsBookingId: vi.fn(),
}));

const mockGetV2ProposalsProposalId = vi.mocked(getV2ProposalsProposalId);
const mockGetV3CustomersCustomerIdBookingsBookingId = vi.mocked(
  getV3CustomersCustomerIdBookingsBookingId,
);

describe('getStay', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('booking type', () => {
    it('should fetch and transform booking data', async () => {
      mockGetV3CustomersCustomerIdBookingsBookingId.mockResolvedValue({
        stays: [
          {
            product_id: 'product-123',
            resort_arrival_date: '2026-06-15',
            resort_leaving_date: '2026-06-22',
            attendees: [
              {
                adults_count: 2,
                children_count: 1,
              },
            ],
            accommodations: [{ quantity: 1 }],
            outward_trip: { transportation: ['PLANE'] },
          },
        ],
      } as any);

      const result = await getStay({
        type: 'booking',
        id: 'booking-456',
        customerId: 'customer-789',
      });

      expect(mockGetV3CustomersCustomerIdBookingsBookingId).toHaveBeenCalledWith(
        'customer-789',
        'booking-456',
      );
      expect(result).toEqual({
        productId: 'product-123',
        resortArrivalDate: '2026-06-15',
        resortDepartureDate: '2026-06-22',
        adultsCount: 2,
        childrenCount: 1,
        roomCount: 1,
        transportTypes: ['PLANE'],
      });
    });

    it('should throw error when customerId is missing for booking type', async () => {
      await expect(
        getStay({
          type: 'booking',
          id: 'booking-456',
        }),
      ).rejects.toThrow('customerId is required for booking type');
    });

    it('should handle missing stays data', async () => {
      mockGetV3CustomersCustomerIdBookingsBookingId.mockResolvedValue({
        stays: [],
      } as any);

      const result = await getStay({
        type: 'booking',
        id: 'booking-456',
        customerId: 'customer-789',
      });

      expect(result).toEqual({
        productId: '',
        resortArrivalDate: undefined,
        resortDepartureDate: undefined,
        adultsCount: 0,
        childrenCount: 0,
        roomCount: 0,
        transportTypes: undefined,
      });
    });

    it('should handle missing attendees data', async () => {
      mockGetV3CustomersCustomerIdBookingsBookingId.mockResolvedValue({
        stays: [
          {
            product_id: 'product-123',
            resort_arrival_date: '2026-06-15',
            resort_leaving_date: '2026-06-22',
            attendees: [],
            accommodations: [],
            outward_trip: { transportation: [] },
          },
        ],
      } as any);

      const result = await getStay({
        type: 'booking',
        id: 'booking-456',
        customerId: 'customer-789',
      });

      expect(result.adultsCount).toBe(0);
      expect(result.childrenCount).toBe(0);
    });
  });

  describe('proposal type', () => {
    it('should fetch and transform proposal data', async () => {
      mockGetV2ProposalsProposalId.mockResolvedValue({
        product_id: 'product-abc',
        resort_arrival_date: '2026-07-10',
        resort_departure_date: '2026-07-17',
        households: [
          {
            attendees: [{ age: 30 }, { age: 28 }, { age: 5 }],
          },
        ],
        accommodations: [{ quantity: 2 }],
        transportation_summary: [{ transportation_type: 'PLANE' }],
      } as any);

      const result = await getStay({
        type: 'proposal',
        id: 'proposal-xyz',
      });

      expect(mockGetV2ProposalsProposalId).toHaveBeenCalledWith('proposal-xyz');
      expect(result).toEqual({
        productId: 'product-abc',
        resortArrivalDate: '2026-07-10',
        resortDepartureDate: '2026-07-17',
        adultsCount: 3,
        childrenCount: 0,
        roomCount: 2,
        transportTypes: ['PLANE'],
      });
    });

    it('should handle missing households data', async () => {
      mockGetV2ProposalsProposalId.mockResolvedValue({
        product_id: 'product-abc',
        resort_arrival_date: '2026-07-10',
        resort_departure_date: '2026-07-17',
        households: [],
        accommodations: [],
      } as any);

      const result = await getStay({
        type: 'proposal',
        id: 'proposal-xyz',
      });

      expect(result.adultsCount).toBe(0);
      expect(result.childrenCount).toBe(0);
    });

    it('should handle null dates', async () => {
      mockGetV2ProposalsProposalId.mockResolvedValue({
        product_id: 'product-abc',
        resort_arrival_date: null,
        resort_departure_date: null,
        households: [
          {
            attendees: [{ age: 30 }],
          },
        ],
        accommodations: [],
      } as any);

      const result = await getStay({
        type: 'proposal',
        id: 'proposal-xyz',
      });

      expect(result.resortArrivalDate).toBeNull();
      expect(result.resortDepartureDate).toBeNull();
    });

    it('should not require customerId for proposal type', async () => {
      mockGetV2ProposalsProposalId.mockResolvedValue({
        product_id: 'product-abc',
        households: [],
        accommodations: [],
      } as any);

      await getStay({
        type: 'proposal',
        id: 'proposal-xyz',
      });

      expect(mockGetV2ProposalsProposalId).toHaveBeenCalledWith('proposal-xyz');
    });
  });
});
