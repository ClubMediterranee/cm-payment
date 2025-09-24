import { usePaymentProviders } from '@clubmed/payment-sdk/hooks/usePaymentProviders.js';
import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';

export function usePaymentProvidersCheckboxes() {
  const { data: paymentProviders = [], isSuccess } = usePaymentProviders();

  const { register, setValue, trigger, watch } = useFormContext();

  const watchedProviderId = watch('provider_id');

  useEffect(() => {
    if (isSuccess && paymentProviders.length > 0) {
      setValue('provider_id', paymentProviders[0]?.id, {
        shouldValidate: true,
      });
    }
  }, [isSuccess, paymentProviders, setValue]);

  return { paymentProviders, register, setValue, trigger, watchedProviderId };
}
