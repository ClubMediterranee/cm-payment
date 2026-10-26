import { Controller } from 'react-hook-form';

import { Action } from '../__generated__/index.schemas';
import { useCapsConfigContext } from '../hooks/utils/useCapsConfigContext';
import { useFormContext } from '../hooks/utils/useForm';
import { TOKENS } from '../types/Tokens';
import { FreeDepositField } from './PaymentSchedule/FreeDepositField';
import { ScheduleCardSkeleton } from './PaymentSchedule/ScheduleCard';
import { ScheduleOptionsField } from './PaymentSchedule/ScheduleOptionsField';
import { FormPanel } from './ui/FormPanel';
import { Title } from './ui/Title';

export const PaymentSchedule = ({ className }: { className?: string }) => {
  const { content } = useCapsConfigContext();
  const { control, getValues } = useFormContext();

  const isPartialPayment = getValues('action') === Action.PAYMENT_PARTIAL;

  return (
    <div className={className}>
      <Title variant="section">{content.paymentSchedule.heading}</Title>
      <Controller
        name="amount"
        control={control}
        render={({ field, fieldState }) => {
          return isPartialPayment ? (
            <FormPanel>
              <FreeDepositField
                field={field}
                error={fieldState.error}
                isValid={fieldState.isTouched && !fieldState.error}
              />
            </FormPanel>
          ) : (
            <ScheduleOptionsField field={field} />
          );
        }}
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
