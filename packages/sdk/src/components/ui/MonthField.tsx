import clsx from 'clsx';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';

import { ErrorMessage } from './ErrorMessage';
import { FormPanel } from './FormPanel';

type Props = {
  label: string;
  name: string;
  placeholder?: string;
  isLoading?: boolean;
  error?: string;
};

const formatMonthDisplay = (input: string) => {
  const digits = input.replace(/\D/g, '').slice(0, 6);
  if (digits.length === 0) return '';
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)} / ${digits.slice(2)}`;
};

const formatMonthValue = (display: string) => {
  const digits = display.replace(/\D/g, '');
  if (digits.length < 6) return '';
  const month = digits.slice(0, 2);
  const year = digits.slice(2, 6);
  return `${year}-${month}`;
};

export const MonthField = ({ label, name, placeholder, isLoading, error }: Props) => {
  const { setValue } = useFormContext();
  const [displayValue, setDisplayValue] = useState('');

  return (
    <div className="w-full flex flex-col gap-6">
      <span className="font-semibold px-20">{label}</span>

      <FormPanel
        className={clsx(
          'w-full rounded-pill h-48 relative overflow-hidden m-0 min-h-48 py-10 px-20',
          isLoading && 'animate-pulsation bg-lightGrey pointer-events-none',
          error && 'border-red',
        )}
      >
        <input
          name={name}
          type="text"
          disabled={!!isLoading}
          placeholder={isLoading ? '' : placeholder || 'MM / YYYY'}
          inputMode="numeric"
          value={displayValue}
          onChange={(e) => {
            const formatted = formatMonthDisplay(e.target.value);
            setDisplayValue(formatted);

            const formValue = formatMonthValue(formatted);
            setValue(name, formValue || '', { shouldValidate: true, shouldTouch: true });
          }}
          onBlur={() => {
            setValue(name, formatMonthValue(displayValue) || '', {
              shouldValidate: true,
              shouldTouch: true,
            });
          }}
          className="w-full h-full border-none outline-none bg-transparent text-14"
        />
      </FormPanel>

      <ErrorMessage message={error} />
    </div>
  );
};
