import { createContext, PropsWithChildren, useContext } from 'react';

import { useAppParams } from '../hooks/useAppParams.js';
import { LoadingPage } from '../pages/LoadingPage.js';
import { setFetcherConfig } from '../utils/fetcher.js';

type AppParams = NonNullable<ReturnType<typeof useAppParams>>;

const AppContext = createContext<AppParams | null>(null);

export const AppProvider = ({ children }: PropsWithChildren) => {
  const params = useAppParams();

  if (!params) {
    return <LoadingPage />;
  }

  setFetcherConfig({ locale: params.values.locale, oidc: params.oidc, api: params.api });

  return <AppContext.Provider value={params}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const params = useContext(AppContext);

  if (!params) {
    throw new Error('useAppContext must be used within an AppProvider');
  }

  const { bookingId, proposalId } = params.values;

  return {
    ...params,
    id: (bookingId ?? proposalId) as string | undefined,
    type: bookingId ? ('booking' as const) : ('proposal' as const),
  };
};
