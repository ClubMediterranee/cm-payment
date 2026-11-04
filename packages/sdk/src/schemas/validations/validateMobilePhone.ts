import { GLOBAL_CAPS_SETTINGS } from '../../config';
import { intlPhoneRegex } from '../../utils/regex';
import type { Validate } from '../capsFormSchema';

export const validateMobilePhone: Validate = (data, { content, getProviderConfiguration }) => {
  const validation = getProviderConfiguration(data.provider_id);

  if (
    validation?.requires_contact_choice &&
    data.template_id === GLOBAL_CAPS_SETTINGS.templateIds.mobilePhone
  ) {
    const mobilePhone = data.billing_details?.mobile_phone;

    if (!mobilePhone || mobilePhone.trim() === '') {
      return {
        path: ['billing_details', 'mobile_phone'],
        message: content.contactChoice.validation.required,
      };
    }

    if (!intlPhoneRegex.test(mobilePhone)) {
      return {
        path: ['billing_details', 'mobile_phone'],
        message: content.contactChoice.mobile_phone.invalid,
      };
    }
  }

  return undefined;
};
