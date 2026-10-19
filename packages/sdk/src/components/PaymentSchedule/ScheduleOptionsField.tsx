import type { ControllerRenderProps } from 'react-hook-form';

import { PaymentProvider1CategoryPaymentMethod } from '../../__generated__/index.schemas';
import { usePaymentProviders } from '../../hooks/data/usePaymentProviders';
import { usePaymentSchedule } from '../../hooks/data/usePaymentSchedule';
import { useCapsConfigContext } from '../../hooks/utils/useCapsConfigContext';
import { useFormContext, useWatch } from '../../hooks/utils/useForm';
import { useWatchedPaymentProvider } from '../../hooks/utils/useWatchedPaymentProvider';
import type { CapsFormSchema } from '../../schemas/capsFormSchema';
import { getActiveBuyNowPayLaterProviders } from '../../utils/paymentProviders';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { renderTemplate } from '../../utils/renderTemplate';
import { BnplOption } from './BnplOption';
import { ScheduleCard } from './ScheduleCard';

type ScheduleOptionsFieldProps = {
  field: ControllerRenderProps<CapsFormSchema, 'amount'>;
};

export const ScheduleOptionsField = ({ field }: ScheduleOptionsFieldProps) => {
  const watchedAmount = useWatch('amount');
  const watchedDonationAmount = useWatch('donation_amount');
  const watchedProvider = useWatchedPaymentProvider();
  const { paymentSchedule } = usePaymentSchedule();

  const { data } = usePaymentProviders();
  const { buyNowPayLaterProviders, paymentProviders } = data;
  const { setValue } = useFormContext();
  const { content, locale } = useCapsConfigContext();
  const { cards } = content.paymentSchedule;

  const stayAmount = paymentSchedule[0]?.amount?.toString();

  const activeBuyNowPayLaterProviders = getActiveBuyNowPayLaterProviders(
    buyNowPayLaterProviders,
    stayAmount,
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
    <div role="radiogroup" className="flex flex-wrap justify-center gap-16">
      {paymentSchedule.map(({ amount, currency, deadline = null, balance }) => {
        const formattedAmount = formatCurrency({
          amount: Number(amount) + Number(watchedDonationAmount || 0),
          currency,
          locale,
        });
        const isDeposit = deadline && balance;
        const formattedBalance = isDeposit
          ? formatCurrency({ amount: Number(balance), currency, locale })
          : null;

        return (
          <ScheduleCard
            key={amount}
            name={field.name}
            value={amount?.toString() ?? ''}
            checked={value === amount?.toString()}
            onChange={handleScheduleChange}
            title={isDeposit ? cards.payInTwo.title : cards.payInFull.title}
          >
            {isDeposit ? (
              <>
                <p className="text-b5">
                  {renderTemplate(cards.payInTwo.description, {
                    deposit: <span className="font-bold">{formattedAmount}</span>,
                    balance: <span className="font-bold">{formattedBalance}</span>,
                    deadline: <span className="font-bold">{formatDate(deadline)}</span>,
                  })}
                </p>
                <p className="text-b2 font-bold">
                  {formattedAmount} + {formattedBalance}
                </p>
              </>
            ) : (
              <>
                <p className="text-b5">{cards.payInFull.description}</p>
                <p className="text-b2 font-bold">{formattedAmount}</p>
                <p className="text-b6">{cards.payInFull.caption}</p>
              </>
            )}
          </ScheduleCard>
        );
      })}

      {activeBuyNowPayLaterProviders.map((provider) => (
        <BnplOption
          key={provider.id}
          provider={provider}
          name={field.name}
          checked={value === provider.id}
          onChange={handleScheduleChange}
        />
      ))}
    </div>
  );
};
