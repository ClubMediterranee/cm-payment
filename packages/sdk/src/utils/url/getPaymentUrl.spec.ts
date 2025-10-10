import { OidcIssuerTypes } from '../../types/SDKOptions.js';
import { getPaymentUrl } from './getPaymentUrl.js';

// Mock navigator.language
Object.defineProperty(window, 'navigator', {
  writable: true,
  value: {
    language: 'en-US',
  },
});

describe('getPaymentUrl', () => {
  const baseUrl = 'https://payment.clubmed.com';

  beforeEach(() => {
    // Reset navigator.language to default
    Object.defineProperty(window, 'navigator', {
      writable: true,
      value: {
        language: 'en-US',
      },
    });
  });

  describe('URL construction with proposalId', () => {
    it('should generate correct URL with proposalId for GM issuer type', () => {
      // Arrange
      const options = {
        issuerType: OidcIssuerTypes.GM,
        proposalId: 'proposal-123',
        customerId: 'customer-456',
        locale: 'fr-FR',
      };

      // Act
      const result = getPaymentUrl(baseUrl, options);

      // Assert
      expect(result).toBe(
        'https://payment.clubmed.com/GM/proposal/proposal-123?locale=fr-FR&customer_id=customer-456',
      );
    });

    it('should generate correct URL with proposalId for OIDC issuer type', () => {
      // Arrange
      const options = {
        issuerType: OidcIssuerTypes.GM,
        proposalId: 'proposal-123',
        customerId: 'customer-456',
        locale: 'en-US',
      };

      // Act
      const result = getPaymentUrl(baseUrl, options);

      // Assert
      expect(result).toBe(
        'https://payment.clubmed.com/GM/proposal/proposal-123?locale=en-US&customer_id=customer-456',
      );
    });

    it('should generate correct URL with proposalId for KEYCLOAK issuer type', () => {
      // Arrange
      const options = {
        issuerType: OidcIssuerTypes.GO,
        proposalId: 'proposal-123',
        customerId: 'customer-456',
        locale: 'de-DE',
      };

      // Act
      const result = getPaymentUrl(baseUrl, options);

      // Assert
      expect(result).toBe(
        'https://payment.clubmed.com/GO/proposal/proposal-123?locale=de-DE&customer_id=customer-456',
      );
    });
  });

  describe('URL construction with bookingId', () => {
    it('should generate correct URL with bookingId for GM issuer type', () => {
      // Arrange
      const options = {
        issuerType: OidcIssuerTypes.GM,
        bookingId: 'booking-789',
        customerId: 'customer-456',
        locale: 'fr-FR',
      };

      // Act
      const result = getPaymentUrl(baseUrl, options);

      // Assert
      expect(result).toBe(
        'https://payment.clubmed.com/GM/booking/booking-789?locale=fr-FR&customer_id=customer-456',
      );
    });

    it('should prioritize bookingId over proposalId when both are provided', () => {
      // Arrange
      const options = {
        issuerType: OidcIssuerTypes.GM,
        proposalId: 'proposal-123',
        bookingId: 'booking-789',
        customerId: 'customer-456',
        locale: 'en-US',
      };

      // Act
      const result = getPaymentUrl(baseUrl, options);

      // Assert
      expect(result).toBe(
        'https://payment.clubmed.com/GM/booking/booking-789?locale=en-US&customer_id=customer-456',
      );
    });
  });

  describe('Locale handling', () => {
    it('should use provided locale when specified', () => {
      // Arrange
      const options = {
        issuerType: OidcIssuerTypes.GM,
        proposalId: 'proposal-123',
        customerId: 'customer-456',
        locale: 'es-ES',
      };

      // Act
      const result = getPaymentUrl(baseUrl, options);

      // Assert
      expect(result).toContain('locale=es-ES');
    });

    it('should use navigator.language when locale is not provided', () => {
      // Arrange
      Object.defineProperty(window, 'navigator', {
        writable: true,
        value: {
          language: 'it-IT',
        },
      });

      const options = {
        issuerType: OidcIssuerTypes.GM,
        proposalId: 'proposal-123',
        customerId: 'customer-456',
      };

      // Act
      const result = getPaymentUrl(baseUrl, options);

      // Assert
      expect(result).toContain('locale=it-IT');
    });

    it('should default to fr-FR when locale is not provided and navigator.language is unavailable', () => {
      // Arrange
      Object.defineProperty(window, 'navigator', {
        writable: true,
        value: {
          language: null,
        },
      });

      const options = {
        issuerType: OidcIssuerTypes.GM,
        proposalId: 'proposal-123',
        customerId: 'customer-456',
      };

      // Act
      const result = getPaymentUrl(baseUrl, options);

      // Assert
      expect(result).toContain('locale=fr-FR');
    });
  });

  describe('CustomerId handling', () => {
    it('should include customerId in query parameters when provided', () => {
      // Arrange
      const options = {
        issuerType: OidcIssuerTypes.PARTNERS,
        proposalId: 'proposal-123',
        customerId: 'customer-456',
      };

      // Act
      const result = getPaymentUrl(baseUrl, options);

      // Assert
      expect(result).toContain('customer_id=customer-456');
    });

    it('should not include customerId in query parameters when not provided for GM issuer', () => {
      // Arrange
      const options = {
        issuerType: OidcIssuerTypes.GM,
        proposalId: 'proposal-123',
        customerId: '',
      };

      // Act
      const result = getPaymentUrl(baseUrl, options);

      // Assert
      expect(result).not.toContain('customer_id=');
    });
  });

  describe('Extra parameters', () => {
    it('should include extraParams in query parameters', () => {
      // Arrange
      const options = {
        issuerType: OidcIssuerTypes.GM,
        proposalId: 'proposal-123',
        customerId: 'customer-456',
        extraParams: {
          redirect_uri: 'https://example.com/callback',
          state: 'random-state',
        },
      };

      // Act
      const result = getPaymentUrl(baseUrl, options);

      // Assert
      expect(result).toContain('https%3A%2F%2Fexample.com%2Fcallback');
      expect(result).toContain('state=random-state');
    });

    it('should handle empty extraParams object', () => {
      // Arrange
      const options = {
        issuerType: OidcIssuerTypes.GM,
        proposalId: 'proposal-123',
        customerId: 'customer-456',
        extraParams: {},
      };

      // Act
      const result = getPaymentUrl(baseUrl, options);

      // Assert
      expect(result).toBe(
        'https://payment.clubmed.com/GM/proposal/proposal-123?locale=en-US&customer_id=customer-456',
      );
    });
  });

  describe('Error handling', () => {
    it('should throw error when customerId is required but not provided for non-GM issuer', () => {
      // Arrange
      const options = {
        issuerType: OidcIssuerTypes.GO,
        proposalId: 'proposal-123',
        customerId: '',
      };

      // Act & Assert
      expect(() => getPaymentUrl(baseUrl, options)).toThrow(
        'CustomerId is required for issuerType GO',
      );
    });

    it('should throw error when neither proposalId nor bookingId is provided', () => {
      // Arrange
      const options = {
        issuerType: OidcIssuerTypes.GM,
        customerId: 'customer-456',
      };

      // Act & Assert
      expect(() => getPaymentUrl(baseUrl, options)).toThrow(
        'Either proposalId or bookingId must be provided',
      );
    });

    it('should throw error when both proposalId and bookingId are empty strings', () => {
      // Arrange
      const options = {
        issuerType: OidcIssuerTypes.GM,
        proposalId: '',
        bookingId: '',
        customerId: 'customer-456',
      };

      // Act & Assert
      expect(() => getPaymentUrl(baseUrl, options)).toThrow(
        'Either proposalId or bookingId must be provided',
      );
    });
  });

  describe('URL handling', () => {
    it('should handle base URLs with existing paths', () => {
      // Arrange
      const baseUrlWithPath = 'https://payment.clubmed.com/api/v1';
      const options = {
        issuerType: OidcIssuerTypes.GM,
        proposalId: 'proposal-123',
        customerId: 'customer-456',
      };

      // Act
      const result = getPaymentUrl(baseUrlWithPath, options);

      // Assert
      expect(result).toBe(
        'https://payment.clubmed.com/GM/proposal/proposal-123?locale=en-US&customer_id=customer-456',
      );
    });

    it('should handle base URLs with ports', () => {
      // Arrange
      const baseUrlWithPort = 'http://localhost:3000';
      const options = {
        issuerType: OidcIssuerTypes.GM,
        proposalId: 'proposal-123',
        customerId: 'customer-456',
      };

      // Act
      const result = getPaymentUrl(baseUrlWithPort, options);

      // Assert
      expect(result).toBe(
        'http://localhost:3000/GM/proposal/proposal-123?locale=en-US&customer_id=customer-456',
      );
    });
  });

  describe('Special characters handling', () => {
    it('should handle special characters in IDs', () => {
      // Arrange
      const options = {
        issuerType: OidcIssuerTypes.GM,
        proposalId: 'proposal-123@special',
        customerId: 'customer-456&test=value',
      };

      // Act
      const result = getPaymentUrl(baseUrl, options);

      // Assert
      const url = new URL(result);
      expect(url.pathname).toBe('/GM/proposal/proposal-123@special');
      expect(url.searchParams.get('customer_id')).toBe('customer-456&test=value');
    });
  });
});
