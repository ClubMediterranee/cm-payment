import { OidcIssuerTypes } from '@clubmed/caps';
import { useEffect, useMemo, useState } from 'react';
import { hasAuthParams, useAuth } from 'react-oidc-context';
import { useRoute } from 'wouter';

import { useAppParams } from './useAppParams';

export const useAutoSignin = () => {
  const { oidc: { issuerType } = {} } = useAppParams();
  const isSeller = [OidcIssuerTypes.GO, OidcIssuerTypes.PARTNERS].includes(issuerType!);
  const [isBookingRoute] = useRoute('/*/booking/*');
  const auth = useAuth();
  const [hasInitSignin, setHasInitSignin] = useState(false);

  const isAuthRequired = isBookingRoute || isSeller;

  const isSigningIn = useMemo(
    () =>
      isAuthRequired &&
      !hasAuthParams() &&
      !auth.isAuthenticated &&
      !auth.isLoading &&
      !auth.activeNavigator &&
      !hasInitSignin,
    [isAuthRequired, auth.isAuthenticated, auth.isLoading, auth.activeNavigator, hasInitSignin],
  );

  useEffect(() => {
    if (isSigningIn) {
      auth.signinRedirect({
        state: { return_url: window.location.href },
      });
      setHasInitSignin(true);
    }
  }, [auth, isSigningIn]);

  return { isSigningIn };
};
