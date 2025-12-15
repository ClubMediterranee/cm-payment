import { TOKENS } from '@clubmed/payment-sdk/types/Tokens';
import { Icon } from '@clubmed/trident-icons';
import { Radio } from '@clubmed/trident-ui/molecules/Forms/Radios';
import clsx from 'clsx';
import { Controller, useFormContext } from 'react-hook-form';

import { PaymentProvider1CategoryPaymentMethod } from '../__generated__/index.schemas';
import { usePaymentProviders } from '../hooks/data/usePaymentProviders';
import { usePaymentSchedule } from '../hooks/data/usePaymentSchedule';
import { useCapsConfigContext } from '../hooks/utils/useCapsConfigContext';
import { useWatch } from '../hooks/utils/useForm';
import { formatCurrency } from '../utils/formatCurrency';
import { renderTemplate } from '../utils/renderTemplate';
import { PaymentProviderRules } from './PaymentProviders/PaymentProviderRules';
import { FormPanel } from './ui/FormPanel';
import { RadioSkeleton } from './ui/skeletons';

const PROVIDER_ICON = {
  [PaymentProvider1CategoryPaymentMethod.CreditCard]: 'CreditCard',
};

export const PaymentProviders = () => {
  const { content, locale } = useCapsConfigContext();
  const { data: paymentProviders } = usePaymentProviders();
  const { control } = useFormContext();

  const {
    paymentSchedule: [{ currency }],
  } = usePaymentSchedule();

  const watchedAmount = useWatch('amount');

  const PROVIDER_LABEL = {
    [PaymentProvider1CategoryPaymentMethod.CreditCard]: content.paymentProviders.creditCard.label,
    [PaymentProvider1CategoryPaymentMethod.BankTransfer]:
      content.paymentProviders.bankTransfer.label,
    [PaymentProvider1CategoryPaymentMethod.Paypal]: content.paymentProviders.paypal.label,
  };

  return (
    <FormPanel className="p-0">
      <Controller
        name="provider_id"
        control={control}
        render={({ field: { value, onChange, name } }) => (
          <div className="flex flex-col pt-12">
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
                    {provider.category_payment_method ===
                      PaymentProvider1CategoryPaymentMethod.BankTransfer && (
                      <PaymentProviderRules className="mt-12" />
                    )}
                    <Radio
                      className="my-24"
                      name={name}
                      value={provider.id}
                      checked={value === provider.id}
                      onChange={(_, providerId) => onChange(providerId)}
                    >
                      {renderTemplate(
                        PROVIDER_LABEL[
                          provider.category_payment_method as keyof typeof PROVIDER_LABEL
                        ] || content.paymentProviders.creditCard.label,
                        {
                          amount: (
                            <span className="font-bold text-sienna">
                              {formatCurrency({ amount: Number(watchedAmount), currency, locale })}
                            </span>
                          ),
                        },
                      )}
                    </Radio>
                  </div>
                  <Icon
                    name={
                      PROVIDER_ICON[
                        provider.category_payment_method as keyof typeof PROVIDER_ICON
                      ] || ''
                    }
                    width="80px"
                  />
                </div>
              );
            })}
          </div>
        )}
      />
    </FormPanel>
  );
};

const PaymentProvidersSkeleton = () => (
  <FormPanel className="p-0">
    <div className="flex flex-col pt-12">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className={clsx(
            'w-full p-20 flex justify-between gap-24',
            i === 1 && 'border-b-1 border-lightGrey',
          )}
        >
          <div className="flex-1">
            <div className="h-16 w-1/2 rounded-8 animate-pulsation bg-lightGrey mb-12" />
            <RadioSkeleton className="my-24" />
          </div>
          <div className="w-80 h-80 rounded-8 animate-pulsation bg-lightGrey" />
        </div>
      ))}
    </div>
  </FormPanel>
);

PaymentProviders.Skeleton = PaymentProvidersSkeleton;
PaymentProviders.COMPONENT_KEY = TOKENS.PaymentProviders;
