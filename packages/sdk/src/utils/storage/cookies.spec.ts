import Cookies from 'js-cookie';

import { COOKIE_KEYS, getCookie, setCookie } from './cookies.js';

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

  describe('setCookie', () => {
    it('should set cookie with correct options when value is provided', () => {
      const key = 'test_key';
      const value = 'test_value';

      setCookie(key, value);

      expect(mockCookies.set).toHaveBeenCalledWith(key, value, {
        sameSite: 'none',
        secure: true,
        expires: 1 / 48,
      });
    });

    it('should set cookie with custom expiration when provided', () => {
      const key = 'test_key';
      const value = 'test_value';
      const expires = 7;

      setCookie(key, value, expires);

      expect(mockCookies.set).toHaveBeenCalledWith(key, value, {
        sameSite: 'none',
        secure: true,
        expires: 7,
      });
    });

    it('should use COOKIE_KEYS constant for callback URL', () => {
      const value = 'https://example.com/callback';

      setCookie(COOKIE_KEYS.CALLBACK_URL, value);

      expect(mockCookies.set).toHaveBeenCalledWith('callback_url', value, {
        sameSite: 'none',
        secure: true,
        expires: 1 / 48,
      });
    });
  });

  describe('getCookie', () => {
    it('should get cookie value', () => {
      const key = 'test_key';
      const expectedValue = 'test_value';
      mockCookies.get.mockReturnValue(expectedValue);

      const result = getCookie(key);

      expect(mockCookies.get).toHaveBeenCalledWith(key);
      expect(result).toBe(expectedValue);
    });

    it('should return undefined when cookie does not exist', () => {
      const key = 'non_existent_key';
      mockCookies.get.mockReturnValue(undefined);

      const result = getCookie(key);

      expect(mockCookies.get).toHaveBeenCalledWith(key);
      expect(result).toBeUndefined();
    });

    it('should use COOKIE_KEYS constant for callback URL', () => {
      const expectedUrl = 'https://example.com/callback';
      mockCookies.get.mockReturnValue(expectedUrl);

      const result = getCookie(COOKIE_KEYS.CALLBACK_URL);

      expect(mockCookies.get).toHaveBeenCalledWith('callback_url');
      expect(result).toBe(expectedUrl);
    });
  });

  describe('Cookie security settings', () => {
    it('should use secure: true for all cookies', () => {
      setCookie('test_key', 'test_value');

      expect(mockCookies.set).toHaveBeenCalledWith(
        'test_key',
        'test_value',
        expect.objectContaining({ secure: true }),
      );
    });

    it('should use sameSite: none for all cookies', () => {
      setCookie('test_key', 'test_value');

      expect(mockCookies.set).toHaveBeenCalledWith(
        'test_key',
        'test_value',
        expect.objectContaining({ sameSite: 'none' }),
      );
    });
  });

  describe('Cookie expiration', () => {
    it('should default to 30 minutes (1/48 days) expiration', () => {
      setCookie('test_key', 'test_value');

      expect(mockCookies.set).toHaveBeenCalledWith(
        'test_key',
        'test_value',
        expect.objectContaining({ expires: 1 / 48 }),
      );
    });
  });
});
