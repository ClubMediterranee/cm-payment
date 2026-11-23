import { describe, expect, it } from 'vitest';

import { PaymentStatus } from '../../../infra/api/__generated__/index.js';
import { buildConfirmationUrl } from './buildConfirmationUrl.js';

const paymentData = {
  payment_status: PaymentStatus.OK,
  booking_id: 'BOOK1',
  payment_amount: '100',
  payment_currency: 'EUR',
  provider_id: 'EVOXPAY',
};

describe('buildConfirmationUrl', () => {
  it('appends the payment data as query params to the callback url', () => {
    const url = buildConfirmationUrl({ callbackUrl: 'https://client.callback', paymentData });

    const params = new URL(url).searchParams;
    expect(params.get('payment_status')).toBe(PaymentStatus.OK);
    expect(params.get('booking_id')).toBe('BOOK1');
    expect(params.get('payment_amount')).toBe('100');
    expect(params.get('payment_currency')).toBe('EUR');
    expect(params.get('provider_id')).toBe('EVOXPAY');
  });

  it('includes proposal_id and locale when provided', () => {
    const url = buildConfirmationUrl({
      callbackUrl: 'https://client.callback',
      paymentData,
      proposalId: 'PROP1',
      locale: 'fr-FR',
    });

    const params = new URL(url).searchParams;
    expect(params.get('proposal_id')).toBe('PROP1');
    expect(params.get('locale')).toBe('fr-FR');
  });

  it('includes payment_id, action and category_payment_method when provided', () => {
    const url = buildConfirmationUrl({
      callbackUrl: 'https://client.callback',
      paymentData,
      paymentId: 'PAY1',
      action: 'PAYMENT_RESA',
      categoryPaymentMethod: 'CreditCard',
    });

    const params = new URL(url).searchParams;
    expect(params.get('payment_id')).toBe('PAY1');
    expect(params.get('action')).toBe('PAYMENT_RESA');
    expect(params.get('category_payment_method')).toBe('CreditCard');
  });

  it('omits the optional params when absent', () => {
    const url = buildConfirmationUrl({ callbackUrl: 'https://client.callback', paymentData });

    const params = new URL(url).searchParams;
    ['payment_id', 'proposal_id', 'locale', 'action', 'category_payment_method'].forEach((key) =>
      expect(params.has(key)).toBe(false),
    );
  });

  it('keeps the query string and hash of the callback url', () => {
    const url = buildConfirmationUrl({
      callbackUrl: 'https://client.callback/confirm?ref=abc#top',
      paymentData,
    });

    const parsed = new URL(url);
    expect(parsed.searchParams.get('ref')).toBe('abc');
    expect(parsed.searchParams.get('payment_status')).toBe(PaymentStatus.OK);
    expect(parsed.hash).toBe('#top');
  });

  it('throws when the callback url is missing', () => {
    expect(() => buildConfirmationUrl({ callbackUrl: null, paymentData })).toThrow(
      'callback_url is required',
    );
  });
});
