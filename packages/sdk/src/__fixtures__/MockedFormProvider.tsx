import { FormProvider } from 'react-hook-form';

import { type useForm } from '../hooks/utils/useForm';

export function MockedFormProvider({
  children,
  ...methods
}: { children: React.ReactNode } & ReturnType<typeof useForm>) {
  return (
    <FormProvider {...methods}>
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>{children}</div>
    </FormProvider>
  );
}
