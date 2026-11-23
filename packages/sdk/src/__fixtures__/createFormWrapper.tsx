import { act } from '@testing-library/react';
import type { ReactNode } from 'react';
import { FormProvider, useForm, type UseFormProps, type UseFormReturn } from 'react-hook-form';

import type { CapsFormSchema } from '../schemas/capsFormSchema';

export const createFormWrapper = (props: UseFormProps<CapsFormSchema>) => {
  let methods!: UseFormReturn<CapsFormSchema>;

  const wrapper = ({ children }: { children: ReactNode }) => {
    methods = useForm<CapsFormSchema>({ mode: 'onTouched', ...props });
    return <FormProvider {...methods}>{children}</FormProvider>;
  };

  return {
    wrapper,
    getValues: () => methods.getValues(),
    submit: () => act(() => methods.handleSubmit(() => undefined)()),
  };
};
