import { usePaymentProvidersForm } from '@clubmed/payment-sdk/hooks/usePaymentProviders';
import { TOKENS } from '@clubmed/payment-sdk/types/Tokens';
import { Radio, RadioGroup } from '@clubmed/trident-ui/molecules/Forms/Radios';
import clsx from 'clsx';

import { FormPanel } from './ui/FormPanel';

export const PaymentProviders = () => {
  const { paymentProviders, register, setValue, trigger, watchedProviderId } =
    usePaymentProvidersForm();

  return (
    <FormPanel>
      <RadioGroup className="flex flex-col" value={watchedProviderId}>
        {paymentProviders.map((provider, index) => {
          const isLastProvider = index === paymentProviders.length - 1;

          return (
            <div
              key={provider.id}
              className={clsx(
                'w-full py-24',
                !isLastProvider && 'border-b-1 border-lightGrey',
                index === 0 && 'pt-0',
              )}
            >
              <p className="font-bold mb-32">
                {provider.category_payment_method || provider.description || ''}
              </p>
              <Radio
                {...register('provider_id', {
                  required: 'Vous devez choisir un moyen de paiement',
                })}
                value={provider.id}
                onChange={(_, value) => {
                  setValue('provider_id', value || '');
                  trigger('provider_id');
                }}
              >
                {provider.description}
              </Radio>
            </div>
          );
        })}
      </RadioGroup>
    </FormPanel>
  );
};

PaymentProviders.COMPONENT_KEY = TOKENS.PaymentProviders;
