import { User } from "oidc-client-ts";
import { getParams } from "./router";

export function getAccessToken() {
  const { issuer } = getParams();
  const storageKey =
    issuer === "gm"
      ? `oidc.user:${import.meta.env.VITE_OIDC_CLIENT}:${import.meta.env.VITE_OIDC_CLIENT_ID}`
      : `oidc.user:${import.meta.env.VITE_GO_OIDC_CLIENT}:${import.meta.env.VITE_GO_OIDC_CLIENT_ID}`;

  const oidcStorage = sessionStorage.getItem(storageKey);

  if (!oidcStorage) {
    return "";
  }

  return User.fromStorageString(oidcStorage).access_token;
}

export const getApiKey = () => {
  const { issuer } = getParams();
  return issuer === "gm"
    ? import.meta.env.VITE_API_KEY
    : import.meta.env.VITE_SELLER_API_KEY;
};

export const fetcher = async <T>(
  path: string,
  init?: RequestInit & { withAuth?: boolean }
): Promise<T> => {
  const accessToken = getAccessToken();
  const { locale } = getParams();

  const response = await fetch(
    `${import.meta.env.VITE_API_ENDPOINT}${path}?api_key=${getApiKey()}`,
    {
      method: "GET",
      ...init,
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        ...init?.headers,
        ...(init?.withAuth && accessToken
          ? { Authorization: `Bearer ${accessToken}` }
          : {}),
        "accept-language": locale || "fr-FR",
      },
    }
  );

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.errors[0].error_description);
  }

  return json;
};
