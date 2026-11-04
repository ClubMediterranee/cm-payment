import { describe, expect, it, vi } from 'vitest';

import * as api from '../../../infra/api/__generated__/index.js';
import { resolveBooking } from './resolveBooking.js';

vi.mock('../../../infra/api/__generated__/index.js', () => ({
  getV2ProposalsProposalId: vi.fn(),
  postV3Bookings: vi.fn(),
}));

describe('resolveBooking', () => {
  it('returns the booking id and customer id as-is for a booking', async () => {
    const result = await resolveBooking({ type: 'booking', id: 'BOOK1', customerId: 'CUST1' });

    expect(result).toEqual({ bookingId: 'BOOK1', customerId: 'CUST1' });
    expect(api.postV3Bookings).not.toHaveBeenCalled();
  });

  it('creates a booking from a proposal and reads the customer id from it', async () => {
    vi.mocked(api.getV2ProposalsProposalId).mockResolvedValue({
      households: [{ attendees: [{ customer_id: 'CUST_FROM_PROPOSAL' }] }],
    } as any);
    vi.mocked(api.postV3Bookings).mockResolvedValue({ booking_id: 'BOOK_NEW' } as any);

    const result = await resolveBooking({ type: 'proposal', id: 'PROP1' });

    expect(api.getV2ProposalsProposalId).toHaveBeenCalledWith('PROP1');
    expect(api.postV3Bookings).toHaveBeenCalledWith({ proposal_id: 'PROP1' });
    expect(result).toEqual({ bookingId: 'BOOK_NEW', customerId: 'CUST_FROM_PROPOSAL' });
  });

  it('falls back to an empty customer id when the proposal has none', async () => {
    vi.mocked(api.getV2ProposalsProposalId).mockResolvedValue({} as any);
    vi.mocked(api.postV3Bookings).mockResolvedValue({ booking_id: 'BOOK_NEW' } as any);

    const result = await resolveBooking({ type: 'proposal', id: 'PROP1' });

    expect(result).toEqual({ bookingId: 'BOOK_NEW', customerId: '' });
  });
});
