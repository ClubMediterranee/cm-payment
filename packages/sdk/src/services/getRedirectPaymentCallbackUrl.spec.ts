import {getRedirectPaymentCallbackUrl} from './getRedirectPaymentCallbackUrl.js';
import {getSDKPaymentOptions} from '../providers/SDKConfigProvider.js';

// Mock the getSDKPaymentOptions function
vi.mock('../providers/SDKConfigProvider.js', () => ({
  getSDKPaymentOptions: vi.fn(),
}));

const mockGetSDKPaymentOptions = vi.mocked(getSDKPaymentOptions);

describe('getRedirectPaymentCallbackUrl', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should generate correct URL with all parameters', () => {
    // Arrange
    const mockOptions = {
      url: 'https://example.com',
      oidc: {
        issuerType: 'OIDC',
      },
      proposalId: 'proposal-123',
    };
    mockGetSDKPaymentOptions.mockReturnValue(mockOptions);

    const paymentId = 'payment-456';
    const providerId = 'provider-789';

    // Act
    const result = getRedirectPaymentCallbackUrl(paymentId, providerId);

    // Assert
    expect(result).toBe('https://example.com/oidc/redirect/payment-456?provider_id=provider-789&proposal_id=proposal-123');
    expect(mockGetSDKPaymentOptions).toHaveBeenCalledOnce();
  });

  it('should generate URL without provider_id when not provided', () => {
    // Arrange
    const mockOptions = {
      url: 'https://example.com',
      oidc: {
        issuerType: 'OIDC',
      },
      proposalId: 'proposal-123',
    };
    mockGetSDKPaymentOptions.mockReturnValue(mockOptions);

    const paymentId = 'payment-456';
    const providerId = '';

    // Act
    const result = getRedirectPaymentCallbackUrl(paymentId, providerId);

    // Assert
    expect(result).toBe('https://example.com/oidc/redirect/payment-456?proposal_id=proposal-123');
  });

  it('should generate URL without proposal_id when not provided', () => {
    // Arrange
    const mockOptions = {
      url: 'https://example.com',
      oidc: {
        issuerType: 'OIDC',
      },
      proposalId: '',
    };
    mockGetSDKPaymentOptions.mockReturnValue(mockOptions);

    const paymentId = 'payment-456';
    const providerId = 'provider-789';

    // Act
    const result = getRedirectPaymentCallbackUrl(paymentId, providerId);

    // Assert
    expect(result).toBe('https://example.com/oidc/redirect/payment-456?provider_id=provider-789');
  });

  it('should generate URL without query parameters when both providerId and proposalId are not provided', () => {
    // Arrange
    const mockOptions = {
      url: 'https://example.com',
      oidc: {
        issuerType: 'OIDC',
      },
      proposalId: '',
    };
    mockGetSDKPaymentOptions.mockReturnValue(mockOptions);

    const paymentId = 'payment-456';
    const providerId = '';

    // Act
    const result = getRedirectPaymentCallbackUrl(paymentId, providerId);

    // Assert
    expect(result).toBe('https://example.com/oidc/redirect/payment-456');
  });

  it('should handle different issuer types with correct case conversion', () => {
    // Arrange
    const mockOptions = {
      url: 'https://example.com',
      oidc: {
        issuerType: 'KEYCLOAK',
      },
      proposalId: 'proposal-123',
    };
    mockGetSDKPaymentOptions.mockReturnValue(mockOptions);

    const paymentId = 'payment-456';
    const providerId = 'provider-789';

    // Act
    const result = getRedirectPaymentCallbackUrl(paymentId, providerId);

    // Assert
    expect(result).toBe('https://example.com/keycloak/redirect/payment-456?provider_id=provider-789&proposal_id=proposal-123');
  });

  it('should handle URLs with existing paths', () => {
    // Arrange
    const mockOptions = {
      url: 'https://example.com/api/v1',
      oidc: {
        issuerType: 'OIDC',
      },
      proposalId: 'proposal-123',
    };
    mockGetSDKPaymentOptions.mockReturnValue(mockOptions);

    const paymentId = 'payment-456';
    const providerId = 'provider-789';

    // Act
    const result = getRedirectPaymentCallbackUrl(paymentId, providerId);

    // Assert
    expect(result).toBe('https://example.com/oidc/redirect/payment-456?provider_id=provider-789&proposal_id=proposal-123');
  });

  it('should handle URLs with ports', () => {
    // Arrange
    const mockOptions = {
      url: 'http://localhost:3000',
      oidc: {
        issuerType: 'OIDC',
      },
      proposalId: 'proposal-123',
    };
    mockGetSDKPaymentOptions.mockReturnValue(mockOptions);

    const paymentId = 'payment-456';
    const providerId = 'provider-789';

    // Act
    const result = getRedirectPaymentCallbackUrl(paymentId, providerId);

    // Assert
    expect(result).toBe('http://localhost:3000/oidc/redirect/payment-456?provider_id=provider-789&proposal_id=proposal-123');
  });

  it('should handle special characters in paymentId', () => {
    // Arrange
    const mockOptions = {
      url: 'https://example.com',
      oidc: {
        issuerType: 'OIDC',
      },
      proposalId: 'proposal-123',
    };
    mockGetSDKPaymentOptions.mockReturnValue(mockOptions);

    const paymentId = 'payment-456-special@chars';
    const providerId = 'provider-789';

    // Act
    const result = getRedirectPaymentCallbackUrl(paymentId, providerId);

    // Assert
    expect(result).toBe('https://example.com/oidc/redirect/payment-456-special@chars?provider_id=provider-789&proposal_id=proposal-123');
  });

  it('should handle special characters in providerId and proposalId', () => {
    // Arrange
    const mockOptions = {
      url: 'https://example.com',
      oidc: {
        issuerType: 'OIDC',
      },
      proposalId: 'proposal-123&test=value',
    };
    mockGetSDKPaymentOptions.mockReturnValue(mockOptions);

    const paymentId = 'payment-456';
    const providerId = 'provider-789&special=chars';

    // Act
    const result = getRedirectPaymentCallbackUrl(paymentId, providerId);

    // Assert
    const url = new URL(result);
    expect(url.origin + url.pathname).toBe('https://example.com/oidc/redirect/payment-456');
    expect(url.searchParams.get('provider_id')).toBe('provider-789&special=chars');
    expect(url.searchParams.get('proposal_id')).toBe('proposal-123&test=value');
  });
});