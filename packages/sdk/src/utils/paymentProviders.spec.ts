import { getDefaultPaymentConditionId, getDefaultSelection } from './paymentProviders';

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

  describe('getDefaultSelection', () => {
    const provider = (id: string, maxAmount?: number) =>
      ({ id, configuration: { settings: { max_amount: maxAmount } } }) as any;
    const base = {
      isPartial: false,
      paymentSchedule: [{ amount: 3000 }],
      paymentProviders: [provider('card'), provider('paypal')],
      buyNowPayLaterProviders: [],
    };

    it('preselects the stay amount and the first provider outside the stepper', () => {
      const { amount, provider: selected } = getDefaultSelection({
        ...base,
        paymentSchedule: [{ amount: 3000 }, { amount: 500 }],
      });

      expect(amount).toBe('3000');
      expect(selected?.id).toBe('card');
    });

    it('leaves the amount and the provider empty in the stepper when the user has a choice', () => {
      const { amount, provider: selected } = getDefaultSelection({
        ...base,
        stepper: true,
        paymentSchedule: [{ amount: 3000 }, { amount: 500 }],
      });

      expect(amount).toBe('');
      expect(selected).toBeUndefined();
    });

    it('counts an active BNPL provider as a schedule choice', () => {
      expect(
        getDefaultSelection({ ...base, stepper: true, buyNowPayLaterProviders: [provider('oney')] })
          .amount,
      ).toBe('');
      expect(
        getDefaultSelection({
          ...base,
          stepper: true,
          buyNowPayLaterProviders: [provider('oney', 1000)],
        }).amount,
      ).toBe('3000');
    });

    it('keeps the amount of a partial payment and a single provider in the stepper', () => {
      const { amount, provider: selected } = getDefaultSelection({
        ...base,
        stepper: true,
        isPartial: true,
        paymentSchedule: [{ amount: 3000 }, { amount: 500 }],
        paymentProviders: [provider('card')],
      });

      expect(amount).toBe('3000');
      expect(selected?.id).toBe('card');
    });
  });
});
