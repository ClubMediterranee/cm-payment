import { useCallback } from 'react';

import { PspProviders } from '../../../types/PspProviders';
import { useCapsConfigContext } from '../../utils/useCapsConfigContext';
import { useWatch } from '../../utils/useForm';
import { usePaymentProviderSettings } from '../../utils/usePaymentProviderSettings';
import { useScriptLoader } from '../../utils/useScriptLoader';
import { getOneyPopinOptions, loadOneySimulationPopin } from './oney';

export const useOneySimulationPopin = () => {
  const { language, country } = useCapsConfigContext();
  const watchedAmount = useWatch('amount');
  const { merchant_id, payment_mode, script_url } = usePaymentProviderSettings<{
    merchant_id: string;
    payment_mode: string;
    script_url: string;
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
    });

    loadOneySimulationPopin(options);
  }, [isLoaded, watchedAmount, merchant_id, country, language, payment_mode]);

  return { handlePopinClick };
};
