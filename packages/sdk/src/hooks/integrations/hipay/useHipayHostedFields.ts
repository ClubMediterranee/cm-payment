import { useCallback, useEffect, useRef, useState } from 'react';

import type { HipayInputChangeData, HipayInstance } from '../../../types/Hipay';
import { PspProviders } from '../../../types/PspProviders';
import { useCapsConfigContext } from '../../utils/useCapsConfigContext';
import { useDisclosure } from '../../utils/useDisclosure';
import { useFormContext, useWatch } from '../../utils/useForm';
import { usePaymentProviderSettings } from '../../utils/usePaymentProviderSettings';
import { useScriptLoader } from '../../utils/useScriptLoader';
import { createHipayClient, mapHipayErrorsToObject } from './hipay';

type UseHipayHostedFieldsParams = {
  fieldSelectors: {
    cardHolder: string;
    cardNumber: string;
    expiryDate: string;
    cvc: string;
  };
};

export const useHipayHostedFields = ({ fieldSelectors }: UseHipayHostedFieldsParams) => {
  const { content } = useCapsConfigContext();
  const { formState, setValue } = useFormContext();
  const { isSubmitting } = formState;

  const { script_url, ...hipayConfig } = usePaymentProviderSettings<{
    script_url: string;
    environment: string;
    username: string;
    password: string;
  }>(PspProviders.HIPAY);

  const { isLoaded } = useScriptLoader(script_url);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const watchedToken = useWatch('token.value');
  const watchedTokenStatus = useWatch('token.status');
  const { isOpen: isHipayReady, onOpen: onHipayReady } = useDisclosure();

  const instance = useRef<HipayInstance | null>(null);
  const generationIdRef = useRef(0);

  const generateToken = useCallback(() => {
    if (!instance.current?.getPaymentData) return;

    const generationId = generationIdRef.current;

    setValue('token.status', 'pending');
    instance.current
      .getPaymentData()
      .then(({ token }) => {
        if (generationId === generationIdRef.current) {
          setValue('token', { value: token, status: 'success' });
        }
      })
      .catch((errors) => {
        if (generationId === generationIdRef.current) {
          setErrors(mapHipayErrorsToObject(errors));
          setValue('token', { value: '', status: 'error' });
        }
      })
      .finally(() => {
        if (generationId !== generationIdRef.current) {
          setValue('token.status', 'idle');
        }
      });
  }, [setValue]);

  const onHipayInputChange = (field: HipayInputChangeData) => {
    generationIdRef.current++;
    setErrors((prev) => {
      return {
        ...prev,
        [field.element]: field.validity.error || '',
      };
    });
  };

  useEffect(() => {
    if (!isLoaded || instance.current) return;

    instance.current = createHipayClient({
      type: 'card',
      config: hipayConfig,
      options: {
        cardHolder: {
          placeholder: content.creditCardForm.fullName,
          selector: fieldSelectors.cardHolder,
        },
        cardNumber: {
          placeholder: content.creditCardForm.cardNumber,
          selector: fieldSelectors.cardNumber,
        },
        cvc: {
          placeholder: content.creditCardForm.cvc,
          selector: fieldSelectors.cvc,
        },
        expiryDate: {
          placeholder: content.creditCardForm.expiryDate,
          selector: fieldSelectors.expiryDate,
        },
      },
      events: {
        ready: onHipayReady,
        inputChange: onHipayInputChange,
        change: ({ valid }) => {
          if (valid) {
            return generateToken();
          }
          setValue('token.value', '');
        },
      },
    });

    return () => {
      instance.current?.destroy();
    };
  }, [isLoaded]);

  useEffect(() => {
    if (isSubmitting && !watchedToken && watchedTokenStatus !== 'pending') {
      generateToken();
    }
  }, [formState, generateToken, isSubmitting, watchedToken, watchedTokenStatus]);

  return { errors, isReady: isHipayReady };
};
