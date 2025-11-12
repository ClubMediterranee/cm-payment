import { CapsConfigProvider } from '@clubmed/payment-sdk/providers/CapsConfigProvider.js';
import { PropsWithChildren } from 'react';

import { useAppParams } from '../hooks/useAppParams.js';
import { LoadingPage } from '../pages/LoadingPage.js';

export const AppProvider = ({ children }: PropsWithChildren) => {
  const { url, values, api, oidc, callbackUrl } = useAppParams();

  if (!values) {
    return <LoadingPage />;
  }

  return (
    <CapsConfigProvider
      url={url}
      locale={values.locale}
      proposalId={values.proposalId}
      bookingId={values.bookingId}
      customerId={values.customerId}
      api={api}
      oidc={oidc}
      callbackUrl={callbackUrl}
    >
      {children}
    </CapsConfigProvider>
  );
};
