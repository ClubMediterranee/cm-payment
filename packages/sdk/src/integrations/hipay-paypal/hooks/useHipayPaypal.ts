import { useEffect, useRef } from 'react';
import integration from '../integration.config.js';
import { HipayInstance } from '../../ixopay/types/Hipay.js';
import { PspProviders } from '../../../types/PspProviders.js';
import { usePaymentSubmit } from '../../../hooks/usePaymentSubmit.js';
import { useCapsConfigContext } from '../../../hooks/utils/useCapsConfigContext.js';
import { useFormContext, useWatch } from '../../../hooks/utils/useForm.js';
import { usePaymentProviderSettings } from '../../../hooks/utils/usePaymentProviderSettings.js';
import { useScriptLoader } from '../../../hooks/utils/useScriptLoader.js';
import { createHipayClient } from '../../hipay/hooks/hipay.js';

export const useHipayPaypal = () => {
  const { locale } = useCapsConfigContext();
  const { setValue } = useFormContext();
  const { script_url, ...hipayConfig } = usePaymentProviderSettings<{
    script_url: string;
    environment: string;
    username: string;
    password: string;
  }>(PspProviders.HIPAY_PAYPAL);

  const { handleSubmit } = usePaymentSubmit();
  const { isLoaded } = useScriptLoader(script_url);

  const watchedAmount = useWatch('amount');
  const watchedCurrency = useWatch('currency');

  const instance = useRef<HipayInstance | null>(null);

  useEffect(() => {
    if (!isLoaded || instance.current) return;

    instance.current = createHipayClient({
      type: 'paypal',
      config: hipayConfig,
      options: {
        amount: Number(watchedAmount),
        currency: watchedCurrency,
        locale: locale.replace('-', '_'),
        selector: integration.mountPoints.button,
      },
      events: {
        paymentAuthorized: ({ orderID }) => {
          setValue('token', { value: orderID, status: 'success' });
          handleSubmit();
        },
      },
    });

    return () => {
      instance.current?.destroy();

      const hipayPaypalElementIds = ['hipay-hosted-stylesheet', 'sdkjs-paypal'];
      hipayPaypalElementIds.forEach((id) => {
        document.getElementById(id)?.remove();
      });
    };
  }, [
    isLoaded,
    hipayConfig,
    watchedAmount,
    watchedCurrency,
    locale,
    setValue,
    handleSubmit,
    script_url,
  ]);
};
