/* eslint-disable simple-import-sort/imports */
import {
  useForm as useReactHookForm,
  useFormContext as useReactHookFormContext,
  useFormState as useReactHookFormState,
  useWatch as useReactHookFormWatch,
  type FieldPath,
  type FieldPathValue,
  type FieldValues,
  type UseFormProps,
} from 'react-hook-form';

import { type CapsFormSchema } from '../../schemas/capsFormSchema';

export const useForm = <TFieldValues extends FieldValues = FieldValues>(
  props?: UseFormProps<TFieldValues>,
) => useReactHookForm<TFieldValues>(props);

export const useWatch = <
  TFieldValues extends FieldValues = CapsFormSchema,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  name: TName,
): FieldPathValue<TFieldValues, TName> => useReactHookFormWatch<TFieldValues, TName>({ name });

/**
 * Form state read through its own subscription: unlike `useFormContext().formState`, it computes
 * `isValid` when the component mounts, even after the form itself (e.g. behind a `Suspense`).
 */
export const useFormState = () => useReactHookFormState<CapsFormSchema>();

export const useFormContext = () => {
  const methods = useReactHookFormContext<CapsFormSchema>();

  const triggerAndTouch = async () => {
    await methods.trigger();
    const values = methods.getValues();
    (Object.keys(values) as (keyof typeof values)[]).forEach((key) => {
      methods.setValue(key, values[key], { shouldTouch: true });
    });
  };

  return { ...methods, triggerAndTouch };
};
