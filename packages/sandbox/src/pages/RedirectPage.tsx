import { useParams } from "wouter";
import { lazy, Suspense } from "react";
import {  usePaymentConfirmation } from "@cm-payment/sdk/src";

const Loader = lazy(async () => ({
  default: (await import("@clubmed/trident-ui/molecules/Loader")).Loader,
}));

export const RedirectPage = () => {
  const { paymentId = "" } = useParams();
  usePaymentConfirmation({ paymentId }); 

  return (
    <Suspense fallback={null}>
      <Loader
        isVisible
        label="This is like elevator music but for your eyes. Please wait while we load your content."
      />
    </Suspense>
  );
};
