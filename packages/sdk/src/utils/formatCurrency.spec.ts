import { formatCurrency } from './formatCurrency';

describe('formatCurrency', () => {
  it('formats amount with currency symbol on the right', () => {
    const result = formatCurrency({
      amount: 1234.56,
      currency: 'EUR',
      locale: 'fr-FR',
    });
    expect(result).toBe('1\u202f234,56\u00a0€');
  });

  it('formats amount with currency symbol on the left', () => {
    const result = formatCurrency({
      amount: 1234.56,
      currency: 'USD',
      locale: 'en-US',
    });
    expect(result).toBe('$1,234.56');
  });

  it('handles zero amount', () => {
    const result = formatCurrency({
      amount: 0,
      currency: 'EUR',
      locale: 'fr-FR',
    });
    expect(result).toBe('0,00\u00a0€');
  });

  it('handles negative amount', () => {
    const result = formatCurrency({
      amount: -50.25,
      currency: 'USD',
      locale: 'en-US',
    });
    expect(result).toBe('-$50.25');
  });

  it('rounds decimal places correctly', () => {
    const result = formatCurrency({
      amount: 123.456,
      currency: 'EUR',
      locale: 'fr-FR',
    });
    expect(result).toBe('123,46\u00a0€');
  });
});
