import { BadRequest } from '@tsed/exceptions';
import { describe, expect, it } from 'vitest';

import { OidcIssuerTypes } from '../services/payment_config/types.js';
import { IssuerTypePipe } from './IssuerType.js';

describe('IssuerTypePipe', () => {
  const pipe = new IssuerTypePipe();

  it('should default to GM when absent', () => {
    expect(pipe.transform(undefined)).toBe(OidcIssuerTypes.GM);
  });

  it('should accept valid issuer types', () => {
    expect(pipe.transform('GO')).toBe(OidcIssuerTypes.GO);
    expect(pipe.transform('PARTNERS')).toBe(OidcIssuerTypes.PARTNERS);
  });

  it('should throw BadRequest on an invalid issuer type', () => {
    expect(() => pipe.transform('BOGUS')).toThrow(BadRequest);
    expect(() => pipe.transform('BOGUS')).toThrow(/Invalid issuer type/);
  });
});
