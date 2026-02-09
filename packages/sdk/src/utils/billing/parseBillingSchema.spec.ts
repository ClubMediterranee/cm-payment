import { describe, expect, it, vi } from 'vitest';

import { ClientSchemaModel } from '../../__generated__/index.schemas';
import { parseBillingSchema } from './parseBillingSchema';

describe('parseBillingSchema', () => {
  const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  afterEach(() => {
    consoleErrorSpy.mockClear();
  });

  it('parse un schéma valide avec attendee et address', () => {
    const schema: ClientSchemaModel = {
      properties: {
        attendee: {
          type: 'object',
          required: ['first_name'],
          properties: {
            first_name: { type: 'string' },
            last_name: { type: 'string' },
          },
        },
        address: {
          type: 'object',
          required: ['city'],
          properties: {
            city: { type: 'string' },
            country: { type: 'string', enum: ['FR', 'US'] },
          },
        },
      },
    };

    const result = parseBillingSchema(schema);

    expect(result).toHaveLength(4);
    expect(result).toContainEqual({
      name: 'first_name',
      group: 'attendee',
      type: 'text',
      required: true,
      options: undefined,
      maxLength: undefined,
      minLength: undefined,
      pattern: undefined,
    });
    expect(result).toContainEqual({
      name: 'city',
      group: 'address',
      type: 'text',
      required: true,
      options: undefined,
      maxLength: undefined,
      minLength: undefined,
      pattern: undefined,
    });
  });

  it('parse un champ de type select avec enum', () => {
    const schema: ClientSchemaModel = {
      properties: {
        address: {
          type: 'object',
          required: ['country'],
          properties: {
            country: { type: 'string', enum: ['FR', 'US', 'ES'] },
          },
        },
      },
    };

    const result = parseBillingSchema(schema);

    expect(result[0]).toEqual({
      name: 'country',
      group: 'address',
      type: 'select',
      required: true,
      options: [
        { value: 'FR', label: 'FR' },
        { value: 'US', label: 'US' },
        { value: 'ES', label: 'ES' },
      ],
      maxLength: undefined,
      minLength: undefined,
      pattern: undefined,
    });
  });

  it('parse un champ de type select avec x-choices', () => {
    const schema: ClientSchemaModel = {
      properties: {
        address: {
          type: 'object',
          required: ['country'],
          properties: {
            country: {
              type: 'string',
              'x-choices': [
                { code: 'FR', label: 'France' },
                { code: 'US', label: 'United States' },
              ],
            },
          },
        },
      },
    };

    const result = parseBillingSchema(schema);

    expect(result[0]).toEqual({
      name: 'country',
      group: 'address',
      type: 'select',
      required: true,
      options: [
        { value: 'FR', label: 'France' },
        { value: 'US', label: 'United States' },
      ],
      maxLength: undefined,
      minLength: undefined,
      pattern: undefined,
    });
  });

  it('préfère x-choices sur enum si les deux sont présents', () => {
    const schema: ClientSchemaModel = {
      properties: {
        address: {
          type: 'object',
          properties: {
            country: {
              type: 'string',
              enum: ['FR', 'US'],
              'x-choices': [
                { code: 'FR', label: 'France' },
                { code: 'US', label: 'United States' },
              ],
            },
          },
        },
      },
    };

    const result = parseBillingSchema(schema);

    expect(result[0].options).toEqual([
      { value: 'FR', label: 'France' },
      { value: 'US', label: 'United States' },
    ]);
  });

  it('parse les contraintes de validation maxLength, minLength, pattern', () => {
    const schema: ClientSchemaModel = {
      properties: {
        attendee: {
          type: 'object',
          properties: {
            first_name: {
              type: 'string',
              maxLength: 50,
              minLength: 2,
              pattern: '^[A-Za-z]+$',
            },
          },
        },
      },
    };

    const result = parseBillingSchema(schema);

    expect(result[0]).toEqual({
      name: 'first_name',
      group: 'attendee',
      type: 'text',
      required: false,
      options: undefined,
      maxLength: 50,
      minLength: 2,
      pattern: '^[A-Za-z]+$',
    });
  });

  it('gère les champs non requis', () => {
    const schema: ClientSchemaModel = {
      properties: {
        attendee: {
          type: 'object',
          required: [],
          properties: {
            first_name: { type: 'string' },
          },
        },
      },
    };

    const result = parseBillingSchema(schema);

    expect(result[0].required).toBe(false);
  });

  it('parse un schéma avec properties en string JSON', () => {
    const schema: ClientSchemaModel = {
      properties: JSON.stringify({
        attendee: {
          type: 'object',
          properties: {
            first_name: { type: 'string' },
          },
        },
      }),
    };

    const result = parseBillingSchema(schema);

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('first_name');
  });

  it('lève une erreur si properties est manquant', () => {
    const schema = {} as ClientSchemaModel;

    expect(() => parseBillingSchema(schema)).toThrow('Invalid billing schema: missing properties');
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '[parseBillingSchema] Missing properties in schema',
    );
  });

  it('lève une erreur si properties est un JSON invalide', () => {
    const schema: ClientSchemaModel = {
      properties: 'invalid json{' as any,
    };

    expect(() => parseBillingSchema(schema)).toThrow(
      'Invalid billing schema: malformed properties',
    );
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '[parseBillingSchema] Failed to parse properties:',
      expect.any(Error),
    );
  });

  it('lève une erreur si attendee et address sont tous deux manquants', () => {
    const schema: ClientSchemaModel = {
      properties: {
        other: { type: 'object' },
      },
    };

    expect(() => parseBillingSchema(schema)).toThrow(
      'Invalid billing schema: missing attendee and address groups',
    );
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '[parseBillingSchema] Missing attendee and address in schema properties',
    );
  });

  it('accepte un schéma avec seulement attendee', () => {
    const schema: ClientSchemaModel = {
      properties: {
        attendee: {
          type: 'object',
          properties: {
            first_name: { type: 'string' },
          },
        },
      },
    };

    const result = parseBillingSchema(schema);

    expect(result).toHaveLength(1);
    expect(result[0].group).toBe('attendee');
  });

  it('accepte un schéma avec seulement address', () => {
    const schema: ClientSchemaModel = {
      properties: {
        address: {
          type: 'object',
          properties: {
            city: { type: 'string' },
          },
        },
      },
    };

    const result = parseBillingSchema(schema);

    expect(result).toHaveLength(1);
    expect(result[0].group).toBe('address');
  });

  it('gère un groupe sans properties', () => {
    const schema: ClientSchemaModel = {
      properties: {
        attendee: {
          type: 'object',
        },
        address: {
          type: 'object',
          properties: {
            city: { type: 'string' },
          },
        },
      },
    };

    const result = parseBillingSchema(schema);

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('city');
  });

  it('ignore les enum vides', () => {
    const schema: ClientSchemaModel = {
      properties: {
        address: {
          type: 'object',
          properties: {
            country: { type: 'string', enum: [] },
          },
        },
      },
    };

    const result = parseBillingSchema(schema);

    expect(result[0].type).toBe('text');
    expect(result[0].options).toBeUndefined();
  });

  it('ignore les x-choices vides', () => {
    const schema: ClientSchemaModel = {
      properties: {
        address: {
          type: 'object',
          properties: {
            country: { type: 'string', 'x-choices': [] },
          },
        },
      },
    };

    const result = parseBillingSchema(schema);

    expect(result[0].type).toBe('text');
    expect(result[0].options).toBeUndefined();
  });
});
