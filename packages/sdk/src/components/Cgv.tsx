import { TOKENS } from '@clubmed/payment-sdk/types/Tokens';
import { Checkbox } from '@clubmed/trident-ui/molecules/Forms/Checkboxes';
import clsx from 'clsx';

import { useCapsConfigContext } from '../hooks/utils/useCapsConfigContext';
import { useFormContext } from '../hooks/utils/useForm';
import { CapsFormData } from '../types/FormData';
import { ErrorMessage } from './ui/ErrorMessage';
import { FormPanel } from './ui/FormPanel';
import { CheckboxSkeleton, TitleSkeleton } from './ui/skeletons';

export const Cgv = () => {
  const { content } = useCapsConfigContext();
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
            setValue(name as keyof CapsFormData, value);
            trigger(name as keyof CapsFormData);
          }}
        >
          <span className="text-b4 font-bold">{content.cgv.content}</span>
        </Checkbox>
      </FormPanel>
      <ErrorMessage message={errors.cgv?.message} />
    </div>
  );
};

const CgvSkeleton = () => (
  <div className="w-full">
    <TitleSkeleton variant="h5" />
    <FormPanel>
      <CheckboxSkeleton />
    </FormPanel>
  </div>
);

Cgv.Skeleton = CgvSkeleton;
Cgv.COMPONENT_KEY = TOKENS.Cgv;
