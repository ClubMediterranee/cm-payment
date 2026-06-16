import { describe, expect, it } from 'vitest';

import {
  PaymentMethodModel4,
  TimePaymentConditionModel,
} from '../../../infra/api/__generated__/index.js';
import { sortTimePaymentConditions } from './sortTimePaymentConditions.js';

describe('sortTimePaymentConditions', () => {
  it('should sort time_payment_conditions by payment_count ascending', () => {
    const paymentMethods: PaymentMethodModel4[] = [
      {
        id: 'METHOD_1',
        label: 'Method 1',
        time_payment_conditions: [
          { payment_count: 12 } as TimePaymentConditionModel,
          { payment_count: 3 } as TimePaymentConditionModel,
          { payment_count: 6 } as TimePaymentConditionModel,
        ],
      } as PaymentMethodModel4,
    ];

    const result = sortTimePaymentConditions(paymentMethods);

    expect(result?.[0]?.time_payment_conditions).toEqual([
      { payment_count: 3 },
      { payment_count: 6 },
      { payment_count: 12 },
    ]);
  });

  it('should handle payment_count = 0', () => {
    const paymentMethods: PaymentMethodModel4[] = [
      {
        id: 'METHOD_1',
        time_payment_conditions: [
          { payment_count: 5 } as TimePaymentConditionModel,
          { payment_count: 0 } as TimePaymentConditionModel,
          { payment_count: 3 } as TimePaymentConditionModel,
        ],
      } as PaymentMethodModel4,
    ];

    const result = sortTimePaymentConditions(paymentMethods);

    expect(result?.[0]?.time_payment_conditions).toEqual([
      { payment_count: 0 },
      { payment_count: 3 },
      { payment_count: 5 },
    ]);
  });

  it('should treat undefined payment_count as 0', () => {
    const paymentMethods: PaymentMethodModel4[] = [
      {
        id: 'METHOD_1',
        time_payment_conditions: [
          { payment_count: 5 } as TimePaymentConditionModel,
          {} as TimePaymentConditionModel,
          { payment_count: 3 } as TimePaymentConditionModel,
        ],
      } as PaymentMethodModel4,
    ];

    const result = sortTimePaymentConditions(paymentMethods);

    expect(result?.[0]?.time_payment_conditions?.[0]).toEqual({});
    expect(result?.[0]?.time_payment_conditions?.[1]).toEqual({ payment_count: 3 });
    expect(result?.[0]?.time_payment_conditions?.[2]).toEqual({ payment_count: 5 });
  });

  it('should handle empty time_payment_conditions array', () => {
    const paymentMethods: PaymentMethodModel4[] = [
      { id: 'METHOD_1', currency: 'EUR', time_payment_conditions: [] },
    ];

    const result = sortTimePaymentConditions(paymentMethods);

    expect(result?.[0]?.time_payment_conditions).toEqual([]);
  });

  it('should handle undefined time_payment_conditions', () => {
    const paymentMethods: PaymentMethodModel4[] = [{ id: 'METHOD_1' } as PaymentMethodModel4];

    const result = sortTimePaymentConditions(paymentMethods);

    expect(result?.[0]?.time_payment_conditions).toBeUndefined();
  });

  it('should sort multiple payment methods independently', () => {
    const paymentMethods: PaymentMethodModel4[] = [
      {
        id: 'METHOD_1',
        time_payment_conditions: [
          { payment_count: 12 } as TimePaymentConditionModel,
          { payment_count: 3 } as TimePaymentConditionModel,
        ],
      } as PaymentMethodModel4,
      {
        id: 'METHOD_2',
        time_payment_conditions: [
          { payment_count: 6 } as TimePaymentConditionModel,
          { payment_count: 2 } as TimePaymentConditionModel,
        ],
      } as PaymentMethodModel4,
    ];

    const result = sortTimePaymentConditions(paymentMethods);

    expect(result?.[0]?.time_payment_conditions).toEqual([
      { payment_count: 3 },
      { payment_count: 12 },
    ]);
    expect(result?.[1]?.time_payment_conditions).toEqual([
      { payment_count: 2 },
      { payment_count: 6 },
    ]);
  });

  it('should return undefined when payment_methods is undefined', () => {
    expect(sortTimePaymentConditions(undefined)).toBeUndefined();
  });

  it('should not mutate the original conditions', () => {
    const originalConditions = [
      { payment_count: 12 } as TimePaymentConditionModel,
      { payment_count: 3 } as TimePaymentConditionModel,
    ];
    const paymentMethods: PaymentMethodModel4[] = [
      { id: 'METHOD_1', time_payment_conditions: originalConditions } as PaymentMethodModel4,
    ];

    sortTimePaymentConditions(paymentMethods);

    expect(originalConditions[0].payment_count).toBe(12);
    expect(originalConditions[1].payment_count).toBe(3);
  });
});
