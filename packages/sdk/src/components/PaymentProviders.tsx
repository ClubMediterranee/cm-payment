import { usePaymentProvidersForm } from '@clubmed/payment-sdk/hooks/usePaymentProvidersForm';
import { TOKENS } from '@clubmed/payment-sdk/types/Tokens';
import { Icon } from '@clubmed/trident-icons';
import { Radio, RadioGroup } from '@clubmed/trident-ui/molecules/Forms/Radios';
import clsx from 'clsx';
import { useWatch } from 'react-hook-form';

import { usePaymentSchedule } from '../hooks/data/usePaymentSchedule';
import { useSDKConfig } from '../providers/SDKConfigProvider';
import { renderTemplate } from '../utils/renderTemplate';
import { PaymentProviderRules } from './PaymentProviders/PaymentProviderRules';
import { FormPanel } from './ui/FormPanel';

const PROVIDER_ICON = {
  CreditCard: 'CreditCard',
};

export const PaymentProviders = () => {
  const { content } = useSDKConfig();
  const { paymentProviders, register, setValue, watchedProviderId } = usePaymentProvidersForm();
  const {
    paymentSchedule: [{ currency }],
  } = usePaymentSchedule();

  const watchedAmount = useWatch({ name: 'amount' });

  const PROVIDER_LABEL = {
    CreditCard: content.paymentProviders.creditCard.label,
    BankTransfer: content.paymentProviders.bankTransfer.label,
    Paypal: content.paymentProviders.paypal.label,
  };

  return (
    <FormPanel className="p-0">
      <RadioGroup className="flex flex-col pt-12" value={watchedProviderId}>
        {paymentProviders.map((provider, index) => {
          const isLastProvider = index === paymentProviders.length - 1;

          return (
            <div
              key={provider.id}
              className={clsx(
                'w-full p-20 flex justify-between',
                !isLastProvider && 'border-b-1 border-lightGrey',
              )}
            >
              <div>
                <p className="font-bold text-b3">{provider.description || ''}</p>
                {provider.category_payment_method === 'BankTransfer' && (
                  <PaymentProviderRules className="mt-12" />
                )}
                <Radio
                  {...register('provider_id', {
                    required: content.paymentProviders.validation.required,
                  })}
                  className="my-24"
                  value={provider.id}
                  onChange={(_, value) => {
                    setValue('provider_id', value || '');
                  }}
                >
                  {renderTemplate(
                    PROVIDER_LABEL[
                      provider.category_payment_method as keyof typeof PROVIDER_LABEL
                    ] || content.paymentProviders.creditCard.label,
                    {
                      amount: <span className="font-bold text-sienna">{watchedAmount}</span>,
                      currency: <span className="font-bold text-sienna">{currency}</span>,
                    },
                  )}
                </Radio>
              </div>
              <Icon
                name={
                  PROVIDER_ICON[provider.category_payment_method as keyof typeof PROVIDER_ICON] ||
                  ''
                }
                width="80px"
              />
            </div>
          );
        })}
      </RadioGroup>
    </FormPanel>
  );
};

PaymentProviders.COMPONENT_KEY = TOKENS.PaymentProviders;
