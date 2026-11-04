import {
  clearSessionStorage,
  getSessionItem,
  getSessionKeys,
  hasSessionItem,
  removeSessionItem,
  setSessionItem,
} from './storage';

describe('storage utils', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  describe('setSessionItem', () => {
    it('stores a JSON object in sessionStorage', () => {
      const data = { name: 'test', value: 123 };
      const result = setSessionItem('stay' as any, data);

      expect(result).toBe(true);
      expect(sessionStorage.getItem('stay')).toBe(JSON.stringify(data));
    });

    it('stores a string in sessionStorage', () => {
      const data = 'test-value';
      const result = setSessionItem('userId' as any, data);

      expect(result).toBe(true);
      expect(sessionStorage.getItem('userId')).toBe(JSON.stringify(data));
    });

    it('stores a number in sessionStorage', () => {
      const data = 42;
      const result = setSessionItem('productId' as any, data);

      expect(result).toBe(true);
      expect(sessionStorage.getItem('productId')).toBe(JSON.stringify(data));
    });

    it('returns false when an error occurs', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => {
        throw new Error('Storage error');
      });

      const result = setSessionItem('stay' as any, { test: 'data' });

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('getSessionItem', () => {
    it('retrieves and parses a JSON object from sessionStorage', () => {
      const data = { name: 'test', value: 123 };
      sessionStorage.setItem('stay', JSON.stringify(data));

      const result = getSessionItem('stay' as any);

      expect(result).toEqual(data);
    });

    it('returns null if the key does not exist', () => {
      const result = getSessionItem('nonexistent' as any);

      expect(result).toBeNull();
    });

    it('returns null if the JSON is invalid', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      sessionStorage.setItem('invalid', 'invalid json {');

      const result = getSessionItem('invalid' as any);

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('returns null if an error occurs during read', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.spyOn(Storage.prototype, 'getItem').mockImplementationOnce(() => {
        throw new Error('Storage error');
      });

      const result = getSessionItem('stay' as any);

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('removeSessionItem', () => {
    it('removes an item from sessionStorage', () => {
      sessionStorage.setItem('stay', JSON.stringify({ test: 'data' }));

      const result = removeSessionItem('stay' as any);

      expect(result).toBe(true);
      expect(sessionStorage.getItem('stay')).toBeNull();
    });

    it('returns false if the key does not exist', () => {
      const result = removeSessionItem('nonexistent' as any);

      expect(result).toBe(false);
    });

    it('returns false when an error occurs', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.spyOn(Storage.prototype, 'removeItem').mockImplementationOnce(() => {
        throw new Error('Storage error');
      });

      const result = removeSessionItem('stay' as any);

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('hasSessionItem', () => {
    it('returns true if the key exists', () => {
      sessionStorage.setItem('stay', JSON.stringify({ test: 'data' }));

      const result = hasSessionItem('stay' as any);

      expect(result).toBe(true);
    });

    it('returns false if the key does not exist', () => {
      const result = hasSessionItem('nonexistent' as any);

      expect(result).toBe(false);
    });

    it('returns false when an error occurs', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.spyOn(Storage.prototype, 'getItem').mockImplementationOnce(() => {
        throw new Error('Storage error');
      });

      const result = hasSessionItem('stay' as any);

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('clearSessionStorage', () => {
    it('clears all sessionStorage', () => {
      sessionStorage.setItem('stay', JSON.stringify({ test: 'data' }));
      sessionStorage.setItem('userId', JSON.stringify('user123'));

      const result = clearSessionStorage();

      expect(result).toBe(true);
      expect(sessionStorage.length).toBe(0);
    });

    it('returns false when an error occurs', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.spyOn(Storage.prototype, 'clear').mockImplementationOnce(() => {
        throw new Error('Storage error');
      });

      const result = clearSessionStorage();

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('getSessionKeys', () => {
    it('returns all keys from sessionStorage', () => {
      sessionStorage.setItem('stay', JSON.stringify({ test: 'data' }));
      sessionStorage.setItem('userId', JSON.stringify('user123'));
      sessionStorage.setItem('productId', JSON.stringify(42));

      const keys = getSessionKeys();

      expect(keys).toHaveLength(3);
      expect(keys).toContain('stay');
      expect(keys).toContain('userId');
      expect(keys).toContain('productId');
    });

    it('returns an empty array if sessionStorage is empty', () => {
      const keys = getSessionKeys();

      expect(keys).toEqual([]);
    });

    it('returns an empty array when an error occurs', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      Object.defineProperty(Storage.prototype, 'length', {
        get: () => {
          throw new Error('Storage error');
        },
        configurable: true,
      });

      const keys = getSessionKeys();

      expect(keys).toEqual([]);
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });
});
