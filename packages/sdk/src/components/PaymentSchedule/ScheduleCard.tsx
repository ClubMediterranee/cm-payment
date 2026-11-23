import { Button } from '@clubmed/trident-ui/ui/buttons/Button';
import clsx from 'clsx';
import { type PropsWithChildren, type ReactNode, useId } from 'react';

import { useCapsConfigContext } from '../../hooks/utils/useCapsConfigContext';

const SCHEDULE_CARD_SIZE = 'w-full max-w-370 md:w-370';

type ScheduleCardProps = PropsWithChildren<{
  title: ReactNode;
  description?: ReactNode;
  value: string;
  checked: boolean;
  onChange: (value: string) => void;
  disabled?: boolean;
  selectable?: boolean;
}>;

export const ScheduleCard = ({
  title,
  description,
  value,
  checked,
  onChange,
  disabled,
  selectable = true,
  children,
}: ScheduleCardProps) => {
  const { content } = useCapsConfigContext();
  const { select, selected } = content.paymentSchedule;
  const titleId = useId();

  return (
    <div
      className={clsx(
        SCHEDULE_CARD_SIZE,
        'flex flex-col items-center rounded-32 bg-white p-20 text-center md:min-h-272',
        checked || !selectable
          ? 'inset-ring-2 inset-ring-black'
          : 'inset-ring inset-ring-lightGrey',
        selectable ? 'justify-between gap-20' : 'justify-center gap-32',
        disabled && 'text-grey',
      )}
    >
      <div className="flex w-full flex-col items-center gap-4">
        <p id={titleId} className="text-b2 font-semibold">
          {title}
        </p>
        {description && <p className="text-b3">{description}</p>}
      </div>
      {children}
      {selectable && (
        <Button
          variant="pill"
          color="black"
          theme={checked ? 'solid' : 'outline'}
          icon={checked ? 'CheckDefault' : undefined}
          aria-pressed={checked}
          aria-describedby={titleId}
          disabled={disabled}
          className="min-w-200 whitespace-nowrap"
          onClick={() => onChange(value)}
        >
          {checked ? selected : select}
        </Button>
      )}
    </div>
  );
};

export const ScheduleCardSkeleton = () => (
  <div className={`${SCHEDULE_CARD_SIZE} h-272 rounded-32 animate-pulsation bg-lightGrey`} />
);
