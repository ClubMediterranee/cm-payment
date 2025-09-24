import {useFormContext, useWatch} from "react-hook-form";
import {useEffect, useRef} from "react";
import {Spinner} from "@clubmed/trident-ui/molecules/Spinner";
import classNames from "classnames";
import {GLOBAL_SDK_SETTINGS} from "@clubmed/payment-sdk/config";
import {usePaymentRedirect} from "@clubmed/payment-sdk/hooks/usePaymentRedirect.js";

// Rename by SdkIframePayment ?
export const IframeProvider = () => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const {mutate, isPending} = usePaymentRedirect({
    onSuccess: (url) => {
      if (iframeRef.current) {
        iframeRef.current.src = url;
      }
    },
    onError: () => {
    },
  });

  const {
    formState: {isValid},
    watch,
    getValues,
    control,
  } = useFormContext();
  const watchedForm = useWatch({control});

  const displayProviderIframe =
    isValid && GLOBAL_SDK_SETTINGS.iframeProviders.includes(watch("provider_id"));

  useEffect(() => {
    if (displayProviderIframe) {
      mutate(getValues() as never);
    }
  }, [displayProviderIframe, getValues, mutate, watchedForm]);

  if (!displayProviderIframe) {
    return null;
  }

  return (
    <div className="w-full flex justify-center flex-col items-center mt-24">
      <Spinner
        className={classNames("w-48", {
          hidden: !isPending,
        })}
      />
      <iframe
        ref={iframeRef}
        style={{height: "910px"}}
        className={classNames("w-full overflow-hidden", {
          hidden: isPending,
        })}
        height={400}
      ></iframe>
    </div>
  );
};

IframeProvider.COMPONENT_KEY = Symbol.for("IframeProvider");