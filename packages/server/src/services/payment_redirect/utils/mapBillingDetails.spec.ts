import { describe, expect, it } from 'vitest';

import { mapBillingDetails } from './mapBillingDetails.js';

const billing = {
  email: 'a@b.com',
  mobile_phone: '+33600000000',
  first_name: 'John',
} as any;

describe('mapBillingDetails', () => {
  it('returns undefined when there are no billing details', () => {
    expect(mapBillingDetails(undefined, '1')).toBeUndefined();
  });

  it('removes the mobile phone for the email template', () => {
    expect(mapBillingDetails(billing, '6')).toEqual({ ...billing, mobile_phone: undefined });
  });

  it('removes the email for the mobile phone template', () => {
    expect(mapBillingDetails(billing, '4')).toEqual({ ...billing, email: undefined });
  });

  it('keeps all fields for the call template', () => {
    expect(mapBillingDetails(billing, '1')).toEqual(billing);
  });

  it('keeps all fields when no template id is provided', () => {
    expect(mapBillingDetails(billing, undefined)).toEqual(billing);
  });
});
