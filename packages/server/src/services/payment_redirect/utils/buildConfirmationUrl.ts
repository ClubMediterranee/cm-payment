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
  proposalId,
  locale,
}: {
  callbackUrl: string | null;
  paymentData: PaymentData;
  proposalId?: string | null;
  locale?: string | null;
}) => {
  if (!callbackUrl) {
    throw new Error('callback_url is required');
  }

  const params = new URLSearchParams({
    ...paymentData,
    ...(proposalId ? { proposal_id: proposalId } : {}),
    ...(locale ? { locale } : {}),
  });

  return `${callbackUrl}?${params.toString()}`;
};
