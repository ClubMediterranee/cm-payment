import { BillingDetailsModel } from '../../../infra/api/__generated__/index.js';
import { TEMPLATE_IDS } from '../constants.js';

export const mapBillingDetails = (
  billingDetails: BillingDetailsModel | undefined,
  templateId: string | undefined,
): BillingDetailsModel | undefined => {
  if (!billingDetails) {
    return undefined;
  }

  if (templateId === TEMPLATE_IDS.email) {
    return { ...billingDetails, mobile_phone: undefined };
  }
  if (templateId === TEMPLATE_IDS.mobilePhone) {
    return { ...billingDetails, email: undefined };
  }
  return billingDetails;
};
