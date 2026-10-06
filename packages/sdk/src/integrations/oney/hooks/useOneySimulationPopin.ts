import { useCallback } from 'react';

import { PspProviders } from '../../../types/PspProviders.js';
import { useCapsConfigContext } from '../../../hooks/utils/useCapsConfigContext.js';
import { useWatch } from '../../../hooks/utils/useForm.js';
import { usePaymentProviderSettings } from '../../../hooks/utils/usePaymentProviderSettings.js';
import { useScriptLoader } from '../../../hooks/utils/useScriptLoader.js';
import { getOneyPopinOptions, loadOneySimulationPopin } from './oney.js';

export const useOneySimulationPopin = () => {
  const { language, country } = useCapsConfigContext();
  const watchedAmount = useWatch('amount');
  const { merchant_id, payment_mode, script_url, is_free } = usePaymentProviderSettings<{
    merchant_id: string;
    payment_mode: string;
    script_url: string;
    is_free: boolean;
  }>(PspProviders.EHIPAYBNPL);

  const { isLoaded } = useScriptLoader(script_url);

  const handlePopinClick = useCallback(() => {
    if (!isLoaded) return;

    const options = getOneyPopinOptions({
      payment_amount: Number(watchedAmount),
      merchant_id,
      country,
      language,
      payment_mode,
      is_free: String(is_free),
    });

    loadOneySimulationPopin(options);
  }, [isLoaded, watchedAmount, merchant_id, country, language, payment_mode, is_free]);

  return { handlePopinClick };
};
