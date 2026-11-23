import { ValidatedTextField } from './ValidatedTextField';

type Props = {
  label: string;
  placeholder?: string;
  hint?: string;
  isLoading?: boolean;
  className?: string;
};

export const formatMonth = (input: string) => {
  const digits = input.replace(/\D/g, '').slice(0, 6);

  if (digits.length > 4) return `${digits.slice(0, 4)} / ${digits.slice(4)}`;
  if (digits.length === 4 && /\d\s*\/\s*$/.test(input) && !/ \/$/.test(input)) {
    return `${digits} / `;
  }

  return digits;
};

export const MonthField = (props: Props) => (
  <ValidatedTextField
    {...props}
    name="creditCard.expiryDate"
    inputMode="numeric"
    autoComplete="cc-exp"
    formatter={formatMonth}
  />
);
