import type { ValidationStatus } from '@clubmed/trident-ui/ui/hooks/useInternalStatus';

export type FieldValidity = {
  valid: boolean;
  empty: boolean;
};

export type ErrorReveal = {
  shown: boolean;
  hiddenAt: number;
};

export const hiddenError = (submitCount: number): ErrorReveal => ({
  shown: false,
  hiddenAt: submitCount,
});

export const revealOnChange = (
  reveal: ErrorReveal,
  { valid, empty }: FieldValidity,
  submitCount: number,
): ErrorReveal => (valid || empty ? hiddenError(submitCount) : reveal);

export const revealOnBlur = (reveal: ErrorReveal, { valid, empty }: FieldValidity): ErrorReveal =>
  valid || empty ? reveal : { ...reveal, shown: true };

export const isErrorRevealed = ({ shown, hiddenAt }: ErrorReveal, submitCount: number) =>
  shown || submitCount > hiddenAt;

export const resolveFieldStatus = ({
  valid,
  empty,
  revealed,
  checked = true,
}: FieldValidity & { revealed: boolean; checked?: boolean }): ValidationStatus => {
  if (!valid) return revealed ? 'error' : 'default';

  return !empty && checked ? 'success' : 'default';
};
