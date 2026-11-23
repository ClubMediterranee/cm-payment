import { Select } from '@clubmed/trident-ui/ui/forms/Select';
import { TextField, type TextFieldProps } from '@clubmed/trident-ui/ui/forms/TextField';
import { useId, useState } from 'react';
import type { FieldPath } from 'react-hook-form';

import { useValidatedController } from '../../hooks/useValidatedController';
import type { CapsFormSchema } from '../../schemas/capsFormSchema';

type Props = Pick<
  TextFieldProps<string>,
  | 'type'
  | 'placeholder'
  | 'formatter'
  | 'inputMode'
  | 'autoComplete'
  | 'disabled'
  | 'className'
  | 'data-testid'
> & {
  name: FieldPath<CapsFormSchema>;
  label: string;
  required?: boolean;
  description?: string;
  hint?: string;
  isLoading?: boolean;
  options?: { value: string; label: string }[];
};

export const ValidatedTextField = ({
  name,
  label,
  required,
  description,
  hint,
  isLoading = false,
  disabled = false,
  placeholder,
  options,
  className,
  ...props
}: Props) => {
  const labelId = useId();
  const [focused, setFocused] = useState(false);
  const { ref, value, status, errorMessage, onChange, onBlur } = useValidatedController(name);

  const fieldProps = {
    name,
    ref,
    className,
    label: <span id={labelId}>{label}</span>,
    'aria-labelledby': labelId,
    required,
    description: hint && (focused || value) ? hint : description,
    disabled: isLoading || disabled,
    value,
    validationStatus: status,
    errorMessage,
    onChange: (_: Event, next: string) => void onChange(next),
    onFocus: () => setFocused(true),
    onBlur: () => {
      setFocused(false);
      void onBlur();
    },
  };

  return options ? (
    <Select {...fieldProps}>
      <option value="" disabled hidden aria-label={label} />
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </Select>
  ) : (
    <TextField {...fieldProps} {...props} placeholder={isLoading ? '' : placeholder} />
  );
};
