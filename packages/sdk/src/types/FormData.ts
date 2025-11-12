import type { Action, BillingDetailsModel } from '../__generated__';

export type CapsFormData = {
  // Payment amount
  amount: string;

  // Payment currency
  currency: string;

  // Payment provider selection
  provider_id: string;

  // Template/Contact method selection
  template_id: string;

  // CGV acceptance
  cgv: boolean;

  // Billing details for contact form
  billing_details: BillingDetailsModel;

  // Action
  action: Action;
};
