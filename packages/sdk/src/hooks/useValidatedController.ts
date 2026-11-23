import { useState } from 'react';
import { type FieldPath, useController } from 'react-hook-form';

import type { CapsFormSchema } from '../schemas/capsFormSchema';
import {
  hiddenError,
  isErrorRevealed,
  resolveFieldStatus,
  revealOnBlur,
  revealOnChange,
} from '../utils/fieldStatus';
import { useFormContext } from './utils/useForm';

const isEmpty = (value: string) => value.trim() === '';

export const useValidatedController = (name: FieldPath<CapsFormSchema>) => {
  const {
    control,
    setValue,
    trigger,
    formState: { submitCount },
  } = useFormContext();
  const { field, fieldState } = useController({ name, control });
  const [reveal, setReveal] = useState(() => hiddenError(submitCount));

  const value = field.value == null ? '' : String(field.value);
  const empty = isEmpty(value);

  const status = resolveFieldStatus({
    valid: !fieldState.error,
    empty,
    revealed: isErrorRevealed(reveal, submitCount),
    checked: fieldState.isTouched || fieldState.isDirty || submitCount > 0,
  });

  return {
    ref: field.ref,
    value,
    status,
    errorMessage: status === 'error' ? fieldState.error?.message : undefined,
    onChange: async (next: string) => {
      setValue(name, next, { shouldDirty: true });
      const valid = await trigger(name);
      setReveal((prev) => revealOnChange(prev, { valid, empty: isEmpty(next) }, submitCount));
    },
    onBlur: async () => {
      setValue(name, field.value, { shouldTouch: true });
      const valid = await trigger(name);
      setReveal((prev) => revealOnBlur(prev, { valid, empty }));
    },
  };
};
