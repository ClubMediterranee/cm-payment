import { describe, expect, it } from 'vitest';

import { hasCountryField } from './hasCountryField';
import { FieldMetadata } from './parseBillingSchema';

describe('hasCountryField', () => {
  it('retourne true si un champ country existe', () => {
    const fields: FieldMetadata[] = [
      { name: 'first_name', group: 'attendee', type: 'text', required: true },
      { name: 'country', group: 'address', type: 'select', required: true },
    ];

    expect(hasCountryField(fields)).toBe(true);
  });

  it('retourne true si un champ country_code existe', () => {
    const fields: FieldMetadata[] = [
      { name: 'first_name', group: 'attendee', type: 'text', required: true },
      { name: 'country_code', group: 'address', type: 'select', required: true },
    ];

    expect(hasCountryField(fields)).toBe(true);
  });

  it('retourne true si les deux champs country et country_code existent', () => {
    const fields: FieldMetadata[] = [
      { name: 'country', group: 'address', type: 'select', required: true },
      { name: 'country_code', group: 'address', type: 'select', required: true },
    ];

    expect(hasCountryField(fields)).toBe(true);
  });

  it('retourne false si aucun champ country ou country_code existe', () => {
    const fields: FieldMetadata[] = [
      { name: 'first_name', group: 'attendee', type: 'text', required: true },
      { name: 'city', group: 'address', type: 'text', required: true },
    ];

    expect(hasCountryField(fields)).toBe(false);
  });

  it('retourne false pour un tableau vide', () => {
    expect(hasCountryField([])).toBe(false);
  });
});
