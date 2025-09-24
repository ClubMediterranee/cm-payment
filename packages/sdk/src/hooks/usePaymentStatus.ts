import {useQuery} from "@tanstack/react-query";
import {getV0PaymentsPaymentIdStatus} from "../__generated__";
import {GLOBAL_SDK_SETTINGS} from "@clubmed/payment-sdk/config.js";

export const usePaymentStatus = ({paymentId}: { paymentId: string }) => {
  const search = new URLSearchParams(document.location.search);
  const provider_id = new URLSearchParams(search).get("provider_id");
  const isEnabled = !!paymentId &&
    GLOBAL_SDK_SETTINGS.serverValidationProviders.includes(provider_id as any || "");

  return useQuery({
    queryKey: ["status"],
    queryFn: () => getV0PaymentsPaymentIdStatus(paymentId),
    enabled: isEnabled,
    retry: false,
    refetchInterval: ({state: {dataUpdateCount, data}}) => {
      const paymentStatus =
        data?.finalisePaymentResponse.paiement.statutPaiement;
      return dataUpdateCount < 3 && paymentStatus !== "OK" ? 1000 : false;
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
