import { TOKENS } from '@clubmed/payment-sdk/types/Tokens';
import { Radio, RadioGroup } from '@clubmed/trident-ui/molecules/Forms/Radios';

import { usePaymentSchedule } from '../hooks/data/usePaymentSchedule';
import { useCapsConfigContext } from '../hooks/utils/useCapsConfigContext';
import { useFormContext } from '../hooks/utils/useForm';
import { formatCurrency } from '../utils/formatCurrency';
import { renderTemplate } from '../utils/renderTemplate';
import { FormPanel } from './ui/FormPanel';

export const PaymentSchedule = () => {
  const { paymentSchedule } = usePaymentSchedule();
  const { content, locale } = useCapsConfigContext();
  const { register, setValue, watch } = useFormContext();
  const watchedAmount = watch('amount');

  return (
    <FormPanel>
      <RadioGroup className="flex flex-col" value={watchedAmount}>
        {paymentSchedule.map(({ amount, currency, deadline = null }) => {
          return (
            <div key={amount}>
              <Radio
                className="my-20"
                {...register('amount')}
                onChange={(_, value) => setValue('amount', value || '')}
                value={amount?.toString()}
              >
                {renderTemplate(content.paymentSchedule.payAmount, {
                  amount: (
                    <span className="font-bold text-sienna">
                      {formatCurrency({ amount: Number(amount), currency, locale })}
                    </span>
                  ),
                })}
                {deadline && renderTemplate(content.paymentSchedule.deadline, { deadline })}
              </Radio>
            </div>
          );
        })}
      </RadioGroup>
    </FormPanel>
  );
};

PaymentSchedule.COMPONENT_KEY = TOKENS.PaymentSchedule;
