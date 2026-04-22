import { getPaymentConfig } from '../providers/PaymentConfigProvider';

export const fetcher = async <T>({
  baseUrl,
  url,
  method,
  params = {},
  headers,
  data,
}: {
  baseUrl?: string;
  url: string;
  method: string;
  headers?: Record<string, string>;
  params?: Record<string, unknown>;
  data?: unknown;
}): Promise<T> => {
  const {
    locale,
    oidc: { accessToken },
    api: { apiKey },
    paymentGatewayUrl,
  } = getPaymentConfig();

  const queryParams = new URLSearchParams();

  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined) {
      queryParams.append(key, value === null ? 'null' : value.toString());
    }
  });

  const endpoint = `${baseUrl || paymentGatewayUrl || ''}${url}?${queryParams.toString()}`;

  const opts = {
    method,
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      'accept-language': locale,
      ...headers,
    },
    ...(data ? { body: JSON.stringify(data) } : {}),
  };

  const response = await fetch(endpoint, opts);

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.error_description);
  }

  return json;
};
