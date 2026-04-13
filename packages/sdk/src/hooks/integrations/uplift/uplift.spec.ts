import { computePriceInCents } from './uplift';

describe('uplift utilities', () => {
  describe('computePriceInCents', () => {
    it('should convert dollars to cents', () => {
      expect(computePriceInCents(10)).toBe(1000);
      expect(computePriceInCents(99.99)).toBe(9999);
      expect(computePriceInCents(0)).toBe(0);
    });

    it('should round fractional cents', () => {
      expect(computePriceInCents(10.555)).toBe(1056);
      expect(computePriceInCents(10.554)).toBe(1055);
    });

    it('should handle large amounts', () => {
      expect(computePriceInCents(1000000)).toBe(100000000);
    });
  });
});
