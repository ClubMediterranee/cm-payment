import { Checkbox } from '@clubmed/trident-ui/ui/forms/checkboxes/index';
import { FormControlError } from '@clubmed/trident-ui/ui/forms/FormControlError';
import clsx from 'clsx';
import { type ReactNode, useId } from 'react';
import { Controller, type FieldPath, useFormContext } from 'react-hook-form';

import { CapsFormSchema } from '../../../schemas/capsFormSchema';

interface CheckboxFieldProps {
  name: FieldPath<CapsFormSchema>;
  children: ReactNode;
}

export const CheckboxField = ({ name, children }: CheckboxFieldProps) => {
  const { control } = useFormContext<CapsFormSchema>();
  const errorId = useId();

  return (
    <Controller<CapsFormSchema>
      name={name}
      control={control}
      render={({ field: { ref, onChange, value }, fieldState: { error, isTouched } }) => {
        const validationStatus = isTouched && !error ? 'success' : error ? 'error' : 'default';

        return (
          <div className="flex flex-col gap-4">
            <Checkbox
              ref={ref}
              checked={!!value}
              validationStatus={validationStatus}
              aria-invalid={!!error}
              aria-describedby={error?.message ? errorId : undefined}
              onChange={(_, newValue) => onChange(newValue ?? false)}
            >
              <span className={clsx('ms-4', error && 'text-red')}>{children}</span>
            </Checkbox>
            {error?.message && <FormControlError id={errorId}>{error.message}</FormControlError>}
          </div>
        );
      }}
    />
  );
};
