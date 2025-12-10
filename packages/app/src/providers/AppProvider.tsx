import { CapsConfigProvider } from '@clubmed/payment-sdk/providers/CapsConfigProvider.js';
import { PropsWithChildren } from 'react';

import { useAppParams } from '../hooks/useAppParams.js';
import { LoadingPage } from '../pages/LoadingPage.js';

export const AppProvider = ({ children }: PropsWithChildren) => {
  const { paymentGatewayUrl, values, api, oidc } = useAppParams();

  if (!values) {
    return <LoadingPage />;
  }

  return (
    <CapsConfigProvider
      paymentGatewayUrl={paymentGatewayUrl}
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
    </CapsConfigProvider>
  );
};
