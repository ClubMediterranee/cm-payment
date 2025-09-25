import { FormProvider, type useForm } from 'react-hook-form';

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
