import { useMutation } from "@tanstack/react-query";
import { useAuth } from "react-oidc-context";
import {
  PaymentRedirectRequestModel,
  postV0PaymentsPaymentIdRedirectRequest,
} from "../api";

export const useRedirectRequestMutation = () => {
  const { user } = useAuth();
  const profile = user?.profile.type;

  return useMutation({
    mutationKey: ["postBooking"],
    mutationFn: ({
      paymentId,
      params,
    }: {
      paymentId: string;
      params: PaymentRedirectRequestModel;
    }) =>
      postV0PaymentsPaymentIdRedirectRequest(paymentId, params, {
        withAuth: !!profile,
      }),
  });
};
