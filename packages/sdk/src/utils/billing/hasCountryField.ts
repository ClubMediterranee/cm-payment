import { FieldMetadata } from './parseBillingSchema';

export const hasCountryField = (fields: FieldMetadata[]): boolean => {
  return fields.some((field) => field.name === 'country' || field.name === 'country_code');
};
