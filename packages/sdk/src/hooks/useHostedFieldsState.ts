import type { ValidationStatus } from '@clubmed/trident-ui/ui/hooks/useInternalStatus';
import { useEffect, useRef, useState } from 'react';

import type { Content } from '../types/Content';
import {
  type ErrorReveal,
  type FieldValidity,
  hiddenError,
  isErrorRevealed,
  resolveFieldStatus,
  revealOnBlur,
  revealOnChange,
} from '../utils/fieldStatus';
import { useFormContext } from './utils/useForm';

type HostedFieldSnapshot = FieldValidity & {
  focused: boolean;
  message?: string;
  reveal: ErrorReveal;
};

export type HostedFieldMessages = {
  required: string;
  invalid: string;
};

export type HostedFieldState = {
  status: ValidationStatus;
  focused: boolean;
  filled: boolean;
  error?: string;
};

export const cardFieldMessages = (validation: Content['creditCardForm']['validation']) => ({
  cardNumber: { required: validation.cardNumberRequired, invalid: validation.cardNumber },
  cvc: { required: validation.cvcRequired, invalid: validation.cvc },
});

const initialSnapshot = (submitCount: number): HostedFieldSnapshot => ({
  valid: false,
  empty: true,
  focused: false,
  reveal: hiddenError(submitCount),
});

const mapValues = <K extends string, A, B>(record: Record<K, A>, map: (value: A, key: K) => B) =>
  Object.fromEntries(
    Object.entries<A>(record).map(([key, value]) => [key, map(value, key as K)]),
  ) as Record<K, B>;

export const useHostedFieldsState = <K extends string>(
  messages: Record<K, HostedFieldMessages>,
) => {
  const {
    formState: { submitCount },
  } = useFormContext();
  const submitCountRef = useRef(submitCount);

  useEffect(() => {
    submitCountRef.current = submitCount;
  }, [submitCount]);

  const [snapshots, setSnapshots] = useState(() =>
    mapValues(messages, () => initialSnapshot(submitCount)),
  );

  const [actions] = useState(() => {
    const isKey = (key: string): key is K => Object.keys(messages).includes(key);
    const update = (key: K, next: (snapshot: HostedFieldSnapshot) => HostedFieldSnapshot) =>
      setSnapshots((prev) => ({ ...prev, [key]: next(prev[key]) }));

    return {
      change: (key: K, { valid, empty }: FieldValidity, message?: string) =>
        update(key, (snapshot) => ({
          ...snapshot,
          valid,
          empty,
          message,
          reveal: revealOnChange(snapshot.reveal, { valid, empty }, submitCountRef.current),
        })),
      focus: (key: K) => update(key, (snapshot) => ({ ...snapshot, focused: true })),
      blur: (key: K) =>
        update(key, (snapshot) => ({
          ...snapshot,
          focused: false,
          reveal: revealOnBlur(snapshot.reveal, snapshot),
        })),
      rejectAll: (errors: Record<string, string>) =>
        Object.entries(errors).forEach(([key, message]) => {
          if (!isKey(key)) return;

          update(key, (snapshot) => ({
            ...snapshot,
            valid: false,
            message,
            reveal: { ...snapshot.reveal, shown: true },
          }));
        }),
    };
  });

  const fields = mapValues(messages, ({ required, invalid }, key): HostedFieldState => {
    const { valid, empty, focused, message, reveal } = snapshots[key];
    const status = resolveFieldStatus({
      valid,
      empty,
      revealed: isErrorRevealed(reveal, submitCount),
    });

    return {
      status,
      focused,
      filled: !empty,
      error: status === 'error' ? (message ?? (empty ? required : invalid)) : undefined,
    };
  });

  return { fields, isValid: (key: K) => snapshots[key].valid, actions };
};
