import { useQuery } from '@tanstack/react-query';

import { getV0PaymentsPaymentIdStatus } from '../../__generated__';

export const usePaymentStatus = ({
  paymentId,
  enabled,
}: {
  paymentId: string;
  enabled?: boolean;
}) => {
  return useQuery({
    queryKey: ['status', paymentId],
    queryFn: () => getV0PaymentsPaymentIdStatus(paymentId),
    enabled,
    retry: false,
    refetchInterval: ({ state: { dataUpdateCount, data } }) => {
      const paymentStatus = data?.finalisePaymentResponse.paiement.statutPaiement;
      return dataUpdateCount < 3 && paymentStatus !== 'OK' ? 1000 : false;
    },
    select: (data) => {
      return {
        payment_status: data.finalisePaymentResponse.paiement.statutPaiement,
        booking_id: data.finalisePaymentResponse.dossier.numeroDossier,
        payment_amount: data.finalisePaymentResponse.paiement.montantVersement,
        payment_currency: data.finalisePaymentResponse.paiement.codeDevise,
        provider_id: data.finalisePaymentResponse.paiement.serveurId,
      };
    },
  });
};
