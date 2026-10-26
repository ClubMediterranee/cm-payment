import type { PaymentProvidersControllerGetPaymentProviders200PaymentProvidersItem as PaymentProviderItem } from '../__generated__/bff/index.schemas';

export const hasMultiplePaymentConditions = (provider?: PaymentProviderItem) =>
  Object.values(provider?.payment_conditions ?? {}).flat().length > 1;

export const getDefaultPaymentConditionId = (
  provider?: PaymentProviderItem,
  { unselectedIfMultiple = false } = {},
) => {
  if (!provider?.payment_conditions) return undefined;
  if (unselectedIfMultiple && hasMultiplePaymentConditions(provider)) return '';
  return Object.values(provider.payment_conditions)[0]?.[0]?.id;
};

export const getActiveBuyNowPayLaterProviders = (
  providers: PaymentProviderItem[],
  stayAmount?: string,
) =>
  providers.filter(
    ({
      configuration: {
        settings: { max_amount },
      },
    }) => !max_amount || Number(max_amount) >= Number(stayAmount),
  );

type DefaultSelectionParams = {
  stepper?: boolean;
  isPartial: boolean;
  paymentSchedule: { amount?: number }[];
  paymentProviders: PaymentProviderItem[];
  buyNowPayLaterProviders: PaymentProviderItem[];
};

export const getDefaultSelection = ({
  stepper,
  isPartial,
  paymentSchedule,
  paymentProviders,
  buyNowPayLaterProviders,
}: DefaultSelectionParams) => {
  const stayAmount = paymentSchedule[0]?.amount?.toString();
  const hasScheduleChoice =
    !!stepper &&
    !isPartial &&
    (paymentSchedule.length > 1 ||
      getActiveBuyNowPayLaterProviders(buyNowPayLaterProviders, stayAmount).length > 0);

  return {
    amount: hasScheduleChoice ? '' : stayAmount || '',
    provider: stepper && paymentProviders.length > 1 ? undefined : paymentProviders[0],
  };
};
