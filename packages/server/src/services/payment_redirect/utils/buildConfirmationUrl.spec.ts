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

  it('omits proposal_id and locale when absent', () => {
    const url = buildConfirmationUrl({ callbackUrl: 'https://client.callback', paymentData });

    const params = new URL(url).searchParams;
    expect(params.has('proposal_id')).toBe(false);
    expect(params.has('locale')).toBe(false);
  });

  it('throws when the callback url is missing', () => {
    expect(() => buildConfirmationUrl({ callbackUrl: null, paymentData })).toThrow(
      'callback_url is required',
    );
  });
});
