import * as z from 'zod';

import { GLOBAL_CAPS_SETTINGS } from '../config';
import { Action } from '../types';
import { CapsFormConfig } from '../types/CapsFormConfig';
import { LocaleOrCountry } from '../types/LocaleOrCountry';
import { validateBillingAddress } from './validations/validateBillingAddress';
import { validateCardHolder } from './validations/validateCardHolder';
import { validateComment } from './validations/validateComment';
import { validateDonation } from './validations/validateDonation';
import { validateEmail } from './validations/validateEmail';
import { validateExpiryDate } from './validations/validateExpiryDate';
import { validateMobilePhone } from './validations/validateMobilePhone';
import { validateToken } from './validations/validateToken';

export type ValidationError = {
  path: string[];
  message: string;
};

export type Validate = (
  data: CapsFormSchema,
  config: Pick<CapsFormConfig, 'isSeller' | 'content' | 'getProviderConfiguration'>,
) => ValidationError | ValidationError[] | undefined;

export const capsFormSchema = ({
  isSeller,
  content,
  maxAmount,
  getProviderConfiguration,
}: CapsFormConfig) =>
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
      uuid: z.string().optional(),
      reference: z.string().optional(),
      comments: z.string().optional(),
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
      cgv_donation: z.boolean().optional(),
      donation_amount: z.number().nonnegative().optional(),
      payment_condition_id: z.string().optional(),
      billing_details: z.object({
        email: z.string().nullable().optional(),
        mobile_phone: z.string().nullable().optional(),
        attendee: z
          .object({
            first_name: z.string().optional(),
            last_name: z.string().optional(),
          })
          .optional(),
        address: z.object({
          additional_information_1: z.string().optional(),
          additional_information_2: z.string().optional(),
          number: z.string().optional(),
          street: z.string().optional(),
          add_on: z.string().optional(),
          town: z.string().optional(),
          city: z.string().optional(),
          state_or_district: z.string().optional(),
          zip_code: z.string().optional(),
          country: z.string().optional(),
          country_code: z.custom<LocaleOrCountry>(),
        }),
      }),
      token: z
        .object({
          value: z.string().min(1).optional(),
          status: z.enum(['idle', 'pending', 'success', 'error']),
        })
        .optional(),
      creditCard: z
        .object({
          expiryDate: z.string().optional(),
          cardHolder: z.string().optional(),
        })
        .optional(),
    })
    .superRefine((data, ctx) => {
      const config = { isSeller, content, getProviderConfiguration };

      const validations = [
        validateToken,
        validateExpiryDate,
        validateCardHolder,
        validateEmail,
        validateMobilePhone,
        validateBillingAddress,
        validateDonation,
        validateComment,
      ];
      validations.forEach((validate) => {
        const result = validate(data, config);

        if (result) {
          const errors = Array.isArray(result) ? result : [result];
          errors.forEach((error) => {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: error.message,
              path: error.path,
            });
          });
        }
      });
    });

export type CapsFormSchema = z.infer<ReturnType<typeof capsFormSchema>>;
