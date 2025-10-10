import { PropsWithChildren } from 'react';

export const FormPanel = ({ className, children }: PropsWithChildren<{ className?: string }>) => {
  return (
    <div
      className={`relative isolate rounded-16 overflow-hidden border border-lightGrey p-20 flex flex-col my-20 ${className || ''}`}
    >
      {children}
    </div>
  );
};
