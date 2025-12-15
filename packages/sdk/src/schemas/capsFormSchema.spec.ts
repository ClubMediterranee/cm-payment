import { Action } from '../__generated__/index.schemas';
import { defaultContent } from '../content/default';
import type { CapsFormConfig } from '../types/CapsFormConfig';
import { capsFormSchema } from './capsFormSchema';
import * as validations from './validations/validateEmail';
import * as validationsMobile from './validations/validateMobilePhone';
import * as validationsToken from './validations/validateToken';

const mockConfig: CapsFormConfig = {
  content: defaultContent,
  isSeller: false,
  maxAmount: 10000,
};

const createValidFormData = () => ({
  action: Action.PAYMENT_CART,
  provider_id: 'EVOXPAY',
  amount: '100',
  currency: 'EUR',
  template_id: '6' as const,
  cgv: true,
  billing_details: {
    email: 'test@example.com',
    mobile_phone: '+33612345678',
  },
});

describe('capsFormSchema', () => {
  it('should validate a complete valid form', () => {
    const schema = capsFormSchema(mockConfig);

    const result = schema.safeParse(createValidFormData());

    expect(result.success).toBe(true);
  });

  it('should validate required fields and enums', () => {
    const schema = capsFormSchema(mockConfig);

    expect(schema.safeParse({ ...createValidFormData(), action: 'INVALID' }).success).toBe(false);
    expect(schema.safeParse({ ...createValidFormData(), provider_id: '' }).success).toBe(false);
    expect(schema.safeParse({ ...createValidFormData(), template_id: '99' as any }).success).toBe(
      false,
    );
    expect(schema.safeParse({ ...createValidFormData(), template_id: '1' }).success).toBe(true);
    expect(schema.safeParse({ ...createValidFormData(), template_id: '4' }).success).toBe(true);
    expect(schema.safeParse({ ...createValidFormData(), template_id: '6' }).success).toBe(true);
    expect(schema.safeParse({ ...createValidFormData(), cgv: false }).success).toBe(false);
  });

  it('should validate amount constraints', () => {
    const schema = capsFormSchema(mockConfig);

    expect(schema.safeParse({ ...createValidFormData(), amount: '5000' }).success).toBe(true);
    expect(schema.safeParse({ ...createValidFormData(), amount: '10000' }).success).toBe(true);
    expect(schema.safeParse({ ...createValidFormData(), amount: '0' }).success).toBe(false);
    expect(schema.safeParse({ ...createValidFormData(), amount: '-100' }).success).toBe(false);
    expect(schema.safeParse({ ...createValidFormData(), amount: 'abc' }).success).toBe(false);
    expect(schema.safeParse({ ...createValidFormData(), amount: '10001' }).success).toBe(false);
  });

  it('should accept optional fields with various values', () => {
    const schema = capsFormSchema(mockConfig);

    expect(
      schema.safeParse({
        ...createValidFormData(),
        token: { value: 'token123', status: 'success' as const },
      }).success,
    ).toBe(true);
    expect(schema.safeParse({ ...createValidFormData(), token: undefined }).success).toBe(true);
    expect(schema.safeParse({ ...createValidFormData(), billing_details: undefined }).success).toBe(
      true,
    );
    expect(schema.safeParse({ ...createValidFormData(), billing_details: null }).success).toBe(
      true,
    );
  });

  it('should call all validators in superRefine', () => {
    const validateTokenSpy = vi.spyOn(validationsToken, 'validateToken');
    const validateEmailSpy = vi.spyOn(validations, 'validateEmail');
    const validateMobilePhoneSpy = vi.spyOn(validationsMobile, 'validateMobilePhone');

    const schema = capsFormSchema(mockConfig);
    schema.safeParse(createValidFormData());

    expect(validateTokenSpy).toHaveBeenCalled();
    expect(validateEmailSpy).toHaveBeenCalled();
    expect(validateMobilePhoneSpy).toHaveBeenCalled();

    vi.restoreAllMocks();
  });

  it('should add custom errors from validators to schema errors', () => {
    vi.spyOn(validations, 'validateEmail').mockReturnValueOnce({
      path: ['billing_details', 'email'],
      message: 'Custom validation error',
    });

    const schema = capsFormSchema(mockConfig);
    const result = schema.safeParse(createValidFormData());

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors.some((e) => e.message === 'Custom validation error')).toBe(true);
    }

    vi.restoreAllMocks();
  });

  it('should return multiple errors when multiple fields are invalid', () => {
    const schema = capsFormSchema({ ...mockConfig, isSeller: true });
    const invalidData = {
      ...createValidFormData(),
      amount: '-50',
      cgv: false,
      billing_details: { email: 'invalid', mobile_phone: null },
    };

    const result = schema.safeParse(invalidData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors.length).toBeGreaterThan(1);
    }
  });
});
