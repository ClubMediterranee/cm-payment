import { Icon } from '@clubmed/trident-icons';
import { Radio } from '@clubmed/trident-ui/ui/forms/radios/index';
import clsx from 'clsx';
import { type PropsWithChildren, useId } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { PaymentProvider1CategoryPaymentMethod } from '../__generated__/index.schemas';
import { usePaymentProviders } from '../hooks/data/usePaymentProviders';
import { useCapsConfigContext } from '../hooks/utils/useCapsConfigContext';
import { TOKENS } from '../types/Tokens';
import { getDefaultPaymentConditionId } from '../utils/paymentProviders';
import { Title } from './ui/Title';

type PaymentProvidersProps = PropsWithChildren<{
  className?: string;
  alwaysSelectable?: boolean;
}>;

export const PaymentProviders = ({
  className,
  alwaysSelectable = false,
  children,
}: PaymentProvidersProps) => {
  const { content } = useCapsConfigContext();
  const {
    data: { paymentProviders },
  } = usePaymentProviders();
  const { control, setValue } = useFormContext();
  const idPrefix = useId();
  const isSingle = paymentProviders.length === 1 && !alwaysSelectable;

  return (
    <div className={className}>
      <Title as="h3" variant="section" className="text-h5 md:text-h4">
        {content.paymentProviders.heading}
      </Title>
      <Controller
        name="provider_id"
        control={control}
        render={({ field: { value, onChange, name } }) => {
          const select = (providerId: string) => {
            onChange(providerId);
            setValue(
              'payment_condition_id',
              getDefaultPaymentConditionId(
                paymentProviders.find(({ id }) => id === providerId),
                { unselectedIfMultiple: true },
              ),
            );
          };

          return (
            <ul
              role={isSingle ? undefined : 'radiogroup'}
              aria-label={isSingle ? undefined : content.paymentProviders.heading}
              className="flex flex-col gap-12"
            >
              {paymentProviders.map((provider) => {
                const isCreditCard =
                  provider.category_payment_method ===
                  PaymentProvider1CategoryPaymentMethod.CreditCard;
                const checked = isSingle || value === provider.id;
                const logos = provider.configuration?.logos ?? [];
                const nameId = `${idPrefix}-${provider.id}-name`;
                const descriptionId = `${idPrefix}-${provider.id}-description`;

                return (
                  <li
                    key={provider.id}
                    onClick={checked ? undefined : () => select(provider.id)}
                    className={clsx(
                      'flex w-full flex-col gap-40 rounded-32 bg-white p-20',
                      checked
                        ? 'inset-ring-2 inset-ring-black'
                        : 'cursor-pointer inset-ring inset-ring-lightGrey',
                    )}
                  >
                    <div className="flex w-full flex-col items-center gap-20 md:min-h-70 md:flex-row md:gap-40">
                      <div className="flex flex-1 flex-col items-center gap-20 text-center md:flex-row md:items-start md:text-left">
                        {!isSingle && (
                          <Radio
                            name={name}
                            value={provider.id}
                            checked={checked}
                            aria-labelledby={nameId}
                            aria-describedby={isCreditCard ? descriptionId : undefined}
                            onChange={(_, providerId) => select(providerId)}
                          />
                        )}
                        <div className="flex flex-col gap-4">
                          <p id={nameId} className="text-b2 font-semibold">
                            {provider.description}
                          </p>
                          {isCreditCard && (
                            <p id={descriptionId} className="text-b3">
                              {content.paymentProviders.creditCard.description}
                            </p>
                          )}
                        </div>
                      </div>
                      {logos.length > 0 && (
                        <div className="flex items-center md:justify-end" aria-hidden>
                          {logos.map((logo) => (
                            <span key={logo} className="flex size-70 items-center justify-center">
                              <Icon name={logo} width="55px" />
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    {checked && <div className="flex w-full flex-col">{children}</div>}
                  </li>
                );
              })}
            </ul>
          );
        }}
      />
    </div>
  );
};

const PaymentProvidersSkeleton = () => (
  <div className="flex flex-col gap-12">
    {[1, 2].map((i) => (
      <div key={i} className="h-80 rounded-32 animate-pulsation bg-lightGrey" />
    ))}
  </div>
);

PaymentProviders.Skeleton = PaymentProvidersSkeleton;
PaymentProviders.COMPONENT_KEY = TOKENS.PaymentProviders;
