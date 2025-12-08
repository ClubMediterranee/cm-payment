import { usePaymentSchedule } from '@clubmed/payment-sdk/hooks/data/usePaymentSchedule';
import { useCapsConfigContext } from '@clubmed/payment-sdk/hooks/utils/useCapsConfigContext';
import { CapsFormData } from '@clubmed/payment-sdk/types/FormData';
import { TextField } from '@clubmed/trident-ui/molecules/Forms/TextField';
import { useEffect } from 'react';
import { type ControllerRenderProps, type FieldError } from 'react-hook-form';

import { useFormContext, useWatch } from '../../hooks/utils/useForm';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';

type FreeDepositFieldProps = {
  field: ControllerRenderProps<CapsFormData, 'amount'>;
  error?: FieldError;
  isValid?: boolean;
};

export const FreeDepositField = ({ field, error, isValid }: FreeDepositFieldProps) => {
  const { setValue } = useFormContext();
  const { paymentSchedule } = usePaymentSchedule();
  const { content, locale } = useCapsConfigContext();

  const amount = paymentSchedule[0]?.amount;
  const currency = useWatch('currency');
  const deadline = paymentSchedule[0]?.deadline;

  const formattedAmount = formatCurrency({
    amount: Number(amount),
    currency,
    locale,
  });

  useEffect(() => {
    setValue('amount', '', { shouldValidate: false });
  }, [setValue]);

  const validationStatus = isValid ? 'success' : error ? 'error' : 'default';

  return (
    <div className="flex flex-col gap-24">
      <div className="flex justify-between items-center">
        <div>
          <span>
            <span className="text-b3 font-bold">{content.freeDeposit.totalRemaining}</span>
            {deadline && (
              <span className="text-sienna">
                {' '}
                {content.freeDeposit.before} {formatDate(deadline)}
              </span>
            )}
          </span>
        </div>
        <div className="font-bold text-sienna text-b3">{formattedAmount}</div>
      </div>

      <div className="flex flex-col gap-6">
        <TextField
          {...field}
          label={content.freeDeposit.payNowLabel}
          className="!text-b6"
          type="number"
          value={field.value}
          onChange={(_, value) => field.onChange(value)}
          placeholder={content.freeDeposit.placeholder}
          errorMessage={error?.message}
          validationStatus={validationStatus}
          step="0.01"
        />
      </div>
    </div>
  );
};
