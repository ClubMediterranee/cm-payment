import { redirectToCallbackUrl } from './redirectToCallbackUrl';

describe('redirectToCallbackUrl', () => {
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
  });

  afterEach(() => {
    (window as any).location = originalLocation;
  });

  it('should build URL with payment response params', () => {
    const paymentResponse = {
      payment_status: 'OK',
      booking_id: 'booking-123',
    };

    redirectToCallbackUrl({
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

    redirectToCallbackUrl({
      callbackUrl: 'https://example.com/callback',
      paymentResponse,
      proposalId: 'prop-789',
    });

    expect(mockHref).toContain('proposal_id=prop-789');
  });

  it('should not include proposal_id when null', () => {
    const paymentResponse = { payment_status: 'OK' };

    redirectToCallbackUrl({
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

    redirectToCallbackUrl({
      callbackUrl: 'https://example.com/callback',
      paymentResponse,
      proposalId: null,
    });

    expect(mockHref).toContain('message=Payment+%26+confirmation');
  });
});
