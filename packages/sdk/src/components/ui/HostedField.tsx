import clsx from 'clsx';

import { ErrorMessage } from './ErrorMessage';
import { FormPanel } from './FormPanel';

type Props = {
  error?: string;
  label: string;
  id: string;
  isLoading?: boolean;
};

export const HostedField = ({ error, label, id, isLoading }: Props) => {
  return (
    <div className="w-full flex flex-col gap-6">
      <span className="font-semibold px-20">{label}</span>

      <FormPanel
        className={clsx(
          'w-full rounded-pill h-48 relative overflow-hidden py-2 m-0',
          isLoading && 'animate-pulsation bg-lightGrey pointer-events-none',
          error && 'border-red',
        )}
      >
        <div id={id} className="inset-0" />
      </FormPanel>

      <ErrorMessage message={error} />
    </div>
  );
};
