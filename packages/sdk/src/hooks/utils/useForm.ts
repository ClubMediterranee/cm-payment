/* eslint-disable simple-import-sort/imports */
import {
  useForm as useReactHookForm,
  useFormContext as useReactHookFormContext,
  useWatch as useReactHookFormWatch,
  type UseFormProps,
} from 'react-hook-form';

import type { CapsFormData } from '../../types/FormData';

export const useForm = (props?: UseFormProps<CapsFormData>) =>
  useReactHookForm<CapsFormData>(props);

export const useWatch = <T extends keyof CapsFormData>(name: T) =>
  useReactHookFormWatch<CapsFormData>({ name }) as CapsFormData[T];

export const useFormContext = () => useReactHookFormContext<CapsFormData>();
