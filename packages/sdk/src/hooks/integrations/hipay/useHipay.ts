import { useCallback, useEffect, useRef, useState } from 'react';
import { useWatch } from 'react-hook-form';

import type { HipayInputChangeData, HipayInstance } from '../../../types/Hipay';
import { useCapsConfigContext } from '../../utils/useCapsConfigContext';
import { useDisclosure } from '../../utils/useDisclosure';
import { useFormContext } from '../../utils/useForm';
import { useScriptLoader } from '../../utils/useScriptLoader';
import { createHipayHostedFields, HIPAY_CONFIG, mapHipayErrorsToObject } from './hipay';

type UseHipayParams = {
  fieldSelectors: {
    cardHolder: string;
    cardNumber: string;
    expiryDate: string;
    cvc: string;
  };
};

export const useHipay = ({ fieldSelectors }: UseHipayParams) => {
  const { content } = useCapsConfigContext();
  const { formState, setValue } = useFormContext();
  const { isSubmitting } = formState;
  const { isLoaded } = useScriptLoader(HIPAY_CONFIG.scriptUrl);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const watchedToken = useWatch({ name: 'token.value' });
  const watchedTokenStatus = useWatch({ name: 'token.status' });
  const { isOpen: isHipayReady, onOpen: onHipayReady } = useDisclosure();

  const instance = useRef<HipayInstance | null>(null);
  const generationIdRef = useRef(0);

  const generateToken = useCallback(() => {
    if (!instance.current) return;

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

  const initializeHipay = () => {
    instance.current = createHipayHostedFields({
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
    });

    instance.current?.on('ready', onHipayReady);

    instance.current?.on('inputChange', onHipayInputChange);

    instance.current.on('change', ({ valid }) => {
      if (valid) {
        return generateToken();
      }
      setValue('token.value', '');
    });
  };

  useEffect(() => {
    if (!isLoaded) return;
    initializeHipay();
  }, [isLoaded]);

  useEffect(() => {
    if (isSubmitting && !watchedToken && watchedTokenStatus !== 'pending') {
      generateToken();
    }
  }, [formState, generateToken, isSubmitting, watchedToken, watchedTokenStatus]);

  return { errors, isReady: isHipayReady };
};
