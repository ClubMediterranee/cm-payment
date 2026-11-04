import { ClientSchemaModel } from '../../__generated__/index.schemas';

export type FieldMetadata = {
  name: string;
  group: 'attendee' | 'address';
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

export const parseBillingSchema = (rawSchema: ClientSchemaModel): FieldMetadata[] => {
  if (!rawSchema.properties) {
    console.error('[parseBillingSchema] Missing properties in schema');
    throw new Error('Invalid billing schema: missing properties');
  }

  const parsedProperties = rawSchema.properties;

  if (!parsedProperties.attendee && !parsedProperties.address) {
    console.error('[parseBillingSchema] Missing attendee and address in schema properties');
    throw new Error('Invalid billing schema: missing attendee and address groups');
  }

  const fields: FieldMetadata[] = [];

  const groups: Array<{ name: 'attendee' | 'address'; data: SchemaGroup | undefined }> = [
    { name: 'attendee', data: parsedProperties.attendee as SchemaGroup | undefined },
    { name: 'address', data: parsedProperties.address as SchemaGroup | undefined },
  ];

  groups.forEach(({ name: groupName, data: group }) => {
    if (!group || !group.properties) {
      return;
    }

    const requiredFields = group.required || [];

    Object.entries(group.properties).forEach(([fieldName, property]) => {
      const hasEnum = property.enum && property.enum.length > 0;
      const hasXChoices = property['x-choices'] && property['x-choices'].length > 0;

      const isSelect = hasEnum || hasXChoices;
      const isRequired = requiredFields.includes(fieldName);

      let options: { value: string; label: string }[] | undefined;
      if (hasXChoices) {
        options = property['x-choices']!.map((choice) => ({
          value: choice.code,
          label: choice.label,
        }));
      } else if (hasEnum) {
        options = property.enum!.map((value) => ({
          value,
          label: value,
        }));
      }

      if (requiredFields.includes(fieldName) && !group.properties![fieldName]) {
        console.error(
          `[parseBillingSchema] Required field "${fieldName}" not found in ${groupName}.properties`,
        );
        throw new Error(
          `Invalid billing schema: required field "${fieldName}" not defined in ${groupName}`,
        );
      }

      fields.push({
        name: fieldName,
        group: groupName,
        type: isSelect ? 'select' : 'text',
        required: isRequired,
        options,
        maxLength: property.maxLength,
        minLength: property.minLength,
        pattern: property.pattern,
      });
    });
  });

  return fields;
};
