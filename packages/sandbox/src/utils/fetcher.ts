import { fetcher as fetchSdk } from '@clubmed/payment-sdk/utils/fetcher.js';

export const fetcher = async <T>(
  opts: {
    url: string;
    method: string;
    headers?: Record<string, string>;
    params?: Record<string, unknown>;
    data?: unknown;
  },
  auth?: { withAuth: boolean },
): Promise<T> => {
  return fetchSdk(opts, auth);
};
