import { PropsWithChildren } from 'react';
import { twMerge } from 'tailwind-merge';

export const FormPanel = ({ className, children }: PropsWithChildren<{ className?: string }>) => {
  return (
    <div
      className={twMerge(
        'relative isolate rounded-16 overflow-hidden border border-lightGrey p-20 flex flex-col my-20',
        className,
      )}
    >
      {children}
    </div>
  );
};
