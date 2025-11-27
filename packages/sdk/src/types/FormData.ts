import type { Action, BillingDetailsModel } from '../__generated__';
import { GLOBAL_CAPS_SETTINGS } from '../config';

export type CapsFormData = {
  // Payment amount
  amount: string;

  // Payment currency
  currency: string;

  // Payment provider selection
  provider_id: string;

  // Template/Contact method selection
  template_id: (typeof GLOBAL_CAPS_SETTINGS.templateIds)[keyof typeof GLOBAL_CAPS_SETTINGS.templateIds];
  // CGV acceptance
  cgv: boolean;

  // Billing details for contact form
  billing_details: BillingDetailsModel;

  // Action
  action: Action;

  // Payment token for hosted card forms (HiPay, Cybersource, etc.)
  token?: string;
};
