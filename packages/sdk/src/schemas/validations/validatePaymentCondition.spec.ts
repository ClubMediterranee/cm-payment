import { defaultContent } from '../../content/default';
import type { CapsFormConfig } from '../../types/CapsFormConfig';
import type { CapsFormSchema } from '../capsFormSchema';
import { validatePaymentCondition } from './validatePaymentCondition';

const config = (required: boolean): CapsFormConfig => ({
  content: defaultContent,
  isSeller: false,
  maxAmount: 10000,
  requiresPaymentCondition: () => required,
  getProviderConfiguration: () => undefined,
});

const data = (payment_condition_id?: string) =>
  ({ provider_id: 'HIPAY', payment_condition_id }) as unknown as CapsFormSchema;

describe('validatePaymentCondition', () => {
  it('returns an error when the provider offers a choice and none is made', () => {
    expect(validatePaymentCondition(data(), config(true))).toEqual({
      path: ['payment_condition_id'],
      message: defaultContent.cardInstallments.validation.conditionRequired,
    });
  });

  it('returns undefined once a condition is chosen', () => {
    expect(validatePaymentCondition(data('visa-3x'), config(true))).toBeUndefined();
  });

  it('returns undefined when the provider does not offer a choice', () => {
    expect(validatePaymentCondition(data(), config(false))).toBeUndefined();
  });

  it('returns undefined when the requirement is not configured', () => {
    expect(
      validatePaymentCondition(data(), { ...config(true), requiresPaymentCondition: undefined }),
    ).toBeUndefined();
  });
});
