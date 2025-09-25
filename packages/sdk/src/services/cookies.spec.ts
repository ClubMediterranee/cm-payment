import Cookies from 'js-cookie';

import { getCallbackUrl, setCallbackUrl, setCustomerId } from './cookies.js';

// Mock js-cookie
vi.mock('js-cookie', () => ({
  default: {
    set: vi.fn(),
    get: vi.fn(),
  },
}));

const mockCookies = vi.mocked(Cookies);

describe('cookies service', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('setCallbackUrl', () => {
    it('should set callback_url cookie with correct options when callbackUrl is provided', () => {
      // Arrange
      const callbackUrl = 'https://example.com/callback';

      // Act
      setCallbackUrl(callbackUrl);

      // Assert
      expect(mockCookies.set).toHaveBeenCalledWith('callback_url', callbackUrl, {
        sameSite: 'none',
        secure: true,
        expires: 1 / 48, // 30 minutes
      });
    });

    it('should not set cookie when callbackUrl is empty string', () => {
      // Arrange
      const callbackUrl = '';

      // Act
      setCallbackUrl(callbackUrl);

      // Assert
      expect(mockCookies.set).not.toHaveBeenCalled();
    });

    it('should not set cookie when callbackUrl is undefined', () => {
      // Arrange
      const callbackUrl = undefined;

      // Act
      setCallbackUrl(callbackUrl);

      // Assert
      expect(mockCookies.set).not.toHaveBeenCalled();
    });

    it('should not set cookie when callbackUrl is null', () => {
      // Arrange
      const callbackUrl = null;

      // Act
      setCallbackUrl(callbackUrl as any);

      // Assert
      expect(mockCookies.set).not.toHaveBeenCalled();
    });

    it('should set cookie when callbackUrl is a valid URL with special characters', () => {
      // Arrange
      const callbackUrl = 'https://example.com/callback?param=value&other=test';

      // Act
      setCallbackUrl(callbackUrl);

      // Assert
      expect(mockCookies.set).toHaveBeenCalledWith('callback_url', callbackUrl, {
        sameSite: 'none',
        secure: true,
        expires: 1 / 48,
      });
    });

    it('should set cookie when callbackUrl is a relative path', () => {
      // Arrange
      const callbackUrl = '/callback';

      // Act
      setCallbackUrl(callbackUrl);

      // Assert
      expect(mockCookies.set).toHaveBeenCalledWith('callback_url', callbackUrl, {
        sameSite: 'none',
        secure: true,
        expires: 1 / 48,
      });
    });
  });

  describe('getCallbackUrl', () => {
    it('should return the callback_url cookie value', () => {
      // Arrange
      const expectedUrl = 'https://example.com/callback';
      mockCookies.get.mockReturnValue(expectedUrl);

      // Act
      const result = getCallbackUrl();

      // Assert
      expect(result).toBe(expectedUrl);
      expect(mockCookies.get).toHaveBeenCalledWith('callback_url');
    });

    it('should return undefined when cookie does not exist', () => {
      // Arrange
      mockCookies.get.mockReturnValue(undefined);

      // Act
      const result = getCallbackUrl();

      // Assert
      expect(result).toBeUndefined();
      expect(mockCookies.get).toHaveBeenCalledWith('callback_url');
    });

    it('should return empty string when cookie is empty', () => {
      // Arrange
      mockCookies.get.mockReturnValue('');

      // Act
      const result = getCallbackUrl();

      // Assert
      expect(result).toBe('');
      expect(mockCookies.get).toHaveBeenCalledWith('callback_url');
    });
  });

  describe('setCustomerId', () => {
    it('should set customer_id cookie with correct options when customerId is provided', () => {
      // Arrange
      const customerId = 'customer-123';

      // Act
      setCustomerId(customerId);

      // Assert
      expect(mockCookies.set).toHaveBeenCalledWith('customer_id', customerId, {
        sameSite: 'none',
        secure: true,
      });
    });

    it('should not set cookie when customerId is empty string', () => {
      // Arrange
      const customerId = '';

      // Act
      setCustomerId(customerId);

      // Assert
      expect(mockCookies.set).not.toHaveBeenCalled();
    });

    it('should not set cookie when customerId is undefined', () => {
      // Arrange
      const customerId = undefined;

      // Act
      setCustomerId(customerId);

      // Assert
      expect(mockCookies.set).not.toHaveBeenCalled();
    });

    it('should not set cookie when customerId is null', () => {
      // Arrange
      const customerId = null;

      // Act
      setCustomerId(customerId as any);

      // Assert
      expect(mockCookies.set).not.toHaveBeenCalled();
    });

    it('should set cookie when customerId contains special characters', () => {
      // Arrange
      const customerId = 'customer-123@special';

      // Act
      setCustomerId(customerId);

      // Assert
      expect(mockCookies.set).toHaveBeenCalledWith('customer_id', customerId, {
        sameSite: 'none',
        secure: true,
      });
    });

    it('should set cookie when customerId is a numeric string', () => {
      // Arrange
      const customerId = '12345';

      // Act
      setCustomerId(customerId);

      // Assert
      expect(mockCookies.set).toHaveBeenCalledWith('customer_id', customerId, {
        sameSite: 'none',
        secure: true,
      });
    });

    it('should not set expires option for customer_id cookie', () => {
      // Arrange
      const customerId = 'customer-123';

      // Act
      setCustomerId(customerId);

      // Assert
      expect(mockCookies.set).toHaveBeenCalledWith('customer_id', customerId, {
        sameSite: 'none',
        secure: true,
        // Note: no expires option should be set for customer_id
      });

      // Verify that expires is not in the options
      const callArgs = mockCookies.set.mock.calls[0];
      expect(callArgs[2]).not.toHaveProperty('expires');
    });
  });

  describe('Cookie security settings', () => {
    it('should use secure: true for all cookies', () => {
      // Arrange & Act
      setCallbackUrl('https://example.com');
      setCustomerId('customer-123');

      // Assert
      expect(mockCookies.set).toHaveBeenCalledWith(
        'callback_url',
        'https://example.com',
        expect.objectContaining({ secure: true }),
      );
      expect(mockCookies.set).toHaveBeenCalledWith(
        'customer_id',
        'customer-123',
        expect.objectContaining({ secure: true }),
      );
    });

    it('should use sameSite: none for all cookies', () => {
      // Arrange & Act
      setCallbackUrl('https://example.com');
      setCustomerId('customer-123');

      // Assert
      expect(mockCookies.set).toHaveBeenCalledWith(
        'callback_url',
        'https://example.com',
        expect.objectContaining({ sameSite: 'none' }),
      );
      expect(mockCookies.set).toHaveBeenCalledWith(
        'customer_id',
        'customer-123',
        expect.objectContaining({ sameSite: 'none' }),
      );
    });
  });

  describe('Cookie expiration', () => {
    it('should set callback_url cookie to expire in 30 minutes (1/48 days)', () => {
      // Arrange
      const callbackUrl = 'https://example.com/callback';

      // Act
      setCallbackUrl(callbackUrl);

      // Assert
      expect(mockCookies.set).toHaveBeenCalledWith(
        'callback_url',
        callbackUrl,
        expect.objectContaining({ expires: 1 / 48 }),
      );
    });

    it('should not set expiration for customer_id cookie (session cookie)', () => {
      // Arrange
      const customerId = 'customer-123';

      // Act
      setCustomerId(customerId);

      // Assert
      const callArgs = mockCookies.set.mock.calls[0];
      expect(callArgs[2]).not.toHaveProperty('expires');
    });
  });
});
