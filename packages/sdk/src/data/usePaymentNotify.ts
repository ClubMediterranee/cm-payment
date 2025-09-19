import { useQuery } from "@tanstack/react-query";
import { SERVER_VALIDATION_PROVIDERS } from "../utils/constants";
import { postV1PaymentsPaymentIdNotify } from "../gen";

export const usePaymentNotify = ({ paymentId }: { paymentId: string }) => {
  const search = new URLSearchParams(document.location.search);
  const provider_id = new URLSearchParams(search).get("provider_id");
  const isEnabled =
    !SERVER_VALIDATION_PROVIDERS.includes(provider_id || "") && !!paymentId;

  return useQuery({
    queryKey: ["notify"],
    queryFn: () =>
      postV1PaymentsPaymentIdNotify(paymentId, { provider_response: search }),
    enabled: isEnabled,
    retry: false,
  });
};
