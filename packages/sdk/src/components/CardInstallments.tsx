import { Select } from '@clubmed/trident-ui/molecules/Forms/Select';
import { useState } from 'react';
import { Controller } from 'react-hook-form';

import { usePaymentSchedule } from '../hooks/data/usePaymentSchedule';
import { useCapsConfigContext } from '../hooks/utils/useCapsConfigContext';
import { useFormContext, useWatch } from '../hooks/utils/useForm';
import { useWatchedPaymentProvider } from '../hooks/utils/useWatchedPaymentProvider';
import { TOKENS } from '../types/Tokens';
import { formatCurrency } from '../utils/formatCurrency';
import { renderTemplate } from '../utils/renderTemplate';
import { FormPanel } from './ui/FormPanel';

export const CardInstallments = () => {
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

  const [selectedCardType, setSelectedCardType] = useState(cardTypes[0]);
  const watchedPaymentConditionId = useWatch('payment_condition_id');

  const handleCardTypeChange = (cardType: string) => {
    setSelectedCardType(cardType);

    const conditions = paymentConditions[cardType];
    if (!conditions?.length) return;

    const currentPaymentCount = Object.values(paymentConditions)
      .flat()
      .find((c) => c?.id === watchedPaymentConditionId)?.payment_count;

    const selectedPaymentConditionId = (
      conditions.find((c) => c.payment_count === currentPaymentCount) ?? conditions[0]
    ).id;

    methods.setValue('payment_condition_id', selectedPaymentConditionId);
  };

  if ((paymentConditions[selectedCardType] || []).length <= 1) return null;

  return (
    <FormPanel className="w-full flex flex-col md:flex-row gap-16">
      <div className="flex-1">
        <Select
          name="payment_method_id"
          value={selectedCardType}
          onChange={(_, val) => handleCardTypeChange(val as string)}
          label={content.cardInstallments.selectCardType}
        >
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
              value={value}
              onChange={(_, val) => onChange(val)}
              label={content.cardInstallments.selectInstallments}
              disabled={!selectedCardType}
              errorMessage={formState.errors.payment_condition_id?.message as string}
            >
              {(paymentConditions[selectedCardType] || []).map(
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
  );
};

const CardInstallmentsSkeleton = () => (
  <FormPanel className="w-full flex flex-col md:flex-row gap-16">
    <div className="flex-1 h-48 bg-grey-light rounded animate-pulse" />
    <div className="flex-1 h-48 bg-grey-light rounded animate-pulse" />
  </FormPanel>
);

CardInstallments.Skeleton = CardInstallmentsSkeleton;
CardInstallments.COMPONENT_KEY = TOKENS.CardInstallments;
