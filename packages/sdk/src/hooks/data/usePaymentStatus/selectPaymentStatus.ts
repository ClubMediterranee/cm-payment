import type { PaymentStatusModel } from '../../../__generated__/index.schemas';

export const selectPaymentStatus = ({
  finalisePaymentResponse: { paiement, dossier },
}: PaymentStatusModel) => ({
  payment_status: paiement.statutPaiement,
  booking_id: dossier.numeroDossier,
  payment_amount: paiement.montantVersement,
  payment_currency: paiement.codeDevise,
  provider_id: paiement.serveurId,
});
