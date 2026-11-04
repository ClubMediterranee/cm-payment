import type { MouseEvent, ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { useFormSubmit } from '../../contexts/FormSubmitContext';

type SlotProps = { target?: HTMLElement | null; children: ReactNode };

export function FormSlot({ target, children }: SlotProps) {
  return target ? createPortal(children, target) : <>{children}</>;
}

export function SubmitSlot({ target, children }: SlotProps) {
  const { onSubmit } = useFormSubmit();

  const onClickCapture = (event: MouseEvent<HTMLDivElement>) => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>(
      'button[type="submit"]',
    );

    if (button && !button.form) {
      event.preventDefault();
      onSubmit();
    }
  };

  return (
    <FormSlot target={target}>
      {target ? (
        <div className="flex flex-col" onClickCapture={onClickCapture}>
          {children}
        </div>
      ) : (
        children
      )}
    </FormSlot>
  );
}
