import { describe, expect, it } from 'vitest';

import {
  PaymentMethodModel4,
  TimePaymentConditionModel,
} from '../../../infra/api/__generated__/index.schemas.js';
import { EnrichedPaymentProvider } from '../models.js';
import { sortTimePaymentConditions } from './sortTimePaymentConditions.js';

describe('sortTimePaymentConditions', () => {
  it('should sort time_payment_conditions by payment_count ascending', () => {
    const provider: EnrichedPaymentProvider = {
      id: 'TEST_PROVIDER',
      label: 'Test Provider',
      category_payment_method: 'Card',
      payment_methods: [
        {
          id: 'METHOD_1',
          label: 'Method 1',
          time_payment_conditions: [
            { payment_count: 12 } as TimePaymentConditionModel,
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

    const result = sortTimePaymentConditions(provider);

    expect(result.payment_methods?.[0]?.time_payment_conditions).toEqual([
      { payment_count: 3 },
      { payment_count: 6 },
      { payment_count: 12 },
    ]);
  });

  it('should handle payment_count = 0', () => {
    const provider: EnrichedPaymentProvider = {
      id: 'TEST_PROVIDER',
      label: 'Test Provider',
      category_payment_method: 'Card',
      payment_methods: [
        {
          id: 'METHOD_1',
          label: 'Method 1',
          time_payment_conditions: [
            { payment_count: 5 } as TimePaymentConditionModel,
            { payment_count: 0 } as TimePaymentConditionModel,
            { payment_count: 3 } as TimePaymentConditionModel,
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

    const result = sortTimePaymentConditions(provider);

    expect(result.payment_methods?.[0]?.time_payment_conditions).toEqual([
      { payment_count: 0 },
      { payment_count: 3 },
      { payment_count: 5 },
    ]);
  });

  it('should handle undefined payment_count by treating as 0', () => {
    const provider: EnrichedPaymentProvider = {
      id: 'TEST_PROVIDER',
      label: 'Test Provider',
      category_payment_method: 'Card',
      payment_methods: [
        {
          id: 'METHOD_1',
          label: 'Method 1',
          time_payment_conditions: [
            { payment_count: 5 } as TimePaymentConditionModel,
            {} as TimePaymentConditionModel,
            { payment_count: 3 } as TimePaymentConditionModel,
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

    const result = sortTimePaymentConditions(provider);

    expect(result.payment_methods?.[0]?.time_payment_conditions?.[0]).toEqual({});
    expect(result.payment_methods?.[0]?.time_payment_conditions?.[1]).toEqual({ payment_count: 3 });
    expect(result.payment_methods?.[0]?.time_payment_conditions?.[2]).toEqual({ payment_count: 5 });
  });

  it('should handle empty time_payment_conditions array', () => {
    const provider: EnrichedPaymentProvider = {
      id: 'TEST_PROVIDER',
      label: 'Test Provider',
      category_payment_method: 'Card',
      payment_methods: [
        {
          id: 'METHOD_1',
          label: 'Method 1',
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

    const result = sortTimePaymentConditions(provider);

    expect(result.payment_methods?.[0]?.time_payment_conditions).toEqual([]);
  });

  it('should handle undefined time_payment_conditions', () => {
    const provider: EnrichedPaymentProvider = {
      id: 'TEST_PROVIDER',
      label: 'Test Provider',
      category_payment_method: 'Card',
      payment_methods: [
        {
          id: 'METHOD_1',
          label: 'Method 1',
        } as PaymentMethodModel4,
      ],
      configuration: {
        display_type: 'redirect',
        settings: {},
        validation: { requires_token: false, requires_expiry_date: false },
      },
      payment_conditions: {},
    };

    const result = sortTimePaymentConditions(provider);

    expect(result.payment_methods?.[0]?.time_payment_conditions).toBeUndefined();
  });

  it('should sort multiple payment methods independently', () => {
    const provider: EnrichedPaymentProvider = {
      id: 'TEST_PROVIDER',
      label: 'Test Provider',
      category_payment_method: 'Card',
      payment_methods: [
        {
          id: 'METHOD_1',
          label: 'Method 1',
          time_payment_conditions: [
            { payment_count: 12 } as TimePaymentConditionModel,
            { payment_count: 3 } as TimePaymentConditionModel,
          ],
        } as PaymentMethodModel4,
        {
          id: 'METHOD_2',
          label: 'Method 2',
          time_payment_conditions: [
            { payment_count: 6 } as TimePaymentConditionModel,
            { payment_count: 2 } as TimePaymentConditionModel,
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

    const result = sortTimePaymentConditions(provider);

    expect(result.payment_methods?.[0]?.time_payment_conditions).toEqual([
      { payment_count: 3 },
      { payment_count: 12 },
    ]);
    expect(result.payment_methods?.[1]?.time_payment_conditions).toEqual([
      { payment_count: 2 },
      { payment_count: 6 },
    ]);
  });

  it('should handle provider without payment_methods', () => {
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

    const result = sortTimePaymentConditions(provider);

    expect(result.payment_methods).toBeUndefined();
  });

  it('should not mutate original provider', () => {
    const originalConditions = [
      { payment_count: 12 } as TimePaymentConditionModel,
      { payment_count: 3 } as TimePaymentConditionModel,
    ];
    const provider: EnrichedPaymentProvider = {
      id: 'TEST_PROVIDER',
      label: 'Test Provider',
      category_payment_method: 'Card',
      payment_methods: [
        {
          id: 'METHOD_1',
          label: 'Method 1',
          time_payment_conditions: originalConditions,
        } as PaymentMethodModel4,
      ],
      configuration: {
        display_type: 'redirect',
        settings: {},
        validation: { requires_token: false, requires_expiry_date: false },
      },
      payment_conditions: {},
    };

    sortTimePaymentConditions(provider);

    // Original should remain unsorted
    expect(originalConditions[0].payment_count).toBe(12);
    expect(originalConditions[1].payment_count).toBe(3);
  });
});
