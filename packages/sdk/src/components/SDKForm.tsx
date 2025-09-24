import {PropsWithChildren, useEffect} from "react";
import {type GetPaymentRedirectUrlParams, usePaymentRedirect} from "../hooks/usePaymentRedirect";
import {useFormContext} from "react-hook-form";
import {IframeProvider} from "@clubmed/payment-sdk/components/providers/IframeProvider";

type Props = {
  /**
   * events
   */
  onLoad?: () => void;
  onLoadEnd?: () => void;
  onError?: (error: Error) => void;
}

export function SDKForm({children, onError, onLoad}: PropsWithChildren<Props>) {
  const methods = useFormContext<GetPaymentRedirectUrlParams>();

  const {mutate, isPending} = usePaymentRedirect({
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
        onSubmit={methods.handleSubmit(mutate as any)}
        className="w-full flex flex-col justify-center items-center gap-24"
      >
        {children}
        <IframeProvider/>
      </form>
    </>
  );
}
