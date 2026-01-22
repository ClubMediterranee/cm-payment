import { createContext, useContext } from 'react';

export type FormCallbacks = {
  onError?: (error: Error) => void;
  onLoad?: () => void;
  onLoadEnd?: () => void;
};

export const FormCallbacksContext = createContext<FormCallbacks | null>(null);

export const useFormCallbacks = (): FormCallbacks => {
  return useContext(FormCallbacksContext) ?? {};
};
