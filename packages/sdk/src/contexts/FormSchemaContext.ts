import { createContext, useContext } from 'react';

import type { capsFormSchema } from '../schemas/capsFormSchema';

export type FormSchema = ReturnType<typeof capsFormSchema>;

export const FormSchemaContext = createContext<FormSchema | null>(null);

export const useFormSchema = () => useContext(FormSchemaContext);
