import {
  useForm as useReactHookForm,
  useFormContext as useReactHookFormContext,
  type UseFormProps,
} from 'react-hook-form';

import type { CapsFormData } from '../../types/FormData';

export const useForm = (props?: UseFormProps<CapsFormData>) =>
  useReactHookForm<CapsFormData>(props);

export const useFormContext = () => useReactHookFormContext<CapsFormData>();
