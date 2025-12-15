import { useEffect } from 'react';

import { useFormContext, useWatch } from '../hooks/utils/useForm';
import { PspProviders } from '../types/PspProviders';
import { TOKENS } from '../types/Tokens';
import { HipayForm } from './CardForm/HipayForm';
import { FormPanel } from './ui/FormPanel';
import { TextFieldSkeleton, TitleSkeleton } from './ui/skeletons';

export const CardForm = () => {
  const { setValue, register } = useFormContext();

  const providerId = useWatch('provider_id');
  const isIntegratedProvider = providerId === PspProviders.HIPAY;

  useEffect(() => {
    if (!isIntegratedProvider) {
      setValue('token.value', undefined);
    }
  }, [isIntegratedProvider, providerId, register, setValue]);

  if (!isIntegratedProvider) {
    return null;
  }

  return <HipayForm />;
};

const CardFormSkeleton = () => (
  <div className="w-full">
    <TitleSkeleton variant="h5" />
    <FormPanel>
      <div className="flex flex-wrap gap-28">
        <TextFieldSkeleton />
        <TextFieldSkeleton />
        <div className="w-full flex flex-col md:flex-row gap-28">
          <TextFieldSkeleton />
          <TextFieldSkeleton />
        </div>
      </div>
    </FormPanel>
  </div>
);

CardForm.Skeleton = CardFormSkeleton;
CardForm.COMPONENT_KEY = TOKENS.CardForm;
