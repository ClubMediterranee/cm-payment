import type { Hipay, HipayError, HipayInstance } from '../../../types/Hipay';
import { PspProviders } from '../../../types/PspProviders';
import { ProviderSettings } from '../../data/usePaymentConfig/usePaymentProviderSettings';

type HipayFields = {
  cardHolder: { placeholder: string; selector: string };
  cardNumber: { placeholder: string; selector: string };
  cvc: { placeholder: string; selector: string };
  expiryDate: { placeholder: string; selector: string };
};

export const createHipayHostedFields = (
  fields: HipayFields,
  config: Omit<ProviderSettings[PspProviders.HIPAY], 'script_url'>,
): HipayInstance => {
  const HiPay = (window as unknown as Window & { HiPay: Hipay }).HiPay;

  const hipay = HiPay(config);

  return hipay.create('card', { fields });
};

export const mapHipayErrorsToObject = (hipayErrors: HipayError[]): Record<string, string> => {
  return hipayErrors.reduce((acc, { field, error }) => ({ ...acc, [field]: error }), {});
};
