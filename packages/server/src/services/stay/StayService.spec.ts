import { PlatformTest } from '@tsed/platform-http/testing';

import * as generatedApi from '../../infra/api/__generated__/index.js';
import { StayService } from './StayService.js';

describe('StayService', () => {
  let service: StayService;

  beforeEach(async () => {
    await PlatformTest.create();
    service = await PlatformTest.invoke<StayService>(StayService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    return PlatformTest.reset();
  });

  describe('getStay', () => {
    it('returns the resort arrival date for a booking', async () => {
      vi.spyOn(generatedApi, 'getV3CustomersCustomerIdBookingsBookingId').mockResolvedValue({
        stays: [{ resort_arrival_date: '20251231' }],
      } as any);

      const result = await service.getStay({
        type: 'booking',
        id: 'booking-123',
        customerId: 'customer-1',
      });

      expect(generatedApi.getV3CustomersCustomerIdBookingsBookingId).toHaveBeenCalledWith(
        'customer-1',
        'booking-123',
      );
      expect(result).toEqual({ resortArrivalDate: '20251231' });
    });

    it('returns null for a booking when customerId is missing', async () => {
      const spy = vi.spyOn(generatedApi, 'getV3CustomersCustomerIdBookingsBookingId');

      const result = await service.getStay({ type: 'booking', id: 'booking-123' });

      expect(result).toBeNull();
      expect(spy).not.toHaveBeenCalled();
    });

    it('returns the resort arrival date for a proposal', async () => {
      vi.spyOn(generatedApi, 'getV2ProposalsProposalId').mockResolvedValue({
        resort_arrival_date: '20260115',
      } as any);

      const result = await service.getStay({ type: 'proposal', id: 'proposal-9' });

      expect(generatedApi.getV2ProposalsProposalId).toHaveBeenCalledWith('proposal-9');
      expect(result).toEqual({ resortArrivalDate: '20260115' });
    });

    it('returns undefined resortArrivalDate when proposal payload has no stays data', async () => {
      vi.spyOn(generatedApi, 'getV2ProposalsProposalId').mockResolvedValue({} as any);

      const result = await service.getStay({ type: 'proposal', id: 'proposal-empty' });

      expect(result).toEqual({ resortArrivalDate: undefined });
    });

    it('returns undefined resortArrivalDate when booking payload has no stays array', async () => {
      vi.spyOn(generatedApi, 'getV3CustomersCustomerIdBookingsBookingId').mockResolvedValue(
        {} as any,
      );

      const result = await service.getStay({
        type: 'booking',
        id: 'booking-empty',
        customerId: 'customer-1',
      });

      expect(result).toEqual({ resortArrivalDate: undefined });
    });
  });
});
