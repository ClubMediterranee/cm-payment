import { PaymentStatus } from '../../../infra/api/__generated__/index.js';

export type PaymentData = {
  payment_status: PaymentStatus;
  booking_id: string;
  payment_amount: string;
  payment_currency: string;
  provider_id: string;
};

export const buildConfirmationUrl = ({
  callbackUrl,
  paymentData,
  paymentId,
  proposalId,
  locale,
  action,
  categoryPaymentMethod,
}: {
  callbackUrl: string | null;
  paymentData: PaymentData;
  paymentId?: string | null;
  proposalId?: string | null;
  locale?: string | null;
  action?: string | null;
  categoryPaymentMethod?: string | null;
}) => {
  if (!callbackUrl) {
    throw new Error('callback_url is required');
  }

  const url = new URL(callbackUrl);

  Object.entries(paymentData).forEach(([key, value]) => url.searchParams.set(key, String(value)));

  Object.entries({
    payment_id: paymentId,
    proposal_id: proposalId,
    locale,
    action,
    category_payment_method: categoryPaymentMethod,
  }).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, value);
    }
  });

  return url.toString();
};
