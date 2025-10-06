import { useEffect } from 'react';

import { usePaymentProviders } from './data/usePaymentProviders';
import { useFormContext } from './utils/useForm';

export function usePaymentProvidersForm() {
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
