import { useParams, useSearch } from "wouter";
import { usePaymentNotify } from "../data/usePaymentNotify";
import Cookies from "js-cookie";
import { lazy, Suspense, useEffect } from "react";
import { usePaymentStatus } from "../data/usePaymentStatus";

const Loader = lazy(async () => ({
  default: (await import("@clubmed/trident-ui/molecules/Loader")).Loader,
}));

export const RedirectPage = () => {
  const { paymentId = "" } = useParams();
  const callbackUrl = Cookies.get("callback_url");
  const search = useSearch();
  const proposalId = new URLSearchParams(search).get("proposal_id");

  const { data: paymentStatus } = usePaymentStatus({ paymentId });
  const { data: paymentNotify } = usePaymentNotify({ paymentId });

  const paymentResponse = paymentStatus! || paymentNotify!;

  useEffect(() => {
    if (paymentResponse?.payment_status !== "PENDING") {
      window.top.location.href = `${callbackUrl}?${new URLSearchParams({ ...paymentResponse, ...(proposalId ? { spi: proposalId } : {}) }).toString()}`;
    }
  }, [callbackUrl, paymentResponse, proposalId]);

  return (
    <Suspense fallback={null}>
      <Loader
        isVisible
        label="This is like elevator music but for your eyes. Please wait while we load your content."
      />
    </Suspense>
  );
};
