import {
  useForm as useReactHookForm,
  useFormContext as useReactHookFormContext,
  type UseFormProps,
} from 'react-hook-form';

import type { SDKFormData } from '../../types/FormData';

export const useForm = (props?: UseFormProps<SDKFormData>) => useReactHookForm<SDKFormData>(props);

export const useFormContext = () => useReactHookFormContext<SDKFormData>();
