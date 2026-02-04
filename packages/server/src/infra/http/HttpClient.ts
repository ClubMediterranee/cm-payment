import { Exception } from '@tsed/exceptions';
import axios, {
  AxiosError,
  AxiosHeaders,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type CreateAxiosDefaults,
  type Method,
  type RawAxiosRequestHeaders,
} from 'axios';
import axiosRetry from 'axios-retry';
import omit from 'lodash/omit.js';

import type { HttpClientOptions } from './HttpClientOptions.js';
import { HttpLogClient } from './HttpLogClient.js';
import { interpolate } from './utils/interpolate.js';
import { serializeBulk } from './utils/serializeBulk.js';

@Injectable()
export class HttpClient<
  Options extends HttpClientOptions = HttpClientOptions,
> extends HttpLogClient {
  protected baseURL: string = '';

  #raw: AxiosInstance;

  raw(options: AxiosRequestConfig) {
    if (!this.#raw) {
      this.create();
    }

    return this.#raw(options);
  }

  async head(endpoint: string, options?: Options): Promise<RawAxiosRequestHeaders | AxiosHeaders> {
    const reqOptions = await this.getOptions('HEAD', endpoint, options);
    const { headers } = await this.raw(reqOptions);

    return headers;
  }

  async get<Data = unknown>(endpoint: string, options?: Options): Promise<Data> {
    return this.fetch({
      ...options,
      method: 'GET',
      url: endpoint,
    });
  }

  async post<Data = unknown>(endpoint: string, options?: Options): Promise<Data> {
    return this.fetch({
      ...options,
      method: 'POST',
      url: endpoint,
    });
  }

  async put<Data = unknown>(endpoint: string, options?: Options): Promise<Data> {
    return this.fetch({
      ...options,
      method: 'PUT',
      url: endpoint,
    });
  }

  async patch<Data = unknown>(endpoint: string, options?: Options): Promise<Data> {
    return this.fetch({
      ...options,
      method: 'PATCH',
      url: endpoint,
    });
  }

  async delete<Data = unknown>(endpoint: string, options?: Options): Promise<Data> {
    return this.fetch({
      ...options,
      method: 'DELETE',
      url: endpoint,
    });
  }

  async fetch(options: AxiosRequestConfig) {
    const reqOptions = await this.getOptions(
      options.method || ('GET' as any),
      options.url!,
      options as any,
    );
    const result = await this.send(reqOptions);

    return this.mapResponse(result, options);
  }

  async send(options: AxiosRequestConfig) {
    const startTime = new Date().getTime();

    try {
      const response = await this.raw(options);

      this.onSuccess({ ...options, startTime, response });

      return response;
    } catch (error: unknown) {
      this.onError({
        ...options,
        startTime,
        error: error as AxiosError,
        response: (error as AxiosError).response,
      });
      this.throwException(error as AxiosError);
    }
  }

  /**
   * Allow Child class to customize axios instance if needed
   */
  protected create(opts?: CreateAxiosDefaults) {
    const instance = axios.create({
      ...opts,
      baseURL: this.baseURL,
      headers: opts?.headers,
    });

    axiosRetry(instance, { retries: 0, retryDelay: axiosRetry.exponentialDelay });

    this.#raw = instance;

    return instance;
  }

  /**
   * Convert an error to a Ts.ED Exception instance.
   * Depending on the called backed, this method must be adapted to extract error message or other information.
   * @param error
   * @protected
   */
  protected throwException(error: AxiosError) {
    const { status, headers, data, statusText } = error?.response || {};
    const message = this.getErrorMessage(data);

    const exception = new Exception(
      status || 500,
      message || statusText || 'Internal Server Error',
      error.response?.data,
    );

    if (headers) {
      exception.headers = headers;
    }

    exception.errors = [data || error];

    Error.captureStackTrace(exception);

    throw exception;
  }

  protected getErrorMessage(data: any) {
    return (data as { message?: string })?.message;
  }

  protected async getOptions(
    method: Method,
    endpoint: string,
    options: Options = {} as any,
  ): Promise<AxiosRequestConfig> {
    const opts: Options = options || ({} as Options);
    const data = opts.bulkData ? serializeBulk(opts.bulkData) : opts.data;

    endpoint = interpolate(endpoint, options.pathParams);

    if (opts.bulkData) {
      opts.headers = {
        ...opts.headers,
        'Content-Type': 'application/x-ndjson',
      };
    }

    return {
      method,
      url: endpoint,
      ...omit(opts, [
        'env',
        'bulkData',
        'type',
        'collectionType',
        'additionalProperties',
        'groups',
      ]),
      params: opts.params,
      data,
    };
  }

  /**
   * Map the response depending on the given request options
   */
  protected mapResponse(result?: AxiosResponse, options?: HttpClientOptions) {
    const { withHeaders } = options || {};

    if (options?.responseType === 'stream') {
      return result;
    }

    const data = result?.data;

    return withHeaders ? { data, headers: result?.headers } : data;
  }
}
