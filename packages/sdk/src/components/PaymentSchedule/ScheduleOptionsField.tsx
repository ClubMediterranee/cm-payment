import type { ControllerRenderProps } from 'react-hook-form';

import { PaymentProvider1CategoryPaymentMethod } from '../../__generated__/index.schemas';
import { usePaymentProviders } from '../../hooks/data/usePaymentProviders';
import { usePaymentSchedule } from '../../hooks/data/usePaymentSchedule';
import { useCapsConfigContext } from '../../hooks/utils/useCapsConfigContext';
import { useFormContext, useWatch } from '../../hooks/utils/useForm';
import { useDisclosure } from '../../hooks/utils/useDisclosure';
import { useWatchedPaymentProvider } from '../../hooks/utils/useWatchedPaymentProvider';
import type { CapsFormSchema } from '../../schemas/capsFormSchema';
import { getActiveBuyNowPayLaterProviders } from '../../utils/paymentProviders';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { renderTemplate } from '../../utils/renderTemplate';
import { InfoButton } from '../ui/InfoButton';
import { InfoPopin } from '../ui/InfoPopin';
import { Title } from '../ui/Title';
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
  const { full, deposit, moreInformation, close } = content.paymentSchedule;
  const { isOpen: isInfoOpen, onOpen: openInfo, onClose: closeInfo } = useDisclosure();

  const stayAmount = paymentSchedule[0]?.amount?.toString();

  const activeBuyNowPayLaterProviders = getActiveBuyNowPayLaterProviders(
    buyNowPayLaterProviders,
    stayAmount,
  );

  const isBnpl =
    watchedProvider?.category_payment_method ===
    PaymentProvider1CategoryPaymentMethod.BuyNowPayLater;
  const value = isBnpl ? watchedProvider?.id : watchedAmount;
  const isSelectable = paymentSchedule.length + activeBuyNowPayLaterProviders.length > 1;

  const handleScheduleChange = (selectedValue: string) => {
    const isProviderId = isNaN(Number(selectedValue));

    field.onChange(isProviderId ? stayAmount : selectedValue);
    setValue(
      'provider_id',
      isProviderId ? selectedValue : isBnpl ? paymentProviders[0]?.id : watchedProvider?.id || '',
    );
  };

  return (
    <>
      {isSelectable && (
        <Title variant="section" as="h3">
          {content.paymentSchedule.heading}
        </Title>
      )}
      <div className="flex flex-wrap justify-center gap-20">
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
              value={amount?.toString() ?? ''}
              checked={value === amount?.toString()}
              onChange={handleScheduleChange}
              title={isDeposit ? deposit.title : full.title}
              description={
                isDeposit
                  ? renderTemplate(deposit.description, {
                      deposit: <span className="font-semibold">{formattedAmount}</span>,
                      balance: <span className="font-semibold">{formattedBalance}</span>,
                      deadline: <span className="font-semibold">{formatDate(deadline)}</span>,
                    })
                  : full.description
              }
              selectable={isSelectable}
            >
              {isDeposit ? (
                <div className="flex items-center gap-4">
                  <p className="text-b1 font-semibold leading-24">
                    {formattedAmount} + {formattedBalance}
                  </p>
                  {deposit.info && (
                    <InfoButton
                      aria-label={`${moreInformation}: ${deposit.title}`}
                      onClick={openInfo}
                    />
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <p className="text-b1 font-semibold leading-24">{formattedAmount}</p>
                  <p className="text-b5">{full.caption}</p>
                </div>
              )}
            </ScheduleCard>
          );
        })}

        {activeBuyNowPayLaterProviders.map((provider) => (
          <BnplOption
            key={provider.id}
            provider={provider}
            checked={value === provider.id}
            onChange={handleScheduleChange}
          />
        ))}
      </div>

      <InfoPopin isVisible={isInfoOpen} onClose={closeInfo} closeLabel={close}>
        <p>{deposit.info}</p>
      </InfoPopin>
    </>
  );
};
