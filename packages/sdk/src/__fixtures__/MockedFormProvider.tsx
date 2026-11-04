import { FormProvider } from 'react-hook-form';

import { type useCapsForm } from '../hooks/useCapsForm';

export function MockedFormProvider({
  children,
  ...methods
}: { children: React.ReactNode } & ReturnType<typeof useCapsForm>) {
  const onSubmit = (data: any) => {
    console.log('Form submitted:', data);
  };

  return (
    <FormProvider {...methods}>
      <form
        id="mocked-form"
        onSubmit={methods.handleSubmit(onSubmit)}
        style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}
      >
        {children}
      </form>
    </FormProvider>
  );
}
