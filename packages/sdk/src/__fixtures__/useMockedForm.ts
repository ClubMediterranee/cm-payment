import { useEffect } from 'react';
import { type FieldErrors } from 'react-hook-form';

import { useCapsForm, type UseCapsFormParams } from '../hooks/useCapsForm';
import type { CapsFormConfig } from '../types/CapsFormConfig';
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
  getProviderConfiguration,
}: {
  onError?: (errors: FieldErrors) => void;
  onChange?: (value: any) => void;
  content?: Content;
  isSeller?: boolean;
  maxAmount?: number;
  defaultValues?: UseCapsFormParams['defaultValues'];
  getProviderConfiguration?: CapsFormConfig['getProviderConfiguration'];
}) {
  const methods = useCapsForm({
    config: {
      content: content!,
      isSeller: isSeller!,
      maxAmount: maxAmount!,
      getProviderConfiguration: getProviderConfiguration || (() => undefined),
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
