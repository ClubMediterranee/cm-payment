import { PropsWithChildren } from 'react';
import { Controller } from 'react-hook-form';

import { Action } from '../__generated__/index.schemas';
import { useFormContext } from '../hooks/utils/useForm';
import { TOKENS } from '../types/Tokens';
import { FreeDepositField } from './PaymentSchedule/FreeDepositField';
import { ScheduleOptionsField } from './PaymentSchedule/ScheduleOptionsField';
import { FormPanel } from './ui/FormPanel';
import { RadioSkeleton } from './ui/skeletons';

export const PaymentSchedule = ({
  className,
  children,
}: PropsWithChildren<{ className?: string }>) => {
  const { control, getValues } = useFormContext();

  const isPartialPayment = getValues('action') === Action.PAYMENT_PARTIAL;

  return (
    <div className={className}>
      {children}
      <FormPanel>
        <Controller
          name="amount"
          control={control}
          render={({ field, fieldState }) => {
            return isPartialPayment ? (
              <FreeDepositField
                field={field}
                error={fieldState.error}
                isValid={fieldState.isTouched && !fieldState.error}
              />
            ) : (
              <ScheduleOptionsField field={field} />
            );
          }}
        />
      </FormPanel>
    </div>
  );
};

const PaymentScheduleSkeleton = () => (
  <FormPanel>
    <div className="flex flex-col">
      <RadioSkeleton className="my-20" />
      <RadioSkeleton className="my-20" />
    </div>
  </FormPanel>
);

PaymentSchedule.Skeleton = PaymentScheduleSkeleton;
PaymentSchedule.COMPONENT_KEY = TOKENS.PaymentSchedule;
