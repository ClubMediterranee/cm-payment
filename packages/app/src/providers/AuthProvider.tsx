import { WebStorageStateStore } from 'oidc-client-ts';
import { PropsWithChildren } from 'react';
import { AuthProvider as ReactOidcContext } from 'react-oidc-context';

import { useAuthParams } from '../hooks/useAuthParams.js';

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const { oidc, onSigninCallback } = useAuthParams();

  return (
    <ReactOidcContext
      {...oidc}
      userStore={
        new WebStorageStateStore({
          store: localStorage,
        })
      }
      onSigninCallback={onSigninCallback}
    >
      {children}
    </ReactOidcContext>
  );
};
