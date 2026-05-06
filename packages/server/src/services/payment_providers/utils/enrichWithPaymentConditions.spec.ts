import { describe, expect, it } from 'vitest';

import {
  PaymentMethodModel4,
  TimePaymentConditionModel,
} from '../../../infra/api/__generated__/index.schemas.js';
import { EnrichedPaymentProvider } from '../models.js';
import { enrichWithPaymentConditions } from './enrichWithPaymentConditions.js';

describe('enrichWithPaymentConditions', () => {
  it('should extract payment_conditions from payment_methods using label as key', () => {
    const provider: EnrichedPaymentProvider = {
      id: 'TEST_PROVIDER',
      label: 'Test Provider',
      category_payment_method: 'Card',
      payment_methods: [
        {
          id: 'METHOD_1',
          label: 'Credit Card',
          time_payment_conditions: [
            { payment_count: 3 } as TimePaymentConditionModel,
            { payment_count: 6 } as TimePaymentConditionModel,
          ],
        } as PaymentMethodModel4,
      ],
      configuration: {
        display_type: 'redirect',
        settings: {},
        validation: { requires_token: false, requires_expiry_date: false },
      },
      payment_conditions: {},
    };

    const result = enrichWithPaymentConditions(provider);

    expect(result.payment_conditions).toEqual({
      'Credit Card': [{ payment_count: 3 }, { payment_count: 6 }],
    });
  });

  it('should use method.id as key when label is not available', () => {
    const provider: EnrichedPaymentProvider = {
      id: 'TEST_PROVIDER',
      label: 'Test Provider',
      category_payment_method: 'Card',
      payment_methods: [
        {
          id: 'METHOD_1',
          time_payment_conditions: [{ payment_count: 3 } as TimePaymentConditionModel],
        } as PaymentMethodModel4,
      ],
      configuration: {
        display_type: 'redirect',
        settings: {},
        validation: { requires_token: false, requires_expiry_date: false },
      },
      payment_conditions: {},
    };

    const result = enrichWithPaymentConditions(provider);

    expect(result.payment_conditions).toEqual({
      METHOD_1: [{ payment_count: 3 }],
    });
  });

  it('should handle multiple payment methods', () => {
    const provider: EnrichedPaymentProvider = {
      id: 'TEST_PROVIDER',
      label: 'Test Provider',
      category_payment_method: 'Card',
      payment_methods: [
        {
          id: 'METHOD_1',
          label: 'Credit Card',
          time_payment_conditions: [{ payment_count: 3 } as TimePaymentConditionModel],
        } as PaymentMethodModel4,
        {
          id: 'METHOD_2',
          label: 'Debit Card',
          time_payment_conditions: [{ payment_count: 6 } as TimePaymentConditionModel],
        } as PaymentMethodModel4,
      ],
      configuration: {
        display_type: 'redirect',
        settings: {},
        validation: { requires_token: false, requires_expiry_date: false },
      },
      payment_conditions: {},
    };

    const result = enrichWithPaymentConditions(provider);

    expect(result.payment_conditions).toEqual({
      'Credit Card': [{ payment_count: 3 }],
      'Debit Card': [{ payment_count: 6 }],
    });
  });

  it('should handle empty time_payment_conditions', () => {
    const provider: EnrichedPaymentProvider = {
      id: 'TEST_PROVIDER',
      label: 'Test Provider',
      category_payment_method: 'Card',
      payment_methods: [
        {
          id: 'METHOD_1',
          label: 'Credit Card',
          time_payment_conditions: [],
        } as PaymentMethodModel4,
      ],
      configuration: {
        display_type: 'redirect',
        settings: {},
        validation: { requires_token: false, requires_expiry_date: false },
      },
      payment_conditions: {},
    };

    const result = enrichWithPaymentConditions(provider);

    expect(result.payment_conditions).toEqual({
      'Credit Card': [],
    });
  });

  it('should handle undefined time_payment_conditions', () => {
    const provider: EnrichedPaymentProvider = {
      id: 'TEST_PROVIDER',
      label: 'Test Provider',
      category_payment_method: 'Card',
      payment_methods: [
        {
          id: 'METHOD_1',
          label: 'Credit Card',
        } as PaymentMethodModel4,
      ],
      configuration: {
        display_type: 'redirect',
        settings: {},
        validation: { requires_token: false, requires_expiry_date: false },
      },
      payment_conditions: {},
    };

    const result = enrichWithPaymentConditions(provider);

    expect(result.payment_conditions).toEqual({
      'Credit Card': [],
    });
  });

  it('should return empty payment_conditions when payment_methods is undefined', () => {
    const provider: EnrichedPaymentProvider = {
      id: 'TEST_PROVIDER',
      label: 'Test Provider',
      category_payment_method: 'Card',
      configuration: {
        display_type: 'redirect',
        settings: {},
        validation: { requires_token: false, requires_expiry_date: false },
      },
      payment_conditions: {},
    };

    const result = enrichWithPaymentConditions(provider);

    expect(result.payment_conditions).toEqual({});
  });

  it('should return empty payment_conditions when payment_methods is empty array', () => {
    const provider: EnrichedPaymentProvider = {
      id: 'TEST_PROVIDER',
      label: 'Test Provider',
      category_payment_method: 'Card',
      payment_methods: [],
      configuration: {
        display_type: 'redirect',
        settings: {},
        validation: { requires_token: false, requires_expiry_date: false },
      },
      payment_conditions: {},
    };

    const result = enrichWithPaymentConditions(provider);

    expect(result.payment_conditions).toEqual({});
  });

  it('should preserve other provider properties', () => {
    const provider: EnrichedPaymentProvider = {
      id: 'TEST_PROVIDER',
      label: 'Test Provider',
      category_payment_method: 'Card',
      description: 'Test Description',
      payment_methods: [
        {
          id: 'METHOD_1',
          label: 'Credit Card',
          time_payment_conditions: [{ payment_count: 3 } as TimePaymentConditionModel],
        } as PaymentMethodModel4,
      ],
      configuration: {
        display_type: 'redirect',
        settings: {},
        validation: { requires_token: false, requires_expiry_date: false },
      },
      payment_conditions: {},
    };

    const result = enrichWithPaymentConditions(provider);

    expect(result.id).toBe('TEST_PROVIDER');
    expect(result.label).toBe('Test Provider');
    expect(result.category_payment_method).toBe('Card');
    expect(result.description).toBe('Test Description');
    expect(result.configuration).toEqual(provider.configuration);
  });

  it('should handle payment methods with complex time_payment_conditions', () => {
    const provider: EnrichedPaymentProvider = {
      id: 'TEST_PROVIDER',
      label: 'Test Provider',
      category_payment_method: 'BuyNowPayLater',
      payment_methods: [
        {
          id: 'METHOD_1',
          label: 'Installments',
          time_payment_conditions: [
            {
              payment_count: 3,
              amount: 100,
              currency: 'EUR',
            } as TimePaymentConditionModel,
            {
              payment_count: 6,
              amount: 50,
              currency: 'EUR',
            } as TimePaymentConditionModel,
          ],
        } as PaymentMethodModel4,
      ],
      configuration: {
        display_type: 'redirect',
        settings: {},
        validation: { requires_token: false, requires_expiry_date: false },
      },
      payment_conditions: {},
    };

    const result = enrichWithPaymentConditions(provider);

    expect(result.payment_conditions.Installments).toHaveLength(2);
    expect(result.payment_conditions.Installments[0]).toEqual({
      payment_count: 3,
      amount: 100,
      currency: 'EUR',
    });
    expect(result.payment_conditions.Installments[1]).toEqual({
      payment_count: 6,
      amount: 50,
      currency: 'EUR',
    });
  });
});
