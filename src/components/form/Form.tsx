import { lazy, PropsWithChildren, Suspense, useRef } from "react";
import { SubmitButton } from "./SubmitButton";
import { usePaymentRedirect } from "../../data/usePaymentRedirect";
import { FormProvider, useForm } from "react-hook-form";
import { useDisclosure } from "../../hooks/useDisclosure";
import { IframeProvider } from "./IframeProvider";
import { useAppContext } from "../../hooks/useAppContext";

const Loader = lazy(async () => ({
  default: (await import("@clubmed/trident-ui/molecules/Loader")).Loader,
}));

export function Form({ children }: PropsWithChildren) {
  const formRef = useRef(null);
  const methods = useForm();
  const { isOpen, onOpen } = useDisclosure();
  const { isIframe } = useAppContext();
  const { mutate, isSuccess, isPending, error } = usePaymentRedirect({
    onError: onOpen,
    onSuccess: (url) => {
      window.top.location.href = url;
    },
  });

  if (!isIframe && (isPending || isSuccess)) {
    return (
      <Suspense fallback={null}>
        <Loader isVisible label="Your payment is in progress..." />
      </Suspense>
    );
  }

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(mutate)}
        ref={formRef}
        className="w-full flex flex-col justify-center items-center gap-24"
      >
        {children}
        <SubmitButton
          onSubmit={() => {
            formRef.current.requestSubmit();
          }}
        />
        <IframeProvider />
      </form>
      {isOpen && (
        <p className="text-red font-semibold my-4">{error?.message}</p>
      )}
    </FormProvider>
  );
}
