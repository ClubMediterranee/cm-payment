import type {
  CreateHipayClientParams,
  HipayError,
  HipayEventMap,
  HipayInstance,
  HipayStyles,
} from '../types/Hipay.js';
import { HOSTED_FIELD_THEME } from '../../../utils/integrations/hostedFieldTheme.js';

export const HIPAY_STYLES: HipayStyles = {
  base: {
    color: HOSTED_FIELD_THEME.color,
    fontSize: HOSTED_FIELD_THEME.fontSize,
    fontFamily: HOSTED_FIELD_THEME.fontFamily,
    fontWeight: 400,
    placeholderColor: HOSTED_FIELD_THEME.placeholderColor,
    caretColor: HOSTED_FIELD_THEME.color,
    iconColor: HOSTED_FIELD_THEME.color,
  },
  valid: { color: HOSTED_FIELD_THEME.color },
  invalid: { color: HOSTED_FIELD_THEME.color, caretColor: HOSTED_FIELD_THEME.color },
};

export function createHipayClient(params: CreateHipayClientParams): HipayInstance {
  const hipay = window.HiPay(params.config);
  const instance =
    params.type === 'card'
      ? hipay.create('card', { fields: params.options, styles: HIPAY_STYLES })
      : hipay.create('paypal', {
          canPayLater: false,
          request: {
            amount: params.options.amount,
            currency: params.options.currency,
            locale: params.options.locale,
          },
          paypalButtonStyle: { shape: 'pill', color: 'gold', height: 45 },
          template: 'auto',
          selector: params.options.selector,
        });
  const events: Partial<HipayEventMap> = params.events ?? {};

  (Object.keys(events) as (keyof HipayEventMap)[]).forEach((event) => {
    const callback = events[event];

    if (callback) instance.on(event, callback);
  });

  return instance;
}

export const mapHipayErrorsToObject = (hipayErrors: HipayError[]): Record<string, string> => {
  return hipayErrors.reduce((acc, { field, error }) => ({ ...acc, [field]: error }), {});
};
