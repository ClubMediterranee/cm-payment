import type { CapsTheme } from '@clubmed/caps';
import { useSuspenseQuery } from '@tanstack/react-query';

import { paymentConfigControllerGetPaymentConfig } from '../__generated__/bff';
import { useAppContext } from '../providers/AppProvider';

export const useTheme = (): CapsTheme => {
  const { api, oidc, values } = useAppContext();

  const { data } = useSuspenseQuery({
    queryKey: ['theme', api.url, values.locale, oidc.issuerType],
    queryFn: paymentConfigControllerGetPaymentConfig,
    select: ({ settings }) => settings?.theme ?? 'legacy',
  });

  return data;
};
