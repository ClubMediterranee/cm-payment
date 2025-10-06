import { TOKENS } from '@clubmed/payment-sdk/types/Tokens';
import { Radio, RadioGroup } from '@clubmed/trident-ui/molecules/Forms/Radios';
import { useEffect } from 'react';

import { usePaymentSchedule } from '../hooks/data/usePaymentSchedule';
import { useFormContext } from '../hooks/utils/useForm';
import { FormPanel } from './ui/FormPanel';

export const PaymentSchedule = () => {
  const { paymentSchedule } = usePaymentSchedule();
  const { register, setValue, watch } = useFormContext();
  const watchedAmount = watch('amount');

  useEffect(() => {
    if (paymentSchedule.length > 0 && !watchedAmount) {
      setValue('amount', paymentSchedule[0]?.amount || 0);
    }
  }, [paymentSchedule, setValue, watchedAmount]);

  return (
    <FormPanel>
      <input type="hidden" />
      <RadioGroup className="flex flex-col" value={watchedAmount}>
        {paymentSchedule.map((props, index) => {
          return (
            <Radio
              key={index}
              value={props.amount}
              {...register('amount')}
              onChange={(_, value) => setValue('amount', Number(value) || 0)}
              className="my-20"
            >
              Je paie le montant de{' '}
              <span className="font-bold text-sienna mx-4">
                {props.amount} {props.currency}
              </span>
              {'deadline' in props ? ` avant le ${props.deadline}` : ''}
            </Radio>
          );
        })}
      </RadioGroup>
    </FormPanel>
  );
};

PaymentSchedule.COMPONENT_KEY = TOKENS.PaymentSchedule;
