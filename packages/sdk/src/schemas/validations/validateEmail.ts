import { GLOBAL_CAPS_SETTINGS } from '../../config';
import { emailRegex } from '../../utils/regex';
import type { Validate } from '../capsFormSchema';

export const validateEmail: Validate = (data, { content, getProviderConfiguration }) => {
  const validation = getProviderConfiguration(data.provider_id);

  if (
    validation?.requires_contact_choice &&
    data.template_id === GLOBAL_CAPS_SETTINGS.templateIds.email
  ) {
    const email = data.billing_details?.email;
    if (!email || email.trim() === '') {
      return {
        path: ['billing_details', 'email'],
        message: content.contactChoice.validation.required,
      };
    }

    if (!emailRegex.test(email)) {
      return {
        path: ['billing_details', 'email'],
        message: content.contactChoice.email.invalid,
      };
    }
  }

  return undefined;
};
