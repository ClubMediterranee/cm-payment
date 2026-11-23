import type { PaymentProvidersControllerGetPaymentProviders200BuyNowPayLaterProvidersItem } from '../../../__generated__/bff/index.schemas.js';
import { InfoButton } from '../../../components/ui/InfoButton.js';
import {
  ScheduleCard,
  ScheduleCardSkeleton,
} from '../../../components/PaymentSchedule/ScheduleCard.js';
import { useCapsConfigContext } from '../../../hooks/utils/useCapsConfigContext.js';
import { useWatch } from '../../../hooks/utils/useForm.js';
import { useUplift } from '../hooks/useUplift.js';
import { UpliftStatus } from '../types/Uplift.js';

const getCurrencySymbol = (locale: string, currency: string): string => {
  const formatted = new Intl.NumberFormat(locale, { style: 'currency', currency }).format(0);
  return formatted.replace(/[\d\s,.]/g, '');
};

type UpliftCardProps = {
  provider: PaymentProvidersControllerGetPaymentProviders200BuyNowPayLaterProvidersItem;
  checked: boolean;
  onChange: (value: string) => void;
};

export const UpliftCard = ({ provider, checked, onChange }: UpliftCardProps) => {
  const { content, locale, language } = useCapsConfigContext();
  const watchedAmount = useWatch('amount');
  const watchedCurrency = useWatch('currency');
  const { status } = useUplift();
  const { monthly, moreInformation } = content.paymentSchedule;

  const currencySymbol = getCurrencySymbol(locale, watchedCurrency);
  const isFrench = language === 'fr';
  const priceInCents = Math.round(Number(watchedAmount) * 100);

  const isLoading = status === null;
  const isUnavailable =
    status !== null &&
    [UpliftStatus.OFFER_UNAVAILABLE, UpliftStatus.SERVICE_UNAVAILABLE].includes(status);

  return (
    <>
      {isLoading && <ScheduleCardSkeleton />}

      <div className={isLoading ? 'hidden' : 'contents'}>
        <ScheduleCard
          title={monthly.title}
          description={isUnavailable ? monthly.unavailable : monthly.from}
          value={provider.id}
          checked={checked}
          onChange={onChange}
          disabled={isUnavailable}
        >
          {!isUnavailable && (
            <div className="flex flex-col items-center gap-4">
              <div id="up-pay-monthly-selector" className="text-b1 font-semibold leading-24">
                <span
                  className="flex items-center gap-4"
                  data-up-price-type="total"
                  data-up-price-value={priceInCents}
                >
                  {!isFrench && currencySymbol}
                  <span data-up-from-currency-unit-major=""></span>
                  {isFrench && currencySymbol}
                  <InfoButton
                    data-up-tooltip=""
                    aria-label={`${moreInformation}: ${monthly.title}`}
                  />
                </span>
              </div>
              <p className="text-b5">{monthly.caption}</p>
            </div>
          )}
        </ScheduleCard>
      </div>
    </>
  );
};
