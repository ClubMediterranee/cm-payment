import { useEffect } from 'react';
import { type FieldErrors } from 'react-hook-form';

import { useCapsForm, type UseCapsFormParams } from '../hooks/useCapsForm';
import type { Content } from '../types/Content';

export type TestArgs<T> = {
  onError?: (errors: FieldErrors) => void;
  onChange?: (value: any) => void;
} & T;

export function useMockedForm({
  onChange,
  onError,
  content,
  isSeller,
  maxAmount,
  defaultValues,
}: {
  onError?: (errors: FieldErrors) => void;
  onChange?: (value: any) => void;
  content?: Content;
  isSeller?: boolean;
  maxAmount?: number;
  defaultValues?: UseCapsFormParams['defaultValues'];
}) {
  const methods = useCapsForm({
    config: {
      content: content!,
      isSeller: isSeller!,
      maxAmount: maxAmount!,
    },
    defaultValues,
  });

  useEffect(() => {
    const { unsubscribe } = methods.watch((value) => {
      onChange?.(value);
    });
    return () => unsubscribe();
  }, [methods.watch]);

  // on Error
  useEffect(() => {
    if (Object.keys(methods.formState.errors).length > 0) {
      onError?.(methods.formState.errors);
    }
  }, [methods.formState.errors]);

  return methods;
}
