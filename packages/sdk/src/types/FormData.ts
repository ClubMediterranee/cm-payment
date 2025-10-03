import type { BillingDetailsModel } from '../__generated__';

export type SDKFormData = {
  // Payment amount
  amount: number;

  // Payment provider selection
  provider_id: string;

  // Template/Contact method selection
  template_id: string;

  // CGV acceptance
  cgv: boolean;

  // Billing details for contact form
  billing_details: BillingDetailsModel;
};
