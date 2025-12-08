import { zodResolver } from '@hookform/resolvers/zod';

import { GLOBAL_CAPS_SETTINGS } from '../config';
import { type CapsFormSchema, capsFormSchema } from '../schemas/capsFormSchema';
import type { CapsFormConfig } from '../types/CapsFormConfig';
import { useForm } from './utils/useForm';

export type UseCapsFormParams = {
  config: CapsFormConfig;
  defaultValues?: Partial<CapsFormSchema>;
};

export function useCapsForm({ config, defaultValues = {} }: UseCapsFormParams) {
  const { isSeller } = config;

  const baseDefaultValues = {
    cgv: false,
    token: { status: 'idle' as const },
    ...(isSeller ? { template_id: GLOBAL_CAPS_SETTINGS.templateIds.mobilePhone } : {}),
  };

  return useForm({
    mode: 'onTouched',
    resolver: zodResolver(capsFormSchema(config)),
    defaultValues: {
      ...baseDefaultValues,
      ...defaultValues,
    },
  });
}
