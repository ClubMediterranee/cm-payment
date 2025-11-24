import { PropsWithChildren } from 'react';
import { twMerge } from 'tailwind-merge';

export const FormPanel = ({
  className,
  children,
  id,
}: PropsWithChildren<{ className?: string; id?: string }>) => {
  return (
    <div
      id={id}
      className={twMerge(
        'relative isolate rounded-16 overflow-hidden border border-lightGrey p-20 flex flex-col',
        className,
      )}
    >
      {children}
    </div>
  );
};
