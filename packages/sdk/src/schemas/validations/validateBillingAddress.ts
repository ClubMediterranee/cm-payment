import { getBillingFields } from '../../stores/billingFieldsStore';
import type { FieldMetadata } from '../../utils/billing/parseBillingSchema';
import { Validate, ValidationError } from '../capsFormSchema';

const createFieldError = ({ group, name }: FieldMetadata, message: string): ValidationError => ({
  path: ['billing_details', group, name],
  message,
});

export const validateBillingAddress: Validate = (data, { content }) => {
  const fields = getBillingFields();

  if (!fields) return undefined;

  const errors = fields
    .map((field) => {
      const group = data.billing_details?.[field.group];
      const value = String(group?.[field.name as keyof typeof group] ?? '');

      if (field.required && !value.trim()) {
        return createFieldError(field, content.billingAddress.validation.required);
      }

      if (!value.trim()) return undefined;

      if (field.maxLength && value.length > field.maxLength) {
        return createFieldError(field, content.billingAddress.validation.maxLength);
      }

      if (field.minLength && value.length < field.minLength) {
        return createFieldError(field, content.billingAddress.validation.pattern);
      }

      if (field.pattern) {
        try {
          const regex = new RegExp(field.pattern);
          if (!regex.test(value)) {
            return createFieldError(field, content.billingAddress.validation.pattern);
          }
        } catch (error) {
          console.error(`[validateBillingAddress] Invalid regex pattern: ${field.pattern}`, error);
        }
      }

      return undefined;
    })
    .filter((error): error is ValidationError => error !== undefined);

  return errors.length > 0 ? errors : undefined;
};
