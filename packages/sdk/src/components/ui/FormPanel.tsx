import { createContext, PropsWithChildren, useContext } from 'react';
import { twMerge } from 'tailwind-merge';

const BorderlessFormPanelContext = createContext(false);

export const BorderlessFormPanels = BorderlessFormPanelContext.Provider;

export const FormPanel = ({
  className,
  children,
  id,
}: PropsWithChildren<{ className?: string; id?: string }>) => {
  const borderless = useContext(BorderlessFormPanelContext);

  return (
    <div
      id={id}
      className={twMerge(
        'relative isolate rounded-16 overflow-hidden border border-lightGrey p-20 flex flex-col',
        borderless && 'overflow-visible rounded-none border-0 p-0',
        className,
      )}
    >
      {children}
    </div>
  );
};
