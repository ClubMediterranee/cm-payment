import { useEffect } from 'react';

import { usePaymentProviders } from './data/usePaymentProviders';
import { useFormContext } from './utils/useForm';

export function usePaymentProvidersForm() {
  const { data: paymentProviders = [] } = usePaymentProviders();

  const { register, setValue, watch } = useFormContext();

  const watchedProviderId = watch('provider_id');

  useEffect(() => {
    if (paymentProviders.length > 0) {
      setValue('provider_id', paymentProviders[0]?.id, {
        shouldValidate: true,
      });
    }
  }, [paymentProviders, setValue]);

  return { paymentProviders, register, setValue, watchedProviderId };
}
