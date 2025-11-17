import { TOKENS } from '@clubmed/payment-sdk/types/Tokens';
import { Radio, RadioGroup } from '@clubmed/trident-ui/molecules/Forms/Radios';
import { useEffect } from 'react';

import { usePaymentSchedule } from '../hooks/data/usePaymentSchedule';
import { useFormContext } from '../hooks/utils/useForm';
import { useSDKConfig } from '../providers/SDKConfigProvider';
import { renderTemplate } from '../utils/renderTemplate';
import { FormPanel } from './ui/FormPanel';

export const PaymentSchedule = () => {
  const { paymentSchedule, isSuccess } = usePaymentSchedule();
  const { content } = useSDKConfig();
  const { register, setValue, watch } = useFormContext();
  const watchedAmount = watch('amount');

  useEffect(() => {
    if (isSuccess && paymentSchedule.length > 0) {
      setValue('amount', (paymentSchedule[0]?.amount ?? '').toString());
    }
  }, [isSuccess, paymentSchedule, setValue]);

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
                  amount: <span className="font-bold text-sienna">{amount}</span>,
                  currency: <span className="font-bold text-sienna">{currency}</span>,
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
