import { buildPaymentRedirectPayload } from './index';

const formData = {
  provider_id: 'EVOXPAY',
  action: 'PAYMENT_RESA',
  amount: '100',
  currency: 'EUR',
  payment_condition_id: 'cond-1',
  template_id: '1',
  donation_amount: 20,
  billing_details: {
    email: 'a@b.com',
    mobile_phone: '+33600000000',
    attendee: { first_name: 'John', last_name: 'Doe' },
    address: {
      number: '1',
      street: 'rue de Paris',
      city: 'Paris',
      zip_code: '75000',
      state_or_district: 'IDF',
      country_code: 'FR',
    },
  },
  token: { value: 'tok', status: 'success' },
  uuid: 'call-ref-1',
  reference: 'contact-1',
} as any;

const settings = {
  type: 'booking' as const,
  id: 'booking-999',
  customerId: 'customer-888',
  callbackUrl: 'https://client.callback',
  callbackUrlSeller: 'https://seller.callback',
} as any;

describe('buildPaymentRedirectPayload', () => {
  it('maps the form data, settings and provider into the BFF payload', () => {
    const payload = buildPaymentRedirectPayload(formData, settings, {
      connection_type: 'E-commerce',
    } as any);

    expect(payload).toEqual({
      type: 'booking',
      id: 'booking-999',
      customer_id: 'customer-888',
      provider_id: 'EVOXPAY',
      connection_type: 'E-commerce',
      action: 'PAYMENT_RESA',
      amount: '100',
      currency: 'EUR',
      payment_condition_id: 'cond-1',
      template_id: '1',
      billing_details: {
        email: 'a@b.com',
        mobile_phone: '+33600000000',
        first_name: 'John',
        last_name: 'Doe',
        address1: '1 rue de Paris',
        locality: 'Paris',
        postal_code: '75000',
        administrative_area: 'IDF',
        country_code: 'FR',
      },
      donation_amount: 20,
      token: 'tok',
      callback_url: 'https://client.callback',
      callback_url_seller: 'https://seller.callback',
      uuid: 'call-ref-1',
      reference: 'contact-1',
    });
  });

  it('leaves address1 undefined and omits provider fields when data is missing', () => {
    const payload = buildPaymentRedirectPayload(
      {
        ...formData,
        billing_details: { email: 'a@b.com', address: { city: 'Paris' } },
      } as any,
      settings,
      undefined,
    );

    expect(payload.billing_details.address1).toBeUndefined();
    expect(payload.billing_details.first_name).toBeUndefined();
    expect(payload.connection_type).toBeUndefined();
  });
});
