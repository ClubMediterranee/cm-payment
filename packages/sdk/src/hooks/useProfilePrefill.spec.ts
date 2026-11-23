import {
  BILLING_DETAILS_MAPPING,
  CONTACT_MAPPING,
  MAIN_TRAVELER_MAPPING,
} from './useProfilePrefill';

describe('BILLING_DETAILS_MAPPING', () => {
  it('maps every profile field to its corresponding billing_details path', () => {
    const expectedSourceKeys = [
      'email',
      'phones.0.number',
      'first_name',
      'last_name',
      'address.additional_information_1',
      'address.additional_information_2',
      'address.number',
      'address.street',
      'address.add_on',
      'address.town',
      'address.city',
      'address.state_or_district',
      'address.zip_code',
      'address.country',
      'address.country_code',
    ];

    expect(BILLING_DETAILS_MAPPING.map(([source]) => source)).toEqual(expectedSourceKeys);
    BILLING_DETAILS_MAPPING.forEach(([, target]) => {
      expect(target.startsWith('billing_details.')).toBe(true);
    });
  });
});

describe('MAIN_TRAVELER_MAPPING', () => {
  it('maps only the billing address fields, not the contact ones', () => {
    expect(MAIN_TRAVELER_MAPPING.map(([, target]) => target)).toEqual(
      BILLING_DETAILS_MAPPING.map(([, target]) => target).filter(
        (target) => !['billing_details.email', 'billing_details.mobile_phone'].includes(target),
      ),
    );
  });
});

describe('CONTACT_MAPPING', () => {
  it('keeps only the contact fields', () => {
    expect(CONTACT_MAPPING.map(([, target]) => target)).toEqual([
      'billing_details.email',
      'billing_details.mobile_phone',
    ]);
  });
});
