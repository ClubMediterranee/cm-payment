/* eslint-disable simple-import-sort/imports */
import {
  useForm as useReactHookForm,
  useFormContext as useReactHookFormContext,
  useWatch as useReactHookFormWatch,
  type FieldPath,
  type FieldValues,
  type UseFormProps,
} from 'react-hook-form';

import { type CapsFormSchema } from '../../schemas/capsFormSchema';

export const useForm = <TFieldValues extends FieldValues = FieldValues>(
  props?: UseFormProps<TFieldValues>,
) => useReactHookForm<TFieldValues>(props);

export const useWatch = <TFieldValues extends FieldValues = CapsFormSchema>(
  name: FieldPath<TFieldValues>,
) => useReactHookFormWatch<TFieldValues>({ name });

export const useFormContext = () => useReactHookFormContext<CapsFormSchema>();
