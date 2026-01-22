import { vi } from 'vitest';

import { navigateToCallbackUrl } from './navigateToCallbackUrl';

vi.mock('../iframe/sendMessage', () => ({
  sendIframeMessage: vi.fn(),
}));

vi.mock('../iframe/isEmbeddedInIframe', () => ({
  isEmbeddedInIframe: vi.fn(),
}));

vi.mock('../iframe/constants', () => ({
  IframeMessageType: {
    PAYMENT_REDIRECT: 'CAPS_PAYMENT_REDIRECT',
    PAYMENT_REDIRECT_LOADING: 'CAPS_PAYMENT_REDIRECT_LOADING',
  },
}));

describe('navigateToCallbackUrl', () => {
  let originalLocation: Location;
  let mockHref = '';

  beforeEach(() => {
    originalLocation = window.location;
    mockHref = '';

    delete (window as any).location;

    window.location = {
      ...originalLocation,
      set href(value: string) {
        mockHref = value;
      },
      get href() {
        return mockHref;
      },
    } as any;

    vi.clearAllMocks();
  });

  afterEach(() => {
    (window as any).location = originalLocation;
  });

  describe('not in iframe', () => {
    beforeEach(async () => {
      const { isEmbeddedInIframe } = await import('../iframe/isEmbeddedInIframe');
      vi.mocked(isEmbeddedInIframe).mockReturnValue(false);
    });

    it('should build URL with payment response params', () => {
      const paymentResponse = {
        payment_status: 'OK',
        booking_id: 'booking-123',
      };

      navigateToCallbackUrl({
        callbackUrl: 'https://example.com/callback',
        paymentResponse,
        proposalId: null,
      });

      expect(mockHref).toContain('https://example.com/callback?');
      expect(mockHref).toContain('payment_status=OK');
      expect(mockHref).toContain('booking_id=booking-123');
    });

    it('should include proposal_id when provided', () => {
      const paymentResponse = { payment_status: 'OK' };

      navigateToCallbackUrl({
        callbackUrl: 'https://example.com/callback',
        paymentResponse,
        proposalId: 'prop-789',
      });

      expect(mockHref).toContain('proposal_id=prop-789');
    });

    it('should not include proposal_id when null', () => {
      const paymentResponse = { payment_status: 'OK' };

      navigateToCallbackUrl({
        callbackUrl: 'https://example.com/callback',
        paymentResponse,
        proposalId: null,
      });

      expect(mockHref).not.toContain('proposal_id');
    });

    it('should URL encode special characters', () => {
      const paymentResponse = {
        message: 'Payment & confirmation',
      };

      navigateToCallbackUrl({
        callbackUrl: 'https://example.com/callback',
        paymentResponse,
        proposalId: null,
      });

      expect(mockHref).toContain('message=Payment+%26+confirmation');
    });
  });

  describe('in iframe', () => {
    beforeEach(async () => {
      const { isEmbeddedInIframe } = await import('../iframe/isEmbeddedInIframe');
      vi.mocked(isEmbeddedInIframe).mockReturnValue(true);
    });

    it('should send postMessage to parent when in iframe', async () => {
      const { sendIframeMessage } = await import('../iframe/sendMessage');
      const paymentResponse = {
        payment_status: 'OK',
        booking_id: 'booking-123',
      };

      navigateToCallbackUrl({
        callbackUrl: 'https://example.com/callback',
        paymentResponse,
        proposalId: null,
      });

      expect(sendIframeMessage).toHaveBeenCalledWith({
        type: 'CAPS_PAYMENT_REDIRECT',
        url: 'https://example.com/callback?payment_status=OK&booking_id=booking-123',
      });
      expect(mockHref).toBe('');
    });

    it('should include proposal_id in postMessage when provided', async () => {
      const { sendIframeMessage } = await import('../iframe/sendMessage');
      const paymentResponse = { payment_status: 'OK' };

      navigateToCallbackUrl({
        callbackUrl: 'https://example.com/callback',
        paymentResponse,
        proposalId: 'prop-789',
      });

      expect(sendIframeMessage).toHaveBeenCalledWith({
        type: 'CAPS_PAYMENT_REDIRECT',
        url: 'https://example.com/callback?payment_status=OK&proposal_id=prop-789',
      });
    });
  });
});
