import { $log } from '@tsed/logger';
import { EventEmitter } from 'events';
import type { FastifyReply, FastifyRequest } from 'fastify';

import { requestLoggerMiddleware } from './requestLogger.js';

describe('requestLoggerMiddleware', () => {
  let req: Partial<FastifyRequest>;
  let reply: Partial<FastifyReply>;
  let rawEmitter: EventEmitter;
  let done: vi.Mock;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn($log, 'info');
    vi.spyOn($log, 'error');
    vi.useFakeTimers();

    rawEmitter = new EventEmitter();

    req = {
      method: 'GET',
      url: '/test',
      id: 'request-id-123',
      query: { search: 'test' },
      params: { id: '123' },
    };

    reply = {
      statusCode: 200,
      raw: rawEmitter as any,
    };

    done = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('successful requests', () => {
    it('should log info for successful request with status 200', () => {
      // GIVEN
      const startTime = Date.now();
      vi.setSystemTime(startTime);

      // WHEN
      requestLoggerMiddleware(req as FastifyRequest, reply as FastifyReply, done);

      // Simulate time passing
      vi.advanceTimersByTime(150);
      rawEmitter.emit('finish');

      // THEN
      expect(done).toHaveBeenCalledOnce();
      expect($log.info).toHaveBeenCalledWith({
        method: 'GET',
        url: '/test',
        reqId: 'request-id-123',
        duration: 150,
        status: 200,
        state: 'OK',
        query: { search: 'test' },
        params: { id: '123' },
      });
      expect($log.error).not.toHaveBeenCalled();
    });

    it('should log info for successful request with status 201', () => {
      // GIVEN
      reply.statusCode = 201;
      const startTime = Date.now();
      vi.setSystemTime(startTime);

      // WHEN
      requestLoggerMiddleware(req as FastifyRequest, reply as FastifyReply, done);

      vi.advanceTimersByTime(50);
      rawEmitter.emit('finish');

      // THEN
      expect($log.info).toHaveBeenCalledWith({
        method: 'GET',
        url: '/test',
        reqId: 'request-id-123',
        duration: 50,
        status: 201,
        state: 'OK',
        query: { search: 'test' },
        params: { id: '123' },
      });
      expect($log.error).not.toHaveBeenCalled();
    });

    it('should log info for successful request with status 204 (No Content)', () => {
      // GIVEN
      reply.statusCode = 204;

      // WHEN
      requestLoggerMiddleware(req as FastifyRequest, reply as FastifyReply, done);

      rawEmitter.emit('finish');

      // THEN
      expect($log.info).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 204,
          state: 'OK',
        }),
      );
      expect($log.error).not.toHaveBeenCalled();
    });
  });

  describe('error requests', () => {
    it('should log error for request with status 400', () => {
      // GIVEN
      reply.statusCode = 400;

      // WHEN
      requestLoggerMiddleware(req as FastifyRequest, reply as FastifyReply, done);

      vi.advanceTimersByTime(100);
      rawEmitter.emit('finish');

      // THEN
      expect($log.error).toHaveBeenCalledWith({
        method: 'GET',
        url: '/test',
        reqId: 'request-id-123',
        duration: 100,
        status: 400,
        state: 'KO',
        query: { search: 'test' },
        params: { id: '123' },
      });
      expect($log.info).not.toHaveBeenCalled();
    });

    it('should log error for request with status 404', () => {
      // GIVEN
      reply.statusCode = 404;

      // WHEN
      requestLoggerMiddleware(req as FastifyRequest, reply as FastifyReply, done);

      rawEmitter.emit('finish');

      // THEN
      expect($log.error).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 404,
          state: 'KO',
        }),
      );
      expect($log.info).not.toHaveBeenCalled();
    });

    it('should log error for request with status 500', () => {
      // GIVEN
      reply.statusCode = 500;

      // WHEN
      requestLoggerMiddleware(req as FastifyRequest, reply as FastifyReply, done);

      rawEmitter.emit('finish');

      // THEN
      expect($log.error).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 500,
          state: 'KO',
        }),
      );
      expect($log.info).not.toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle missing query params', () => {
      // GIVEN
      req.query = undefined;

      // WHEN
      requestLoggerMiddleware(req as FastifyRequest, reply as FastifyReply, done);

      rawEmitter.emit('finish');

      // THEN
      expect($log.info).toHaveBeenCalledWith(
        expect.objectContaining({
          query: undefined,
        }),
      );
    });

    it('should handle missing route params', () => {
      // GIVEN
      req.params = undefined;

      // WHEN
      requestLoggerMiddleware(req as FastifyRequest, reply as FastifyReply, done);

      rawEmitter.emit('finish');

      // THEN
      expect($log.info).toHaveBeenCalledWith(
        expect.objectContaining({
          params: undefined,
        }),
      );
    });

    it('should handle POST request', () => {
      // GIVEN
      req.method = 'POST';
      req.url = '/api/users';

      // WHEN
      requestLoggerMiddleware(req as FastifyRequest, reply as FastifyReply, done);

      rawEmitter.emit('finish');

      // THEN
      expect($log.info).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: '/api/users',
        }),
      );
    });

    it('should handle PUT request', () => {
      // GIVEN
      req.method = 'PUT';
      reply.statusCode = 200;

      // WHEN
      requestLoggerMiddleware(req as FastifyRequest, reply as FastifyReply, done);

      rawEmitter.emit('finish');

      // THEN
      expect($log.info).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'PUT',
          state: 'OK',
        }),
      );
    });

    it('should handle DELETE request', () => {
      // GIVEN
      req.method = 'DELETE';
      reply.statusCode = 204;

      // WHEN
      requestLoggerMiddleware(req as FastifyRequest, reply as FastifyReply, done);

      rawEmitter.emit('finish');

      // THEN
      expect($log.info).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'DELETE',
          state: 'OK',
        }),
      );
    });

    it('should handle complex query params', () => {
      // GIVEN
      req.query = {
        filter: 'active',
        sort: 'desc',
        page: '2',
        limit: '10',
      };

      // WHEN
      requestLoggerMiddleware(req as FastifyRequest, reply as FastifyReply, done);

      rawEmitter.emit('finish');

      // THEN
      expect($log.info).toHaveBeenCalledWith(
        expect.objectContaining({
          query: {
            filter: 'active',
            sort: 'desc',
            page: '2',
            limit: '10',
          },
        }),
      );
    });

    it('should handle objects that cannot be serialized (circular reference)', () => {
      // GIVEN
      const circular: any = { name: 'test' };
      circular.self = circular;
      req.query = circular;

      // WHEN
      requestLoggerMiddleware(req as FastifyRequest, reply as FastifyReply, done);

      rawEmitter.emit('finish');

      // THEN
      expect($log.info).toHaveBeenCalledWith(
        expect.objectContaining({
          query: undefined,
        }),
      );
    });

    it('should call done callback immediately', () => {
      // WHEN
      requestLoggerMiddleware(req as FastifyRequest, reply as FastifyReply, done);

      // THEN
      expect(done).toHaveBeenCalledOnce();
    });

    it('should calculate correct duration', () => {
      // GIVEN
      const startTime = Date.now();
      vi.setSystemTime(startTime);

      // WHEN
      requestLoggerMiddleware(req as FastifyRequest, reply as FastifyReply, done);

      vi.advanceTimersByTime(2500);
      rawEmitter.emit('finish');

      // THEN
      expect($log.info).toHaveBeenCalledWith(
        expect.objectContaining({
          duration: 2500,
        }),
      );
    });
  });

  describe('status boundary conditions', () => {
    it('should log info for status 399 (last non-error status)', () => {
      // GIVEN
      reply.statusCode = 399;

      // WHEN
      requestLoggerMiddleware(req as FastifyRequest, reply as FastifyReply, done);

      rawEmitter.emit('finish');

      // THEN
      expect($log.info).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 399,
          state: 'OK',
        }),
      );
      expect($log.error).not.toHaveBeenCalled();
    });

    it('should log error for status 400 (first error status)', () => {
      // GIVEN
      reply.statusCode = 400;

      // WHEN
      requestLoggerMiddleware(req as FastifyRequest, reply as FastifyReply, done);

      rawEmitter.emit('finish');

      // THEN
      expect($log.error).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 400,
          state: 'KO',
        }),
      );
      expect($log.info).not.toHaveBeenCalled();
    });
  });
});
