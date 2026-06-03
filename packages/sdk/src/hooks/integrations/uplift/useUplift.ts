import { useEffect, useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';

import { PspProviders } from '../../../types/PspProviders';
import { UpliftChangeEvent, UpliftStatus } from '../../../types/Uplift';
import { useCapsConfigContext } from '../../utils/useCapsConfigContext';
import { useWatch } from '../../utils/useForm';
import { usePaymentProviderSettings } from '../../utils/usePaymentProviderSettings';
import { loadUplift } from './up';
import { useUpliftOrder } from './useUpliftOrder';

export const useUplift = () => {
  const [data, setData] = useState<UpliftChangeEvent | null>(null);
  const { locale } = useCapsConfigContext();
  const { setValue } = useFormContext();
  const { code, api_key } = usePaymentProviderSettings<{ code: string; api_key: string }>(
    PspProviders.MUPLIFT,
  );
  const watchedCurrency = useWatch('currency');
  const order = useUpliftOrder();

  useEffect(() => {
    switch (data?.status) {
      case UpliftStatus.TOKEN_AVAILABLE:
        window.Uplift?.Payments.getToken();
        break;
      case UpliftStatus.TOKEN_RETRIEVED:
        setValue(
          'token',
          { value: data.token?.card_token, status: 'success' },
          { shouldValidate: true },
        );
        break;
    }
  }, [data]);

  const configuration = useMemo(
    () => ({
      apiKey: api_key,
      locale,
      currency: watchedCurrency,
      checkout: true,
      channel: 'desktop',
      container: '#uplift-container',
      onChange: setData,
    }),
    [api_key, locale, watchedCurrency],
  );

  useEffect(() => {
    if (!code || !order) return;

    const initUplift = () => {
      if (!window.Uplift) return;

      window.Uplift.Payments.init(configuration);
      window.Uplift?.Payments?.load(order);
    };

    loadUplift(code);
    window.upReady = initUplift;
  }, [code, api_key, locale, watchedCurrency, order, configuration]);

  useEffect(() => {
    return () => {
      window.Uplift?.Payments.exit();
      window.Uplift?.Payments.clear();
    };
  }, []);

  return { status: data?.status ?? null };
};
