import type { PaymentStatusModel } from '../../../__generated__/index.schemas';
import { StatutPaiement } from '../../../__generated__/index.schemas';

export const getPaymentStatusRefetchInterval =
  (pollIntervalMs?: number) =>
  (data?: PaymentStatusModel): number | false =>
    pollIntervalMs &&
    data?.finalisePaymentResponse.paiement.statutPaiement === StatutPaiement.PENDING
      ? pollIntervalMs
      : false;
