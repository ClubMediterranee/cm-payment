import type { BadRequestErrorModel, BadRequestModel } from '../__generated__/index.schemas';
import { getPaymentConfig } from '../providers/PaymentConfigProvider';

type ErrorNode = BadRequestModel | BadRequestErrorModel;

function findDeepestError(errors?: ErrorNode[]): ErrorNode | undefined {
  if (!Array.isArray(errors) || errors.length === 0) return undefined;
  const first = errors[0] as BadRequestModel;
  return findDeepestError(first.errors) ?? first;
}

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
    oidc: { accessToken, issuerType },
    api: { apiKey, url: baseApiUrl },
  } = getPaymentConfig();

  const queryParams = new URLSearchParams();

  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined) {
      queryParams.append(key, value === null ? 'null' : value.toString());
    }
  });

  const endpoint = `${baseUrl || baseApiUrl || ''}${url}?${queryParams.toString()}`;

  const opts = {
    method,
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      'accept-language': locale,
      'x-issuer-type': issuerType,
      ...headers,
    },
    ...(data ? { body: JSON.stringify(data) } : {}),
  };

  const response = await fetch(endpoint, opts);

  const json = await response.json();

  if (!response.ok) {
    const deepest = findDeepestError(json.errors);
    const errorDescription = deepest?.error_description ?? json.message;

    throw new Error(errorDescription);
  }

  return json;
};
