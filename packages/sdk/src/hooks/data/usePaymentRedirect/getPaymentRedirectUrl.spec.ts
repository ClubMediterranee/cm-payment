import {
  getV2ProposalsProposalId,
  postV0PaymentsPaymentIdRedirectRequest,
  postV1Payments,
  postV3Bookings,
} from '../../../__generated__';
import { Action } from '../../../__generated__/index.schemas';
import { getPaymentRedirectUrl } from './getPaymentRedirectUrl';

vi.mock('../../../__generated__', async () => {
  const actual = await vi.importActual('../../../__generated__');
  return {
    ...actual,
    getV2ProposalsProposalId: vi.fn(),
    postV3Bookings: vi.fn(),
    postV1Payments: vi.fn(),
    postV0PaymentsPaymentIdRedirectRequest: vi.fn(),
  };
});

vi.mock('../../../utils/url/getRedirectPaymentCallbackUrls', () => ({
  getRedirectPaymentCallbackUrls: vi.fn(() => ({
    callback_url: 'https://callback.url/payment',
  })),
}));

const mockGetV2ProposalsProposalId = vi.mocked(getV2ProposalsProposalId);
const mockPostV3Bookings = vi.mocked(postV3Bookings);
const mockPostV1Payments = vi.mocked(postV1Payments);
const mockPostV0PaymentsPaymentIdRedirectRequest = vi.mocked(
  postV0PaymentsPaymentIdRedirectRequest,
);

