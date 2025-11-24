import { TOKENS } from '@clubmed/payment-sdk/types/Tokens';
import { Radio, RadioGroup } from '@clubmed/trident-ui/molecules/Forms/Radios';

import { usePaymentSchedule } from '../hooks/data/usePaymentSchedule';
import { useCapsConfigContext } from '../hooks/utils/useCapsConfigContext';
import { useFormContext } from '../hooks/utils/useForm';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';
import { renderTemplate } from '../utils/renderTemplate';
import { FormPanel } from './ui/FormPanel';
import { RadioSkeleton } from './ui/skeletons';

export const PaymentSchedule = () => {
  const { paymentSchedule } = usePaymentSchedule();
  const { content, locale } = useCapsConfigContext();
  const { register, setValue, watch } = useFormContext();
  const watchedAmount = watch('amount');

  return (
    <FormPanel>
      <RadioGroup className="flex flex-col" value={watchedAmount}>
        {paymentSchedule.map(({ amount, currency, deadline = null, balance }) => {
          const formattedCurrency = formatCurrency({
            amount: Number(amount),
            currency,
            locale,
          });
          return (
            <div key={amount}>
              <Radio
                className="my-20"
                {...register('amount')}
                onChange={(_, value) => setValue('amount', value || '')}
                value={amount?.toString()}
              >
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
            </div>
          );
        })}
      </RadioGroup>
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
