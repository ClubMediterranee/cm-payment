import { getSDKPaymentOptions } from '@clubmed/payment-sdk/providers/SDKConfigProvider.js';

export const fetcher = async <T>(
  {
    url,
    method,
    params = {},
    headers,
    data,
  }: {
    url: string;
    method: string;
    headers?: Record<string, string>;
    params?: Record<string, unknown>;
    data?: unknown;
  },
  auth?: { withAuth: boolean },
): Promise<T> => {
  const withAuth = auth?.withAuth || false;
  const {
    locale,
    oidc: { accessToken },
    api: { url: apiUrl, apiKey },
  } = getSDKPaymentOptions();

  if (withAuth && !accessToken) {
    throw new Error('No access token provided');
  }

  const pathParams = new URLSearchParams();

  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined) {
      pathParams.append(key, value === null ? 'null' : value.toString());
    }
  });

  const endpoint = `${apiUrl}${url}?${pathParams.toString()}`;

  const opts = {
    method,
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      ...(withAuth && accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(data ? { body: JSON.stringify(data) } : {}),
      'accept-language': locale,
      ...headers,
    },
  };

  const response = await fetch(endpoint, opts);

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.errors[0].error_description);
  }

  return json;
};
