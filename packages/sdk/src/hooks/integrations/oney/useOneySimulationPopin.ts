import { useCallback } from 'react';

import { useCapsConfigContext } from '../../utils/useCapsConfigContext';
import { useWatch } from '../../utils/useForm';
import { useScriptLoader } from '../../utils/useScriptLoader';
import { useWatchedPaymentProvider } from '../../utils/useWatchedPaymentProvider';
import { getOneyPopinOptions, loadOneySimulationPopin } from './oney';

export const useOneySimulationPopin = () => {
  const { language, country } = useCapsConfigContext();
  const watchedAmount = useWatch('amount');
  const provider = useWatchedPaymentProvider();
  const { merchant_id, payment_mode, script_url } = provider?.configuration?.settings || {};

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
