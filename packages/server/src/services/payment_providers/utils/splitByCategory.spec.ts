import { describe, expect, it } from 'vitest';

import { EnrichedPaymentProvider, PaymentProvidersResponse } from '../types.js';
import { splitByCategory } from './splitByCategory.js';

describe('splitByCategory', () => {
  it('should add Card provider to payment_providers array', () => {
    const acc: PaymentProvidersResponse = {
      payment_providers: [],
      buy_now_pay_later_providers: [],
    };
    const provider = {
      id: 'CARD_PROVIDER',
      label: 'Card Provider',
      category_payment_method: 'CreditCard',
      connection_type: 'E-commerce',
      required_delay_before_departure: 0,
      billing_address_form: false,
      configuration: {
        display_type: 'redirect',
        confirmation_strategy: 'status',
        settings: {},
        requires_contact_choice: false,
      },
      payment_conditions: {},
    } as const;

    const result = splitByCategory(acc, provider);

    expect(result.payment_providers).toHaveLength(1);
    expect(result.payment_providers[0]).toBe(provider);
    expect(result.buy_now_pay_later_providers).toHaveLength(0);
  });

  it('should add BuyNowPayLater provider to buy_now_pay_later_providers array', () => {
    const acc: PaymentProvidersResponse = {
      payment_providers: [],
      buy_now_pay_later_providers: [],
    };
    const provider = {
      id: 'BNPL_PROVIDER',
      label: 'BNPL Provider',
      category_payment_method: 'BuyNowPayLater',
      connection_type: 'E-commerce',
      required_delay_before_departure: 0,
      billing_address_form: false,
      configuration: {
        display_type: 'redirect',
        confirmation_strategy: 'status',
        settings: {},
        requires_contact_choice: false,
      },
      payment_conditions: {},
    } as const;

    const result = splitByCategory(acc, provider);

    expect(result.payment_providers).toHaveLength(0);
    expect(result.buy_now_pay_later_providers).toHaveLength(1);
    expect(result.buy_now_pay_later_providers[0]).toBe(provider);
  });

  it('should accumulate multiple providers of same category', () => {
    let acc: PaymentProvidersResponse = {
      payment_providers: [],
      buy_now_pay_later_providers: [],
    };
    const provider1: EnrichedPaymentProvider = {
      id: 'CARD_1',
      label: 'Card 1',
      category_payment_method: 'CreditCard',
      connection_type: 'E-commerce',
      required_delay_before_departure: 0,
      billing_address_form: false,
      configuration: {
        display_type: 'redirect',
        confirmation_strategy: 'status',
        settings: {},
        requires_contact_choice: false,
      },
      payment_conditions: {},
    } as const;
    const provider2: EnrichedPaymentProvider = {
      id: 'CARD_2',
      label: 'Card 2',
      category_payment_method: 'CreditCard',
      connection_type: 'E-commerce',
      required_delay_before_departure: 0,
      billing_address_form: false,
      configuration: {
        display_type: 'redirect',
        confirmation_strategy: 'status',
        settings: {},
        requires_contact_choice: false,
      },
      payment_conditions: {},
    } as const;

    acc = splitByCategory(acc, provider1);
    acc = splitByCategory(acc, provider2);

    expect(acc.payment_providers).toHaveLength(2);
    expect(acc.payment_providers[0]).toBe(provider1);
    expect(acc.payment_providers[1]).toBe(provider2);
  });

  it('should accumulate providers across different categories', () => {
    let acc: PaymentProvidersResponse = {
      payment_providers: [],
      buy_now_pay_later_providers: [],
    };
    const cardProvider = {
      id: 'CARD',
      label: 'Card',
      category_payment_method: 'CreditCard',
      connection_type: 'E-commerce',
      required_delay_before_departure: 0,
      billing_address_form: false,
      configuration: {
        display_type: 'redirect',
        confirmation_strategy: 'status',
        settings: {},
        requires_contact_choice: false,
      },
      payment_conditions: {},
    } as const;
    const bnplProvider = {
      id: 'BNPL',
      label: 'BNPL',
      category_payment_method: 'BuyNowPayLater',
      connection_type: 'E-commerce',
      required_delay_before_departure: 0,
      billing_address_form: false,
      configuration: {
        display_type: 'redirect',
        confirmation_strategy: 'status',
        settings: {},
        requires_contact_choice: false,
      },
      payment_conditions: {},
    } as const;

    acc = splitByCategory(acc, cardProvider);
    acc = splitByCategory(acc, bnplProvider);

    expect(acc.payment_providers).toHaveLength(1);
    expect(acc.payment_providers[0]).toBe(cardProvider);
    expect(acc.buy_now_pay_later_providers).toHaveLength(1);
    expect(acc.buy_now_pay_later_providers[0]).toBe(bnplProvider);
  });

  it('should handle providers with other category as Card', () => {
    const acc: PaymentProvidersResponse = {
      payment_providers: [],
      buy_now_pay_later_providers: [],
    };
    const provider = {
      id: 'PAYPAL',
      label: 'PayPal',
      category_payment_method: 'Paypal',
      connection_type: 'E-commerce',
      required_delay_before_departure: 0,
      billing_address_form: false,
      configuration: {
        display_type: 'redirect',
        confirmation_strategy: 'status',
        settings: {},
        requires_contact_choice: false,
      },
      payment_conditions: {},
    } as const;

    const result = splitByCategory(acc, provider);

    expect(result.payment_providers).toHaveLength(1);
    expect(result.payment_providers[0]).toBe(provider);
    expect(result.buy_now_pay_later_providers).toHaveLength(0);
  });

  it('should return the same accumulator reference', () => {
    const acc: PaymentProvidersResponse = {
      payment_providers: [],
      buy_now_pay_later_providers: [],
    };
    const provider = {
      id: 'CARD',
      label: 'Card',
      category_payment_method: 'CreditCard',
      connection_type: 'E-commerce',
      required_delay_before_departure: 0,
      billing_address_form: false,
      configuration: {
        display_type: 'redirect',
        confirmation_strategy: 'status',
        settings: {},
        requires_contact_choice: false,
      },
      payment_conditions: {},
    } as const;

    const result = splitByCategory(acc, provider);

    expect(result).toBe(acc);
  });

  it('should work correctly in a reduce operation', () => {
    const providers: EnrichedPaymentProvider[] = [
      {
        id: 'CARD_1',
        label: 'Card 1',
        category_payment_method: 'CreditCard',
        connection_type: 'E-commerce',
        required_delay_before_departure: 0,
        billing_address_form: false,
        configuration: {
          display_type: 'redirect',
          confirmation_strategy: 'status',
          settings: {},
          requires_contact_choice: false,
        },
        payment_conditions: {},
      },
      {
        id: 'BNPL_1',
        label: 'BNPL 1',
        category_payment_method: 'BuyNowPayLater',
        connection_type: 'E-commerce',
        required_delay_before_departure: 0,
        billing_address_form: false,
        configuration: {
          display_type: 'redirect',
          confirmation_strategy: 'status',
          settings: {},
          requires_contact_choice: false,
        },
        payment_conditions: {},
      },
      {
        id: 'CARD_2',
        label: 'Card 2',
        category_payment_method: 'CreditCard',
        connection_type: 'E-commerce',
        required_delay_before_departure: 0,
        billing_address_form: false,
        configuration: {
          display_type: 'redirect',
          confirmation_strategy: 'status',
          settings: {},
          requires_contact_choice: false,
        },
        payment_conditions: {},
      },
    ];

    const result = providers.reduce(splitByCategory, {
      payment_providers: [],
      buy_now_pay_later_providers: [],
    });

    expect(result.payment_providers).toHaveLength(2);
    expect(result.payment_providers[0].id).toBe('CARD_1');
    expect(result.payment_providers[1].id).toBe('CARD_2');
    expect(result.buy_now_pay_later_providers).toHaveLength(1);
    expect(result.buy_now_pay_later_providers[0].id).toBe('BNPL_1');
  });
});
