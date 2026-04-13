import type { OneyPopinOptions } from '../../../types/Oney';

export const getOneyPopinOptions = ({
  payment_amount,
  merchant_id,
  country,
  language,
  payment_mode,
}: {
  payment_amount: number;
  merchant_id: string;
  country: string;
  language: string;
  payment_mode: string;
}) => {
  return {
    payment_amount,
    country,
    language,
    merchant_guid: merchant_id,
    filter_by: 'filters',
    filters: [
      {
        payment_method: 'bnpl',
        payment_method_type: 'split',
        payment_mode,
        is_free: 'false',
        with_down_payment: 'true',
      },
    ],
    hide_logo: true,
  };
};

export const loadOneySimulationPopin = (options: OneyPopinOptions) => {
  if (!window.loadOneyWidget) return;

  window.loadOneyWidget(() => {
    window.oneyMerchantApp?.loadSimulationPopin({ options });
  });
};
