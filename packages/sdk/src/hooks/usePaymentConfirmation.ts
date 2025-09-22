import { usePaymentNotify } from "./usePaymentNotify";
import Cookies from "js-cookie";
import { useEffect } from "react";
import { usePaymentStatus } from "./usePaymentStatus";

export const usePaymentConfirmation = ({
  paymentId,
}: {
  paymentId: string;
}) => {
  const callbackUrl = Cookies.get("callback_url");
  const search = new URLSearchParams(document.location.search);
  const proposalId = new URLSearchParams(search).get("proposal_id");

  const { data: paymentStatus } = usePaymentStatus({ paymentId });
  const { data: paymentNotify } = usePaymentNotify({ paymentId });

  const paymentResponse = paymentStatus! || paymentNotify!;

  useEffect(() => {
    if (paymentResponse && paymentResponse.payment_status !== "PENDING") {
      window.location.href = `${callbackUrl}?${new URLSearchParams({ ...paymentResponse, ...(proposalId ? { spi: proposalId } : {}) }).toString()}`;
    }
  }, [callbackUrl, paymentResponse, proposalId]);
};
