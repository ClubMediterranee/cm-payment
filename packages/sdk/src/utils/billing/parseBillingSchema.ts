import { ClientSchemaModel } from '../../__generated__/index.schemas';
import type { CapsFormSchema } from '../../schemas/capsFormSchema';

type BillingDetails = CapsFormSchema['billing_details'];
type AttendeeKey = keyof NonNullable<BillingDetails['attendee']>;
type AddressKey = keyof BillingDetails['address'];

type FieldLocation =
  | { group: 'attendee'; name: AttendeeKey; path: `billing_details.attendee.${AttendeeKey}` }
  | { group: 'address'; name: AddressKey; path: `billing_details.address.${AddressKey}` };

export type FieldMetadata = FieldLocation & {
  type: 'select' | 'text';
  required: boolean;
  options?: { value: string; label: string }[];
  maxLength?: number;
  minLength?: number;
  pattern?: string;
};

type SchemaProperty = {
  type?: string;
  enum?: string[];
  'x-choices'?: { code: string; label: string }[];
  maxLength?: number;
  minLength?: number;
  pattern?: string;
};

type SchemaGroup = {
  type: string;
  required?: string[];
  properties?: Record<string, SchemaProperty>;
};

const KEYS = {
  attendee: ['first_name', 'last_name'],
  address: [
    'additional_information_1',
    'additional_information_2',
    'number',
    'street',
    'add_on',
    'town',
    'city',
    'state_or_district',
    'zip_code',
    'country',
    'country_code',
  ],
} as const satisfies { attendee: readonly AttendeeKey[]; address: readonly AddressKey[] };

const locate = (group: FieldLocation['group'], fieldName: string): FieldLocation | undefined => {
  if (group === 'attendee') {
    const name = KEYS.attendee.find((key) => key === fieldName);
    return name && { group, name, path: `billing_details.attendee.${name}` };
  }

  const name = KEYS.address.find((key) => key === fieldName);
  return name && { group, name, path: `billing_details.address.${name}` };
};

const toOptions = (property: SchemaProperty) => {
  if (property['x-choices']?.length) {
    return property['x-choices'].map(({ code, label }) => ({ value: code, label }));
  }

  return property.enum?.length
    ? property.enum.map((value) => ({ value, label: value }))
    : undefined;
};

export const parseBillingSchema = (rawSchema: ClientSchemaModel): FieldMetadata[] => {
  const { properties } = rawSchema;

  if (!properties) {
    console.error('[parseBillingSchema] Missing properties in schema');
    throw new Error('Invalid billing schema: missing properties');
  }

  if (!properties.attendee && !properties.address) {
    console.error('[parseBillingSchema] Missing attendee and address in schema properties');
    throw new Error('Invalid billing schema: missing attendee and address groups');
  }

  return (['attendee', 'address'] as const).flatMap((groupName) => {
    const group = properties[groupName] as SchemaGroup | undefined;

    return Object.entries(group?.properties ?? {}).flatMap(([fieldName, property]) => {
      const location = locate(groupName, fieldName);
      const options = toOptions(property);

      return location
        ? {
            ...location,
            type: options ? 'select' : 'text',
            required: !!group?.required?.includes(fieldName),
            options,
            maxLength: property.maxLength,
            minLength: property.minLength,
            pattern: property.pattern,
          }
        : [];
    });
  });
};
