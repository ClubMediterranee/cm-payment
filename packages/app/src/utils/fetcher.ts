import { fetcher as fetchSdk } from '@clubmed/payment-sdk/utils/fetcher.js';

export const fetcher = async <T>(opts: {
  url: string;
  method: string;
  headers?: Record<string, string>;
  params?: Record<string, unknown>;
  data?: unknown;
}): Promise<T> => {
  return fetchSdk(opts);
};
