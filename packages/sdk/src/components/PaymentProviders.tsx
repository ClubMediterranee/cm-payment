import { Icon } from '@clubmed/trident-icons';
import { Radio } from '@clubmed/trident-ui/ui/forms/radios/index';
import clsx from 'clsx';
import { Children, isValidElement, PropsWithChildren } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { PaymentProvider1CategoryPaymentMethod } from '../__generated__/index.schemas';
import { usePaymentProviders } from '../hooks/data/usePaymentProviders';
import { useCapsConfigContext } from '../hooks/utils/useCapsConfigContext';
import { useProviderIntegrationMode } from '../hooks/utils/useProviderIntegrationMode';
import { useWatchedPaymentProvider } from '../hooks/utils/useWatchedPaymentProvider';
import { TOKENS } from '../types/Tokens';
import { getDefaultPaymentConditionId } from '../utils/paymentProviders';
import { BorderlessFormPanels } from './ui/FormPanel';

const PaymentProvidersPanel = ({ children }: PropsWithChildren) => {
  const watchedProvider = useWatchedPaymentProvider();
  const { iframe } = useProviderIntegrationMode();

  const isBuyNowPayLater =
    watchedProvider?.category_payment_method ===
    PaymentProvider1CategoryPaymentMethod.BuyNowPayLater;

  return (
    <BorderlessFormPanels value={!isBuyNowPayLater}>
      <div
        data-cgv-first={isBuyNowPayLater || iframe || undefined}
        className="group/panel flex flex-col gap-40"
      >
        {children}
      </div>
    </BorderlessFormPanels>
  );
};

const isPanel = (child: unknown) => isValidElement(child) && child.type === PaymentProvidersPanel;

export const PaymentProviders = ({
  className,
  children,
}: PropsWithChildren<{ className?: string }>) => {
  const { content } = useCapsConfigContext();
  const {
    data: { paymentProviders },
  } = usePaymentProviders();
  const { control, setValue } = useFormContext();

  const watchedProvider = useWatchedPaymentProvider();

  const isBuyNowPayLater =
    watchedProvider?.category_payment_method ===
    PaymentProvider1CategoryPaymentMethod.BuyNowPayLater;

  const childArray = Children.toArray(children);
  const heading = childArray.filter((child) => !isPanel(child));
  const panel = childArray.filter(isPanel);

  if (isBuyNowPayLater) {
    return panel.length > 0 ? <div className={className}>{panel}</div> : null;
  }

  return (
    <div className={className}>
      {heading}
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
                      setValue('payment_condition_id', getDefaultPaymentConditionId(provider));
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
                  {checked && panel.length > 0 && <div className="px-20 pb-20">{panel}</div>}
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
PaymentProviders.Panel = PaymentProvidersPanel;
PaymentProviders.COMPONENT_KEY = TOKENS.PaymentProviders;
