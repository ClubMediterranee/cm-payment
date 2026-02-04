import { catchAsyncError } from '@tsed/core';
import { DIContext, DITest, injectable, runInContext } from '@tsed/di';
import { Exception } from '@tsed/exceptions';

import { HttpClient } from './HttpClient.js';
import { serializeBulk } from './utils/serializeBulk.js';

class CustomHttpClient extends HttpClient {
  callee = 'CUSTOM_HTTP_CLIENT';
}

injectable(CustomHttpClient);

vi.mock('axios-retry');
vi.mock('axios', () => {
  const axiosMock = vi.fn();

  return {
    default: {
      create: vi.fn().mockReturnValue(axiosMock),
    },
    create: vi.fn().mockReturnValue(axiosMock),
  };
});

vi.mock('./utils/logToCurl.js', () => ({
  logToCurl: vi.fn().mockReturnValue('CURL command'),
}));

async function createServiceFixture() {
  const client = await DITest.invoke<CustomHttpClient>(CustomHttpClient);
  const ctx = new DIContext({
    id: 'id',
  });

  vi.spyOn(ctx.logger, 'info');
  vi.spyOn(ctx.logger, 'warn');

  return { client, ctx };
}

describe('httpClient', () => {
  beforeEach(() => DITest.create());
  afterEach(() => DITest.reset());

  describe('head()', () => {
    it('should call send method', async () => {
      // GIVEN
      const { client, ctx } = await createServiceFixture();

      vi.spyOn(client, 'raw').mockResolvedValue({
        headers: {
          'x-test': 'test',
        },
      } as any);
      // WHEN
      const result = await runInContext(ctx, () =>
        client.head('/test', {
          headers: {
            'x-api': 'x-api',
          },
        }),
      );

      expect(result).toStrictEqual({
        'x-test': 'test',
      });
    });
  });
  describe('get()', () => {
    it('should make a request', async () => {
      const { client, ctx } = await createServiceFixture();
      vi.spyOn(client, 'raw').mockResolvedValue({
        headers: {
          'x-request-id': 'id',
        },
        data: {
          id: 'id',
        },
      } as any);

      // WHEN
      const result = await runInContext(ctx, () =>
        client.get('/test', {
          params: {
            param1: 7,
            param2: 'test',
          },
          headers: {
            'x-api': 'x-api',
          },
        }),
      );

      expect(result).toStrictEqual({
        id: 'id',
      });
      expect(ctx.logger.info).toHaveBeenCalledWith({
        callee: 'CUSTOM_HTTP_CLIENT',
        callee_request_body: undefined,
        callee_request_headers: '',
        callee_request_qs: 'param1=7&param2=test',
        callee_response_body: undefined,
        callee_response_code: undefined,
        callee_response_headers: '',
        callee_response_x_request_id: 'id',
        curl: undefined,
        duration: expect.any(Number),
        method: 'GET',
        request_id: 'id',
        state: 'OK',
        url: '/test',
        x_request_id: 'id',
      });
      expect(client.raw).toHaveBeenCalledWith({
        url: '/test',
        method: 'GET',
        params: {
          param1: 7,
          param2: 'test',
        },
        data: undefined,
        headers: {
          'x-api': 'x-api',
        },
      });
    });
    it('should call send (with bulkData)', async () => {
      // GIVEN
      const { client, ctx } = await createServiceFixture();

      const bulkData = [{ id: 'id' }, { text: 'text' }];

      vi.spyOn(client, 'raw').mockReturnValue('' as any);

      // WHEN
      await runInContext(ctx, () =>
        client.post('/test', {
          bulkData,
        }),
      );

      expect(client.raw).toHaveBeenCalledWith({
        url: '/test',
        method: 'POST',
        data: serializeBulk(bulkData),
        headers: {
          'Content-Type': 'application/x-ndjson',
        },
      });
    });
    it('should make a request and return a stream', async () => {
      const { client, ctx } = await createServiceFixture();

      vi.spyOn(client, 'raw').mockResolvedValue({ data: 'stream' } as any);

      // WHEN
      const result = await runInContext(ctx, () =>
        client.get('/test', {
          headers: {
            'x-api': 'x-api',
          },
          responseType: 'stream',
        }),
      );

      expect(result).toStrictEqual({ data: 'stream' });
      expect(client.raw).toHaveBeenCalledWith({
        url: '/test',
        method: 'GET',
        responseType: 'stream',
        headers: {
          'x-api': 'x-api',
        },
      });
    });
    it('should throw error (without response information)', async () => {
      // GIVEN
      const { client, ctx } = await createServiceFixture();

      vi.spyOn(client, 'raw').mockRejectedValue(new Error('Some error'));

      // WHEN
      const error = await catchAsyncError<Exception>(() =>
        runInContext(ctx, () =>
          client.get('/test', {
            params: {
              param1: 7,
              param2: 'test',
            },
            headers: {
              'x-api': 'x-api',
            },
          }),
        ),
      );

      expect(error?.message).toBe('Internal Server Error');
      expect(error?.status).toBe(500);
      expect(error?.headers).toStrictEqual({});
      expect(error?.body).toBeUndefined();
      expect(!!error?.stack).toBe(true);
    });
    it('should throw error (with response information)', async () => {
      // GIVEN
      const { client, ctx } = await createServiceFixture();

      // Create a mock error with response for the logger
      const axiosError = new Error('message');
      Object.defineProperty(axiosError, 'response', {
        value: {
          status: 400,
          headers: {
            'x-test': 'test',
          },
          data: {
            message: 'Validation error',
          },
        },
        enumerable: true,
      });

      vi.spyOn(client, 'raw').mockRejectedValue(axiosError);

      // WHEN
      const error = await catchAsyncError<Exception>(() =>
        runInContext(ctx, () =>
          client.get('/test', {
            params: {
              param1: 7,
              param2: 'test',
            },
            headers: {
              'x-api': 'x-api',
            },
          }),
        ),
      );

      expect(error?.message).toBe('Validation error');
      expect(error?.status).toBe(400);
      expect(error?.headers).toStrictEqual({
        'x-test': 'test',
      });
      expect(error?.body).toStrictEqual({ message: 'Validation error' });
      expect(!!error?.stack).toBe(true);
      expect(ctx.logger.warn).toHaveBeenCalledWith(
        expect.objectContaining({
          callee: 'CUSTOM_HTTP_CLIENT',
          callee_error: 'message',
          callee_request_headers: '{"x-api":"x-api"}',
          callee_request_qs: 'param1=7&param2=test',
          callee_response_body: '{"message":"Validation error"}',
          callee_response_code: 400,
          callee_response_headers: '{"x-test":"test"}',
          method: 'GET',
          request_id: 'id',
          state: 'KO',
          url: '/test',
        }),
      );
    });
    it('should throw error (with partial response information)', async () => {
      // GIVEN
      const { client, ctx } = await createServiceFixture();

      // Create a mock error with response for the logger
      const axiosError = new Error('message');
      Object.defineProperty(axiosError, 'response', {
        value: {
          status: 400,
          headers: {
            'x-test': 'test',
          },
          statusText: 'BAD_REQUEST',
          data: {},
        },
        enumerable: true,
      });

      vi.spyOn(client, 'raw').mockRejectedValue(axiosError);

      // WHEN
      const error = await catchAsyncError<Exception>(() =>
        runInContext(ctx, () =>
          client.get('/test', {
            params: {
              param1: 7,
              param2: 'test',
            },
            headers: {
              'x-api': 'x-api',
            },
          }),
        ),
      );

      expect(error?.message).toBe('BAD_REQUEST');
      expect(error?.status).toBe(400);
      expect(error?.headers).toStrictEqual({
        'x-test': 'test',
      });
      expect(error?.body).toStrictEqual({});
      expect(!!error?.stack).toBe(true);
    });
  });
  describe('post()', () => {
    it('should throw error (with response information)', async () => {
      // GIVEN
      const { client, ctx } = await createServiceFixture();

      // Create a mock error with response for the logger
      const axiosError = new Error('message');
      Object.defineProperty(axiosError, 'response', {
        value: {
          status: 400,
          headers: {
            'x-test': 'test',
          },
          data: {
            message: 'Validation error',
          },
        },
        enumerable: true,
      });

      vi.spyOn(client, 'raw').mockRejectedValue(axiosError);

      // WHEN
      const error = await catchAsyncError<Exception>(() =>
        runInContext(ctx, () =>
          client.post('/test', {
            data: {
              id: 'id',
            },
            params: {
              param1: 7,
              param2: 'test',
            },
            headers: {
              'x-api': 'x-api',
            },
          }),
        ),
      );

      expect(error?.message).toBe('Validation error');
      expect(error?.status).toBe(400);
      expect(error?.headers).toStrictEqual({
        'x-test': 'test',
      });
      expect(error?.body).toStrictEqual({ message: 'Validation error' });
      expect(!!error?.stack).toBe(true);
      expect(ctx.logger.warn).toHaveBeenCalledWith(
        expect.objectContaining({
          callee: 'CUSTOM_HTTP_CLIENT',
          callee_error: 'message',
          callee_request_body: '{"id":"id"}',
          callee_request_headers: '{"x-api":"x-api"}',
          callee_request_qs: 'param1=7&param2=test',
          callee_response_body: '{"message":"Validation error"}',
          callee_response_code: 400,
          callee_response_headers: '{"x-test":"test"}',
          method: 'POST',
          request_id: 'id',
          state: 'KO',
          url: '/test',
        }),
      );
    });
  });
  describe('put()', () => {
    it('should make a request', async () => {
      // GIVEN
      const { client, ctx } = await createServiceFixture();
      const payload = {
        id: 'id',
      };

      vi.spyOn(client, 'raw').mockResolvedValue({
        headers: {},
        data: {
          id: 'id',
        },
      } as any);

      // WHEN
      const result = await runInContext(ctx, () =>
        client.put('/test', {
          data: payload,
          headers: {
            'x-api': 'x-api',
          },
        }),
      );

      expect(result).toStrictEqual({
        id: 'id',
      });
      expect(client.raw).toHaveBeenCalledWith({
        url: '/test',
        method: 'PUT',
        params: undefined,
        data: {
          id: 'id',
        },
        headers: {
          'x-api': 'x-api',
        },
      });
    });
  });

  describe('patch()', () => {
    it('should make a request', async () => {
      // GIVEN
      const { client, ctx } = await createServiceFixture();
      const payload = {
        id: 'id',
      };

      vi.spyOn(client, 'raw').mockResolvedValue({
        headers: {},
        data: {
          id: 'id',
        },
      } as any);

      // WHEN
      const result = await runInContext(ctx, () =>
        client.patch('/test', {
          data: payload,
          headers: {
            'x-api': 'x-api',
          },
        }),
      );

      expect(result).toStrictEqual({
        id: 'id',
      });
      expect(client.raw).toHaveBeenCalledWith({
        url: '/test',
        method: 'PATCH',
        params: undefined,
        data: {
          id: 'id',
        },
        headers: {
          'x-api': 'x-api',
        },
      });
    });
  });

  describe('delete()', () => {
    it('should make a request', async () => {
      // GIVEN
      const { client, ctx } = await createServiceFixture();
      const payload = {
        id: 'id',
      };

      vi.spyOn(client, 'raw').mockResolvedValue({
        headers: {},
        data: {
          id: 'id',
        },
      } as any);

      // WHEN
      const result = await runInContext(ctx, () =>
        client.delete('/test', {
          data: payload,
          headers: {
            'x-api': 'x-api',
          },
        }),
      );

      expect(result).toStrictEqual({
        id: 'id',
      });
      expect(client.raw).toHaveBeenCalledWith(
        expect.objectContaining({
          url: '/test',
          method: 'DELETE',
          headers: {
            'x-api': 'x-api',
          },
        }),
      );
    });
  });
});
