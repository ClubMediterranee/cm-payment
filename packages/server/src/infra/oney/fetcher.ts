import { constant, inject } from '@tsed/di';

import { HttpClient } from '../http/HttpClient.js';

export type OneyFetcherOptions = {
  apiKey?: string;
  countryCode?: string;
};

export const oneyFetcher = async <T>(
  {
    url,
    method,
    params = {},
    data,
    headers: requestHeaders,
  }: {
    url: string;
    method: string;
    params?: Record<string, unknown>;
    data?: unknown;
    headers?: Record<string, string>;
  },
  options?: OneyFetcherOptions,
): Promise<T> => {
  const callee = 'ONEY';
  const baseURL = constant<string>('ONEY_API_URL', 'https://api-staging.oney.io');
  const httpClient = inject(HttpClient);

  return httpClient.fetch({
    callee,
    url: baseURL + url,
    method,
    params,
    headers: {
      ...requestHeaders,
      ...(options?.apiKey ? { 'X-Oney-Authorization': options.apiKey } : {}),
      ...(options?.countryCode ? { 'X-Oney-Partner-Country-Code': options.countryCode } : {}),
    },
    data,
  });
};
