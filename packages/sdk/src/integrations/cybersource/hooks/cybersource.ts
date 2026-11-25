import type { CybersourceMicroform, CybersourceStyles } from '../types/Cybersource.js';
import { HOSTED_FIELD_THEME } from '../../../utils/integrations/hostedFieldTheme.js';

export const CYBERSOURCE_STYLES: CybersourceStyles = {
  input: {
    'font-family': HOSTED_FIELD_THEME.fontFamily,
    'font-size': HOSTED_FIELD_THEME.fontSize,
    'line-height': HOSTED_FIELD_THEME.lineHeight,
    color: HOSTED_FIELD_THEME.color,
  },
  '::placeholder': { color: HOSTED_FIELD_THEME.placeholderColor },
  valid: { color: HOSTED_FIELD_THEME.color },
  invalid: { color: HOSTED_FIELD_THEME.color },
};

export const createCybersourceMicroform = (
  token: string,
  fields: {
    cardNumber: { selector: string; placeholder: string };
    cvc: { selector: string; placeholder: string };
  },
): CybersourceMicroform => {
  const flex = new window.Flex(token);

  return flex.microform({
    keyId: token,
    keystore: token,
    container: `#${fields.cardNumber.selector}`,
    label: '.HostedField-label',
    placeholder: fields.cardNumber.placeholder,
    styles: CYBERSOURCE_STYLES,
  });
};
