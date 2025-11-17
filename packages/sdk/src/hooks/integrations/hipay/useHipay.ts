import { useCallback, useEffect, useRef, useState } from 'react';

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
  const {
    formState: { isSubmitting },
    setValue,
  } = useFormContext();
  const { isLoaded } = useScriptLoader(HIPAY_CONFIG.scriptUrl);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { isOpen: isHipayReady, onOpen: onHipayReady } = useDisclosure();

  const instance = useRef<HipayInstance | null>(null);

  const generateToken = useCallback(() => {
    if (!isHipayReady || !instance.current) return;

    instance.current
      .getPaymentData()
      .then(({ token }) => {
        setValue('token', token, { shouldValidate: true });
      })
      .catch((errors) => setErrors(mapHipayErrorsToObject(errors)));
  }, [isHipayReady, setValue]);

  const onHipayInputChange = (field: HipayInputChangeData) => {
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
  };

  useEffect(() => {
    if (!isLoaded) return;
    initializeHipay();
  }, [isLoaded]);

  useEffect(() => {
    if (isSubmitting) {
      generateToken();
    }
  }, [generateToken, isSubmitting]);

  return { errors, isReady: isHipayReady };
};
