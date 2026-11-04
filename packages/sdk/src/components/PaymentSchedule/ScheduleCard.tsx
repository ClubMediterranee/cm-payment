import { Icon } from '@clubmed/trident-icons';
import type { PropsWithChildren, ReactNode } from 'react';

import { useCapsConfigContext } from '../../hooks/utils/useCapsConfigContext';

export const SCHEDULE_CARD_SIZE = 'min-w-[16rem] flex-[0_1_calc(50%-0.5rem)]';

type ScheduleCardProps = PropsWithChildren<{
  title: ReactNode;
  name: string;
  value: string;
  checked: boolean;
  onChange: (value: string) => void;
  disabled?: boolean;
}>;

export const ScheduleCard = ({
  title,
  name,
  value,
  checked,
  onChange,
  disabled,
  children,
}: ScheduleCardProps) => {
  const { content } = useCapsConfigContext();
  const { select, selected } = content.paymentSchedule.cards;

  return (
    <label
      className={`${SCHEDULE_CARD_SIZE} relative flex flex-col items-center gap-16 rounded-16 border bg-white p-24 text-center has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-black ${
        checked ? 'border-black' : 'border-lightGrey'
      } ${disabled ? 'cursor-not-allowed text-grey' : 'cursor-pointer'}`}
    >
      <input
        type="radio"
        className="sr-only"
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={() => onChange(value)}
      />
      <span className="text-b3 font-bold">{title}</span>
      <div className="flex flex-1 flex-col items-center gap-8">{children}</div>
      <span
        aria-hidden="true"
        className={`inline-flex min-h-40 items-center gap-8 rounded-pill border border-black px-24 py-8 text-b5 font-bold ${
          checked ? 'bg-black text-white' : ''
        }`}
      >
        {checked ? selected : select}
        {checked && <Icon name="CheckDefault" width="1.25rem" />}
      </span>
    </label>
  );
};

export const ScheduleCardSkeleton = () => (
  <div className={`${SCHEDULE_CARD_SIZE} h-[16rem] rounded-16 animate-pulsation bg-lightGrey`} />
);
