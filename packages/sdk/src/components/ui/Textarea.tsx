import { FormControl } from '@clubmed/trident-ui/molecules/Forms/FormControl';
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
        'text-b3 w-full resize-y rounded-8 border p-16 outline-none',
        errorMessage ? 'border-red' : 'border-lightGrey focus:border-black',
      )}
    />
  </FormControl>
);
