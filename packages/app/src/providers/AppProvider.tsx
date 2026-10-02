import { PaymentConfigProvider } from '@clubmed/caps';
import { PropsWithChildren } from 'react';

import { getTokenSubject } from '../embedded/embeddedParams.js';
import { useEmbedded } from '../embedded/EmbeddedProvider.js';
import { useAppParams } from '../hooks/useAppParams.js';
import { LoadingPage } from '../pages/LoadingPage.js';

export const AppProvider = ({ children }: PropsWithChildren) => {
  const params = useAppParams();
  const embedded = useEmbedded();

  if (!params) {
    return <LoadingPage />;
  }

  const { values, api, oidc } = params;
  const hostToken = embedded.active ? embedded.hostToken : undefined;
  const isEmbeddedAllowed = embedded.active && embedded.status === 'allowed';
  const customerId =
    values.customerId ??
    (hostToken && oidc.issuerType === 'GM' ? getTokenSubject(hostToken) : undefined);

  return (
    <PaymentConfigProvider
      locale={values.locale}
      proposalId={values.proposalId}
      bookingId={values.bookingId}
      customerId={customerId}
      api={api}
      oidc={hostToken ? { ...oidc, accessToken: hostToken } : oidc}
      content={isEmbeddedAllowed ? embedded.content : undefined}
      onNavigate={isEmbeddedAllowed ? embedded.navigate : undefined}
      callbackUrl={values.callbackUrl}
      callbackUrlSeller={values.callbackUrlSeller}
    >
      {children}
    </PaymentConfigProvider>
  );
};
