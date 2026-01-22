import { describe, expect, it, vi } from 'vitest';

import { getStay } from './getStay';

vi.mock('../__generated__', () => ({
  getV2ProposalsProposalId: vi.fn(),
  getV3CustomersCustomerIdBookingsBookingId: vi.fn(),
}));

import {
  getV2ProposalsProposalId,
  getV3CustomersCustomerIdBookingsBookingId,
} from '../__generated__';

describe('getStay', () => {
  describe('type proposal', () => {
    it('retrieves data from getV2ProposalsProposalId', async () => {
      const mockData = {
        product_id: 'product-123',
        resort_departure_date: '2024-12-31',
        resort_arrival_date: '2024-12-24',
        households: [
          {
            attendees: [{ adult: true }, { adult: true }],
          },
        ],
      };

      vi.mocked(getV2ProposalsProposalId).mockResolvedValue(mockData as any);

      const result = await getStay({
        type: 'proposal',
        id: 'proposal-456',
      });

      expect(getV2ProposalsProposalId).toHaveBeenCalledWith('proposal-456');
      expect(result).toEqual({
        productId: 'product-123',
        resortDepartureDate: '2024-12-31',
        resortArrivalDate: '2024-12-24',
        adultsCount: 2,
        childrenCount: 0,
      });
    });

    it('returns 0 for adultsCount if households is empty', async () => {
      const mockData = {
        product_id: 'product-123',
        resort_departure_date: '2024-12-31',
        resort_arrival_date: '2024-12-24',
        households: [],
      };

      vi.mocked(getV2ProposalsProposalId).mockResolvedValue(mockData as any);

      const result = await getStay({
        type: 'proposal',
        id: 'proposal-456',
      });

      expect(result.adultsCount).toBe(0);
      expect(result.childrenCount).toBe(0);
    });

    it('returns 0 for adultsCount if attendees is undefined', async () => {
      const mockData = {
        product_id: 'product-123',
        resort_departure_date: '2024-12-31',
        resort_arrival_date: '2024-12-24',
        households: [{}],
      };

      vi.mocked(getV2ProposalsProposalId).mockResolvedValue(mockData as any);

      const result = await getStay({
        type: 'proposal',
        id: 'proposal-456',
      });

      expect(result.adultsCount).toBe(0);
    });
  });

  describe('type booking', () => {
    it('retrieves data from getV3CustomersCustomerIdBookingsBookingId', async () => {
      const mockData = {
        stays: [
          {
            product_id: 'product-789',
            resort_leaving_date: '2024-12-31',
            resort_arrival_date: '2024-12-24',
            attendees: [
              {
                adults_count: 2,
                children_count: 1,
              },
            ],
          },
        ],
      };

      vi.mocked(getV3CustomersCustomerIdBookingsBookingId).mockResolvedValue(mockData as any);

      const result = await getStay({
        type: 'booking',
        id: 'booking-123',
        customerId: 'customer-456',
      });

      expect(getV3CustomersCustomerIdBookingsBookingId).toHaveBeenCalledWith(
        'customer-456',
        'booking-123',
      );
      expect(result).toEqual({
        productId: 'product-789',
        resortDepartureDate: '2024-12-31',
        resortArrivalDate: '2024-12-24',
        adultsCount: 2,
        childrenCount: 1,
      });
    });

    it('throws an error if customerId is not provided', async () => {
      await expect(
        getStay({
          type: 'booking',
          id: 'booking-123',
        }),
      ).rejects.toThrow('customerId is required for booking type');
    });

    it('returns default values if stays is empty', async () => {
      const mockData = {
        stays: [],
      };

      vi.mocked(getV3CustomersCustomerIdBookingsBookingId).mockResolvedValue(mockData as any);

      const result = await getStay({
        type: 'booking',
        id: 'booking-123',
        customerId: 'customer-456',
      });

      expect(result).toEqual({
        productId: '',
        resortDepartureDate: undefined,
        resortArrivalDate: undefined,
        adultsCount: 0,
        childrenCount: 0,
      });
    });

    it('returns default values if attendees is empty', async () => {
      const mockData = {
        stays: [
          {
            product_id: 'product-789',
            resort_leaving_date: '2024-12-31',
            resort_arrival_date: '2024-12-24',
            attendees: [],
          },
        ],
      };

      vi.mocked(getV3CustomersCustomerIdBookingsBookingId).mockResolvedValue(mockData as any);

      const result = await getStay({
        type: 'booking',
        id: 'booking-123',
        customerId: 'customer-456',
      });

      expect(result.adultsCount).toBe(0);
      expect(result.childrenCount).toBe(0);
    });
  });
});
