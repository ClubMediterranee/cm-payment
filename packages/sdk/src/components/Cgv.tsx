import { Checkbox } from '@clubmed/trident-ui/molecules/Forms/Checkboxes';
import { FormControl } from '@clubmed/trident-ui/molecules/Forms/FormControl';
import { Controller } from 'react-hook-form';

import { useCapsConfigContext } from '../hooks/utils/useCapsConfigContext';
import { useFormContext } from '../hooks/utils/useForm';
import { TOKENS } from '../types/Tokens';
import { FormPanel } from './ui/FormPanel';
import { CheckboxSkeleton, TitleSkeleton } from './ui/skeletons';

export const Cgv = () => {
  const { content } = useCapsConfigContext();
  const { control } = useFormContext();

  return (
    <div className="w-full">
      <h2 className="text-h5 mb-16 font-serif">{content.cgv.title}</h2>

      <Controller
        name="cgv"
        control={control}
        render={({ field: { onChange }, fieldState: { error, isTouched } }) => {
          const validationStatus = isTouched && !error ? 'success' : error ? 'error' : 'default';
          return (
            <FormControl errorMessage={error?.message} validationStatus={validationStatus}>
              <FormPanel>
                <Checkbox
                  validationStatus={validationStatus}
                  aria-invalid={!!error}
                  onChange={(_, newValue) => {
                    onChange(newValue ?? false);
                  }}
                >
                  <span className="text-b4 font-bold">{content.cgv.content}</span>
                </Checkbox>
              </FormPanel>
            </FormControl>
          );
        }}
      />
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
