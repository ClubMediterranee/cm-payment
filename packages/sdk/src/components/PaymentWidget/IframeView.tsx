import { Spinner } from '@clubmed/trident-ui/molecules/Spinner';
import classNames from 'classnames';
import { useEffect, useRef } from 'react';
import { useWatch } from 'react-hook-form';

import { useFormCallbacks } from '../../contexts/FormCallbacksContext';
import { usePaymentSubmit } from '../../hooks/usePaymentSubmit';
import { useFormContext } from '../../hooks/utils/useForm';
import { IframeMessageType } from '../../utils/iframe/constants';
import { getIframeHeight } from '../../utils/iframe/getIframeHeight';
import { useIframeMessageBridge } from '../../utils/iframe/useIframeMessageBridge';

export const IframeView = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null!);

  const { handleSubmit, isPending, isError } = usePaymentSubmit({
    targetIframe: iframeRef,
  });

  const {
    formState: { isValid },
    trigger,
    control,
    setValue,
  } = useFormContext();

  const watchedForm = useWatch({ control });

  const { onLoad, onLoadEnd } = useFormCallbacks();

  const handlePaymentConfirmationLoading = () => {
    onLoad?.();
  };

  const handlePaymentConfirmationRedirect = (url: string) => {
    window.location.href = url;
  };

  const handlePaymentCancellation = () => {
    setValue('cgv', false, { shouldValidate: true });
    onLoadEnd?.();
  };

  useIframeMessageBridge({
    [IframeMessageType.PAYMENT_REDIRECT]: handlePaymentConfirmationRedirect,
    [IframeMessageType.PAYMENT_REDIRECT_LOADING]: handlePaymentConfirmationLoading,
    [IframeMessageType.PAYMENT_REDIRECT_CANCEL]: handlePaymentCancellation,
  });

  useEffect(() => {
    if (isValid) {
      handleSubmit();
    }
  }, [isValid, watchedForm]);

  useEffect(() => {
    trigger();
  }, []);

  if (!isValid) {
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
        style={{
          height: isPending || isError ? 0 : getIframeHeight(watchedForm.provider_id),
          visibility: isPending || isError ? 'hidden' : 'visible',
        }}
        className="w-full overflow-hidden"
      ></iframe>
    </div>
  );
};
