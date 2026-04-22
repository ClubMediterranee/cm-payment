import { Radio, RadioGroup } from '@clubmed/trident-ui/molecules/Forms/Radios';
import type { ControllerRenderProps } from 'react-hook-form';

import { PaymentProvider1CategoryPaymentMethod } from '../../__generated__/index.schemas';
import { usePaymentProviders } from '../../hooks/data/usePaymentProviders';
import { usePaymentSchedule } from '../../hooks/data/usePaymentSchedule';
import { useCapsConfigContext } from '../../hooks/utils/useCapsConfigContext';
import { useFormContext, useWatch } from '../../hooks/utils/useForm';
import { useWatchedPaymentProvider } from '../../hooks/utils/useWatchedPaymentProvider';
import type { CapsFormSchema } from '../../schemas/capsFormSchema';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { renderTemplate } from '../../utils/renderTemplate';
import { BnplOption } from './BnplOption';

type ScheduleOptionsFieldProps = {
  field: ControllerRenderProps<CapsFormSchema, 'amount'>;
};

export const ScheduleOptionsField = ({ field }: ScheduleOptionsFieldProps) => {
  const watchedAmount = useWatch('amount');
  const watchedProvider = useWatchedPaymentProvider();
  const { paymentSchedule } = usePaymentSchedule();

  const { data } = usePaymentProviders();
  const { buyNowPayLaterProviders, paymentProviders } = data;
  const { setValue } = useFormContext();
  const { content, locale } = useCapsConfigContext();

  const stayAmount = paymentSchedule[0]?.amount?.toString();

  const activeBuyNowPayLaterProviders = buyNowPayLaterProviders.filter(
    ({
      configuration: {
        settings: { max_amount },
      },
    }) => !max_amount || Number(max_amount) >= Number(stayAmount),
  );

  const isBnpl =
    watchedProvider?.category_payment_method ===
    PaymentProvider1CategoryPaymentMethod.BuyNowPayLater;
  const value = isBnpl ? watchedProvider?.id : watchedAmount;

  const handleScheduleChange = (selectedValue: string) => {
    const isProviderId = isNaN(Number(selectedValue));

    field.onChange(isProviderId ? stayAmount : selectedValue);
    setValue(
      'provider_id',
      isProviderId ? selectedValue : isBnpl ? paymentProviders[0]?.id : watchedProvider?.id || '',
    );
  };

  return (
    <div className="flex flex-col py-12">
      <RadioGroup
        className="flex flex-col gap-32"
        value={value}
        name={field.name}
        onChange={(_, val) => handleScheduleChange(val)}
      >
        {paymentSchedule.map(({ amount, currency, deadline = null, balance }) => {
          const formattedCurrency = formatCurrency({
            amount: Number(amount),
            currency,
            locale,
          });
          return (
            <Radio key={amount} value={amount?.toString()}>
              {deadline && balance
                ? renderTemplate(content.paymentSchedule.payDeposit, {
                    amount: <span className="font-bold text-sienna">{formattedCurrency}</span>,
                    deadline: <span className="font-bold">{formatDate(deadline)}</span>,
                    balance: (
                      <span className="font-bold text-sienna">
                        {formatCurrency({
                          amount: Number(balance),
                          currency,
                          locale,
                        })}
                      </span>
                    ),
                  })
                : renderTemplate(content.paymentSchedule.payFullAmount, {
                    amount: <span className="font-bold text-sienna">{formattedCurrency}</span>,
                  })}
            </Radio>
          );
        })}
      </RadioGroup>

      <div className="flex flex-col gap-32">
        {activeBuyNowPayLaterProviders.map((provider) => (
          <BnplOption
            key={provider.id}
            provider={provider}
            name={field.name}
            onChange={handleScheduleChange}
          />
        ))}
      </div>
    </div>
  );
};
