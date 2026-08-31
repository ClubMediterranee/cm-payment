/* eslint-disable simple-import-sort/imports */
import {
  useForm as useReactHookForm,
  useFormContext as useReactHookFormContext,
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
