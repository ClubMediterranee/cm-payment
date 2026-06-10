import { Icon } from '@clubmed/trident-icons';
import { useQueryClient } from '@tanstack/react-query';
import { QRCodeSVG } from 'qrcode.react';
import { useEffect } from 'react';

import { StatutPaiement } from '../../__generated__/index.schemas';
import { usePaymentRedirectState } from '../../hooks/data/usePaymentRedirect';
import { usePaymentStatus } from '../../hooks/data/usePaymentStatus';
import { useCapsConfigContext } from '../../hooks/utils/useCapsConfigContext';
import { useCountdown } from '../../hooks/utils/useCountdown';
import { useWatch } from '../../hooks/utils/useForm';
import { useWatchedPaymentProvider } from '../../hooks/utils/useWatchedPaymentProvider';
import type { CapsFormSchema } from '../../schemas/capsFormSchema';
import { PspProviders } from '../../types/PspProviders';
import { formatCurrency } from '../../utils/formatCurrency';
import { navigateToCallbackUrl } from '../../utils/url/navigateToCallbackUrl';
import { ErrorMessage } from '../ui/ErrorMessage';
import { FormPanel } from '../ui/FormPanel';

const POLL_INTERVAL_MS = 2000;

const formatCountdown = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(seconds % 60).padStart(2, '0')}`;
};

export const WeChatQRView = () => {
  const { content, locale, callbackUrl, id, type } = useCapsConfigContext();
  const provider = useWatchedPaymentProvider();
  const timeoutSeconds = Number(provider?.configuration?.settings?.qr_timeout_seconds) || 0;

  const amount = useWatch('amount');
  const currency = useWatch('currency');

  const queryClient = useQueryClient();
  useEffect(() => queryClient.getMutationCache().clear(), [queryClient]);

  const { paymentId, url } =
    usePaymentRedirectState({
      predicate: (mutation) =>
        (mutation.state.variables as CapsFormSchema)?.provider_id === PspProviders.M99BILLW,
    }) ?? {};

  const { secondsRemaining, expired } = useCountdown(timeoutSeconds, paymentId);

  const { data: paymentStatus, isSuccess } = usePaymentStatus(paymentId, {
    pollIntervalMs: POLL_INTERVAL_MS,
    enabled: !!paymentId && !expired,
  });

  useEffect(() => {
    if (!isSuccess || paymentStatus.payment_status === StatutPaiement.PENDING) return;

    navigateToCallbackUrl({
      callbackUrl,
      paymentResponse: paymentStatus,
      proposalId: type === 'proposal' ? id : null,
    });
  }, [isSuccess, paymentStatus, callbackUrl, id, type]);

  const { wechat } = content;
  const showTutorial = !url || expired;

  return (
    <FormPanel className="w-full items-center text-center gap-16 py-24">
      {showTutorial ? (
        <>
          {expired && <ErrorMessage message={wechat.tutorial.expiredMessage} />}
          <div>
            <p className="text-b3 text-sienna">{wechat.tutorial.title}</p>
            <p className="text-b3">{wechat.tutorial.subtitle}</p>
          </div>
          <img
            src={wechat.tutorial.imageUrl}
            alt="WeChat payment tutorial"
            className="w-420 max-w-full"
          />
        </>
      ) : (
        <>
          <p className="text-b3">
            {wechat.payLabel}{' '}
            <span className="text-sienna">
              {formatCurrency({ amount: Number(amount), currency, locale })}
            </span>
          </p>
          <p className="text-b3 flex items-center justify-center gap-8 text-sienna">
            <Icon name="ClockDefault" width="1rem" />
            {formatCountdown(secondsRemaining)}
          </p>
          <div className="p-16 bg-white border-1 border-lightGrey rounded-8">
            <QRCodeSVG value={url} size={200} />
          </div>
          <p className="text-b3">{wechat.scanLabel}</p>
        </>
      )}
    </FormPanel>
  );
};
