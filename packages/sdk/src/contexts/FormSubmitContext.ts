import { createContext, type FormEvent, useContext } from 'react';

type FormSubmit = {
  onSubmit: (e?: FormEvent) => void;
};

export const FormSubmitContext = createContext<FormSubmit | null>(null);

export const useFormSubmit = (): FormSubmit => {
  const ctx = useContext(FormSubmitContext);
  if (!ctx) throw new Error('useFormSubmit must be used within a Form');
  return ctx;
};
