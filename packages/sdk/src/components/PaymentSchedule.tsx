import { TOKENS } from '@clubmed/payment-sdk/types/Tokens';
import { Checkbox } from '@clubmed/trident-ui/molecules/Forms/Checkboxes';
import { useEffect } from 'react';

import { usePaymentSchedule } from '../hooks/data/usePaymentSchedule';
import { useFormContext } from '../hooks/utils/useForm';
import { FormPanel } from './ui/FormPanel';

export const PaymentSchedule = () => {
  const { paymentSchedule } = usePaymentSchedule();
  const { register, setValue, watch } = useFormContext();
  const watchedAmount = watch('amount');

  useEffect(() => {
    setValue('amount', paymentSchedule[0]?.amount || 0);
  }, [paymentSchedule, setValue]);

  return (
    <FormPanel>
      {paymentSchedule.map((props) => {
        return (
          <Checkbox
            key={props.amount}
            value={props.amount}
            {...register('amount')}
            onChange={setValue}
            className="my-20"
            checked={props.amount === watchedAmount}
          >
            Je paie le montant de{' '}
            <span className="font-bold text-sienna mx-4">
              {props.amount} {props.currency}
            </span>
            {'deadline' in props ? ` avant le ${props.deadline}` : ''}
          </Checkbox>
        );
      })}
    </FormPanel>
  );
};

PaymentSchedule.COMPONENT_KEY = TOKENS.PaymentSchedule;
