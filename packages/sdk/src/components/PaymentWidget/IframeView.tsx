import { Spinner } from '@clubmed/trident-ui/ui/Spinner';
import classNames from 'classnames';
import { useEffect, useRef } from 'react';

import { useFormCallbacks } from '../../contexts/FormCallbacksContext';
import { usePaymentSubmit } from '../../hooks/usePaymentSubmit';
import { useFormContext, useFormState, useWatch } from '../../hooks/utils/useForm';
import { useProviderIntegrationMode } from '../../hooks/utils/useProviderIntegrationMode';
import { PspProviders } from '../../types/PspProviders';
import { IframeMessageType } from '../../utils/iframe/constants';
import { getIframeHeight } from '../../utils/iframe/getIframeHeight';
import { useIframeMessageBridge } from '../../utils/iframe/useIframeMessageBridge';
import { loadEndEvent, loadEvent } from '../../embed/shared/events';
import { navigate } from '../../utils/navigate';
import { UpliftForm } from '../../integrations/uplift/ui/UpliftForm.js';

const thirdPartyIframeRegistry = {
  [PspProviders.MUPLIFT]: UpliftForm,
};

export const IframeView = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null!);

  const { handleSubmit, isPending, isError } = usePaymentSubmit({
    targetIframe: iframeRef,
  });

  const { setValue } = useFormContext();
  const { isValid } = useFormState();

  const watchedPaymentConditionId = useWatch('payment_condition_id');
  const watchedProviderId = useWatch('provider_id');
  const watchedCgv = useWatch('cgv');

  const { thirdPartyIframe } = useProviderIntegrationMode();

  const { onEvent } = useFormCallbacks();

  const handlePaymentConfirmationLoading = () => {
    onEvent?.(loadEvent);
  };

  const handlePaymentConfirmationRedirect = (url: string) => {
    navigate({ url });
  };

  const handlePaymentCancellation = () => {
    setValue('cgv', false, { shouldValidate: true });
    onEvent?.(loadEndEvent);
  };

  useIframeMessageBridge({
    [IframeMessageType.PAYMENT_REDIRECT]: handlePaymentConfirmationRedirect,
    [IframeMessageType.PAYMENT_REDIRECT_LOADING]: handlePaymentConfirmationLoading,
    [IframeMessageType.PAYMENT_REDIRECT_CANCEL]: handlePaymentCancellation,
  });

  useEffect(() => {
    if (isValid && !thirdPartyIframe) {
      handleSubmit();
    }
  }, [isValid, watchedPaymentConditionId]);

  const ThirdPartyIframeComponent =
    thirdPartyIframeRegistry[watchedProviderId as keyof typeof thirdPartyIframeRegistry];

  if (ThirdPartyIframeComponent && watchedCgv) {
    return <ThirdPartyIframeComponent />;
  }

  if (!isValid) {
    return null;
  }

  return (
    <div className="w-full flex justify-center flex-col items-center">
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
