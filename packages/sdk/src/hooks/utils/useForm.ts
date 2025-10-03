import {
  useForm as useReactHookForm,
  useFormContext as useReactHookFormContext,
} from 'react-hook-form';

import type { SDKFormData } from '../../types/FormData';

export const useForm = () => useReactHookForm<SDKFormData>();

export const useFormContext = () => useReactHookFormContext<SDKFormData>();
