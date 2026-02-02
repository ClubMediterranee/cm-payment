import * as z from 'zod';

import { GLOBAL_CAPS_SETTINGS } from '../config';
import { Action } from '../types';
import { CapsFormConfig } from '../types/CapsFormConfig';
import { validateEmail } from './validations/validateEmail';
import { validateMobilePhone } from './validations/validateMobilePhone';
import { validateToken } from './validations/validateToken';

export type ValidationError = {
  path: string[];
  message: string;
};

export type Validate = (
  data: CapsFormSchema,
  config: Pick<CapsFormConfig, 'isSeller' | 'content'>,
) => ValidationError | undefined;

export const capsFormSchema = ({ isSeller, content, maxAmount }: CapsFormConfig) =>
  z
    .object({
      action: z.nativeEnum(Action),
      provider_id: z.string().min(1, {
        message: content.paymentProviders.validation.required,
      }),
      amount: z
        .string()
        .refine(
          (val) => {
            const num = parseFloat(val);
            return !isNaN(num) && num > 0;
          },
          { message: content.freeDeposit.validation.positive },
        )
        .refine((val) => parseFloat(val) <= maxAmount, {
          message: content.freeDeposit.validation.maxExceeded,
        }),
      currency: z.string(),
      template_id: z
        .enum([
          GLOBAL_CAPS_SETTINGS.templateIds.email,
          GLOBAL_CAPS_SETTINGS.templateIds.mobilePhone,
          GLOBAL_CAPS_SETTINGS.templateIds.call,
        ])
        .optional(),
      cgv: z.boolean().refine((val) => val === true, {
        message: content.cgv.validation.mustAccept,
      }),
      billing_details: z
        .object({
          email: z.string().nullable().optional(),
          mobile_phone: z.string().nullable().optional(),
        })
        .nullable()
        .optional(),
      token: z
        .object({
          value: z.string().min(1).optional(),
          status: z.enum(['idle', 'pending', 'success', 'error']),
        })
        .optional(),
    })
    .superRefine((data, ctx) => {
      const config = { isSeller, content };

      const validations = [validateToken, validateEmail, validateMobilePhone];
      validations.forEach((validate) => {
        const error = validate(data, config);

        if (error) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: error.message,
            path: error.path,
          });
        }
      });
    });

export type CapsFormSchema = z.infer<ReturnType<typeof capsFormSchema>>;
