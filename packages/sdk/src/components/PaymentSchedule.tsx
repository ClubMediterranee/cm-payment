import { Controller } from 'react-hook-form';

import { Action } from '../__generated__/index.schemas';
import { useCapsConfigContext } from '../hooks/utils/useCapsConfigContext';
import { useFormContext } from '../hooks/utils/useForm';
import { TOKENS } from '../types/Tokens';
import { ScheduleCardSkeleton } from './PaymentSchedule/ScheduleCard';
import { ScheduleOptionsField } from './PaymentSchedule/ScheduleOptionsField';
import { Title } from './ui/Title';

export const PaymentSchedule = ({ className }: { className?: string }) => {
  const { content } = useCapsConfigContext();
  const { control, getValues } = useFormContext();

  if (getValues('action') === Action.PAYMENT_PARTIAL) {
    return null;
  }

  return (
    <div className={className}>
      <Title variant="section">{content.paymentSchedule.heading}</Title>
      <Controller
        name="amount"
        control={control}
        render={({ field }) => <ScheduleOptionsField field={field} />}
      />
    </div>
  );
};

const PaymentScheduleSkeleton = () => (
  <div className="flex flex-wrap justify-center gap-16">
    <ScheduleCardSkeleton />
    <ScheduleCardSkeleton />
  </div>
);

PaymentSchedule.Skeleton = PaymentScheduleSkeleton;
PaymentSchedule.COMPONENT_KEY = TOKENS.PaymentSchedule;
