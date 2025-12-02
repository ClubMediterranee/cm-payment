import { TOKENS } from '@clubmed/payment-sdk/types/Tokens';
import { Controller } from 'react-hook-form';

import { Action } from '../__generated__';
import { usePaymentSchedule } from '../hooks/data/usePaymentSchedule';
import { useCapsConfigContext } from '../hooks/utils/useCapsConfigContext';
import { useFormContext } from '../hooks/utils/useForm';
import { FreeDepositField } from './PaymentSchedule/FreeDepositField';
import { ScheduleOptionsField } from './PaymentSchedule/ScheduleOptionsField';
import { FormPanel } from './ui/FormPanel';
import { RadioSkeleton } from './ui/skeletons';

export const PaymentSchedule = () => {
  const { paymentSchedule } = usePaymentSchedule();
  const { content } = useCapsConfigContext();
  const { control, getValues } = useFormContext();

  const isPartialPayment = getValues('action') === Action.PAYMENT_PARTIAL;
  const amount = paymentSchedule[0]?.amount || 0;

  return (
    <FormPanel>
      <Controller
        name="amount"
        control={control}
        rules={
          isPartialPayment
            ? {
                required: content.freeDeposit.validation.required,
                validate: {
                  positive: (value) => {
                    return parseFloat(value) > 0 || content.freeDeposit.validation.positive;
                  },
                  max: (value) =>
                    parseFloat(value) <= amount || content.freeDeposit.validation.maxExceeded,
                },
              }
            : {}
        }
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
