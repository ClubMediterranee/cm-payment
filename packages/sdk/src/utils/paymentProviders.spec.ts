import { PaymentProvider1CategoryPaymentMethod } from '../__generated__/index.schemas';
import { getDefaultPaymentConditionId } from './paymentProviders';

const baseProvider = {
  id: 'EVOXPAY',
  label: 'Evoxpay',
  category_payment_method: PaymentProvider1CategoryPaymentMethod.CreditCard,
  connection_type: 'redirect',
  billing_address_form: false,
} as any;

describe('paymentProviders utils', () => {
  describe('getDefaultPaymentConditionId', () => {
    it('returns the first condition id of the first card type', () => {
      const provider = {
        ...baseProvider,
        payment_conditions: {
          visa: [
            { id: 'visa-1x', payment_count: 1 },
            { id: 'visa-3x', payment_count: 3 },
          ],
        },
      };

      expect(getDefaultPaymentConditionId(provider)).toBe('visa-1x');
    });

    it('returns undefined when the provider is undefined', () => {
      expect(getDefaultPaymentConditionId(undefined)).toBeUndefined();
    });

    it('returns undefined when payment_conditions has no entries', () => {
      const provider = {
        ...baseProvider,
        payment_conditions: {},
      };

      expect(getDefaultPaymentConditionId(provider)).toBeUndefined();
    });
  });
});
