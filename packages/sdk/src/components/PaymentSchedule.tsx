import { TOKENS } from '@clubmed/payment-sdk/types/Tokens';
import { Radio, RadioGroup } from '@clubmed/trident-ui/molecules/Forms/Radios';
import { useEffect } from 'react';

import { usePaymentSchedule } from '../hooks/data/usePaymentSchedule';
import { useFormContext } from '../hooks/utils/useForm';
import { FormPanel } from './ui/FormPanel';

export const PaymentSchedule = () => {
  const { paymentSchedule, isSuccess } = usePaymentSchedule();
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
                Je paie le montant de{' '}
                <span className="font-bold text-sienna mx-4">
                  {amount} {currency}
                </span>
                {deadline ? ` avant le ${deadline}` : ''}
              </Radio>
            </div>
          );
        })}
      </RadioGroup>
    </FormPanel>
  );
};

PaymentSchedule.COMPONENT_KEY = TOKENS.PaymentSchedule;
