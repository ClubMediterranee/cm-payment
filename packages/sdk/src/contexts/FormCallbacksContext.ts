import { createContext, useContext } from 'react';

import type { CapsEvent } from '../embed/shared';

export type FormCallbacks = {
  onEvent?: (event: CapsEvent) => void;
};

export const FormCallbacksContext = createContext<FormCallbacks | null>(null);

export const useFormCallbacks = (): FormCallbacks => {
  return useContext(FormCallbacksContext) ?? {};
};
