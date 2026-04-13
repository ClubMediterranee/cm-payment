import { PaymentProvider1CategoryPaymentMethod } from '../../../__generated__/index.schemas';
import { PspProviders } from '../../../types/PspProviders';
import { selectPaymentProviders } from './selectPaymentProviders';

describe('selectPaymentProviders', () => {
  it('should split providers into paymentProviders and buyNowPayLaterProviders', () => {
    const providers = [
      {
        id: PspProviders.EVOXPAY,
        name: 'Evoxpay',
        category_payment_method: PaymentProvider1CategoryPaymentMethod.Payment,
        configuration: {
          is_active: true,
          display_type: 'redirect' as const,
          settings: {},
        },
      },
      {
        id: PspProviders.EHIPAYBNPL,
        name: 'Oney',
        category_payment_method: PaymentProvider1CategoryPaymentMethod.BuyNowPayLater,
        configuration: {
          is_active: true,
          display_type: 'redirect' as const,
          settings: {},
        },
      },
    ] as any;

    const result = selectPaymentProviders(providers);

    expect(result).toHaveProperty('paymentProviders');
    expect(result).toHaveProperty('buyNowPayLaterProviders');
    expect(result.paymentProviders).toHaveLength(1);
    expect(result.buyNowPayLaterProviders).toHaveLength(1);
    expect(result.paymentProviders[0].id).toBe(PspProviders.EVOXPAY);
    expect(result.buyNowPayLaterProviders[0].id).toBe(PspProviders.EHIPAYBNPL);
  });

  it('should handle empty provider list', () => {
    const result = selectPaymentProviders([]);

    expect(result).toEqual({
      paymentProviders: [],
      buyNowPayLaterProviders: [],
    });
  });

  it('should handle all payment providers', () => {
    const providers = [
      {
        id: PspProviders.EVOXPAY,
        name: 'Evoxpay',
        category_payment_method: PaymentProvider1CategoryPaymentMethod.Payment,
        configuration: {
          is_active: true,
          display_type: 'redirect' as const,
          settings: {},
        },
      },
      {
        id: PspProviders.MHIPAY,
        name: 'Hipay',
        category_payment_method: PaymentProvider1CategoryPaymentMethod.Payment,
        configuration: {
          is_active: true,
          display_type: 'hosted_field' as const,
          settings: {},
        },
      },
    ] as any;

    const result = selectPaymentProviders(providers);

    expect(result.paymentProviders).toHaveLength(2);
    expect(result.buyNowPayLaterProviders).toHaveLength(0);
  });

  it('should handle all BNPL providers', () => {
    const providers = [
      {
        id: PspProviders.EHIPAYBNPL,
        name: 'Oney',
        category_payment_method: PaymentProvider1CategoryPaymentMethod.BuyNowPayLater,
        configuration: {
          is_active: true,
          display_type: 'redirect' as const,
          settings: {},
        },
      },
      {
        id: PspProviders.MUPLIFT,
        name: 'Uplift',
        category_payment_method: PaymentProvider1CategoryPaymentMethod.BuyNowPayLater,
        configuration: {
          is_active: true,
          display_type: 'redirect' as const,
          settings: {},
        },
      },
    ] as any;

    const result = selectPaymentProviders(providers);

    expect(result.paymentProviders).toHaveLength(0);
    expect(result.buyNowPayLaterProviders).toHaveLength(2);
  });

  it('should apply sortTimePaymentConditions and enrichWithPaymentConditions transformations', () => {
    const providers = [
      {
        id: PspProviders.EVOXPAY,
        name: 'Evoxpay',
        category_payment_method: PaymentProvider1CategoryPaymentMethod.Payment,
        payment_methods: [
          {
            id: 'card',
            label: 'Card',
            time_payment_conditions: [
              { type: 'immediate', label: 'Immediate' },
              { type: 'deferred', label: 'Deferred' },
            ],
          },
        ],
        configuration: {
          is_active: true,
          display_type: 'redirect' as const,
          settings: {},
        },
      },
    ] as any;

    const result = selectPaymentProviders(providers);

    expect(result.paymentProviders).toHaveLength(1);
    expect(result.paymentProviders[0]).toHaveProperty('payment_conditions');
  });
});
