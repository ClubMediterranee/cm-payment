import { useEffect, useMemo, useState } from 'react';
import { hasAuthParams, useAuth } from 'react-oidc-context';
import { useRoute } from 'wouter';

export const useAutoSignin = () => {
  const [isAuthRequired] = useRoute('/*/booking/*');
  const auth = useAuth();
  const [hasInitSignin, setHasInitSignin] = useState(false);

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
