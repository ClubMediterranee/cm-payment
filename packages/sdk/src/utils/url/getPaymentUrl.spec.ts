import { OidcIssuerTypes } from '../../types/CapsSettings.js';
import { getPaymentUrl } from './getPaymentUrl.js';

Object.defineProperty(window, 'navigator', {
  writable: true,
  value: {
    language: 'en-US',
  },
});

describe('getPaymentUrl', () => {
  const baseUrl = 'https://payment.clubmed.com';

  beforeEach(() => {
    Object.defineProperty(window, 'navigator', {
      writable: true,
      value: {
        language: 'en-US',
      },
    });
  });

  describe('URL construction with type and id', () => {
    it('should generate correct URL with proposal type for GM issuer', () => {
      const options = {
        issuerType: OidcIssuerTypes.GM,
        type: 'proposal' as const,
        id: 'proposal-123',
        customerId: 'customer-456',
        locale: 'fr-FR',
      };

      const result = getPaymentUrl(baseUrl, options);

      expect(result).toBe(
        'https://payment.clubmed.com/GM/proposal/proposal-123?locale=fr-FR&customer_id=customer-456',
      );
    });

    it('should generate correct URL with booking type for GM issuer', () => {
      const options = {
        issuerType: OidcIssuerTypes.GM,
        type: 'booking' as const,
        id: 'booking-789',
        customerId: 'customer-456',
        locale: 'fr-FR',
      };

      const result = getPaymentUrl(baseUrl, options);

      expect(result).toBe(
        'https://payment.clubmed.com/GM/booking/booking-789?locale=fr-FR&customer_id=customer-456',
      );
    });

    it('should generate correct URL for GO issuer type', () => {
      const options = {
        issuerType: OidcIssuerTypes.GO,
        type: 'proposal' as const,
        id: 'proposal-123',
        customerId: 'customer-456',
        locale: 'de-DE',
      };

      const result = getPaymentUrl(baseUrl, options);

      expect(result).toBe(
        'https://payment.clubmed.com/GO/proposal/proposal-123?locale=de-DE&customer_id=customer-456',
      );
    });
  });

  describe('Locale handling', () => {
    it('should use provided locale when specified', () => {
      const options = {
        issuerType: OidcIssuerTypes.GM,
        type: 'proposal' as const,
        id: 'proposal-123',
        customerId: 'customer-456',
        locale: 'es-ES',
      };

      const result = getPaymentUrl(baseUrl, options);

      expect(result).toContain('locale=es-ES');
    });

    it('should use navigator.language when locale is not provided', () => {
      Object.defineProperty(window, 'navigator', {
        writable: true,
        value: {
          language: 'it-IT',
        },
      });

      const options = {
        issuerType: OidcIssuerTypes.GM,
        type: 'proposal' as const,
        id: 'proposal-123',
        customerId: 'customer-456',
      };

      const result = getPaymentUrl(baseUrl, options);

      expect(result).toContain('locale=it-IT');
    });

    it('should default to fr-FR when locale is not provided and navigator.language is unavailable', () => {
      Object.defineProperty(window, 'navigator', {
        writable: true,
        value: {
          language: null,
        },
      });

      const options = {
        issuerType: OidcIssuerTypes.GM,
        type: 'proposal' as const,
        id: 'proposal-123',
        customerId: 'customer-456',
      };

      const result = getPaymentUrl(baseUrl, options);

      expect(result).toContain('locale=fr-FR');
    });
  });

  describe('CustomerId handling', () => {
    it('should include customerId in query parameters when provided', () => {
      const options = {
        issuerType: OidcIssuerTypes.PARTNERS,
        type: 'proposal' as const,
        id: 'proposal-123',
        customerId: 'customer-456',
        locale: 'en-US',
      };

      const result = getPaymentUrl(baseUrl, options);

      expect(result).toContain('customer_id=customer-456');
    });

    it('should not include customerId in query parameters when not provided for GM issuer', () => {
      const options = {
        issuerType: OidcIssuerTypes.GM,
        type: 'proposal' as const,
        id: 'proposal-123',
        customerId: '',
        locale: 'en-US',
      };

      const result = getPaymentUrl(baseUrl, options);

      expect(result).not.toContain('customer_id=');
    });

    it('should throw error when customerId is required but not provided for non-GM issuer', () => {
      const options = {
        issuerType: OidcIssuerTypes.GO,
        type: 'proposal' as const,
        id: 'proposal-123',
        customerId: '',
        locale: 'en-US',
      };

      expect(() => getPaymentUrl(baseUrl, options)).toThrow(
        'CustomerId is required for issuerType GO',
      );
    });
  });

  describe('Extra parameters', () => {
    it('should include extraParams in query parameters', () => {
      const options = {
        issuerType: OidcIssuerTypes.GM,
        type: 'proposal' as const,
        id: 'proposal-123',
        customerId: 'customer-456',
        locale: 'en-US',
        extraParams: {
          redirect_uri: 'https://example.com/callback',
          state: 'random-state',
        },
      };

      const result = getPaymentUrl(baseUrl, options);

      expect(result).toContain('https%3A%2F%2Fexample.com%2Fcallback');
      expect(result).toContain('state=random-state');
    });

    it('should handle empty extraParams object', () => {
      const options = {
        issuerType: OidcIssuerTypes.GM,
        type: 'proposal' as const,
        id: 'proposal-123',
        customerId: 'customer-456',
        locale: 'en-US',
        extraParams: {},
      };

      const result = getPaymentUrl(baseUrl, options);

      expect(result).toBe(
        'https://payment.clubmed.com/GM/proposal/proposal-123?locale=en-US&customer_id=customer-456',
      );
    });
  });

  describe('URL handling', () => {
    it('should handle base URLs with ports', () => {
      const baseUrlWithPort = 'http://localhost:3000';
      const options = {
        issuerType: OidcIssuerTypes.GM,
        type: 'proposal' as const,
        id: 'proposal-123',
        customerId: 'customer-456',
        locale: 'en-US',
      };

      const result = getPaymentUrl(baseUrlWithPort, options);

      expect(result).toBe(
        'http://localhost:3000/GM/proposal/proposal-123?locale=en-US&customer_id=customer-456',
      );
    });
  });

  describe('Special characters handling', () => {
    it('should handle special characters in query parameters', () => {
      const options = {
        issuerType: OidcIssuerTypes.GM,
        type: 'proposal' as const,
        id: 'proposal-123',
        customerId: 'customer-456&test=value',
        locale: 'en-US',
      };

      const result = getPaymentUrl(baseUrl, options);

      const url = new URL(result);
      expect(url.searchParams.get('customer_id')).toBe('customer-456&test=value');
    });
  });
});
