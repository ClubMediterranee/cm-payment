import { TOKENS } from '@clubmed/payment-sdk/types/Tokens';
import { Checkbox } from '@clubmed/trident-ui/molecules/Forms/Checkboxes';
import clsx from 'clsx';

import { useFormContext } from '../hooks/utils/useForm';
import { useSDKPaymentContext } from '../hooks/utils/useSDKPaymentContext';
import { SDKFormData } from '../types/FormData';
import { ErrorMessage } from './ui/ErrorMessage';
import { FormPanel } from './ui/FormPanel';

export const Cgv = () => {
  const { content } = useSDKPaymentContext();
  const {
    register,
    setValue,
    trigger,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="w-full">
      <h2 className="text-h5 mb-16 font-serif">{content.cgv.title}</h2>
      <FormPanel className={clsx(errors.cgv && 'mb-0')}>
        <Checkbox
          {...register('cgv', {
            required: { value: true, message: content.cgv.validation.mustAccept },
          })}
          aria-invalid={!!errors.cgv}
          onChange={(name, value) => {
            setValue(name as keyof SDKFormData, value);
            trigger(name as keyof SDKFormData);
          }}
        >
          <span className="text-b4 font-bold">{content.cgv.content}</span>
        </Checkbox>
      </FormPanel>
      <ErrorMessage message={errors.cgv?.message} />
    </div>
  );
};

Cgv.COMPONENT_KEY = TOKENS.Cgv;
