import { PaymentConfigProvider } from '@clubmed/caps/providers/PaymentConfigProvider.js';
import { PropsWithChildren } from 'react';

import { useAppParams } from '../hooks/useAppParams.js';
import { LoadingPage } from '../pages/LoadingPage.js';

export const AppProvider = ({ children }: PropsWithChildren) => {
  const { paymentGatewayUrl, values, api, oidc } = useAppParams();

  if (!values) {
    return <LoadingPage />;
  }

  return (
    <PaymentConfigProvider
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
    </PaymentConfigProvider>
  );
};
