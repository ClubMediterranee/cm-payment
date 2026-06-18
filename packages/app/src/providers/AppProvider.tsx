import { PaymentConfigProvider } from '@clubmed/caps';
import { PropsWithChildren } from 'react';

import { useAppParams } from '../hooks/useAppParams.js';
import { LoadingPage } from '../pages/LoadingPage.js';

export const AppProvider = ({ children }: PropsWithChildren) => {
  const params = useAppParams();

  if (!params) {
    return <LoadingPage />;
  }

  const { values, api, oidc } = params;

  return (
    <PaymentConfigProvider
      locale={values.locale}
      proposalId={values.proposalId}
      bookingId={values.bookingId}
      customerId={values.customerId}
      api={api}
      oidc={oidc}
      callbackUrl={values.callbackUrl}
      callbackUrlSeller={values.callbackUrlSeller}
    >
      {children}
    </PaymentConfigProvider>
  );
};
