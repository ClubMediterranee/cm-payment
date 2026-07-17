import { describe, expect, it } from 'vitest';

import { getRedirectPaymentCallbackUrls } from './getRedirectPaymentCallbackUrls.js';

const base = {
  paymentId: 'PAY1',
  providerId: 'EVOXPAY',
  apiUrl: 'https://bff.clubmed.com',
  locale: 'fr-FR',
  callbackUrl: 'https://client.callback',
};

describe('getRedirectPaymentCallbackUrls', () => {
  it('builds a client callback url pointing to the payment redirect endpoint', () => {
    const { callback_url, callback_url_seller } = getRedirectPaymentCallbackUrls(base);

    const url = new URL(callback_url);
    expect(url.origin).toBe('https://bff.clubmed.com');
    expect(url.pathname).toBe('/rest/payment_redirect/PAY1');
    expect(url.searchParams.get('locale')).toBe('fr-FR');
    expect(url.searchParams.get('provider_id')).toBe('EVOXPAY');
    expect(url.searchParams.get('callback_url')).toBe('https://client.callback');
    expect(callback_url_seller).toBeUndefined();
  });

  it('adds the proposal id and extra params when provided', () => {
    const { callback_url } = getRedirectPaymentCallbackUrls({
      ...base,
      proposalId: 'PROP1',
      params: { mode: 'iframe', skip: undefined },
    });

    const url = new URL(callback_url);
    expect(url.searchParams.get('proposal_id')).toBe('PROP1');
    expect(url.searchParams.get('mode')).toBe('iframe');
    expect(url.searchParams.has('skip')).toBe(false);
  });

  it('builds a seller callback url when a seller callback is provided', () => {
    const { callback_url, callback_url_seller } = getRedirectPaymentCallbackUrls({
      ...base,
      callbackUrlSeller: 'https://seller.callback',
    });

    expect(new URL(callback_url).searchParams.get('callback_url')).toBe('https://client.callback');
    expect(new URL(callback_url_seller!).searchParams.get('callback_url')).toBe(
      'https://seller.callback',
    );
  });

  it('omits the seller url when no seller callback is provided', () => {
    const { callback_url_seller } = getRedirectPaymentCallbackUrls(base);

    expect(callback_url_seller).toBeUndefined();
  });
});
