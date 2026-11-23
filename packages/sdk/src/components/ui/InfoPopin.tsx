import { Button } from '@clubmed/trident-ui/ui/buttons/Button';
import clsx from 'clsx';
import { type PropsWithChildren, type ReactNode, useId, useLayoutEffect, useRef } from 'react';

type InfoPopinProps = PropsWithChildren<{
  isVisible: boolean;
  onClose: () => void;
  closeLabel: string;
  title?: ReactNode;
  media?: ReactNode;
  footer?: ReactNode;
}>;

export const InfoPopin = ({
  isVisible,
  onClose,
  closeLabel,
  title,
  media,
  footer,
  children,
}: InfoPopinProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const contentId = useId();

  useLayoutEffect(() => {
    if (isVisible) dialogRef.current?.showModal();
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={title ? titleId : contentId}
      aria-describedby={title ? contentId : undefined}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => event.target === event.currentTarget && onClose()}
      className="fixed inset-0 m-0 h-full max-h-none w-full max-w-none items-center justify-center bg-transparent p-0 backdrop:bg-white/80 backdrop:backdrop-blur open:flex"
    >
      <div
        className={clsx(
          'relative flex max-h-[90vh] w-full origin-center animate-zoom-in flex-col overflow-hidden rounded-32 bg-white text-center inset-ring inset-ring-lightGrey sm:w-520',
          !media && 'mx-20',
        )}
      >
        {media && <div className="shrink-0">{media}</div>}
        <div
          className={clsx(
            'flex min-h-0 flex-col gap-40 px-20 sm:px-40',
            media ? 'pb-40 pt-20' : 'pb-20 pt-40',
          )}
        >
          <div className="flex flex-col gap-8 overflow-auto text-b3">
            {title && (
              <h2 id={titleId} className="font-serif text-h4 font-bold">
                {title}
              </h2>
            )}
            <div id={contentId}>{children}</div>
          </div>
          {footer ?? (
            <Button
              type="button"
              color="black"
              variant="circle"
              icon="CrossDefault"
              className="mx-auto"
              aria-label={closeLabel}
              onClick={onClose}
            />
          )}
        </div>
      </div>
    </dialog>
  );
};
