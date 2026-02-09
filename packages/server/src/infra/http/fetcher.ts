import { constant, inject } from '@tsed/di';

import { ApiClient } from '../api/ApiClient.js';

export const fetcher = async <T>({
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
}): Promise<T> => {
  const callee = 'API';
  const baseURL = constant<string>('CLUBMED_API_URL', '');
  const apiKey = constant<string>('API_KEY');

  const callerHeader = constant<string>('AKAMAI_CALLER_HEADER', 'X-CLUBMED-CALLER');
  const apiClient = inject(ApiClient);

  return apiClient.fetch({
    callee,
    url: baseURL + url,
    method,
    params,
    headers: {
      'x-api-key': apiKey,
      caller: callerHeader,
      ...headers,
    },
    data,
  });
};
