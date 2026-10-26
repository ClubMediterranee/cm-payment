import { Select } from '@clubmed/trident-ui/ui/forms/Select';
import { PropsWithChildren, useState } from 'react';
import { Controller } from 'react-hook-form';

import { usePaymentSchedule } from '../hooks/data/usePaymentSchedule';
import { useCapsConfigContext } from '../hooks/utils/useCapsConfigContext';
import { useFormContext, useWatch } from '../hooks/utils/useForm';
import { useWatchedPaymentProvider } from '../hooks/utils/useWatchedPaymentProvider';
import { TOKENS } from '../types/Tokens';
import { formatCurrency } from '../utils/formatCurrency';
import { hasMultiplePaymentConditions } from '../utils/paymentProviders';
import { renderTemplate } from '../utils/renderTemplate';
import { FormPanel } from './ui/FormPanel';

const CardInstallmentsFields = ({
  className,
  children,
}: PropsWithChildren<{ className?: string }>) => {
  const { content, locale } = useCapsConfigContext();
  const watchedProvider = useWatchedPaymentProvider();
  const paymentConditions = watchedProvider?.payment_conditions || {};

  const cardTypes = Object.keys(paymentConditions);
  const methods = useFormContext();
  const { control, formState } = methods;

  const {
    paymentSchedule: [{ currency }],
  } = usePaymentSchedule();

  const amount = useWatch('amount');
  const watchedPaymentConditionId = useWatch('payment_condition_id');

  const [selectedCardType, setSelectedCardType] = useState(
    cardTypes.find((cardType) =>
      paymentConditions[cardType]?.some(({ id }) => id === watchedPaymentConditionId),
    ) ?? '',
  );

  const handleCardTypeChange = (cardType: string) => {
    setSelectedCardType(cardType);

    const currentPaymentCount = Object.values(paymentConditions)
      .flat()
      .find((c) => c?.id === watchedPaymentConditionId)?.payment_count;

    methods.setValue(
      'payment_condition_id',
      paymentConditions[cardType]?.find((c) => c.payment_count === currentPaymentCount)?.id ?? '',
    );
  };

  if (!hasMultiplePaymentConditions(watchedProvider)) return null;

  return (
    <div className={className}>
      {children}
      <FormPanel className="w-full flex flex-col md:flex-row gap-16">
        <div className="flex-1">
          <Select
            name="payment_method_id"
            value={selectedCardType}
            onChange={(_, val) => handleCardTypeChange(val as string)}
            label={content.cardInstallments.selectCardType}
          >
            <option value="" disabled>
              {content.cardInstallments.placeholder}
            </option>
            {cardTypes.map((label) => (
              <option key={label} value={label}>
                {label}
              </option>
            ))}
          </Select>
        </div>

        <div className="flex-1">
          <Controller
            name="payment_condition_id"
            control={control}
            render={({ field: { value, onChange, name } }) => (
              <Select
                name={name}
                value={value ?? ''}
                onChange={(_, val) => onChange(val)}
                label={content.cardInstallments.selectInstallments}
                disabled={!selectedCardType}
                errorMessage={formState.errors.payment_condition_id?.message as string}
              >
                <option value="" disabled>
                  {content.cardInstallments.placeholder}
                </option>
                {(paymentConditions[selectedCardType] ?? []).map(
                  ({ payment_count: count, id: timeConditionId }) => {
                    const amountPerInstallment = Number(amount) / (count || 0);

                    return (
                      <option key={timeConditionId} value={timeConditionId}>
                        {renderTemplate(
                          content.cardInstallments.installmentLabel,
                          {
                            count,
                            amount: formatCurrency({
                              amount: amountPerInstallment,
                              currency,
                              locale,
                            }),
                          },
                          { asFragment: true },
                        )}
                      </option>
                    );
                  },
                )}
              </Select>
            )}
          />
        </div>
      </FormPanel>
    </div>
  );
};

export const CardInstallments = (props: PropsWithChildren<{ className?: string }>) => {
  const providerId = useWatch('provider_id');

  return <CardInstallmentsFields key={providerId} {...props} />;
};

const CardInstallmentsSkeleton = () => (
  <FormPanel className="w-full flex flex-col md:flex-row gap-16">
    <div className="flex-1 h-48 bg-grey-light rounded animate-pulse" />
    <div className="flex-1 h-48 bg-grey-light rounded animate-pulse" />
  </FormPanel>
);

CardInstallments.Skeleton = CardInstallmentsSkeleton;
CardInstallments.COMPONENT_KEY = TOKENS.CardInstallments;
