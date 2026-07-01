import { getDefaultPaymentConditionId } from './paymentProviders';

describe('paymentProviders utils', () => {
  describe('getDefaultPaymentConditionId', () => {
    it('returns the first condition id of the first card type', () => {
      const provider = {
        payment_conditions: {
          Visa: [
            { id: 'visa-1x', payment_count: 1 },
            { id: 'visa-3x', payment_count: 3 },
          ],
        },
      } as any;

      expect(getDefaultPaymentConditionId(provider)).toBe('visa-1x');
    });

    it('returns undefined when the provider is undefined', () => {
      expect(getDefaultPaymentConditionId(undefined as any)).toBeUndefined();
    });

    it('returns undefined when payment_conditions has no entries', () => {
      expect(getDefaultPaymentConditionId({ payment_conditions: {} } as any)).toBeUndefined();
    });
  });
});
