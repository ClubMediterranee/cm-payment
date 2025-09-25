import { getV2ProposalsProposalId, postV3Bookings } from '../__generated__/index.js';
import { createBookingFromProposal } from './createBookingFromProposal.js';

// Mock the API functions
vi.mock('../__generated__/index.js', () => ({
  getV2ProposalsProposalId: vi.fn(),
  postV3Bookings: vi.fn(),
}));

const mockGetV2ProposalsProposalId = vi.mocked(getV2ProposalsProposalId);
const mockPostV3Bookings = vi.mocked(postV3Bookings);

describe('createBookingFromProposal', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should successfully create booking from proposal with customer ID', async () => {
    // Arrange
    const proposalId = 'proposal-123';
    const mockProposal = {
      households: [
        {
          attendees: [
            {
              customer_id: 'customer-456',
            },
          ],
        },
      ],
    };
    const mockBooking = {
      booking_id: 'booking-789',
    };

    mockGetV2ProposalsProposalId.mockResolvedValue(mockProposal);
    mockPostV3Bookings.mockResolvedValue(mockBooking as never);

    // Act
    const result = await createBookingFromProposal(proposalId);

    // Assert
    expect(result).toEqual({
      customerId: 'customer-456',
      bookingId: 'booking-789',
    });
    expect(mockGetV2ProposalsProposalId).toHaveBeenCalledWith(proposalId);
    expect(mockPostV3Bookings).toHaveBeenCalledWith({
      proposal_id: proposalId,
    });
  });

  it('should handle proposal with empty customer_id', async () => {
    // Arrange
    const proposalId = 'proposal-123';
    const mockProposal = {
      households: [
        {
          attendees: [
            {
              customer_id: '',
            },
          ],
        },
      ],
    };
    const mockBooking = {
      booking_id: 'booking-789',
    };

    mockGetV2ProposalsProposalId.mockResolvedValue(mockProposal);
    mockPostV3Bookings.mockResolvedValue(mockBooking as never);

    // Act
    const result = await createBookingFromProposal(proposalId);

    // Assert
    expect(result).toEqual({
      customerId: '',
      bookingId: 'booking-789',
    });
  });

  it('should handle proposal with null customer_id', async () => {
    // Arrange
    const proposalId = 'proposal-123';
    const mockProposal = {
      households: [
        {
          attendees: [
            {
              customer_id: null,
            },
          ],
        },
      ],
    };
    const mockBooking = {
      booking_id: 'booking-789',
    };

    mockGetV2ProposalsProposalId.mockResolvedValue(mockProposal);
    mockPostV3Bookings.mockResolvedValue(mockBooking as never);

    // Act
    const result = await createBookingFromProposal(proposalId);

    // Assert
    expect(result).toEqual({
      customerId: '',
      bookingId: 'booking-789',
    });
  });

  it('should handle proposal with undefined customer_id', async () => {
    // Arrange
    const proposalId = 'proposal-123';
    const mockProposal = {
      households: [
        {
          attendees: [
            {
              customer_id: undefined,
            },
          ],
        },
      ],
    };
    const mockBooking = {
      booking_id: 'booking-789',
    };

    mockGetV2ProposalsProposalId.mockResolvedValue(mockProposal);
    mockPostV3Bookings.mockResolvedValue(mockBooking as never);

    // Act
    const result = await createBookingFromProposal(proposalId);

    // Assert
    expect(result).toEqual({
      customerId: '',
      bookingId: 'booking-789',
    });
  });

  it('should handle proposal with no attendees', async () => {
    // Arrange
    const proposalId = 'proposal-123';
    const mockProposal = {
      households: [
        {
          attendees: [],
        },
      ],
    };
    const mockBooking = {
      booking_id: 'booking-789',
    };

    mockGetV2ProposalsProposalId.mockResolvedValue(mockProposal);
    mockPostV3Bookings.mockResolvedValue(mockBooking as never);

    // Act
    const result = await createBookingFromProposal(proposalId);

    // Assert
    expect(result).toEqual({
      customerId: '',
      bookingId: 'booking-789',
    });
  });

  it('should handle proposal with no households', async () => {
    // Arrange
    const proposalId = 'proposal-123';
    const mockProposal = {
      households: [],
    };
    const mockBooking = {
      booking_id: 'booking-789',
    };

    mockGetV2ProposalsProposalId.mockResolvedValue(mockProposal);
    mockPostV3Bookings.mockResolvedValue(mockBooking as never);

    // Act
    const result = await createBookingFromProposal(proposalId);

    // Assert
    expect(result).toEqual({
      customerId: '',
      bookingId: 'booking-789',
    });
  });

  it('should handle proposal with undefined households', async () => {
    // Arrange
    const proposalId = 'proposal-123';
    const mockProposal = {
      households: undefined,
    };
    const mockBooking = {
      booking_id: 'booking-789',
    };

    mockGetV2ProposalsProposalId.mockResolvedValue(mockProposal);
    mockPostV3Bookings.mockResolvedValue(mockBooking as never);

    // Act
    const result = await createBookingFromProposal(proposalId);

    // Assert
    expect(result).toEqual({
      customerId: '',
      bookingId: 'booking-789',
    });
  });

  it('should handle null proposal response', async () => {
    // Arrange
    const proposalId = 'proposal-123';
    const mockBooking = {
      booking_id: 'booking-789',
    };

    mockGetV2ProposalsProposalId.mockResolvedValue(null);
    mockPostV3Bookings.mockResolvedValue(mockBooking as never);

    // Act
    const result = await createBookingFromProposal(proposalId);

    // Assert
    expect(result).toEqual({
      customerId: '',
      bookingId: 'booking-789',
    });
  });

  it('should handle undefined proposal response', async () => {
    // Arrange
    const proposalId = 'proposal-123';
    const mockBooking = {
      booking_id: 'booking-789',
    };

    mockGetV2ProposalsProposalId.mockResolvedValue(undefined);
    mockPostV3Bookings.mockResolvedValue(mockBooking as never);

    // Act
    const result = await createBookingFromProposal(proposalId);

    // Assert
    expect(result).toEqual({
      customerId: '',
      bookingId: 'booking-789',
    });
  });

  it('should handle multiple attendees and take the first one', async () => {
    // Arrange
    const proposalId = 'proposal-123';
    const mockProposal = {
      households: [
        {
          attendees: [{ customer_id: 'customer-first' }, { customer_id: 'customer-second' }],
        },
      ],
    };
    const mockBooking = {
      booking_id: 'booking-789',
    };

    mockGetV2ProposalsProposalId.mockResolvedValue(mockProposal);
    mockPostV3Bookings.mockResolvedValue(mockBooking as never);

    // Act
    const result = await createBookingFromProposal(proposalId);

    // Assert
    expect(result).toEqual({
      customerId: 'customer-first',
      bookingId: 'booking-789',
    });
  });

  it('should propagate error from getV2ProposalsProposalId', async () => {
    // Arrange
    const proposalId = 'proposal-123';
    const error = new Error('Failed to fetch proposal');

    mockGetV2ProposalsProposalId.mockRejectedValue(error);

    // Act & Assert
    await expect(createBookingFromProposal(proposalId)).rejects.toThrow('Failed to fetch proposal');
    expect(mockPostV3Bookings).not.toHaveBeenCalled();
  });

  it('should propagate error from postV3Bookings', async () => {
    // Arrange
    const proposalId = 'proposal-123';
    const mockProposal = {
      households: [
        {
          attendees: [
            {
              customer_id: 'customer-456',
            },
          ],
        },
      ],
    };
    const error = new Error('Failed to create booking');

    mockGetV2ProposalsProposalId.mockResolvedValue(mockProposal);
    mockPostV3Bookings.mockRejectedValue(error);

    // Act & Assert
    await expect(createBookingFromProposal(proposalId)).rejects.toThrow('Failed to create booking');
    expect(mockGetV2ProposalsProposalId).toHaveBeenCalledWith(proposalId);
    expect(mockPostV3Bookings).toHaveBeenCalledWith({
      proposal_id: proposalId,
    });
  });
});
