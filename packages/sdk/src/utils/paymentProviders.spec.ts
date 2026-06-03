import { PaymentProvider1CategoryPaymentMethod } from '../__generated__/index.schemas';
import {
  enrichWithPaymentConditions,
  getDefaultPaymentConditionId,
  sortTimePaymentConditions,
  splitByCategory,
} from './paymentProviders';

const baseProvider = {
  id: 'EVOXPAY',
  label: 'Evoxpay',
  category_payment_method: PaymentProvider1CategoryPaymentMethod.CreditCard,
  connection_type: 'redirect',
  billing_address_form: false,
} as any;

describe('paymentProviders utils', () => {
  describe('sortTimePaymentConditions', () => {
    it('sorts each payment method conditions by payment_count ascending', () => {
      const sorted = sortTimePaymentConditions({
        ...baseProvider,
        payment_methods: [
          {
            id: 'visa',
            label: 'Visa',
            time_payment_conditions: [
              { id: 'visa-4x', payment_count: 4 },
              { id: 'visa-1x', payment_count: 1 },
              { id: 'visa-3x', payment_count: 3 },
            ],
          },
        ],
      });

      expect(sorted.payment_methods![0].time_payment_conditions!.map((c) => c.id)).toEqual([
        'visa-1x',
        'visa-3x',
        'visa-4x',
      ]);
    });

    it('treats a missing payment_count as 0 for sorting', () => {
      const sorted = sortTimePaymentConditions({
        ...baseProvider,
        payment_methods: [
          {
            id: 'visa',
            label: 'Visa',
            time_payment_conditions: [{ id: 'visa-3x', payment_count: 3 }, { id: 'visa-default' }],
          },
        ],
      });

      expect(sorted.payment_methods![0].time_payment_conditions!.map((c) => c.id)).toEqual([
        'visa-default',
        'visa-3x',
      ]);
    });

    it('keeps time_payment_conditions untouched when undefined', () => {
      const sorted = sortTimePaymentConditions({
        ...baseProvider,
        payment_methods: [{ id: 'visa', label: 'Visa' }],
      });

      expect(sorted.payment_methods![0].time_payment_conditions).toBeUndefined();
    });

    it('returns an undefined payment_methods when the provider has none', () => {
      const sorted = sortTimePaymentConditions({ ...baseProvider, payment_methods: undefined });
      expect(sorted.payment_methods).toBeUndefined();
    });
  });

  describe('enrichWithPaymentConditions', () => {
    it('maps payment_methods by label into payment_conditions', () => {
      const enriched = enrichWithPaymentConditions({
        ...baseProvider,
        payment_methods: [
          {
            id: 'visa',
            label: 'Visa',
            time_payment_conditions: [{ id: 'visa-1x', payment_count: 1 }],
          },
          {
            id: 'mastercard',
            label: 'Mastercard',
            time_payment_conditions: [{ id: 'mc-1x', payment_count: 1 }],
          },
        ],
      });

      expect(Object.keys(enriched.payment_conditions)).toEqual(['Visa', 'Mastercard']);
      expect(enriched.payment_conditions.Visa).toHaveLength(1);
    });

    it('falls back to the method id when label is missing', () => {
      const enriched = enrichWithPaymentConditions({
        ...baseProvider,
        payment_methods: [
          {
            id: 'unlabeled',
            time_payment_conditions: [{ id: 'cond-1', payment_count: 1 }],
          },
        ],
      });

      expect(Object.keys(enriched.payment_conditions)).toEqual(['unlabeled']);
    });

    it('uses an empty array when a method has no time_payment_conditions', () => {
      const enriched = enrichWithPaymentConditions({
        ...baseProvider,
        payment_methods: [{ id: 'visa', label: 'Visa' }],
      });

      expect(enriched.payment_conditions.Visa).toEqual([]);
    });

    it('returns an empty payment_conditions when the provider has no payment_methods', () => {
      const enriched = enrichWithPaymentConditions({
        ...baseProvider,
        payment_methods: undefined,
      });

      expect(enriched.payment_conditions).toEqual({});
    });
  });

  describe('splitByCategory', () => {
    it('pushes BuyNowPayLater providers into buyNowPayLaterProviders', () => {
      const result = splitByCategory(
        { paymentProviders: [], buyNowPayLaterProviders: [] },
        {
          ...baseProvider,
          category_payment_method: PaymentProvider1CategoryPaymentMethod.BuyNowPayLater,
        },
      );

      expect(result.buyNowPayLaterProviders).toHaveLength(1);
      expect(result.paymentProviders).toHaveLength(0);
    });

    it('pushes other categories into paymentProviders', () => {
      const result = splitByCategory(
        { paymentProviders: [], buyNowPayLaterProviders: [] },
        baseProvider,
      );

      expect(result.paymentProviders).toHaveLength(1);
      expect(result.buyNowPayLaterProviders).toHaveLength(0);
    });
  });

  describe('getDefaultPaymentConditionId', () => {
    it('returns the first condition id of the first card type', () => {
      const enriched = enrichWithPaymentConditions({
        ...baseProvider,
        payment_methods: [
          {
            id: 'visa',
            label: 'Visa',
            time_payment_conditions: [
              { id: 'visa-1x', payment_count: 1 },
              { id: 'visa-3x', payment_count: 3 },
            ],
          },
        ],
      });

      expect(getDefaultPaymentConditionId(enriched)).toBe('visa-1x');
    });

    it('returns undefined when the provider is undefined', () => {
      expect(getDefaultPaymentConditionId(undefined)).toBeUndefined();
    });

    it('returns undefined when payment_conditions has no entries', () => {
      const enriched = enrichWithPaymentConditions({
        ...baseProvider,
        payment_methods: undefined,
      });

      expect(getDefaultPaymentConditionId(enriched)).toBeUndefined();
    });
  });
});
