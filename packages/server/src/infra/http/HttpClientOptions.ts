import { AxiosError, type AxiosRequestConfig, type AxiosResponse } from 'axios';

export interface HttpClientOptions<Data = unknown> extends Omit<AxiosRequestConfig<Data>, 'env'> {
  noCache?: boolean;
  withHeaders?: boolean;
  pathParams?: Record<string, unknown>;
  disableLog?: boolean;
  bulkData?: Array<Record<string, any> | string>;
  callee?: string;
}

export interface HttpRequestConfig<Data = unknown> extends HttpClientOptions<Data> {
  startTime: number;
  response: AxiosResponse;
}

export interface HttpRequestErrorConfig<Data = unknown>
  extends Omit<HttpRequestConfig<Data>, 'response'> {
  response?: AxiosResponse;
  error: AxiosError;
}
