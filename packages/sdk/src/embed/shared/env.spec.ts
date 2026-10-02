import { CAPS_ENV_URLS, resolveCapsUrl } from './env';
import type { CapsEnv } from './types';

describe('resolveCapsUrl', () => {
  it('should default to production', () => {
    expect(resolveCapsUrl()).toBe('https://caps.api.clubmed');
    expect(resolveCapsUrl({})).toBe('https://caps.api.clubmed');
  });

  it('should resolve each environment', () => {
    expect(resolveCapsUrl({ env: 'production' })).toBe('https://caps.api.clubmed');
    expect(resolveCapsUrl({ env: 'staging' })).toBe('https://staging.caps.api.clubmed');
    expect(resolveCapsUrl({ env: 'integration' })).toBe('https://integration.caps.api.clubmed');
  });

  it('should give precedence to an explicit url and strip trailing slashes', () => {
    expect(resolveCapsUrl({ env: 'production', url: 'https://localhost:8083/' })).toBe(
      'https://localhost:8083',
    );
    expect(resolveCapsUrl({ url: 'https://preview.example/caps//' })).toBe(
      'https://preview.example/caps',
    );
  });

  it('should throw on an unknown environment', () => {
    expect(() => resolveCapsUrl({ env: 'qa' as CapsEnv })).toThrow('Unknown environment "qa"');
    expect(() => resolveCapsUrl({ env: 'toString' as CapsEnv })).toThrow('Unknown environment');
  });

  it('should expose a frozen map', () => {
    expect(Object.isFrozen(CAPS_ENV_URLS)).toBe(true);
  });
});
