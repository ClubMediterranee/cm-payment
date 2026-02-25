import clsx from 'clsx';
import { ReactNode } from 'react';

import { ErrorMessage } from './ErrorMessage';
import { FormPanel } from './FormPanel';

type Props = {
  error?: string;
  label: string;
  id?: string;
  isLoading?: boolean;
  children?: ReactNode;
};

export const HostedField = ({ error, label, id, isLoading, children }: Props) => {
  return (
    <div className="w-full flex flex-col gap-6">
      <span className="font-semibold px-20">{label}</span>

      <FormPanel
        id={id}
        className={clsx(
          'w-full rounded-pill h-48 relative overflow-hidden m-0 min-h-48 py-10',
          isLoading && 'animate-pulsation bg-lightGrey pointer-events-none',
          error && 'border-red',
        )}
      >
        {children}
      </FormPanel>

      <ErrorMessage message={error} />
    </div>
  );
};
