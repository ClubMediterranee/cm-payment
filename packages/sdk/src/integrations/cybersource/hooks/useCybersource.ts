import { useCallback, useEffect, useRef } from 'react';

import type { CybersourceMicroform } from '../types/Cybersource.js';
import { PspProviders } from '../../../types/PspProviders.js';
import { createFieldLoadTracker } from '../../../utils/integrations/createFieldLoadTracker.js';
import { useRequestToken } from '../../../hooks/data/useRequestToken.js';
import { cardFieldMessages, useHostedFieldsState } from '../../../hooks/useHostedFieldsState.js';
import { useCapsConfigContext } from '../../../hooks/utils/useCapsConfigContext.js';
import { useDisclosure } from '../../../hooks/utils/useDisclosure.js';
import { useFormContext, useWatch } from '../../../hooks/utils/useForm.js';
import { useScriptLoader } from '../../../hooks/utils/useScriptLoader.js';
import { parseExpiryDate } from '../../../schemas/validations/validateExpiryDate.js';
import { createCybersourceMicroform } from './cybersource.js';

const FIELD_KEYS = ['cardNumber', 'cvc'] as const;

type CybersourceFieldKey = (typeof FIELD_KEYS)[number];

type UseCybersourceParams = {
  fields: Record<CybersourceFieldKey, { selector: string; placeholder: string }>;
};

const FIELD_TYPES = {
  cardNumber: 'number',
  cvc: 'securityCode',
} as const;

export const useCybersource = ({ fields }: UseCybersourceParams) => {
  const { id, type, content } = useCapsConfigContext();
  const { validation } = content.creditCardForm;
  const {
    setValue,
    formState: { isSubmitting, errors: formErrors },
  } = useFormContext();
  const microformRef = useRef<CybersourceMicroform | null>(null);
  const expiryDate = useWatch('creditCard.expiryDate');
  const tokenStatus = useWatch('token.status');
  const token = useWatch('token.value');

  const { fields: states, isValid, actions } = useHostedFieldsState(cardFieldMessages(validation));

  const { data } = useRequestToken({
    providerId: PspProviders.MCYBERSOURCE,
    params: {
      target_origins: window.location.origin,
      ...(type === 'booking' && id ? { booking_id: id } : {}),
    },
  });

  const { isLoaded } = useScriptLoader(data?.config.scriptUrl || '', {
    integrity: data?.config.scriptIntegrity || '',
    crossOrigin: 'anonymous',
  });

  const { isOpen: isReady, onOpen: onReady } = useDisclosure();

  useEffect(() => {
    if (!data?.token || !isLoaded || microformRef.current) return;

    const microform = createCybersourceMicroform(data.token, fields);

    microformRef.current = microform;

    const onFieldLoaded = createFieldLoadTracker(FIELD_KEYS.length, onReady);

    FIELD_KEYS.forEach((key) => {
      const microformField = microform.createField(FIELD_TYPES[key], {
        placeholder: fields[key].placeholder,
      });

      microformField.load(`#${fields[key].selector}`);
      microformField.on('load', onFieldLoaded);
      microformField.on('change', ({ valid, empty }) => actions.change(key, { valid, empty }));
      microformField.on('focus', () => actions.focus(key));
      microformField.on('blur', () => actions.blur(key));
    });
  }, [actions, data, isLoaded, fields, onReady]);

  const allFieldsValid =
    isValid('cardNumber') && isValid('cvc') && !formErrors?.creditCard?.expiryDate;

  const generateToken = useCallback(() => {
    const parsedExpiryDate = parseExpiryDate(expiryDate);

    if (!microformRef.current || !allFieldsValid || !parsedExpiryDate) return;

    setValue('token.status', 'pending');

    microformRef.current.createToken(parsedExpiryDate, (err, tokenizedCard) => {
      if (err) {
        setValue('token', { value: '', status: 'error' });
        return;
      }

      setValue('token', { value: tokenizedCard, status: 'success' });
    });
  }, [allFieldsValid, expiryDate, setValue]);

  useEffect(() => {
    if (isSubmitting && !token && tokenStatus !== 'pending') {
      generateToken();
    }
  }, [generateToken, isSubmitting]);

  return { isReady, fields: states };
};
