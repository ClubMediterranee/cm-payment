import { Icon } from '@clubmed/trident-icons';
import { FormControlError } from '@clubmed/trident-ui/ui/forms/FormControlError';
import { useQueryClient } from '@tanstack/react-query';
import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useState } from 'react';

import { StatutPaiement } from '../../../__generated__/index.schemas.js';
import { usePaymentStatus } from '../../../hooks/data/usePaymentStatus/index.js';
import { useCapsConfigContext } from '../../../hooks/utils/useCapsConfigContext.js';
import { useCountdown } from '../../../hooks/utils/useCountdown.js';
import { useWatch } from '../../../hooks/utils/useForm.js';
import { usePaymentProviderSettings } from '../../../hooks/utils/usePaymentProviderSettings.js';
import { PspProviders } from '../../../types/PspProviders.js';
import { formatCurrency } from '../../../utils/formatCurrency.js';
import { loadPaymentProviderUrl } from '../../../utils/loadPaymentProviderUrl.js';
import { renderTemplate } from '../../../utils/renderTemplate.js';
import { useWeChatQRCode } from '../hooks/useWeChatQRCode.js';

const formatCountdown = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(seconds % 60).padStart(2, '0')}`;
};

type CountdownProps = { seconds: number; onExpire: () => void };

const Countdown = ({ seconds, onExpire }: CountdownProps) => {
  const { secondsRemaining, expired } = useCountdown(seconds);

  useEffect(() => {
    if (expired) onExpire();
  }, [expired, onExpire]);

  return (
    <p className="flex items-center gap-8">
      <Icon name="ClockDefault" width="1rem" />
      {formatCountdown(secondsRemaining)}
    </p>
  );
};

export const WeChatQRView = () => {
  const { content, locale } = useCapsConfigContext();
  const { qr_timeout_seconds = 0, poll_interval_seconds = 2 } = usePaymentProviderSettings<{
    qr_timeout_seconds?: number;
    poll_interval_seconds?: number;
  }>(PspProviders.M99BILLW);

  const amount = useWatch('amount');
  const currency = useWatch('currency');
  const cgv = useWatch('cgv');

  const queryClient = useQueryClient();
  useEffect(() => queryClient.getMutationCache().clear(), [queryClient]);

  const [expired, setExpired] = useState(false);
  const { payment, url } = useWeChatQRCode();
  const { paymentId, callbacks } = payment ?? {};

  const { data: paymentStatus, isSuccess } = usePaymentStatus(paymentId, {
    pollIntervalMs: poll_interval_seconds * 1000,
    enabled: !!paymentId,
  });

  useEffect(() => {
    if (!isSuccess || paymentStatus.payment_status === StatutPaiement.PENDING || !callbacks) return;

    loadPaymentProviderUrl({ url: callbacks.callback_url, method: 'GET' });
  }, [isSuccess, paymentStatus, callbacks]);

  if (!cgv) return null;

  const { wechat } = content;
  const formattedAmount = formatCurrency({ amount: Number(amount), currency, locale });

  const expire = () => {
    setExpired(true);
    queryClient.getMutationCache().clear();
  };

  return (
    <div className="flex w-full flex-col items-center gap-20 text-center">
      {expired && !url && <FormControlError role="alert">{wechat.expiredMessage}</FormControlError>}
      <p className="hidden w-full text-left text-b3 md:block">
        {renderTemplate(wechat.instruction, { amount: formattedAmount }, { asFragment: true })}
      </p>
      {url ? (
        <>
          <div className="flex flex-col items-center gap-4 text-b3 md:hidden">
            <p>
              {wechat.payLabel} {formattedAmount}
            </p>
            <Countdown seconds={qr_timeout_seconds} onExpire={expire} />
          </div>
          <QRCodeSVG
            value={url}
            size={229}
            title={wechat.qrCodeLabel}
            className="size-229 md:size-172"
          />
        </>
      ) : (
        <img src={wechat.imageUrl} alt={wechat.imageAlt} className="w-full max-w-480 rounded-16" />
      )}
    </div>
  );
};
