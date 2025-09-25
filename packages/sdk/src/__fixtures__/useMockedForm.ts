import { useEffect } from 'react';
import { type FieldErrors, useForm } from 'react-hook-form';

export type TestArgs<T> = {
  onError?: (errors: FieldErrors) => void;
  onChange?: (value: any) => void;
} & T;

export function useMockedForm({
  onChange,
  onError,
  ...props
}: {
  onError?: (errors: FieldErrors) => void;
  onChange?: (value: any) => void;
} & Parameters<typeof useForm>[0]) {
  const methods = useForm(props);

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
