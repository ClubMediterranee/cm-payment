import type { Hipay, HipayError, HipayInstance } from '../../../types/Hipay';

// TO DO: move it to payment config fetch mapper
export const HIPAY_CONFIG = {
  scriptUrl: 'https://stage-libs.hipay.com/js/sdkjs.js',
  username: '94675627.stage-secure-gateway.hipay-tpp.com',
  password: 'Test_jTQeMVl7R8Om7LTFGZwJV0Q5',
  environment: 'stage',
};

export const createHipayHostedFields = (fields: {
  cardHolder: { placeholder: string; selector: string };
  cardNumber: { placeholder: string; selector: string };
  cvc: { placeholder: string; selector: string };
  expiryDate: { placeholder: string; selector: string };
}): HipayInstance => {
  const HiPay = (window as unknown as Window & { HiPay: Hipay }).HiPay;

  const hipay = HiPay({
    environment: HIPAY_CONFIG.environment,
    username: HIPAY_CONFIG.username,
    password: HIPAY_CONFIG.password,
  });

  return hipay.create('card', { fields });
};

export const mapHipayErrorsToObject = (hipayErrors: HipayError[]): Record<string, string> => {
  return hipayErrors.reduce((acc, { field, error }) => ({ ...acc, [field]: error }), {});
};
