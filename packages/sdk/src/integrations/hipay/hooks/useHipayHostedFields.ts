import { useCallback, useEffect, useRef } from 'react';

import type { HipayField, HipayInstance } from '../types/Hipay.js';
import { PspProviders } from '../../../types/PspProviders.js';
import { cardFieldMessages, useHostedFieldsState } from '../../../hooks/useHostedFieldsState.js';
import { useCapsConfigContext } from '../../../hooks/utils/useCapsConfigContext.js';
import { useDisclosure } from '../../../hooks/utils/useDisclosure.js';
import { useFormContext, useWatch } from '../../../hooks/utils/useForm.js';
import { usePaymentProviderSettings } from '../../../hooks/utils/usePaymentProviderSettings.js';
import { useScriptLoader } from '../../../hooks/utils/useScriptLoader.js';
import { createHipayClient, mapHipayErrorsToObject } from './hipay.js';

type UseHipayHostedFieldsParams = {
  fieldSelectors: Record<HipayField, string>;
};

export const useHipayHostedFields = ({ fieldSelectors }: UseHipayHostedFieldsParams) => {
  const { content } = useCapsConfigContext();
  const { formState, setValue } = useFormContext();
  const { isSubmitting } = formState;
  const { placeholders, validation } = content.creditCardForm;

  const { script_url, ...hipayConfig } = usePaymentProviderSettings<{
    script_url: string;
    environment: string;
    username: string;
    password: string;
  }>(PspProviders.HIPAY);

  const { isLoaded } = useScriptLoader(script_url);

  const { fields, actions } = useHostedFieldsState<HipayField>({
    cardHolder: { required: validation.cardHolder, invalid: validation.cardHolder },
    ...cardFieldMessages(validation),
    expiryDate: { required: validation.expiryDate, invalid: validation.expiryDateInvalid },
  });

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
          actions.rejectAll(mapHipayErrorsToObject(errors));
          setValue('token', { value: '', status: 'error' });
        }
      })
      .finally(() => {
        if (generationId !== generationIdRef.current) {
          setValue('token.status', 'idle');
        }
      });
  }, [actions, setValue]);

  useEffect(() => {
    if (!isLoaded || instance.current) return;

    instance.current = createHipayClient({
      type: 'card',
      config: hipayConfig,
      options: {
        cardHolder: { placeholder: placeholders.cardHolder, selector: fieldSelectors.cardHolder },
        cardNumber: { placeholder: placeholders.cardNumber, selector: fieldSelectors.cardNumber },
        cvc: { placeholder: placeholders.cvc, selector: fieldSelectors.cvc },
        expiryDate: { placeholder: placeholders.expiryDate, selector: fieldSelectors.expiryDate },
      },
      events: {
        ready: onHipayReady,
        inputChange: ({ element, validity }) => {
          generationIdRef.current++;
          actions.change(element, validity, validity.error || undefined);
        },
        focus: ({ element }) => actions.focus(element),
        blur: ({ element }) => actions.blur(element),
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

  return { fields, isReady: isHipayReady };
};
