import type { AxiosError, AxiosResponse } from 'axios';

import type {
  HttpClientOptions,
  HttpRequestConfig,
  HttpRequestErrorConfig,
} from './HttpClientOptions';

describe('HttpClientOptions', () => {
  describe('HttpClientOptions interface', () => {
    it('should accept valid HttpClientOptions', () => {
      const options: HttpClientOptions = {
        url: '/test',
        method: 'GET',
        noCache: true,
        withHeaders: true,
        pathParams: { id: '123' },
        disableLog: false,
        bulkData: [{ key: 'value' }],
        callee: 'TEST_CLIENT',
      };

      expect(options).toBeDefined();
      expect(options.noCache).toBe(true);
      expect(options.withHeaders).toBe(true);
      expect(options.pathParams).toEqual({ id: '123' });
      expect(options.disableLog).toBe(false);
      expect(options.callee).toBe('TEST_CLIENT');
    });

    it('should accept HttpClientOptions with minimal properties', () => {
      const options: HttpClientOptions = {
        url: '/test',
      };

      expect(options).toBeDefined();
      expect(options.url).toBe('/test');
    });

    it('should accept bulkData as array of strings', () => {
      const options: HttpClientOptions = {
        bulkData: ['data1', 'data2'],
      };

      expect(options.bulkData).toEqual(['data1', 'data2']);
    });
  });

  describe('HttpRequestConfig interface', () => {
    it('should accept valid HttpRequestConfig', () => {
      const config: HttpRequestConfig = {
        startTime: Date.now(),
        response: {
          status: 200,
          data: { id: 'test' },
        } as AxiosResponse,
        url: '/test',
        method: 'POST',
      };

      expect(config).toBeDefined();
      expect(config.startTime).toBeDefined();
      expect(config.response.status).toBe(200);
    });

    it('should include all HttpClientOptions properties', () => {
      const config: HttpRequestConfig = {
        startTime: Date.now(),
        response: {
          status: 201,
        } as AxiosResponse,
        noCache: true,
        withHeaders: true,
        pathParams: { userId: '456' },
        disableLog: true,
        callee: 'REQUEST_CLIENT',
      };

      expect(config.noCache).toBe(true);
      expect(config.withHeaders).toBe(true);
      expect(config.pathParams).toEqual({ userId: '456' });
      expect(config.disableLog).toBe(true);
      expect(config.callee).toBe('REQUEST_CLIENT');
    });
  });

  describe('HttpRequestErrorConfig interface', () => {
    it('should accept valid HttpRequestErrorConfig with response', () => {
      const errorConfig: HttpRequestErrorConfig = {
        startTime: Date.now(),
        response: {
          status: 400,
          data: { message: 'Bad Request' },
        } as AxiosResponse,
        error: new Error('Request failed') as AxiosError,
        url: '/test',
      };

      expect(errorConfig).toBeDefined();
      expect(errorConfig.error).toBeDefined();
      expect(errorConfig.response?.status).toBe(400);
    });

    it('should accept HttpRequestErrorConfig without response', () => {
      const errorConfig: HttpRequestErrorConfig = {
        startTime: Date.now(),
        error: new Error('Network error') as AxiosError,
        url: '/test',
      };

      expect(errorConfig).toBeDefined();
      expect(errorConfig.error).toBeDefined();
      expect(errorConfig.response).toBeUndefined();
    });

    it('should include HttpClientOptions properties', () => {
      const errorConfig: HttpRequestErrorConfig = {
        startTime: Date.now(),
        error: new Error('Error') as AxiosError,
        callee: 'ERROR_CLIENT',
        disableLog: false,
        pathParams: { id: 'error-id' },
      };

      expect(errorConfig.callee).toBe('ERROR_CLIENT');
      expect(errorConfig.disableLog).toBe(false);
      expect(errorConfig.pathParams).toEqual({ id: 'error-id' });
    });
  });
});
