import { type CapsTheme, useCapsTheme } from '@clubmed/caps';

import { useAppContext } from '../providers/AppProvider';

export const useTheme = (): CapsTheme => {
  const { api, oidc, values } = useAppContext();

  return useCapsTheme({ locale: values.locale, oidc, api });
};
