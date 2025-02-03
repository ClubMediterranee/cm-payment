import { AuthProvider as ReactOidcContext } from "react-oidc-context";
import { PropsWithChildren } from "react";
import Cookies from "js-cookie";
import { getParams } from "../utils/router";

const commonConfig = {
  redirect_uri: `${import.meta.env.VITE_DOMAIN}/signin_redirect`,
  scope: "openid profile email clubmed",
};

const oidcConfig = {
  gm: {
    authority: import.meta.env.VITE_OIDC_CLIENT,
    client_id: import.meta.env.VITE_OIDC_CLIENT_ID,
  },
  go: {
    authority: import.meta.env.VITE_GO_OIDC_CLIENT,
    client_id: import.meta.env.VITE_GO_OIDC_CLIENT_ID,
  },
  partners: {
    authority: import.meta.env.VITE_GO_OIDC_CLIENT,
    client_id: import.meta.env.VITE_GO_OIDC_CLIENT_ID,
  },
};

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const { issuer } = getParams();

  const config = {
    ...(oidcConfig[issuer as keyof typeof oidcConfig] || oidcConfig.gm),
    ...commonConfig,
  };

  return (
    <ReactOidcContext
      {...config}
      onSigninCallback={(u) => {
        console.log(u);
        Cookies.set("neolane_id", u?.state.neolane_id, {
          sameSite: "none",
          secure: true,
        });
        window.location.href = u?.state.return_url;
      }}
    >
      {children}
    </ReactOidcContext>
  );
};
