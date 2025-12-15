import { OidcIssuerTypes } from '../../types/CapsSettings';
import { getRedirectPaymentCallbackUrls } from './getRedirectPaymentCallbackUrls';

vi.mock('../../providers/CapsConfigProvider', () => ({
  getCapsConfig: vi.fn(),
}));

const { getCapsConfig } = await import('../../providers/CapsConfigProvider');
const mockGetCapsConfig = vi.mocked(getCapsConfig);

describe('getRedirectPaymentCallbackUrls', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GM issuerType', () => {
    it('returns only callback_url for GM without callbackUrlSeller', () => {
      mockGetCapsConfig.mockReturnValue({
        paymentGatewayUrl: 'https://payment.clubmed.com',
        oidc: { issuerType: OidcIssuerTypes.GM, accessToken: 'token' },
        type: 'booking',
        id: 'booking-123',
        callbackUrl: 'https://app.clubmed.com/confirmation',
        callbackUrlSeller: undefined,
      } as any);

      const result = getRedirectPaymentCallbackUrls('payment-456', 'PROVIDER-789');

      expect(result).toEqual({
        callback_url:
          'https://payment.clubmed.com/gm/redirect/payment-456?provider_id=PROVIDER-789&callback_url=https%3A%2F%2Fapp.clubmed.com%2Fconfirmation',
      });
      expect(result).not.toHaveProperty('callback_url_seller');
    });

    it('returns only callback_url for GM even with callbackUrlSeller provided', () => {
      mockGetCapsConfig.mockReturnValue({
        paymentGatewayUrl: 'https://payment.clubmed.com',
        oidc: { issuerType: OidcIssuerTypes.GM, accessToken: 'token' },
        type: 'booking',
        id: 'booking-123',
        callbackUrl: 'https://app.clubmed.com/client/confirmation',
        callbackUrlSeller: 'https://app.clubmed.com/seller/dashboard',
      } as any);

      const result = getRedirectPaymentCallbackUrls('payment-456', 'PROVIDER-789');

      expect(result).toEqual({
        callback_url:
          'https://payment.clubmed.com/gm/redirect/payment-456?provider_id=PROVIDER-789&callback_url=https%3A%2F%2Fapp.clubmed.com%2Fclient%2Fconfirmation',
      });
      expect(result).not.toHaveProperty('callback_url_seller');
    });
  });

  describe('GO issuerType', () => {
    it('returns only callback_url for GO without callbackUrlSeller', () => {
      mockGetCapsConfig.mockReturnValue({
        paymentGatewayUrl: 'https://payment.clubmed.com',
        oidc: { issuerType: OidcIssuerTypes.GO, accessToken: 'token' },
        type: 'booking',
        id: 'booking-123',
        callbackUrl: 'https://app.clubmed.com/confirmation',
        callbackUrlSeller: undefined,
      } as any);

      const result = getRedirectPaymentCallbackUrls('payment-456', 'PROVIDER-789');

      expect(result).toEqual({
        callback_url:
          'https://payment.clubmed.com/go/redirect/payment-456?provider_id=PROVIDER-789&callback_url=https%3A%2F%2Fapp.clubmed.com%2Fconfirmation',
      });
      expect(result).not.toHaveProperty('callback_url_seller');
    });

    it('returns both callback_url and callback_url_seller for GO with callbackUrlSeller', () => {
      mockGetCapsConfig.mockReturnValue({
        paymentGatewayUrl: 'https://payment.clubmed.com',
        oidc: { issuerType: OidcIssuerTypes.GO, accessToken: 'token' },
        type: 'booking',
        id: 'booking-123',
        callbackUrl: 'https://app.clubmed.com/client/confirmation',
        callbackUrlSeller: 'https://app.clubmed.com/seller/dashboard',
      } as any);

      const result = getRedirectPaymentCallbackUrls('payment-456', 'PROVIDER-789');

      expect(result).toEqual({
        callback_url:
          'https://payment.clubmed.com/go/redirect/payment-456?provider_id=PROVIDER-789&callback_url=https%3A%2F%2Fapp.clubmed.com%2Fclient%2Fconfirmation',
        callback_url_seller:
          'https://payment.clubmed.com/go/redirect/payment-456?provider_id=PROVIDER-789&callback_url=https%3A%2F%2Fapp.clubmed.com%2Fseller%2Fdashboard',
      });
    });
  });

  describe('PARTNERS issuerType', () => {
    it('returns only callback_url for PARTNERS without callbackUrlSeller', () => {
      mockGetCapsConfig.mockReturnValue({
        paymentGatewayUrl: 'https://payment.clubmed.com',
        oidc: { issuerType: OidcIssuerTypes.PARTNERS, accessToken: 'token' },
        type: 'proposal',
        id: 'proposal-999',
        callbackUrl: 'https://partner.com/confirmation',
        callbackUrlSeller: undefined,
      } as any);

      const result = getRedirectPaymentCallbackUrls('payment-777', 'PROVIDER-888');

      expect(result).toEqual({
        callback_url:
          'https://payment.clubmed.com/partners/redirect/payment-777?provider_id=PROVIDER-888&proposal_id=proposal-999&callback_url=https%3A%2F%2Fpartner.com%2Fconfirmation',
      });
      expect(result).not.toHaveProperty('callback_url_seller');
    });

    it('returns both callback_url and callback_url_seller for PARTNERS with callbackUrlSeller', () => {
      mockGetCapsConfig.mockReturnValue({
        paymentGatewayUrl: 'https://payment.clubmed.com',
        oidc: { issuerType: OidcIssuerTypes.PARTNERS, accessToken: 'token' },
        type: 'proposal',
        id: 'proposal-999',
        callbackUrl: 'https://partner.com/client/confirmation',
        callbackUrlSeller: 'https://partner.com/seller/dashboard',
      } as any);

      const result = getRedirectPaymentCallbackUrls('payment-777', 'PROVIDER-888');

      expect(result).toEqual({
        callback_url:
          'https://payment.clubmed.com/partners/redirect/payment-777?provider_id=PROVIDER-888&proposal_id=proposal-999&callback_url=https%3A%2F%2Fpartner.com%2Fclient%2Fconfirmation',
        callback_url_seller:
          'https://payment.clubmed.com/partners/redirect/payment-777?provider_id=PROVIDER-888&proposal_id=proposal-999&callback_url=https%3A%2F%2Fpartner.com%2Fseller%2Fdashboard',
      });
    });
  });

  describe('edge cases', () => {
    it('handles empty callbackUrl', () => {
      mockGetCapsConfig.mockReturnValue({
        paymentGatewayUrl: 'https://payment.clubmed.com',
        oidc: { issuerType: OidcIssuerTypes.GM, accessToken: 'token' },
        type: 'booking',
        id: 'booking-123',
        callbackUrl: '',
        callbackUrlSeller: undefined,
      } as any);

      const result = getRedirectPaymentCallbackUrls('payment-456', 'PROVIDER-789');

      expect(result).toEqual({
        callback_url:
          'https://payment.clubmed.com/gm/redirect/payment-456?provider_id=PROVIDER-789&callback_url=',
      });
    });

    it('handles empty providerId', () => {
      mockGetCapsConfig.mockReturnValue({
        paymentGatewayUrl: 'https://payment.clubmed.com',
        oidc: { issuerType: OidcIssuerTypes.GO, accessToken: 'token' },
        type: 'booking',
        id: 'booking-123',
        callbackUrl: 'https://app.clubmed.com/confirmation',
        callbackUrlSeller: 'https://app.clubmed.com/seller',
      } as any);

      const result = getRedirectPaymentCallbackUrls('payment-456', '');

      expect(result).toEqual({
        callback_url:
          'https://payment.clubmed.com/go/redirect/payment-456?callback_url=https%3A%2F%2Fapp.clubmed.com%2Fconfirmation',
        callback_url_seller:
          'https://payment.clubmed.com/go/redirect/payment-456?callback_url=https%3A%2F%2Fapp.clubmed.com%2Fseller',
      });
    });

    it('handles proposal type correctly', () => {
      mockGetCapsConfig.mockReturnValue({
        paymentGatewayUrl: 'https://payment.clubmed.com',
        oidc: { issuerType: OidcIssuerTypes.GO, accessToken: 'token' },
        type: 'proposal',
        id: 'proposal-555',
        callbackUrl: 'https://app.clubmed.com/confirmation',
        callbackUrlSeller: 'https://app.clubmed.com/seller',
      } as any);

      const result = getRedirectPaymentCallbackUrls('payment-456', 'PROVIDER-789');

      expect(result.callback_url).toContain('proposal_id=proposal-555');
      expect(result.callback_url_seller).toContain('proposal_id=proposal-555');
    });
  });
});
