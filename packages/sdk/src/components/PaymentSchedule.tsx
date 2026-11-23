import { Controller } from 'react-hook-form';

import { Action } from '../__generated__/index.schemas';
import { useFormContext } from '../hooks/utils/useForm';
import { TOKENS } from '../types/Tokens';
import { ScheduleCardSkeleton } from './PaymentSchedule/ScheduleCard';
import { ScheduleOptionsField } from './PaymentSchedule/ScheduleOptionsField';

export const PaymentSchedule = ({ className }: { className?: string }) => {
  const { control, getValues } = useFormContext();

  if (getValues('action') === Action.PAYMENT_PARTIAL) {
    return null;
  }

  return (
    <div className={className}>
      <Controller
        name="amount"
        control={control}
        render={({ field }) => <ScheduleOptionsField field={field} />}
      />
    </div>
  );
};

const PaymentScheduleSkeleton = () => (
  <div className="flex flex-wrap justify-center gap-20">
    <ScheduleCardSkeleton />
    <ScheduleCardSkeleton />
  </div>
);

PaymentSchedule.Skeleton = PaymentScheduleSkeleton;
PaymentSchedule.COMPONENT_KEY = TOKENS.PaymentSchedule;
