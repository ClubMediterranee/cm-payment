import { FormControl } from '@clubmed/trident-ui/ui/forms/FormControl';
import clsx from 'clsx';

interface TextareaProps {
  value?: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  errorMessage?: string;
  dataTestId?: string;
}

export const Textarea = ({
  value,
  onChange,
  onBlur,
  placeholder,
  errorMessage,
  dataTestId,
}: TextareaProps) => (
  <FormControl errorMessage={errorMessage} validationStatus={errorMessage ? 'error' : 'default'}>
    <textarea
      rows={4}
      value={value ?? ''}
      onChange={(event) => onChange(event.target.value)}
      onBlur={onBlur}
      placeholder={placeholder}
      data-testid={dataTestId}
      aria-invalid={!!errorMessage}
      className={clsx(
        'text-b3 w-full resize-y rounded-8 bg-white p-16 text-black inset-ring outline-none focus-visible:ring-4 focus-visible:ring-black focus-visible:ring-offset-2',
        errorMessage
          ? 'inset-ring-red'
          : 'inset-ring-middleGrey focus:inset-ring-black active:inset-ring-black',
      )}
    />
  </FormControl>
);
