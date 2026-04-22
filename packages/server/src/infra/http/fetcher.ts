import { constant, context, inject } from '@tsed/di';
import { PlatformContext } from '@tsed/platform-http';

import { HttpClient } from './HttpClient.js';

export const fetcher = async <T>({
  url,
  method,
  params = {},
  data,
}: {
  url: string;
  method: string;
  params?: Record<string, unknown>;
  data?: unknown;
}): Promise<T> => {
  const callee = 'API';
  const baseURL = constant<string>('CLUBMED_API_URL', '');
  const callerHeader = constant<string>('AKAMAI_CALLER_HEADER', 'X-CLUBMED-CALLER');
  const httpClient = inject(HttpClient);

  const $ctx = context<PlatformContext>();
  const acceptLanguage = $ctx?.request.headers['accept-language'];
  const authorization = $ctx?.request.headers.authorization;
  const apiKey = $ctx?.request.headers['x-api-key'];

  return httpClient.fetch({
    callee,
    url: baseURL + url,
    method,
    params,
    headers: {
      'x-api-key': apiKey,
      caller: callerHeader,
      ...(acceptLanguage ? { 'Accept-Language': acceptLanguage } : {}),
      ...(authorization ? { Authorization: authorization } : {}),
    },
    data,
  });
};
