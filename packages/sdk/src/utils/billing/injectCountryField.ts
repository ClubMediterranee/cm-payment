import { CountryModel } from '../../__generated__/index.schemas';
import { FieldMetadata } from './parseBillingSchema';

export const injectCountryField = (
  fields: FieldMetadata[],
  countries: CountryModel[],
): FieldMetadata[] => {
  const countryField = fields.find((f) => f.name === 'country' || f.name === 'country_code');

  if (!countryField) {
    return fields;
  }

  const fieldsWithoutCountry = fields.filter(
    (f) => f.name !== 'country' && f.name !== 'country_code',
  );

  const countryCodeField: FieldMetadata = {
    group: 'address',
    name: 'country_code',
    path: 'billing_details.address.country_code',
    type: 'select',
    required: countryField.required,
    options: countries.map((country) => ({
      value: country.id,
      label: country.label,
    })),
  };

  const insertIndex = fields.indexOf(countryField);
  fieldsWithoutCountry.splice(insertIndex, 0, countryCodeField);

  return fieldsWithoutCountry;
};