describe('getPaymentRedirectUrl', () => {
  const mockFormData = {
    currency: 'EUR',
    action: Action.PAYMENT_OPTION,
    amount: '1000',
    provider_id: 'provider-123',
    template_id: 'template-456',
    billing_details: {
      email: 'test@example.com',
    },
    token: undefined,
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should handle proposal type and create booking', async () => {
    mockGetV2ProposalsProposalId.mockResolvedValue({
      households: [
        {
          attendees: [
            {
              customer_id: 'customer-789',
            },
          ],
        },
      ],
    } as any);

    mockPostV3Bookings.mockResolvedValue({
      booking_id: 'booking-456',
    } as any);

    mockPostV1Payments.mockResolvedValue({
      id: 'payment-123',
    } as any);

    mockPostV0PaymentsPaymentIdRedirectRequest.mockResolvedValue({
      url: 'https://payment.gateway.com',
      body: 'param1=value1&param2=value2',
    } as any);

    const result = await getPaymentRedirectUrl(mockFormData as any, {
      type: 'proposal',
      id: 'proposal-789',
      customerId: 'original-customer',
    });

    expect(mockGetV2ProposalsProposalId).toHaveBeenCalledWith('proposal-789');
    expect(mockPostV3Bookings).toHaveBeenCalledWith({ proposal_id: 'proposal-789' });
    expect(mockPostV1Payments).toHaveBeenCalledWith({
      booking_id: 'booking-456',
      customer_id: 'customer-789',
      currency: 'EUR',
      action: Action.PAYMENT_OPTION,
      amount: 1000,
      provider_id: 'provider-123',
    });
    expect(mockPostV0PaymentsPaymentIdRedirectRequest).toHaveBeenCalledWith('payment-123', {
      callback_url: 'https://callback.url/payment',
      template_id: 'template-456',
      billing_details: {
        email: 'test@example.com',
      },
      token: undefined,
    });
    expect(result).toEqual({
      url: 'https://payment.gateway.com',
      body: 'param1=value1&param2=value2',
    });
  });

  it('should handle booking type directly without creating booking', async () => {
    mockPostV1Payments.mockResolvedValue({
      id: 'payment-456',
    } as any);

    mockPostV0PaymentsPaymentIdRedirectRequest.mockResolvedValue({
      url: 'https://redirect.url',
      body: 'data=test',
    } as any);

    const result = await getPaymentRedirectUrl(mockFormData as any, {
      type: 'booking',
      id: 'booking-999',
      customerId: 'customer-888',
    });

    expect(mockGetV2ProposalsProposalId).not.toHaveBeenCalled();
    expect(mockPostV3Bookings).not.toHaveBeenCalled();
    expect(mockPostV1Payments).toHaveBeenCalledWith({
      booking_id: 'booking-999',
      customer_id: 'customer-888',
      currency: 'EUR',
      action: Action.PAYMENT_OPTION,
      amount: 1000,
      provider_id: 'provider-123',
    });
    expect(result).toEqual({
      url: 'https://redirect.url',
      body: 'data=test',
    });
  });

  it('should throw error when redirect URL is empty', async () => {
    mockPostV1Payments.mockResolvedValue({
      id: 'payment-789',
    } as any);

    mockPostV0PaymentsPaymentIdRedirectRequest.mockResolvedValue({
      url: '',
      body: '',
    } as any);

    await expect(
      getPaymentRedirectUrl(mockFormData as any, {
        type: 'booking',
        id: 'booking-123',
        customerId: 'customer-456',
      }),
    ).rejects.toThrow('Payment redirect URL not found');
  });

  it('should handle missing customer_id in proposal', async () => {
    mockGetV2ProposalsProposalId.mockResolvedValue({
      households: [],
    } as any);

    mockPostV3Bookings.mockResolvedValue({
      booking_id: 'booking-111',
    } as any);

    mockPostV1Payments.mockResolvedValue({
      id: 'payment-222',
    } as any);

    mockPostV0PaymentsPaymentIdRedirectRequest.mockResolvedValue({
      url: 'https://test.url',
      body: 'test=data',
    } as any);

    await getPaymentRedirectUrl(mockFormData as any, {
      type: 'proposal',
      id: 'proposal-333',
      customerId: 'fallback-customer',
    });

    expect(mockPostV1Payments).toHaveBeenCalledWith({
      booking_id: 'booking-111',
      customer_id: '',
      currency: 'EUR',
      action: Action.PAYMENT_OPTION,
      amount: 1000,
      provider_id: 'provider-123',
    });
  });

  it('should handle undefined url in redirect response', async () => {
    mockPostV1Payments.mockResolvedValue({
      id: 'payment-999',
    } as any);

    mockPostV0PaymentsPaymentIdRedirectRequest.mockResolvedValue({
      url: undefined,
      body: 'some-body',
    } as any);

    await expect(
      getPaymentRedirectUrl(mockFormData as any, {
        type: 'booking',
        id: 'booking-777',
        customerId: 'customer-666',
      }),
    ).rejects.toThrow('Payment redirect URL not found');
  });

  it('should handle null callback url', async () => {
    const { getRedirectPaymentCallbackUrls } = await import(
      '../../../utils/url/getRedirectPaymentCallbackUrls'
    );
    vi.mocked(getRedirectPaymentCallbackUrls).mockReturnValueOnce({ callback_url: '' } as any);

    mockPostV1Payments.mockResolvedValue({
      id: 'payment-555',
    } as any);

    mockPostV0PaymentsPaymentIdRedirectRequest.mockResolvedValue({
      url: 'https://final.url',
      body: 'final=body',
    } as any);

    const result = await getPaymentRedirectUrl(mockFormData as any, {
      type: 'booking',
      id: 'booking-444',
      customerId: 'customer-333',
    });

    expect(mockPostV0PaymentsPaymentIdRedirectRequest).toHaveBeenCalledWith('payment-555', {
      callback_url: '',
      template_id: 'template-456',
      billing_details: {
        email: 'test@example.com',
      },
      token: undefined,
    });
    expect(result).toEqual({
      url: 'https://final.url',
      body: 'final=body',
    });
  });

  it('should handle callback_url_seller for GO/PARTNERS', async () => {
    const { getRedirectPaymentCallbackUrls } = await import(
      '../../../utils/url/getRedirectPaymentCallbackUrls'
    );
    vi.mocked(getRedirectPaymentCallbackUrls).mockReturnValueOnce({
      callback_url: 'https://callback.url/client',
      callback_url_seller: 'https://callback.url/seller',
    } as any);

    mockPostV1Payments.mockResolvedValue({
      id: 'payment-999',
    } as any);

    mockPostV0PaymentsPaymentIdRedirectRequest.mockResolvedValue({
      url: 'https://redirect.url',
      body: 'data=test',
    } as any);

    const result = await getPaymentRedirectUrl(mockFormData as any, {
      type: 'booking',
      id: 'booking-555',
      customerId: 'customer-444',
    });

    expect(mockPostV0PaymentsPaymentIdRedirectRequest).toHaveBeenCalledWith('payment-999', {
      callback_url: 'https://callback.url/client',
      callback_url_seller: 'https://callback.url/seller',
      template_id: 'template-456',
      billing_details: {
        email: 'test@example.com',
      },
      token: undefined,
    });
    expect(result).toEqual({
      url: 'https://redirect.url',
      body: 'data=test',
    });
  });
});
