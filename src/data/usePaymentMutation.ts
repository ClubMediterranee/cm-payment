import { useMutation } from "@tanstack/react-query";
import { postV1Payments } from "../api";

export const usePaymentMutation = () => {
  return useMutation({
    mutationKey: ["postPayment"],
    mutationFn: postV1Payments,
  });
};
