import type { FieldMetadata } from '../utils/billing/parseBillingSchema';

const ref: { value: FieldMetadata[] | undefined } = {
  value: undefined,
};

export function getBillingFields(): FieldMetadata[] | undefined {
  return ref.value;
}

export function setBillingFields(fields: FieldMetadata[]): void {
  ref.value = fields;
}
