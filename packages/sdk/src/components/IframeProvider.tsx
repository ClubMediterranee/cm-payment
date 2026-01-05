import { Spinner } from '@clubmed/trident-ui/molecules/Spinner';
import classNames from 'classnames';
import { useEffect, useRef } from 'react';
import { useWatch } from 'react-hook-form';

import { GLOBAL_CAPS_SETTINGS } from '../config';
import { usePaymentRedirect } from '../hooks/data/usePaymentRedirect';
import { useFormContext } from '../hooks/utils/useForm';
import { PspProviders } from '../types/PspProviders';
import { TOKENS } from '../types/Tokens';

// Rename by SdkIframePayment ?
export const IframeProvider = () => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const { mutate, isPending } = usePaymentRedirect({
    onSuccess: (url) => {
      if (iframeRef.current) {
        iframeRef.current.src = url;
      }
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
    isValid && GLOBAL_CAPS_SETTINGS.iframeProviders.includes(watch('provider_id') as PspProviders);

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
        className={classNames('w-48', {
          hidden: !isPending,
        })}
      />
      <iframe
        title="payment-iframe"
        ref={iframeRef}
        style={{ height: '910px' }}
        className={classNames('w-full overflow-hidden', {
          hidden: isPending,
        })}
        height={400}
      ></iframe>
    </div>
  );
};

const IframeProviderSkeleton = () => (
  <div className="w-full flex justify-center flex-col items-center mt-24">
    <div className="w-full h-[910px] rounded-16 animate-pulsation bg-lightGrey" />
  </div>
);

IframeProvider.Skeleton = IframeProviderSkeleton;
IframeProvider.COMPONENT_KEY = TOKENS.IframeProvider;
