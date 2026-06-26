import { GLOBAL_CAPS_SETTINGS } from '../../config';
import { defaultContent } from '../../content/default';
import type { CapsFormConfig } from '../../types/CapsFormConfig';
import type { CapsFormSchema } from '../capsFormSchema';
import { validateMobilePhone } from './validateMobilePhone';

const mockConfig: CapsFormConfig = {
  content: defaultContent,
  isSeller: true,
  maxAmount: 10000,
  getProviderValidation: () => ({ requires_contact_choice: true }),
};

describe('validateMobilePhone', () => {
  it('returns undefined when provider has no requires_contact_choice', () => {
    const result = validateMobilePhone(
      {
        template_id: GLOBAL_CAPS_SETTINGS.templateIds.mobilePhone,
        billing_details: { mobile_phone: '+33612345678' },
      } as unknown as CapsFormSchema,
      { ...mockConfig, getProviderValidation: () => undefined },
    );

    expect(result).toBeUndefined();
  });

  it('returns undefined when template_id is not mobilePhone', () => {
    const result = validateMobilePhone(
      {
        template_id: GLOBAL_CAPS_SETTINGS.templateIds.email,
        billing_details: { mobile_phone: '+33612345678' },
      } as unknown as CapsFormSchema,
      mockConfig,
    );

    expect(result).toBeUndefined();
  });

  it('returns error when mobile_phone is empty', () => {
    const result = validateMobilePhone(
      {
        template_id: GLOBAL_CAPS_SETTINGS.templateIds.mobilePhone,
        billing_details: { mobile_phone: '' },
      } as unknown as CapsFormSchema,
      mockConfig,
    );

    expect(result).toEqual({
      path: ['billing_details', 'mobile_phone'],
      message: defaultContent.contactChoice.validation.required,
    });
  });

  it('returns error when phone format is invalid', () => {
    const result = validateMobilePhone(
      {
        template_id: GLOBAL_CAPS_SETTINGS.templateIds.mobilePhone,
        billing_details: { mobile_phone: 'invalid-phone' },
      } as unknown as CapsFormSchema,
      mockConfig,
    );

    expect(result).toEqual({
      path: ['billing_details', 'mobile_phone'],
      message: defaultContent.contactChoice.mobile_phone.invalid,
    });
  });
});
