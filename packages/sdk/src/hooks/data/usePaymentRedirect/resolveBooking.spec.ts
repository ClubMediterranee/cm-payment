import { getV2ProposalsProposalId, postV3Bookings } from '../../../__generated__';
import { resolveBooking } from './resolveBooking';

vi.mock('../../../__generated__', async () => {
  const actual = await vi.importActual('../../../__generated__');
  return {
    ...actual,
    getV2ProposalsProposalId: vi.fn(),
    postV3Bookings: vi.fn(),
  };
});

const mockGetV2ProposalsProposalId = vi.mocked(getV2ProposalsProposalId);
const mockPostV3Bookings = vi.mocked(postV3Bookings);

describe('resolveBooking', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should create a booking from the proposal and return its customer_id', async () => {
    mockGetV2ProposalsProposalId.mockResolvedValue({
      households: [{ attendees: [{ customer_id: 'customer-789' }] }],
    } as any);
    mockPostV3Bookings.mockResolvedValue({ booking_id: 'booking-456' } as any);

    const result = await resolveBooking({
      type: 'proposal',
      id: 'proposal-789',
      customerId: 'original-customer',
    });

    expect(mockGetV2ProposalsProposalId).toHaveBeenCalledWith('proposal-789');
    expect(mockPostV3Bookings).toHaveBeenCalledWith({ proposal_id: 'proposal-789' });
    expect(result).toEqual({ booking_id: 'booking-456', customer_id: 'customer-789' });
  });

  it('should fall back to empty customer_id when proposal has no attendee', async () => {
    mockGetV2ProposalsProposalId.mockResolvedValue({ households: [] } as any);
    mockPostV3Bookings.mockResolvedValue({ booking_id: 'booking-111' } as any);

    const result = await resolveBooking({
      type: 'proposal',
      id: 'proposal-333',
      customerId: 'fallback-customer',
    });

    expect(result).toEqual({ booking_id: 'booking-111', customer_id: '' });
  });

  it('should pass through booking id and customerId for booking type', async () => {
    const result = await resolveBooking({
      type: 'booking',
      id: 'booking-999',
      customerId: 'customer-888',
    });

    expect(mockGetV2ProposalsProposalId).not.toHaveBeenCalled();
    expect(mockPostV3Bookings).not.toHaveBeenCalled();
    expect(result).toEqual({ booking_id: 'booking-999', customer_id: 'customer-888' });
  });
});
