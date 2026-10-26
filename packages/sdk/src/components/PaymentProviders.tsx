import { Icon } from '@clubmed/trident-icons';
import { Radio } from '@clubmed/trident-ui/ui/forms/radios/index';
import clsx from 'clsx';
import type { PropsWithChildren } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { PaymentProvider1CategoryPaymentMethod } from '../__generated__/index.schemas';
import { usePaymentProviders } from '../hooks/data/usePaymentProviders';
import { useCapsConfigContext } from '../hooks/utils/useCapsConfigContext';
import { TOKENS } from '../types/Tokens';
import { getDefaultPaymentConditionId } from '../utils/paymentProviders';
import { Title } from './ui/Title';

export const PaymentProviders = ({
  className,
  children,
}: PropsWithChildren<{ className?: string }>) => {
  const { content } = useCapsConfigContext();
  const {
    data: { paymentProviders },
  } = usePaymentProviders();
  const { control, setValue } = useFormContext();

  return (
    <div className={className}>
      <Title variant="section">{content.paymentProviders.heading}</Title>
      <Controller
        name="provider_id"
        control={control}
        render={({ field: { value, onChange, name } }) => (
          <div className="flex flex-col gap-16">
            {paymentProviders.map((provider) => {
              const isCreditCard =
                provider.category_payment_method ===
                PaymentProvider1CategoryPaymentMethod.CreditCard;
              const checked = value === provider.id;
              const logos = provider.configuration?.logos ?? [];

              return (
                <div
                  key={provider.id}
                  className={clsx(
                    'w-full rounded-32 border-2',
                    checked ? 'border-black' : 'border-lightGrey',
                  )}
                >
                  <Radio
                    className="w-full cursor-pointer gap-16 p-20"
                    name={name}
                    value={provider.id}
                    checked={checked}
                    onChange={(_, providerId) => {
                      onChange(providerId);
                      const provider = paymentProviders.find(({ id }) => id === providerId);
                      setValue(
                        'payment_condition_id',
                        getDefaultPaymentConditionId(provider, { unselectedIfMultiple: true }),
                      );
                    }}
                  >
                    <div className="flex flex-1 items-center justify-between gap-16">
                      <div>
                        <p className="font-bold text-b3">{provider.description || ''}</p>
                        {isCreditCard && (
                          <p className="text-b5">
                            {content.paymentProviders.creditCard.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-8">
                        {logos.map((logo) => (
                          <Icon key={logo} name={logo} width="2.5rem" />
                        ))}
                      </div>
                    </div>
                  </Radio>
                  {checked && <div className="px-20 pb-20">{children}</div>}
                </div>
              );
            })}
          </div>
        )}
      />
    </div>
  );
};

const PaymentProvidersSkeleton = () => (
  <div className="flex flex-col gap-16">
    {[1, 2].map((i) => (
      <div key={i} className="h-80 rounded-32 animate-pulsation bg-lightGrey" />
    ))}
  </div>
);

PaymentProviders.Skeleton = PaymentProvidersSkeleton;
PaymentProviders.COMPONENT_KEY = TOKENS.PaymentProviders;
