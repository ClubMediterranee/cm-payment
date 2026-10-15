import { fetcher as fetchSdk, type FetcherConfig } from '@clubmed/caps';

let config: FetcherConfig;

export const setFetcherConfig = (value: FetcherConfig) => {
  config = value;
};

export const fetcher = async <T>(opts: {
  url: string;
  method: string;
  headers?: Record<string, string>;
  params?: Record<string, unknown>;
  data?: unknown;
}): Promise<T> => {
  return fetchSdk({ baseUrl: '/api', config, ...opts });
};
