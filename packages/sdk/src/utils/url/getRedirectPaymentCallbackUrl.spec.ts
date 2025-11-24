import { getCapsConfig } from '../../providers/CapsConfigProvider.js';
import { getRedirectPaymentCallbackUrl } from './getRedirectPaymentCallbackUrl.js';

vi.mock('../../providers/CapsConfigProvider.js', () => ({
  getCapsConfig: vi.fn(),
}));

const mockGetCapsConfig = vi.mocked(getCapsConfig);

describe('getRedirectPaymentCallbackUrl', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should generate correct URL with all parameters for proposal type', () => {
    const mockOptions = {
      paymentGatewayUrl: 'https://example.com',
      oidc: {
        issuerType: 'OIDC',
      },
      type: 'proposal',
      id: 'proposal-123',
      callbackUrl: 'https://callback.url',
    };
    mockGetCapsConfig.mockReturnValue(mockOptions);

    const paymentId = 'payment-456';
    const providerId = 'provider-789';

    const result = getRedirectPaymentCallbackUrl(paymentId, providerId);

    expect(result).toBe(
      'https://example.com/oidc/redirect/payment-456?callback_url=https%3A%2F%2Fcallback.url&provider_id=provider-789&proposal_id=proposal-123',
    );
    expect(mockGetCapsConfig).toHaveBeenCalledOnce();
  });

  it('should generate URL without provider_id when not provided', () => {
    const mockOptions = {
      paymentGatewayUrl: 'https://example.com',
      oidc: {
        issuerType: 'OIDC',
      },
      type: 'proposal',
      id: 'proposal-123',
      callbackUrl: 'https://callback.url',
    };
    mockGetCapsConfig.mockReturnValue(mockOptions);

    const paymentId = 'payment-456';
    const providerId = '';

    const result = getRedirectPaymentCallbackUrl(paymentId, providerId);

    expect(result).toBe(
      'https://example.com/oidc/redirect/payment-456?callback_url=https%3A%2F%2Fcallback.url&proposal_id=proposal-123',
    );
  });

  it('should generate URL without proposal_id when type is not proposal', () => {
    const mockOptions = {
      paymentGatewayUrl: 'https://example.com',
      oidc: {
        issuerType: 'OIDC',
      },
      type: 'booking',
      id: 'booking-123',
      callbackUrl: 'https://callback.url',
    };
    mockGetCapsConfig.mockReturnValue(mockOptions);

    const paymentId = 'payment-456';
    const providerId = 'provider-789';

    const result = getRedirectPaymentCallbackUrl(paymentId, providerId);

    expect(result).toBe(
      'https://example.com/oidc/redirect/payment-456?callback_url=https%3A%2F%2Fcallback.url&provider_id=provider-789',
    );
  });

  it('should generate URL without query parameters when type is not proposal and no providerId', () => {
    const mockOptions = {
      paymentGatewayUrl: 'https://example.com',
      oidc: {
        issuerType: 'OIDC',
      },
      type: 'booking',
      id: 'booking-123',
      callbackUrl: 'https://callback.url',
    };
    mockGetCapsConfig.mockReturnValue(mockOptions);

    const paymentId = 'payment-456';
    const providerId = '';

    const result = getRedirectPaymentCallbackUrl(paymentId, providerId);

    expect(result).toBe(
      'https://example.com/oidc/redirect/payment-456?callback_url=https%3A%2F%2Fcallback.url',
    );
  });

  it('should handle different issuer types with correct case conversion', () => {
    const mockOptions = {
      paymentGatewayUrl: 'https://example.com',
      oidc: {
        issuerType: 'KEYCLOAK',
      },
      type: 'proposal',
      id: 'proposal-123',
      callbackUrl: 'https://callback.url',
    };
    mockGetCapsConfig.mockReturnValue(mockOptions);

    const paymentId = 'payment-456';
    const providerId = 'provider-789';

    const result = getRedirectPaymentCallbackUrl(paymentId, providerId);

    expect(result).toBe(
      'https://example.com/keycloak/redirect/payment-456?callback_url=https%3A%2F%2Fcallback.url&provider_id=provider-789&proposal_id=proposal-123',
    );
  });

  it('should handle URLs with ports', () => {
    const mockOptions = {
      paymentGatewayUrl: 'http://localhost:3000',
      oidc: {
        issuerType: 'OIDC',
      },
      type: 'proposal',
      id: 'proposal-123',
      callbackUrl: 'https://callback.url',
    };
    mockGetCapsConfig.mockReturnValue(mockOptions);

    const paymentId = 'payment-456';
    const providerId = 'provider-789';

    const result = getRedirectPaymentCallbackUrl(paymentId, providerId);

    expect(result).toBe(
      'http://localhost:3000/oidc/redirect/payment-456?callback_url=https%3A%2F%2Fcallback.url&provider_id=provider-789&proposal_id=proposal-123',
    );
  });

  it('should handle special characters in query parameters', () => {
    const mockOptions = {
      paymentGatewayUrl: 'https://example.com',
      oidc: {
        issuerType: 'OIDC',
      },
      type: 'proposal',
      id: 'proposal-123&test=value',
      callbackUrl: 'https://callback.url',
    };
    mockGetCapsConfig.mockReturnValue(mockOptions);

    const paymentId = 'payment-456';
    const providerId = 'provider-789&special=chars';

    const result = getRedirectPaymentCallbackUrl(paymentId, providerId);

    const url = new URL(result);
    expect(url.origin + url.pathname).toBe('https://example.com/oidc/redirect/payment-456');
    expect(url.searchParams.get('provider_id')).toBe('provider-789&special=chars');
    expect(url.searchParams.get('proposal_id')).toBe('proposal-123&test=value');
  });
});
