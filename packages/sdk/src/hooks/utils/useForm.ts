/* eslint-disable simple-import-sort/imports */
import {
  useForm as useReactHookForm,
  useFormContext as useReactHookFormContext,
  useWatch as useReactHookFormWatch,
  type UseFormProps,
  type FieldValues,
} from 'react-hook-form';

import { type CapsFormSchema } from '../../schemas/capsFormSchema';

export const useForm = <TFieldValues extends FieldValues = FieldValues>(
  props?: UseFormProps<TFieldValues>,
) => useReactHookForm<TFieldValues>(props);

export const useWatch = <T extends keyof CapsFormSchema>(name: T) =>
  useReactHookFormWatch<CapsFormSchema>({ name }) as CapsFormSchema[T];

export const useFormContext = () => useReactHookFormContext<CapsFormSchema>();
