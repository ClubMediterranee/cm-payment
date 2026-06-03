import { useEffect, useRef } from 'react';

import { HipayInstance } from '../../../types/Hipay';
import { PspProviders } from '../../../types/PspProviders';
import { usePaymentSubmit } from '../../usePaymentSubmit';
import { useCapsConfigContext } from '../../utils/useCapsConfigContext';
import { useFormContext, useWatch } from '../../utils/useForm';
import { usePaymentProviderSettings } from '../../utils/usePaymentProviderSettings';
import { useScriptLoader } from '../../utils/useScriptLoader';
import { createHipayClient } from './hipay';

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
        selector: 'paypal-button',
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
