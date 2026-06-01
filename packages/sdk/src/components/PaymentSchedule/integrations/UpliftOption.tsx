import { Icon } from '@clubmed/trident-icons';
import { Radio } from '@clubmed/trident-ui/molecules/Forms/Radios';

import type { PaymentProvidersControllerGetPaymentProviders200BuyNowPayLaterProvidersItem } from '../../../__generated__/bff/index.schemas';
import { useUplift } from '../../../hooks/integrations/uplift/useUplift';
import { useCapsConfigContext } from '../../../hooks/utils/useCapsConfigContext';
import { useWatch } from '../../../hooks/utils/useForm';
import { UpliftStatus } from '../../../types/Uplift';
import { renderTemplate } from '../../../utils/renderTemplate';
import { RadioSkeleton } from '../../ui/skeletons';

const getCurrencySymbol = (locale: string, currency: string): string => {
  const formatted = new Intl.NumberFormat(locale, { style: 'currency', currency }).format(0);
  return formatted.replace(/[\d\s,.]/g, '');
};

type UpliftOptionProps = {
  provider: PaymentProvidersControllerGetPaymentProviders200BuyNowPayLaterProvidersItem;
  name: string;
  onChange: (value: string) => void;
};

export const UpliftOption = ({ provider, name, onChange }: UpliftOptionProps) => {
  const { content, locale, language } = useCapsConfigContext();
  const watchedAmount = useWatch('amount');
  const watchedCurrency = useWatch('currency');
  const { status } = useUplift();

  const currencySymbol = getCurrencySymbol(locale, watchedCurrency);
  const isFrench = language === 'fr';
  const priceInCents = Math.round(Number(watchedAmount) * 100);

  const isLoading = status === null;
  const isUnavailable =
    status !== null &&
    [UpliftStatus.OFFER_UNAVAILABLE, UpliftStatus.SERVICE_UNAVAILABLE].includes(status);

  return (
    <>
      {isLoading && <RadioSkeleton />}

      <div className={isLoading ? 'hidden' : ''}>
        <Radio
          value={provider.id}
          name={name}
          onChange={() => onChange(provider.id)}
          disabled={isUnavailable}
        >
          {isUnavailable ? (
            <span>{content.paymentSchedule.buyNowPayLater.unavailable}</span>
          ) : (
            <div id="up-pay-monthly-selector" className="flex items-center gap-4">
              {renderTemplate(content.paymentSchedule.buyNowPayLater.priceLabel, {
                price: (
                  <span
                    className="font-bold text-sienna cursor-pointer flex gap-12"
                    data-up-price-type="total"
                    data-up-price-value={priceInCents}
                  >
                    {!isFrench && currencySymbol}
                    <span data-up-from-currency-unit-major=""></span>
                    {isFrench && `${currencySymbol}/mo`}
                    <span data-up-tooltip="" className="cursor-pointer">
                      <Icon name="Information" width="1.5rem" />
                    </span>
                  </span>
                ),
              })}
            </div>
          )}
        </Radio>
      </div>
    </>
  );
};
