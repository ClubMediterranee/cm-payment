import { TOKENS } from '@clubmed/payment-sdk/types/Tokens';
import { Controller } from 'react-hook-form';

import { Action } from '../__generated__/index.schemas';
import { useFormContext } from '../hooks/utils/useForm';
import { FreeDepositField } from './PaymentSchedule/FreeDepositField';
import { ScheduleOptionsField } from './PaymentSchedule/ScheduleOptionsField';
import { FormPanel } from './ui/FormPanel';
import { RadioSkeleton } from './ui/skeletons';

export const PaymentSchedule = () => {
  const { control, getValues } = useFormContext();

  const isPartialPayment = getValues('action') === Action.PAYMENT_PARTIAL;

  return (
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
