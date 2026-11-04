import { describe, expect, it } from 'vitest';

import { DEFAULT_LOCALE } from '../services/payment_config/constants.js';
import { LocalePipe } from './Locale.js';

describe('LocalePipe', () => {
  const pipe = new LocalePipe();

  it('should return the header value when present', () => {
    expect(pipe.transform('en-US')).toBe('en-US');
  });

  it('should fall back to DEFAULT_LOCALE when absent', () => {
    expect(pipe.transform(undefined)).toBe(DEFAULT_LOCALE);
    expect(pipe.transform('')).toBe(DEFAULT_LOCALE);
  });
});
