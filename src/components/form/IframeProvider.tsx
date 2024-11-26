import { useFormContext, useWatch } from "react-hook-form";
import { usePaymentRedirect } from "../../data/usePaymentRedirect";
import { useEffect, useRef } from "react";
import { Spinner } from "@clubmed/trident-ui/molecules/Spinner";
import classNames from "classnames";
import { IFRAME_PROVIDERS } from "../../utils/constants";

export const IframeProvider = () => {
  const iframeRef = useRef(null);
  const { mutate, isPending } = usePaymentRedirect({
    onSuccess: (url) => {
      iframeRef.current.src = url;
    },
    onError: () => {},
  });

  const {
    formState: { isValid },
    watch,
    getValues,
    control,
  } = useFormContext();
  const watchedForm = useWatch({ control });

  const displayProviderIframe =
    isValid && IFRAME_PROVIDERS.includes(watch("provider_id"));

  useEffect(() => {
    if (displayProviderIframe) {
      mutate(getValues());
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
        style={{ height: "910px" }}
        className={classNames("w-full overflow-hidden", {
          hidden: isPending,
        })}
        height={400}
      ></iframe>
    </div>
  );
};
