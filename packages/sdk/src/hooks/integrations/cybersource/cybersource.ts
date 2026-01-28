import type { CybersourceMicroform } from '../../../types/Cybersource';

export const createCybersourceMicroform = (
  token: string,
  fields: {
    cardNumber: { selector: string; placeholder: string };
    cvc: { selector: string; placeholder: string };
  },
): CybersourceMicroform => {
  const Flex = (window as unknown as Window & { Flex: any }).Flex;

  const flex = new Flex(token);

  const microform = flex.microform({
    keyId: token,
    keystore: token,
    container: `#${fields.cardNumber.selector}`,
    label: '.HostedField-label',
    placeholder: fields.cardNumber.placeholder,
    styles: {
      input: {
        'font-size': '14px',
        color: '#000',
      },
      '::placeholder': {
        color: '#9ca3af',
      },
    },
  });

  return microform;
};
