import { useCallback, useEffect, useRef } from 'react';

import type {
  IxopayConfig,
  IxopayError,
  IxopayEventData,
  IxopayPayment,
  IxopayPaymentJs,
  IxopayStyle,
} from '../types/Ixopay.js';
import { cardFieldMessages, useHostedFieldsState } from '../../../hooks/useHostedFieldsState.js';
import { useCapsConfigContext } from '../../../hooks/utils/useCapsConfigContext.js';
import { useDisclosure } from '../../../hooks/utils/useDisclosure.js';
import { useFormContext, useWatch } from '../../../hooks/utils/useForm.js';
import { useScriptLoader } from '../../../hooks/utils/useScriptLoader.js';
import { useWatchedPaymentProvider } from '../../../hooks/utils/useWatchedPaymentProvider.js';
import { parseExpiryDate } from '../../../schemas/validations/validateExpiryDate.js';
import { HOSTED_FIELD_THEME } from '../../../utils/integrations/hostedFieldTheme.js';
import { mapIxopayErrorsToObject } from './ixopay.js';

export const IXOPAY_STYLE: IxopayStyle = {
  border: '0',
  width: '100%',
  height: HOSTED_FIELD_THEME.lineHeight,
  outline: 'none',
  'box-shadow': 'none',
  'font-family': HOSTED_FIELD_THEME.fontFamily,
  'font-size': HOSTED_FIELD_THEME.fontSize,
  'line-height': HOSTED_FIELD_THEME.lineHeight,
  color: HOSTED_FIELD_THEME.color,
  '::placeholder': { color: HOSTED_FIELD_THEME.placeholderColor },
};

type UseIxopayHostedFieldsParams = {
  fieldSelectors: {
    cardNumber: string;
    cvc: string;
  };
};

export const useIxopayHostedFields = ({ fieldSelectors }: UseIxopayHostedFieldsParams) => {
  const { formState, setValue } = useFormContext();
  const { content } = useCapsConfigContext();
  const { placeholders, validation } = content.creditCardForm;
  const provider = useWatchedPaymentProvider();

  const { cardNumber, cvc } = cardFieldMessages(validation);
  const { fields, actions } = useHostedFieldsState({ number: cardNumber, cvv: cvc });

  const { script_url = '', integration_key = '' } = (provider?.configuration?.settings ||
    {}) as Partial<IxopayConfig>;
  const { isLoaded } = useScriptLoader(script_url, { 'data-main': 'payment-js' });

  const watchedToken = useWatch('token.value');
  const watchedTokenStatus = useWatch('token.status');
  const watchedExpiryDate = useWatch('creditCard.expiryDate');
  const watchedCardHolder = useWatch('creditCard.cardHolder');

  const { isOpen: isIxopayReady, onOpen: onIxopayReady } = useDisclosure();

  const paymentJs = useRef<IxopayPaymentJs | null>(null);

  useEffect(() => {
    if (!isLoaded || !window.PaymentJs) return;
    if (paymentJs.current) return;
    paymentJs.current = new window.PaymentJs('1.3');
    paymentJs.current.init(
      integration_key,
      fieldSelectors.cardNumber,
      fieldSelectors.cvc,
      (payment: IxopayPayment) => {
        payment.setNumberStyle(IXOPAY_STYLE);
        payment.setCvvStyle(IXOPAY_STYLE);
        payment.setNumberPlaceholder(placeholders.cardNumber);
        payment.setCvvPlaceholder(placeholders.cvc);

        payment.numberOn('input', ({ validNumber, numberLength }: IxopayEventData) =>
          actions.change('number', { valid: validNumber, empty: !numberLength }),
        );
        payment.numberOn('focus', () => actions.focus('number'));
        payment.numberOn('blur', () => actions.blur('number'));

        payment.cvvOn('input', ({ validCvv, cvvLength }: IxopayEventData) =>
          actions.change('cvv', { valid: validCvv, empty: !cvvLength }),
        );
        payment.cvvOn('focus', () => actions.focus('cvv'));
        payment.cvvOn('blur', () => actions.blur('cvv'));

        onIxopayReady();
      },
    );
  }, [isLoaded]);

  const generateToken = useCallback(() => {
    if (!paymentJs.current || !watchedExpiryDate || !watchedCardHolder) return;

    const expiryDate = parseExpiryDate(watchedExpiryDate);
    if (!expiryDate) {
      setValue('token', { value: '', status: 'error' });
      return;
    }

    setValue('token.status', 'pending');

    paymentJs.current.tokenize(
      {
        card_holder: watchedCardHolder,
        month: expiryDate.expirationMonth,
        year: expiryDate.expirationYear,
      },
      (token: string) => {
        setValue('token', { value: token, status: 'success' });
      },
      (errors: IxopayError[]) => {
        setValue('token', { value: '', status: 'error' });
        actions.rejectAll(mapIxopayErrorsToObject(errors));
      },
    );
  }, [actions, watchedExpiryDate, watchedCardHolder, setValue]);

  useEffect(() => {
    if (formState.isSubmitting && !watchedToken && watchedTokenStatus !== 'pending') {
      generateToken();
    }
  }, [formState.isSubmitting, watchedToken, watchedTokenStatus, generateToken]);

  return { isReady: isIxopayReady, fields };
};
