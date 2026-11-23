import { Icon, type IconicNames } from '@clubmed/trident-icons';
import { FormControlError } from '@clubmed/trident-ui/ui/forms/FormControlError';
import clsx from 'clsx';

import type { HostedFieldState } from '../../hooks/useHostedFieldsState';
import { usePspMountPoint } from '../../hooks/utils/usePspMountPoint';

type Props = {
  id: string;
  label: string;
  hint?: string;
  state: HostedFieldState;
  isLoading?: boolean;
  icon?: IconicNames;
  className?: string;
};

const STATUS_ICONS = {
  error: { name: 'CrossDefault', className: 'text-red' },
  success: { name: 'CheckDefault', className: 'text-green' },
} as const;

export const HostedField = ({
  id,
  label,
  hint,
  state: { status, focused, filled, error },
  isLoading = false,
  icon,
  className,
}: Props) => {
  const { ref, slotted } = usePspMountPoint<HTMLFieldSetElement>(id);
  const labelId = `${id}-label`;
  const statusIcon = status === 'default' ? undefined : STATUS_ICONS[status];
  const endIcon = statusIcon ?? (icon && { name: icon, className: 'text-black' });

  return (
    <fieldset
      ref={ref}
      aria-labelledby={labelId}
      className={clsx('w-full min-w-0 flex flex-col gap-4', className)}
    >
      <span
        id={labelId}
        className="HostedField-label text-b3 font-semibold text-black flex flex-wrap items-center ps-20"
      >
        {label}
        {hint && (focused || filled) && (
          <span className="ms-12 text-b4 font-normal text-darkGrey">{hint}</span>
        )}
      </span>

      <div className="relative">
        <div
          id={slotted ? undefined : id}
          className={clsx(
            'h-48 w-full overflow-hidden rounded-pill px-20 py-12 text-b3 text-black inset-ring',
            endIcon && 'pe-52',
            isLoading ? 'animate-pulsation bg-lightGrey pointer-events-none' : 'bg-white',
            focused
              ? 'ring-4 ring-black ring-offset-2'
              : 'focus-within:ring-4 focus-within:ring-black focus-within:ring-offset-2',
            status === 'error'
              ? 'inset-ring-red'
              : status === 'success'
                ? 'inset-ring-green'
                : focused
                  ? 'inset-ring-black'
                  : 'inset-ring-middleGrey focus-within:inset-ring-black',
          )}
        >
          {slotted && <slot name={id} />}
        </div>

        {endIcon && (
          <span
            aria-hidden
            className={clsx(
              'pointer-events-none absolute inset-y-0 inset-e-20 flex items-center',
              endIcon.className,
            )}
          >
            <Icon name={endIcon.name} width="24px" />
          </span>
        )}
      </div>

      {error && <FormControlError role="alert">{error}</FormControlError>}
    </fieldset>
  );
};
