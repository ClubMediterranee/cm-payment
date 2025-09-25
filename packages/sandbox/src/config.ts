import { OidcIssuerTypes } from '@clubmed/payment-sdk/types/SDKOptions.js';

const commonConfig = {
  scope: 'openid profile email clubmed',
};

export const AppSettings = {
  url: import.meta.env.VITE_DOMAIN,
  api: {
    [OidcIssuerTypes.GM]: {
      url: import.meta.env.VITE_API_ENDPOINT,
      apiKey: import.meta.env.VITE_API_KEY,
    },
    [OidcIssuerTypes.GO]: {
      url: import.meta.env.VITE_API_ENDPOINT,
      apiKey: import.meta.env.VITE_SELLER_API_KEY,
    },
    [OidcIssuerTypes.PARTNERS]: {
      url: import.meta.env.VITE_API_ENDPOINT,
      apiKey: import.meta.env.VITE_SELLER_API_KEY,
    },
  },
  oidc: {
    [OidcIssuerTypes.GM]: {
      authority: import.meta.env.VITE_GM_OIDC_URL,
      client_id: import.meta.env.VITE_GM_OIDC_CLIENT_ID,
      redirect_uri: `${import.meta.env.VITE_DOMAIN}/gm/signin_redirect`,
      ...commonConfig,
    },
    [OidcIssuerTypes.GO]: {
      authority: import.meta.env.VITE_GO_OIDC_URL,
      client_id: import.meta.env.VITE_GO_OIDC_CLIENT_ID,
      redirect_uri: `${import.meta.env.VITE_DOMAIN}/go/signin_redirect`,
      ...commonConfig,
    },
    [OidcIssuerTypes.PARTNERS]: {
      authority: import.meta.env.VITE_GO_OIDC_URL,
      client_id: import.meta.env.VITE_GO_OIDC_CLIENT_ID,
      redirect_uri: `${import.meta.env.VITE_DOMAIN}/partners/signin_redirect`,
      ...commonConfig,
    },
  },
};
