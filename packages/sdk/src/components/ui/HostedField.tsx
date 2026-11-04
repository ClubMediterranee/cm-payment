import clsx from 'clsx';
import { ReactNode } from 'react';

import { usePspMountPoint } from '../../hooks/utils/usePspMountPoint';
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
  const { ref, slotted } = usePspMountPoint(id);

  return (
    <div ref={ref} className="w-full flex flex-col gap-6">
      <span className="font-semibold px-20">{label}</span>

      <FormPanel
        id={slotted ? undefined : id}
        className={clsx(
          'text-b3 rounded-pill w-full border overflow-hidden px-20 py-12 font-normal outline-none focus-visible:ring-4 focus-visible:ring-black focus-visible:ring-offset-2 h-48 border-middleGrey focus:border-black active:border-black bg-white text-black',
          isLoading && 'animate-pulsation bg-lightGrey pointer-events-none',
          error && 'border-red',
        )}
      >
        {slotted ? <slot name={id} /> : children}
      </FormPanel>

      <ErrorMessage message={error} />
    </div>
  );
};
