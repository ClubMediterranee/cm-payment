import { usePaymentProvidersCheckboxes } from '@clubmed/payment-sdk/hooks/usePaymentProvidersCheckboxes';
import { TOKENS } from '@clubmed/payment-sdk/types/Tokens';
import { Checkbox } from '@clubmed/trident-ui/molecules/Forms/Checkboxes';
import clsx from 'clsx';

import { FormPanel } from './ui/FormPanel';

export const PaymentProvidersCheckboxes = () => {
  const { paymentProviders, register, setValue, trigger, watchedProviderId } =
    usePaymentProvidersCheckboxes();

  return (
    <FormPanel>
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
            <Checkbox
              {...register('provider_id', {
                required: 'Vous devez choisir un moyen de paiement',
              })}
              value={provider.id}
              checked={provider.id === watchedProviderId}
              onChange={(name, value) => {
                setValue(name, value ? provider.id : undefined);
                trigger(name);
              }}
            >
              {provider.description}
            </Checkbox>
          </div>
        );
      })}
    </FormPanel>
  );
};

PaymentProvidersCheckboxes.COMPONENT_KEY = TOKENS.PaymentProviders;
