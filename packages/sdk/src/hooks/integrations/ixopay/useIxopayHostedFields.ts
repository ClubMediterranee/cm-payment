import { useCallback, useEffect, useRef, useState } from 'react';

import type { IxopayConfig, IxopayError, IxopayEventData } from '../../../types/Ixopay';
import { useCapsConfigContext } from '../../utils/useCapsConfigContext';
import { useDisclosure } from '../../utils/useDisclosure';
import { useFormContext, useWatch } from '../../utils/useForm';
import { useScriptLoader } from '../../utils/useScriptLoader';
import { useWatchedPaymentProvider } from '../../utils/useWatchedPaymentProvider';
import { mapIxopayErrorsToObject, removeErrorKey } from './ixopay';

type UseIxopayHostedFieldsParams = {
  fieldSelectors: {
    cardNumber: string;
    cvc: string;
  };
};

const parseExpiryDate = (expiryDate: string) => {
  if (!expiryDate) {
    return { expirationMonth: '', expirationYear: '' };
  }

  const date = new Date(expiryDate);
  const expirationMonth = (date.getMonth() + 1).toString().padStart(2, '0');
  const expirationYear = date.getFullYear().toString();

  return { expirationMonth, expirationYear };
};

export const useIxopayHostedFields = ({ fieldSelectors }: UseIxopayHostedFieldsParams) => {
  const { formState, setValue, setError } = useFormContext();
  const { content } = useCapsConfigContext();
  const provider = useWatchedPaymentProvider();

  const [errors, setErrors] = useState<Record<string, string>>({});

  const { script_url = '', integration_key } = (provider?.configuration?.settings ||
    {}) as Partial<IxopayConfig>;
  const { isLoaded } = useScriptLoader(script_url, { 'data-main': 'payment-js' });

  const watchedToken = useWatch('token.value');
  const watchedTokenStatus = useWatch('token.status');
  const watchedExpiryDate = useWatch('creditCard.expiryDate');
  const watchedCardHolder = useWatch('creditCard.cardHolder');

  const { isOpen: isIxopayReady, onOpen: onIxopayReady } = useDisclosure();

  const paymentJs = useRef<any>(null);

  useEffect(() => {
    if (!isLoaded || !window.PaymentJs) return;
    if (paymentJs.current) return;
    paymentJs.current = new window.PaymentJs('1.3');
    paymentJs.current.init(
      integration_key,
      fieldSelectors.cardNumber,
      fieldSelectors.cvc,
      (payment: any) => {
        const style = {
          border: '0px ',
          width: '100%',
          height: '24px',
          outline: 'none',
          boxShadow: 'none',
          '::placeholder': {
            color: '#9ca3af',
          },
        };
        payment.setNumberStyle(style);
        payment.setCvvStyle(style);
        payment.setNumberPlaceholder(content.creditCardForm.cardNumber);
        payment.setCvvPlaceholder(content.creditCardForm.cvc);

        payment.numberOn('input', ({ validNumber }: IxopayEventData) => {
          setErrors((prev) =>
            validNumber
              ? removeErrorKey(prev, 'number')
              : {
                  ...prev,
                  ...mapIxopayErrorsToObject([
                    {
                      attribute: 'number',
                      message: content.creditCardForm.validation.cardNumber,
                    },
                  ]),
                },
          );
        });

        payment.cvvOn('input', ({ validCvv }: IxopayEventData) => {
          setErrors((prev) =>
            validCvv
              ? removeErrorKey(prev, 'cvv')
              : {
                  ...prev,
                  ...mapIxopayErrorsToObject([
                    { attribute: 'cvv', message: content.creditCardForm.validation.cvc },
                  ]),
                },
          );
        });

        onIxopayReady();
      },
    );
  }, [isLoaded]);

  const generateToken = useCallback(() => {
    if (!paymentJs.current || !watchedExpiryDate || !watchedCardHolder) return;

    const { expirationMonth, expirationYear } = parseExpiryDate(watchedExpiryDate);
    if (!expirationMonth || !expirationYear) {
      setValue('token', { value: '', status: 'error' });
      return;
    }

    setValue('token.status', 'pending');

    paymentJs.current.tokenize(
      {
        card_holder: watchedCardHolder,
        month: expirationMonth,
        year: expirationYear,
      },
      (token: string) => {
        setValue('token', { value: token, status: 'success' });
      },
      (errors: IxopayError[]) => {
        setValue('token', { value: '', status: 'error' });
        setErrors(mapIxopayErrorsToObject(errors));
      },
    );
  }, [watchedExpiryDate, watchedCardHolder, setValue, setError]);

  useEffect(() => {
    if (formState.isSubmitting && !watchedToken && watchedTokenStatus !== 'pending') {
      generateToken();
    }
  }, [formState.isSubmitting, watchedToken, watchedTokenStatus, generateToken]);

  return {
    isReady: isIxopayReady,
    errors,
  };
};
