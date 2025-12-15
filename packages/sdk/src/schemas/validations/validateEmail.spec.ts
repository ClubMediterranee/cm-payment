import { GLOBAL_CAPS_SETTINGS } from '../../config';
import { defaultContent } from '../../content/default';
import type { CapsFormConfig } from '../../types/CapsFormConfig';
import type { CapsFormSchema } from '../capsFormSchema';
import { validateEmail } from './validateEmail';

const mockConfig: CapsFormConfig = {
  content: defaultContent,
  isSeller: true,
  maxAmount: 10000,
};

describe('validateEmail', () => {
  it('returns undefined when isSeller is false', () => {
    const result = validateEmail(
      {
        template_id: GLOBAL_CAPS_SETTINGS.templateIds.email,
        billing_details: { email: 'test@example.com' },
      } as unknown as CapsFormSchema,
      { ...mockConfig, isSeller: false },
    );

    expect(result).toBeUndefined();
  });

  it('returns undefined when template_id is not email', () => {
    const result = validateEmail(
      {
        template_id: GLOBAL_CAPS_SETTINGS.templateIds.mobilePhone,
        billing_details: { email: 'test@example.com' },
      } as unknown as CapsFormSchema,
      mockConfig,
    );

    expect(result).toBeUndefined();
  });

  it('returns error when email is empty', () => {
    const result = validateEmail(
      {
        template_id: GLOBAL_CAPS_SETTINGS.templateIds.email,
        billing_details: { email: '' },
      } as unknown as CapsFormSchema,
      mockConfig,
    );

    expect(result).toEqual({
      path: ['billing_details', 'email'],
      message: defaultContent.contactChoice.validation.required,
    });
  });

  it('returns error when email format is invalid', () => {
    const result = validateEmail(
      {
        template_id: GLOBAL_CAPS_SETTINGS.templateIds.email,
        billing_details: { email: 'invalid-email' },
      } as unknown as CapsFormSchema,
      mockConfig,
    );

    expect(result).toEqual({
      path: ['billing_details', 'email'],
      message: defaultContent.contactChoice.email.invalid,
    });
  });
});
