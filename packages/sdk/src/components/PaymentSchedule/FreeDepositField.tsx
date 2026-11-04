import { TextField } from '@clubmed/trident-ui/ui/forms/TextField';
import { useController } from 'react-hook-form';

import { usePaymentSchedule } from '../../hooks/data/usePaymentSchedule';
import { useCapsConfigContext } from '../../hooks/utils/useCapsConfigContext';
import { useWatch } from '../../hooks/utils/useForm';
import { type CapsFormSchema } from '../../schemas/capsFormSchema';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';

export const FreeDepositField = () => {
  const { field, fieldState } = useController<CapsFormSchema, 'amount'>({ name: 'amount' });
  const { paymentSchedule } = usePaymentSchedule();
  const { content, locale } = useCapsConfigContext();

  const amount = paymentSchedule[0]?.amount;
  const currency = useWatch('currency');
  const donationAmount = useWatch('donation_amount');
  const deadline = paymentSchedule[0]?.deadline;

  const formattedAmount = formatCurrency({
    amount: Number(amount) + Number(donationAmount || 0),
    currency,
    locale,
  });

  return (
    <div className="flex flex-col gap-24">
      <div className="flex flex-col gap-4">
        <p className="flex items-baseline gap-8">
          <span className="text-b3 font-bold">{content.freeDeposit.totalRemaining}</span>
          <span className="text-b2 font-bold">{formattedAmount}</span>
        </p>
        {deadline && (
          <p className="text-b4">
            {content.freeDeposit.before} {formatDate(deadline)}
          </p>
        )}
      </div>

      <TextField
        {...field}
        label={content.freeDeposit.payNowLabel}
        className="text-b6"
        type="number"
        onChange={(_, value) => field.onChange(value)}
        placeholder={content.freeDeposit.placeholder}
        errorMessage={fieldState.error?.message}
        validationStatus={
          fieldState.isTouched && !fieldState.error
            ? 'success'
            : fieldState.error
              ? 'error'
              : 'default'
        }
        step="0.01"
      />
    </div>
  );
};
