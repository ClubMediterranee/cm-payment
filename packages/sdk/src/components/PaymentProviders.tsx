import { usePaymentProvidersForm } from '@clubmed/payment-sdk/hooks/usePaymentProvidersForm';
import { TOKENS } from '@clubmed/payment-sdk/types/Tokens';
import { Radio, RadioGroup } from '@clubmed/trident-ui/molecules/Forms/Radios';
import clsx from 'clsx';
import { useFormContext } from 'react-hook-form';

import { FormPanel } from './ui/FormPanel';

export const PaymentProviders = () => {
  const { paymentProviders, register, setValue, trigger, watchedProviderId } =
    usePaymentProvidersForm();
  const { watch } = useFormContext();

  const watchedAmount = watch('amount');

  return (
    <FormPanel className="p-0">
      <RadioGroup className="flex flex-col gap-0" value={watchedProviderId}>
        {paymentProviders.map((provider, index) => {
          const isLastProvider = index === paymentProviders.length - 1;

          return (
            <div
              key={provider.id}
              className={clsx('w-full p-20', !isLastProvider && 'border-b-1 border-lightGrey')}
            >
              <p className="font-bold text-18 pb-32">{provider.description || ''}</p>
              <Radio
                {...register('provider_id', {
                  required: 'Vous devez choisir un moyen de paiement',
                })}
                className="mb-24"
                value={provider.id}
                onChange={(_, value) => {
                  setValue('provider_id', value || '');
                  trigger('provider_id');
                }}
              >
                <div>
                  {provider.description} la somme de{' '}
                  <span className="font-bold text-sienna">{watchedAmount}</span>
                </div>
              </Radio>
            </div>
          );
        })}
      </RadioGroup>
    </FormPanel>
  );
};

PaymentProviders.COMPONENT_KEY = TOKENS.PaymentProviders;
