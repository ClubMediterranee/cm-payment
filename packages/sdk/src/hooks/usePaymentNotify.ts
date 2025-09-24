import {useQuery} from "@tanstack/react-query";
import {postV1PaymentsPaymentIdNotify} from "../__generated__";
import {isServerValidationProvidersEnabled} from "@clubmed/payment-sdk/services/isServerValidationProvidersEnabled.js";

export const usePaymentNotify = ({paymentId}: { paymentId: string }) => {
  const search = new URLSearchParams(document.location.search);
  const provider_id = search.get("provider_id") as string;

  return useQuery({
    queryKey: ["notify"],
    queryFn: () =>
      // TODO Jeremo enleve le never et tu verras le problème
      postV1PaymentsPaymentIdNotify(paymentId, {provider_response: search as never}),
    enabled: isServerValidationProvidersEnabled(paymentId, provider_id),
    retry: false,
  });
};
