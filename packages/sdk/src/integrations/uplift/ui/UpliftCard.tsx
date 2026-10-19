import { Icon } from '@clubmed/trident-icons';

import type { PaymentProvidersControllerGetPaymentProviders200BuyNowPayLaterProvidersItem } from '../../../__generated__/bff/index.schemas.js';
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
  name: string;
  checked: boolean;
  onChange: (value: string) => void;
};

export const UpliftCard = ({ provider, name, checked, onChange }: UpliftCardProps) => {
  const { content, locale, language } = useCapsConfigContext();
  const watchedAmount = useWatch('amount');
  const watchedCurrency = useWatch('currency');
  const { status } = useUplift();
  const { payMonthly } = content.paymentSchedule.cards;

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
          title={payMonthly.title}
          name={name}
          value={provider.id}
          checked={checked}
          onChange={onChange}
          disabled={isUnavailable}
        >
          {isUnavailable ? (
            <p className="text-b5">{content.paymentSchedule.buyNowPayLater.unavailable}</p>
          ) : (
            <>
              <p className="text-b5">{payMonthly.from}</p>
              <div id="up-pay-monthly-selector" className="text-b2 font-bold">
                <span
                  className="flex items-center gap-4 cursor-pointer"
                  data-up-price-type="total"
                  data-up-price-value={priceInCents}
                >
                  {!isFrench && currencySymbol}
                  <span data-up-from-currency-unit-major=""></span>
                  {isFrench && currencySymbol}
                  <span data-up-tooltip="" className="cursor-pointer">
                    <Icon name="Information" width="1.5rem" />
                  </span>
                </span>
              </div>
              <p className="text-b6">{payMonthly.caption}</p>
            </>
          )}
        </ScheduleCard>
      </div>
    </>
  );
};
