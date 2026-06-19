import { Checkbox } from '@clubmed/trident-ui/molecules/Forms/Checkboxes';
import { FormControl } from '@clubmed/trident-ui/molecules/Forms/FormControl';
import { type ReactNode } from 'react';
import { Controller, type FieldPath, useFormContext } from 'react-hook-form';

import { CapsFormSchema } from '../../../schemas/capsFormSchema';

interface CheckboxFieldProps {
  name: FieldPath<CapsFormSchema>;
  children: ReactNode;
}

export const CheckboxField = ({ name, children }: CheckboxFieldProps) => {
  const { control } = useFormContext<CapsFormSchema>();

  return (
    <Controller<CapsFormSchema>
      name={name}
      control={control}
      render={({ field: { onChange, value }, fieldState: { error, isTouched } }) => {
        const validationStatus = isTouched && !error ? 'success' : error ? 'error' : 'default';

        return (
          <FormControl errorMessage={error?.message} validationStatus={validationStatus}>
            <Checkbox
              checked={!!value}
              validationStatus={validationStatus}
              aria-invalid={!!error}
              onChange={(_, newValue) => onChange(newValue ?? false)}
            >
              {children}
            </Checkbox>
          </FormControl>
        );
      }}
    />
  );
};
