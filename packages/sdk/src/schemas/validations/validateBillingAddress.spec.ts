import { defaultContent } from '../../content/default';
import { setBillingFields } from '../../stores/billingFieldsStore';
import type { CapsFormConfig } from '../../types/CapsFormConfig';
import type { FieldMetadata } from '../../utils/billing/parseBillingSchema';
import type { CapsFormSchema } from '../capsFormSchema';
import { validateBillingAddress } from './validateBillingAddress';

const mockConfig: CapsFormConfig = {
  content: defaultContent,
  isSeller: true,
  maxAmount: 10000,
  getProviderConfiguration: () => undefined,
};

describe('validateBillingAddress', () => {
  beforeEach(() => {
    setBillingFields([]);
  });

  afterEach(() => {
    setBillingFields([]);
  });

  it('returns undefined when no billing fields are configured', () => {
    setBillingFields(undefined as any);

    const result = validateBillingAddress(
      {
        billing_details: {
          address: {
            city: 'Paris',
            country_code: 'FR',
          },
        },
      } as unknown as CapsFormSchema,
      mockConfig,
    );

    expect(result).toBeUndefined();
  });

  it('returns undefined when billing fields array is empty', () => {
    setBillingFields([]);

    const result = validateBillingAddress(
      {
        billing_details: {
          address: {
            city: 'Paris',
            country_code: 'FR',
          },
        },
      } as unknown as CapsFormSchema,
      mockConfig,
    );

    expect(result).toBeUndefined();
  });

  it('returns undefined when all required fields are valid', () => {
    const fields: FieldMetadata[] = [
      { name: 'first_name', group: 'attendee', type: 'text', required: true },
      { name: 'last_name', group: 'attendee', type: 'text', required: true },
      { name: 'street', group: 'address', type: 'text', required: true },
      { name: 'city', group: 'address', type: 'text', required: true },
    ];
    setBillingFields(fields);

    const result = validateBillingAddress(
      {
        billing_details: {
          attendee: {
            first_name: 'Jean',
            last_name: 'Dupont',
          },
          address: {
            street: 'Avenue des Champs-Élysées',
            city: 'Paris',
            country_code: 'FR',
          },
        },
      } as unknown as CapsFormSchema,
      mockConfig,
    );

    expect(result).toBeUndefined();
  });

  it('returns error when required attendee field is missing', () => {
    const fields: FieldMetadata[] = [
      { name: 'first_name', group: 'attendee', type: 'text', required: true },
      { name: 'last_name', group: 'attendee', type: 'text', required: true },
    ];
    setBillingFields(fields);

    const result = validateBillingAddress(
      {
        billing_details: {
          attendee: {
            first_name: 'Jean',
            last_name: '',
          },
          address: {
            country_code: 'FR',
          },
        },
      } as unknown as CapsFormSchema,
      mockConfig,
    );

    expect(result).toEqual([
      {
        path: ['billing_details', 'attendee', 'last_name'],
        message: defaultContent.billingAddress.validation.required,
      },
    ]);
  });

  it('returns error when required address field is missing', () => {
    const fields: FieldMetadata[] = [
      { name: 'street', group: 'address', type: 'text', required: true },
      { name: 'city', group: 'address', type: 'text', required: true },
    ];
    setBillingFields(fields);

    const result = validateBillingAddress(
      {
        billing_details: {
          address: {
            street: 'Rue de la Paix',
            city: '',
            country_code: 'FR',
          },
        },
      } as unknown as CapsFormSchema,
      mockConfig,
    );

    expect(result).toEqual([
      {
        path: ['billing_details', 'address', 'city'],
        message: defaultContent.billingAddress.validation.required,
      },
    ]);
  });

  it('returns error when required field is only whitespace', () => {
    const fields: FieldMetadata[] = [
      { name: 'first_name', group: 'attendee', type: 'text', required: true },
    ];
    setBillingFields(fields);

    const result = validateBillingAddress(
      {
        billing_details: {
          attendee: {
            first_name: '   ',
          },
          address: {
            country_code: 'FR',
          },
        },
      } as unknown as CapsFormSchema,
      mockConfig,
    );

    expect(result).toEqual([
      {
        path: ['billing_details', 'attendee', 'first_name'],
        message: defaultContent.billingAddress.validation.required,
      },
    ]);
  });

  it('returns error when field exceeds maxLength', () => {
    const fields: FieldMetadata[] = [
      { name: 'first_name', group: 'attendee', type: 'text', required: true, maxLength: 10 },
    ];
    setBillingFields(fields);

    const result = validateBillingAddress(
      {
        billing_details: {
          attendee: {
            first_name: 'VeryLongFirstName',
          },
          address: {
            country_code: 'FR',
          },
        },
      } as unknown as CapsFormSchema,
      mockConfig,
    );

    expect(result).toEqual([
      {
        path: ['billing_details', 'attendee', 'first_name'],
        message: defaultContent.billingAddress.validation.maxLength,
      },
    ]);
  });

  it('returns error when field is below minLength', () => {
    const fields: FieldMetadata[] = [
      { name: 'zip_code', group: 'address', type: 'text', required: true, minLength: 5 },
    ];
    setBillingFields(fields);

    const result = validateBillingAddress(
      {
        billing_details: {
          address: {
            zip_code: '123',
            country_code: 'FR',
          },
        },
      } as unknown as CapsFormSchema,
      mockConfig,
    );

    expect(result).toEqual([
      {
        path: ['billing_details', 'address', 'zip_code'],
        message: defaultContent.billingAddress.validation.pattern,
      },
    ]);
  });

  it('returns error when field does not match pattern', () => {
    const fields: FieldMetadata[] = [
      {
        name: 'zip_code',
        group: 'address',
        type: 'text',
        required: true,
        pattern: '^[0-9]{5}$',
      },
    ];
    setBillingFields(fields);

    const result = validateBillingAddress(
      {
        billing_details: {
          address: {
            zip_code: 'ABCDE',
            country_code: 'FR',
          },
        },
      } as unknown as CapsFormSchema,
      mockConfig,
    );

    expect(result).toEqual([
      {
        path: ['billing_details', 'address', 'zip_code'],
        message: defaultContent.billingAddress.validation.pattern,
      },
    ]);
  });

  it('returns undefined when optional field is empty', () => {
    const fields: FieldMetadata[] = [
      { name: 'first_name', group: 'attendee', type: 'text', required: true },
      { name: 'last_name', group: 'attendee', type: 'text', required: false },
    ];
    setBillingFields(fields);

    const result = validateBillingAddress(
      {
        billing_details: {
          attendee: {
            first_name: 'Jean',
            last_name: '',
          },
          address: {
            country_code: 'FR',
          },
        },
      } as unknown as CapsFormSchema,
      mockConfig,
    );

    expect(result).toBeUndefined();
  });

  it('returns multiple errors when multiple fields are invalid', () => {
    const fields: FieldMetadata[] = [
      { name: 'first_name', group: 'attendee', type: 'text', required: true },
      { name: 'last_name', group: 'attendee', type: 'text', required: true },
      { name: 'street', group: 'address', type: 'text', required: true, maxLength: 10 },
    ];
    setBillingFields(fields);

    const result = validateBillingAddress(
      {
        billing_details: {
          attendee: {
            first_name: '',
            last_name: '',
          },
          address: {
            street: 'Very Long Street Name That Exceeds Maximum',
            country_code: 'FR',
          },
        },
      } as unknown as CapsFormSchema,
      mockConfig,
    );

    expect(result).toEqual([
      {
        path: ['billing_details', 'attendee', 'first_name'],
        message: defaultContent.billingAddress.validation.required,
      },
      {
        path: ['billing_details', 'attendee', 'last_name'],
        message: defaultContent.billingAddress.validation.required,
      },
      {
        path: ['billing_details', 'address', 'street'],
        message: defaultContent.billingAddress.validation.maxLength,
      },
    ]);
  });

  it('handles fields with valid pattern correctly', () => {
    const fields: FieldMetadata[] = [
      {
        name: 'zip_code',
        group: 'address',
        type: 'text',
        required: true,
        pattern: '^[0-9]{5}$',
      },
    ];
    setBillingFields(fields);

    const result = validateBillingAddress(
      {
        billing_details: {
          address: {
            zip_code: '75008',
            country_code: 'FR',
          },
        },
      } as unknown as CapsFormSchema,
      mockConfig,
    );

    expect(result).toBeUndefined();
  });

  it('handles invalid regex pattern gracefully', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const fields: FieldMetadata[] = [
      {
        name: 'test_field',
        group: 'address',
        type: 'text',
        required: false,
        pattern: '[invalid(regex',
      },
    ];
    setBillingFields(fields);

    const result = validateBillingAddress(
      {
        billing_details: {
          address: {
            test_field: 'some value',
            country_code: 'FR',
          },
        },
      } as unknown as CapsFormSchema,
      mockConfig,
    );

    expect(consoleErrorSpy).toHaveBeenCalled();
    expect(result).toBeUndefined();

    consoleErrorSpy.mockRestore();
  });

  it('handles missing billing_details gracefully', () => {
    const fields: FieldMetadata[] = [
      { name: 'first_name', group: 'attendee', type: 'text', required: true },
    ];
    setBillingFields(fields);

    const result = validateBillingAddress({} as unknown as CapsFormSchema, mockConfig);

    expect(result).toEqual([
      {
        path: ['billing_details', 'attendee', 'first_name'],
        message: defaultContent.billingAddress.validation.required,
      },
    ]);
  });

  it('handles missing group in billing_details', () => {
    const fields: FieldMetadata[] = [
      { name: 'first_name', group: 'attendee', type: 'text', required: true },
    ];
    setBillingFields(fields);

    const result = validateBillingAddress(
      {
        billing_details: {
          address: {
            country_code: 'FR',
          },
        },
      } as unknown as CapsFormSchema,
      mockConfig,
    );

    expect(result).toEqual([
      {
        path: ['billing_details', 'attendee', 'first_name'],
        message: defaultContent.billingAddress.validation.required,
      },
    ]);
  });

  it('validates combination of required and optional fields with constraints', () => {
    const fields: FieldMetadata[] = [
      { name: 'first_name', group: 'attendee', type: 'text', required: true, maxLength: 50 },
      { name: 'last_name', group: 'attendee', type: 'text', required: true, maxLength: 50 },
      { name: 'street', group: 'address', type: 'text', required: true, maxLength: 100 },
      { name: 'city', group: 'address', type: 'text', required: true, maxLength: 50 },
      {
        name: 'zip_code',
        group: 'address',
        type: 'text',
        required: true,
        minLength: 5,
        maxLength: 5,
        pattern: '^[0-9]{5}$',
      },
    ];
    setBillingFields(fields);

    const result = validateBillingAddress(
      {
        billing_details: {
          attendee: {
            first_name: 'Jean',
            last_name: 'Dupont',
          },
          address: {
            street: 'Avenue des Champs-Élysées',
            city: 'Paris',
            zip_code: '75008',
            country_code: 'FR',
          },
        },
      } as unknown as CapsFormSchema,
      mockConfig,
    );

    expect(result).toBeUndefined();
  });
});
