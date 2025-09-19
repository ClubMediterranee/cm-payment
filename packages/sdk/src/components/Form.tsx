import { PropsWithChildren, useEffect } from "react";
import { usePaymentRedirect } from "../data/usePaymentRedirect";
import {  useFormContext } from "react-hook-form";
import { IframeProvider } from "./IframeProvider";
import { useAppContext } from "../hooks/useAppContext";

export function Form({ children }: PropsWithChildren) {
  const methods = useFormContext();
  const { onLoad, onError } = useAppContext();
  const { mutate, isPending } = usePaymentRedirect({
    onError: (error) => {
      onError?.(error);
    },
    onSuccess: (url) => {
      window.location.href = url;
    },
  });

  useEffect(() => {
    if (isPending) {
      onLoad?.();
    }
  }, [isPending, onLoad]);

  return (
    <>
        <form
          onSubmit={methods.handleSubmit(mutate)}
          className="w-full flex flex-col justify-center items-center gap-24"
        >
            {children}
          <IframeProvider />
        </form>
      </>
  );
}
