import { describe, expect, it, vi } from 'vitest';

import { ProfileModelV2 } from '../__generated__/index.schemas';
import { mapProfileToForm } from './mapProfileToForm';

describe('mapProfileToForm', () => {
  it('mappe les champs simples du profil vers le formulaire', () => {
    const profile: ProfileModelV2 = {
      email: 'john.doe@example.com',
      first_name: 'John',
      last_name: 'Doe',
      personal_data_usage_allowed: true,
      identity: null,
    };

    const mapping = [
      ['email', 'billing_details.email'],
      ['first_name', 'billing_details.attendee.first_name'],
    ] as const;

    const setValue = vi.fn();

    const result = mapProfileToForm(profile, mapping as any, setValue);

    expect(setValue).toHaveBeenCalledWith('billing_details.email', 'john.doe@example.com');
    expect(setValue).toHaveBeenCalledWith('billing_details.attendee.first_name', 'John');
    expect(setValue).toHaveBeenCalledTimes(2);
    expect(result).toEqual(profile);
  });

  it('mappe les champs imbriqués avec la notation point', () => {
    const profile: ProfileModelV2 = {
      email: 'john@example.com',
      address: {
        street: 'Main Street',
        city: 'Paris',
        zip_code: '75001',
      },
      personal_data_usage_allowed: true,
      identity: null,
    };

    const mapping = [
      ['address.street', 'billing_details.address.street'],
      ['address.city', 'billing_details.address.city'],
      ['address.zip_code', 'billing_details.address.zip_code'],
    ] as const;

    const setValue = vi.fn();

    mapProfileToForm(profile, mapping as any, setValue);

    expect(setValue).toHaveBeenCalledWith('billing_details.address.street', 'Main Street');
    expect(setValue).toHaveBeenCalledWith('billing_details.address.city', 'Paris');
    expect(setValue).toHaveBeenCalledWith('billing_details.address.zip_code', '75001');
  });

  it('mappe les tableaux avec la notation point et index', () => {
    const profile: ProfileModelV2 = {
      email: 'john@example.com',
      phones: [
        { number: '+33612345678', type: 'MOBILE' },
        { number: '+33987654321', type: 'HOME' },
      ],
      personal_data_usage_allowed: true,
      identity: null,
    };

    const mapping = [
      ['phones.0.number', 'billing_details.mobile_phone'],
      ['phones.1.number', 'billing_details.home_phone'],
    ] as const;

    const setValue = vi.fn();

    mapProfileToForm(profile, mapping as any, setValue);

    expect(setValue).toHaveBeenCalledWith('billing_details.mobile_phone', '+33612345678');
    expect(setValue).toHaveBeenCalledWith('billing_details.home_phone', '+33987654321');
  });

  it('ignore les champs undefined', () => {
    const profile: ProfileModelV2 = {
      email: 'john@example.com',
      first_name: undefined,
      personal_data_usage_allowed: true,
      identity: null,
    };

    const mapping = [
      ['email', 'billing_details.email'],
      ['first_name', 'billing_details.attendee.first_name'],
    ] as const;

    const setValue = vi.fn();

    mapProfileToForm(profile, mapping as any, setValue);

    expect(setValue).toHaveBeenCalledWith('billing_details.email', 'john@example.com');
    expect(setValue).toHaveBeenCalledTimes(1);
  });

  it('ignore les champs null', () => {
    const profile: ProfileModelV2 = {
      email: 'john@example.com',
      first_name: null as any,
      personal_data_usage_allowed: true,
      identity: null,
    };

    const mapping = [
      ['email', 'billing_details.email'],
      ['first_name', 'billing_details.attendee.first_name'],
    ] as const;

    const setValue = vi.fn();

    mapProfileToForm(profile, mapping as any, setValue);

    expect(setValue).toHaveBeenCalledWith('billing_details.email', 'john@example.com');
    expect(setValue).toHaveBeenCalledTimes(1);
  });

  it("gère les chemins inexistants sans lever d'erreur", () => {
    const profile: ProfileModelV2 = {
      email: 'john@example.com',
      personal_data_usage_allowed: true,
      identity: null,
    };

    const mapping = [
      ['email', 'billing_details.email'],
      ['address.nonexistent.field', 'some.path'],
      ['phones.0.number', 'another.path'],
    ] as const;

    const setValue = vi.fn();

    expect(() => {
      mapProfileToForm(profile, mapping as any, setValue);
    }).not.toThrow();

    expect(setValue).toHaveBeenCalledTimes(1);
    expect(setValue).toHaveBeenCalledWith('billing_details.email', 'john@example.com');
  });

  it('retourne le profil inchangé', () => {
    const profile: ProfileModelV2 = {
      email: 'john@example.com',
      first_name: 'John',
      personal_data_usage_allowed: true,
      identity: null,
    };

    const mapping = [['email', 'billing_details.email']] as const;

    const setValue = vi.fn();

    const result = mapProfileToForm(profile, mapping as any, setValue);

    expect(result).toBe(profile);
    expect(result).toEqual(profile);
  });

  it('mappe correctement tous les champs de BILLING_ADDRESS_MAPPING', () => {
    const profile: ProfileModelV2 = {
      email: 'john@example.com',
      first_name: 'John',
      last_name: 'Doe',
      address: {
        additional_information_1: 'Building A',
        additional_information_2: 'Floor 3',
        number: '42',
        street: 'Main Street',
        add_on: 'Apt 5',
        town: 'Downtown',
        city: 'Paris',
        state_or_district: 'Île-de-France',
        zip_code: '75001',
        country: 'France',
        country_code: 'FR',
      },
      personal_data_usage_allowed: true,
      identity: null,
    };

    const mapping = [
      ['first_name', 'billing_details.attendee.first_name'],
      ['last_name', 'billing_details.attendee.last_name'],
      ['address.additional_information_1', 'billing_details.address.additional_information_1'],
      ['address.additional_information_2', 'billing_details.address.additional_information_2'],
      ['address.number', 'billing_details.address.number'],
      ['address.street', 'billing_details.address.street'],
      ['address.add_on', 'billing_details.address.add_on'],
      ['address.town', 'billing_details.address.town'],
      ['address.city', 'billing_details.address.city'],
      ['address.state_or_district', 'billing_details.address.state_or_district'],
      ['address.zip_code', 'billing_details.address.zip_code'],
      ['address.country', 'billing_details.address.country'],
      ['address.country_code', 'billing_details.address.country_code'],
    ] as const;

    const setValue = vi.fn();

    mapProfileToForm(profile, mapping as any, setValue);

    expect(setValue).toHaveBeenCalledTimes(13);
    expect(setValue).toHaveBeenCalledWith('billing_details.attendee.first_name', 'John');
    expect(setValue).toHaveBeenCalledWith('billing_details.attendee.last_name', 'Doe');
    expect(setValue).toHaveBeenCalledWith(
      'billing_details.address.additional_information_1',
      'Building A',
    );
    expect(setValue).toHaveBeenCalledWith('billing_details.address.number', '42');
    expect(setValue).toHaveBeenCalledWith('billing_details.address.street', 'Main Street');
    expect(setValue).toHaveBeenCalledWith('billing_details.address.city', 'Paris');
    expect(setValue).toHaveBeenCalledWith('billing_details.address.zip_code', '75001');
    expect(setValue).toHaveBeenCalledWith('billing_details.address.country_code', 'FR');
  });

  it('mappe correctement tous les champs de BILLING_DETAILS_MAPPING', () => {
    const profile: ProfileModelV2 = {
      email: 'john.doe@example.com',
      phones: [{ number: '+33612345678', type: 'MOBILE' }],
      personal_data_usage_allowed: true,
      identity: null,
    };

    const mapping = [
      ['email', 'billing_details.email'],
      ['phones.0.number', 'billing_details.mobile_phone'],
    ] as const;

    const setValue = vi.fn();

    mapProfileToForm(profile, mapping as any, setValue);

    expect(setValue).toHaveBeenCalledTimes(2);
    expect(setValue).toHaveBeenCalledWith('billing_details.email', 'john.doe@example.com');
    expect(setValue).toHaveBeenCalledWith('billing_details.mobile_phone', '+33612345678');
  });

  it('gère un mapping vide', () => {
    const profile: ProfileModelV2 = {
      email: 'john@example.com',
      personal_data_usage_allowed: true,
      identity: null,
    };

    const setValue = vi.fn();

    const result = mapProfileToForm(profile, [], setValue);

    expect(setValue).not.toHaveBeenCalled();
    expect(result).toBe(profile);
  });

  it('mappe les valeurs falsy qui ne sont pas null ou undefined', () => {
    const profile: ProfileModelV2 = {
      email: '',
      first_name: '0',
      personal_data_usage_allowed: false,
      identity: null,
    };

    const mapping = [
      ['email', 'billing_details.email'],
      ['first_name', 'billing_details.attendee.first_name'],
      ['personal_data_usage_allowed', 'consent.data_usage'],
    ] as const;

    const setValue = vi.fn();

    mapProfileToForm(profile, mapping as any, setValue);

    expect(setValue).toHaveBeenCalledWith('billing_details.email', '');
    expect(setValue).toHaveBeenCalledWith('billing_details.attendee.first_name', '0');
    expect(setValue).toHaveBeenCalledWith('consent.data_usage', false);
    expect(setValue).toHaveBeenCalledTimes(3);
  });
});
