import { fetcher as fetchSdk, type FetcherConfig } from '@clubmed/caps';

let config: FetcherConfig;

export const setFetcherConfig = (value: FetcherConfig) => {
  config = value;
};

type FetcherOptions = {
  url: string;
  method: string;
  headers?: Record<string, string>;
  params?: Record<string, unknown>;
  data?: unknown;
};

export const bffFetcher = async <T>(opts: FetcherOptions): Promise<T> =>
  fetchSdk({ config, ...opts });

export const fetcher = async <T>(opts: FetcherOptions): Promise<T> =>
  fetchSdk({ baseUrl: '/api', config, ...opts });
