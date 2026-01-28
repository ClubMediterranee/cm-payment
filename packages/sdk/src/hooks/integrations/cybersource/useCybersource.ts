import { useCallback, useEffect, useRef, useState } from 'react';

import type { CybersourceMicroform } from '../../../types/Cybersource';
import { PspProviders } from '../../../types/PspProviders';
import { createFieldLoadTracker } from '../../../utils/integrations/createFieldLoadTracker';
import { useRequestToken } from '../../data/useRequestToken';
import { useCapsConfigContext } from '../../utils/useCapsConfigContext';
import { useDisclosure } from '../../utils/useDisclosure';
import { useFormContext, useWatch } from '../../utils/useForm';
import { useScriptLoader } from '../../utils/useScriptLoader';
import { createCybersourceMicroform } from './cybersource';

type UseCybersourceParams = {
  fields: {
    cardNumber: { selector: string; placeholder: string };
    cvc: { selector: string; placeholder: string };
  };
};

const FIELD_MAPPING = {
  cardNumber: { type: 'number' as const, errorKey: 'number' as const },
  cvc: { type: 'securityCode' as const, errorKey: 'securityCode' as const },
} as const;

const parseExpiryDate = (expiryDate: string) => {
  const date = new Date(expiryDate);
  return {
    expirationMonth: (date.getMonth() + 1).toString().padStart(2, '0'),
    expirationYear: date.getFullYear().toString(),
  };
};

export const useCybersource = ({ fields }: UseCybersourceParams) => {
  const { id, type, content } = useCapsConfigContext();
  const {
    setValue,
    formState: { isSubmitting, errors: formErrors },
  } = useFormContext();
  const microformRef = useRef<CybersourceMicroform | null>(null);
  const expiryDate = useWatch('creditCard.expiryDate');
  const tokenStatus = useWatch('token.status');
  const token = useWatch('token.value');

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

  const [fieldsState, setFieldsState] = useState({
    number: { valid: false, empty: true, touched: false },
    securityCode: { valid: false, empty: true, touched: false },
  });

  useEffect(() => {
    if (!data?.token || !isLoaded || microformRef.current) return;

    const microform = createCybersourceMicroform(data.token, fields);

    microformRef.current = microform;

    const onFieldLoaded = createFieldLoadTracker(Object.keys(fields).length, onReady);

    Object.entries(fields).forEach(([fieldKey, config]) => {
      const fieldConfig = FIELD_MAPPING[fieldKey as keyof typeof fields];

      const field = microform.createField(fieldConfig.type, {
        placeholder: config.placeholder,
      });

      field.load(`#${config.selector}`);
      field.on('load', onFieldLoaded);

      field.on('change', ({ valid, empty }) => {
        setFieldsState((prev) => ({
          ...prev,
          [fieldConfig.errorKey]: { valid, empty, touched: true },
        }));
      });
    });
  }, [data, isLoaded, fields, onReady]);

  const generateToken = useCallback(() => {
    if (!microformRef.current) return;

    const hasExpiryDateError = !!formErrors?.creditCard?.expiryDate;
    const allFieldsValid =
      fieldsState.number.valid && fieldsState.securityCode.valid && !hasExpiryDateError;

    if (!allFieldsValid) {
      setFieldsState((prev) => ({
        number: { ...prev.number, touched: true },
        securityCode: { ...prev.securityCode, touched: true },
      }));
      return;
    }

    const { expirationMonth, expirationYear } = parseExpiryDate(expiryDate!);

    setValue('token.status', 'pending');

    microformRef.current.createToken({ expirationMonth, expirationYear }, (err, tokenizedCard) => {
      if (err) {
        setValue('token', { value: '', status: 'error' });
        return;
      }

      setValue('token', { value: tokenizedCard, status: 'success' });
    });
  }, [
    formErrors?.creditCard?.expiryDate,
    fieldsState.number.valid,
    fieldsState.securityCode.valid,
    expiryDate,
    setValue,
  ]);

  useEffect(() => {
    if (isSubmitting && !token && tokenStatus !== 'pending') {
      generateToken();
    }
  }, [generateToken, isSubmitting]);

  const errors = {
    ...(fieldsState.number.touched &&
      !fieldsState.number.valid && {
        number: fieldsState.number.empty
          ? content.creditCardForm.validation.cardNumberRequired
          : content.creditCardForm.validation.cardNumber,
      }),
    ...(fieldsState.securityCode.touched &&
      !fieldsState.securityCode.valid && {
        securityCode: fieldsState.securityCode.empty
          ? content.creditCardForm.validation.cvcRequired
          : content.creditCardForm.validation.cvc,
      }),
  };

  return {
    fieldsState,
    isReady,
    errors,
  };
};
