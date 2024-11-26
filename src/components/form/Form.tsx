import { PropsWithChildren, useRef } from "react";
import { SubmitButton } from "./SubmitButton";
import { usePaymentRedirect } from "../../data/usePaymentRedirect";
import { FormProvider, useForm } from "react-hook-form";
import { Loader } from "@clubmed/trident-ui/molecules/Loader";

import { Popin } from "@clubmed/trident-ui/molecules/Popin";
import { useDisclosure } from "../../hooks/useDisclosure";
import { IframeProvider } from "./IframeProvider";

export function Form({ children }: PropsWithChildren) {
  const formRef = useRef(null);
  const methods = useForm();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { mutate, isSuccess, isPending, error } = usePaymentRedirect({
    onError: onOpen,
    onSuccess: (url) => {
      window.top.location.href = url;
    },
  });

  if (isPending || isSuccess) {
    return <Loader isVisible label="Your payment is in progress..." />;
  }

  return (
    <FormProvider {...methods}>
      <Popin
        title={error?.message}
        isVisible={isOpen}
        onClose={onClose}
        closeLabel="Close"
      />
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
    </FormProvider>
  );
}
