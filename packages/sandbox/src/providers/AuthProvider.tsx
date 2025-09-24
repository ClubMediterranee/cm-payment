import {AuthProvider as ReactOidcContext} from "react-oidc-context";
import {PropsWithChildren} from "react";
import {useAuthParams} from "../hooks/useAuthParams.js";

export const AuthProvider = ({children}: PropsWithChildren) => {
  const {
    oidc,
    onSigninCallback
  } = useAuthParams();

  return (
    <ReactOidcContext
      {...oidc}
      onSigninCallback={onSigninCallback}
    >
      {children}
    </ReactOidcContext>
  );
};
