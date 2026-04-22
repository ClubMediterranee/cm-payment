import { OidcIssuerTypes } from '@clubmed/caps';

const commonConfig = {
  scope: 'openid profile email clubmed',
};

const DOMAIN = window.location.origin;

export const AppSettings = {
  url: DOMAIN,
  api: {
    [OidcIssuerTypes.GM]: {
      apiKey: import.meta.env.VITE_API_KEY,
    },
    [OidcIssuerTypes.GO]: {
      apiKey: import.meta.env.VITE_SELLER_API_KEY,
    },
    [OidcIssuerTypes.PARTNERS]: {
      apiKey: import.meta.env.VITE_SELLER_API_KEY,
    },
  },
  oidc: {
    [OidcIssuerTypes.GM]: {
      authority: import.meta.env.VITE_GM_OIDC_URL,
      client_id: import.meta.env.VITE_GM_OIDC_CLIENT_ID,
      redirect_uri: `${DOMAIN}/gm/signin_redirect`,
      ...commonConfig,
    },
    [OidcIssuerTypes.GO]: {
      authority: import.meta.env.VITE_GO_OIDC_URL,
      client_id: import.meta.env.VITE_GO_OIDC_CLIENT_ID,
      redirect_uri: `${DOMAIN}/go/signin_redirect`,
      ...commonConfig,
    },
    [OidcIssuerTypes.PARTNERS]: {
      authority: import.meta.env.VITE_GO_OIDC_URL,
      client_id: import.meta.env.VITE_GO_OIDC_CLIENT_ID,
      redirect_uri: `${DOMAIN}/partners/signin_redirect`,
      ...commonConfig,
    },
  },
};
