import { useQuery } from '@tanstack/react-query';

import { getV0PaymentsPaymentIdStatus } from '../../__generated__';
import { StatutPaiement } from '../../__generated__/index.schemas';

type Options = { enabled?: boolean; pollIntervalMs?: number };

export const usePaymentStatus = (paymentId?: string, { enabled, pollIntervalMs }: Options = {}) =>
  useQuery({
    enabled,
    queryKey: ['paymentStatus', paymentId],
    queryFn: () => getV0PaymentsPaymentIdStatus(paymentId!),
    select: ({ finalisePaymentResponse: { paiement, dossier } }) => ({
      payment_status: paiement.statutPaiement,
      booking_id: dossier.numeroDossier,
      payment_amount: paiement.montantVersement,
      payment_currency: paiement.codeDevise,
      provider_id: paiement.serveurId,
    }),
    refetchInterval: ({ state }) =>
      pollIntervalMs &&
      state.data?.finalisePaymentResponse.paiement.statutPaiement === StatutPaiement.PENDING
        ? pollIntervalMs
        : false,
  });
