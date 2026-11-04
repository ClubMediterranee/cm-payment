import { describe, expect, it } from 'vitest';

import { CountryModel } from '../../__generated__/index.schemas';
import { injectCountryField } from './injectCountryField';
import { FieldMetadata } from './parseBillingSchema';

describe('injectCountryField', () => {
  const mockCountries: CountryModel[] = [
    { id: 'FR', label: 'France' },
    { id: 'US', label: 'United States' },
    { id: 'ES', label: 'Spain' },
  ];

  it('remplace le champ country par country_code avec les options des pays', () => {
    const fields: FieldMetadata[] = [
      { name: 'first_name', group: 'attendee', type: 'text', required: true },
      { name: 'country', group: 'address', type: 'select', required: true },
      { name: 'city', group: 'address', type: 'text', required: false },
    ];

    const result = injectCountryField(fields, mockCountries);

    expect(result).toHaveLength(3);
    expect(result[1]).toEqual({
      name: 'country_code',
      group: 'address',
      type: 'select',
      required: true,
      options: [
        { value: 'FR', label: 'France' },
        { value: 'US', label: 'United States' },
        { value: 'ES', label: 'Spain' },
      ],
    });
  });

  it('remplace le champ country_code existant par un nouveau avec les options', () => {
    const fields: FieldMetadata[] = [
      { name: 'first_name', group: 'attendee', type: 'text', required: true },
      { name: 'country_code', group: 'address', type: 'select', required: true },
      { name: 'city', group: 'address', type: 'text', required: false },
    ];

    const result = injectCountryField(fields, mockCountries);

    expect(result).toHaveLength(3);
    expect(result[1].name).toBe('country_code');
    expect(result[1].options).toHaveLength(3);
  });

  it('préserve la position du champ country dans la liste', () => {
    const fields: FieldMetadata[] = [
      { name: 'first_name', group: 'attendee', type: 'text', required: true },
      { name: 'street', group: 'address', type: 'text', required: false },
      { name: 'country', group: 'address', type: 'select', required: true },
      { name: 'city', group: 'address', type: 'text', required: false },
    ];

    const result = injectCountryField(fields, mockCountries);

    expect(result).toHaveLength(4);
    expect(result[2].name).toBe('country_code');
    expect(result[1].name).toBe('street');
    expect(result[3].name).toBe('city');
  });

  it('préserve le caractère required du champ original', () => {
    const fields: FieldMetadata[] = [
      { name: 'country', group: 'address', type: 'select', required: false },
    ];

    const result = injectCountryField(fields, mockCountries);

    expect(result[0].required).toBe(false);
  });

  it('retourne les champs inchangés si aucun champ country ou country_code existe', () => {
    const fields: FieldMetadata[] = [
      { name: 'first_name', group: 'attendee', type: 'text', required: true },
      { name: 'city', group: 'address', type: 'text', required: false },
    ];

    const result = injectCountryField(fields, mockCountries);

    expect(result).toEqual(fields);
  });

  it('gère correctement un tableau de pays vide', () => {
    const fields: FieldMetadata[] = [
      { name: 'country', group: 'address', type: 'select', required: true },
    ];

    const result = injectCountryField(fields, []);

    expect(result).toHaveLength(1);
    expect(result[0].options).toEqual([]);
  });

  it('supprime le champ country original et ne garde que country_code', () => {
    const fields: FieldMetadata[] = [
      { name: 'first_name', group: 'attendee', type: 'text', required: true },
      { name: 'country', group: 'address', type: 'select', required: true },
      { name: 'city', group: 'address', type: 'text', required: false },
    ];

    const result = injectCountryField(fields, mockCountries);

    expect(result.find((f) => f.name === 'country')).toBeUndefined();
    expect(result.find((f) => f.name === 'country_code')).toBeDefined();
  });

  it('si country et country_code existent tous les deux, supprime les deux et crée un nouveau country_code', () => {
    const fields: FieldMetadata[] = [
      { name: 'first_name', group: 'attendee', type: 'text', required: true },
      { name: 'country', group: 'address', type: 'select', required: true },
      { name: 'country_code', group: 'address', type: 'select', required: false },
      { name: 'city', group: 'address', type: 'text', required: false },
    ];

    const result = injectCountryField(fields, mockCountries);

    const countryFields = result.filter((f) => f.name === 'country' || f.name === 'country_code');
    expect(countryFields).toHaveLength(1);
    expect(countryFields[0].name).toBe('country_code');
  });
});
