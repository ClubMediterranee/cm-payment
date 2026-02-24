import { describe, expect, it } from 'vitest';

import { getPaymentValidationStrategy } from './getPaymentValidationStrategy.js';

describe('getPaymentValidationStrategy', () => {
  it('should return polling for EVOXPAY provider', () => {
    expect(getPaymentValidationStrategy('EVOXPAY')).toBe('polling');
    expect(getPaymentValidationStrategy('EVOXPAY_V2')).toBe('polling');
  });

  it('should return polling for EPAYGATE provider', () => {
    expect(getPaymentValidationStrategy('EPAYGATE')).toBe('polling');
    expect(getPaymentValidationStrategy('EPAYGATE_V2')).toBe('polling');
  });

  it('should return notify for HIPAY provider', () => {
    expect(getPaymentValidationStrategy('HIPAY')).toBe('notify');
  });

  it('should return notify for EGLOBALCOLLECT provider', () => {
    expect(getPaymentValidationStrategy('EGLOBALCOLLECT')).toBe('notify');
  });

  it('should return notify by default for unknown provider', () => {
    expect(getPaymentValidationStrategy('UNKNOWN_PROVIDER')).toBe('notify');
  });

  it('should return notify when no provider is specified', () => {
    expect(getPaymentValidationStrategy()).toBe('notify');
    expect(getPaymentValidationStrategy('')).toBe('notify');
  });
});
