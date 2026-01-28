import { Spinner } from '@clubmed/trident-ui/molecules/Spinner';
import classNames from 'classnames';
import { useEffect, useRef } from 'react';

import { useFormCallbacks } from '../../contexts/FormCallbacksContext';
import { usePaymentSubmit } from '../../hooks/usePaymentSubmit';
import { useFormContext, useWatch } from '../../hooks/utils/useForm';
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
    setValue,
  } = useFormContext();

  const watchedPaymentConditionId = useWatch('payment_condition_id');
  const watchedProviderId = useWatch('provider_id');

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
  }, [isValid, watchedPaymentConditionId]);

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
          height: isPending || isError ? 0 : getIframeHeight(watchedProviderId),
          visibility: isPending || isError ? 'hidden' : 'visible',
        }}
        className="w-full overflow-hidden"
      ></iframe>
    </div>
  );
};
