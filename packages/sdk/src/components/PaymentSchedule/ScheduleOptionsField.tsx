import { Radio, RadioGroup } from '@clubmed/trident-ui/molecules/Forms/Radios';
import type { ControllerRenderProps } from 'react-hook-form';

import { usePaymentSchedule } from '../../hooks/data/usePaymentSchedule';
import { useCapsConfigContext } from '../../hooks/utils/useCapsConfigContext';
import { useWatch } from '../../hooks/utils/useForm';
import type { CapsFormSchema } from '../../schemas/capsFormSchema';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { renderTemplate } from '../../utils/renderTemplate';

type ScheduleOptionsFieldProps = {
  field: ControllerRenderProps<CapsFormSchema, 'amount'>;
};

export const ScheduleOptionsField = ({ field }: ScheduleOptionsFieldProps) => {
  const watchedAmount = useWatch('amount');
  const { paymentSchedule } = usePaymentSchedule();
  const { content, locale } = useCapsConfigContext();

  return (
    <RadioGroup
      className="flex flex-col"
      value={watchedAmount}
      name={field.name}
      onChange={(_, value) => field.onChange(value)}
    >
      {paymentSchedule.map(({ amount, currency, deadline = null, balance }) => {
        const formattedCurrency = formatCurrency({
          amount: Number(amount),
          currency,
          locale,
        });
        return (
          <Radio key={amount} className="my-20" value={amount?.toString()}>
            {deadline && balance
              ? renderTemplate(content.paymentSchedule.payDeposit, {
                  amount: <span className="font-bold text-sienna">{formattedCurrency}</span>,
                  deadline: <span className="font-bold">{formatDate(deadline)}</span>,
                  balance: (
                    <span className="font-bold text-sienna">
                      {formatCurrency({
                        amount: Number(balance),
                        currency,
                        locale,
                      })}
                    </span>
                  ),
                })
              : renderTemplate(content.paymentSchedule.payFullAmount, {
                  amount: <span className="font-bold text-sienna">{formattedCurrency}</span>,
                })}
          </Radio>
        );
      })}
    </RadioGroup>
  );
};
