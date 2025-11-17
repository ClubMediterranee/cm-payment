import { useEffect } from 'react';
import { useWatch } from 'react-hook-form';

import { useFormContext } from '../hooks/utils/useForm';
import { PspProviders } from '../types/PspProviders';
import { TOKENS } from '../types/Tokens';
import { HipayForm } from './CardForm/HipayForm';

export const CardForm = () => {
  const { setValue, register } = useFormContext();

  const providerId = useWatch({ name: 'provider_id' });
  const isIntegratedProvider = providerId === PspProviders.HIPAY;

  useEffect(() => {
    register('token', {
      required: isIntegratedProvider,
    });
    if (!isIntegratedProvider) {
      setValue('token', '');
    }
  }, [isIntegratedProvider, providerId, register, setValue]);

  if (!isIntegratedProvider) {
    return null;
  }

  return <HipayForm />;
};

CardForm.COMPONENT_KEY = TOKENS.CardForm;
