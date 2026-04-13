import { $log } from '@tsed/logger';
import type { FastifyReply, FastifyRequest } from 'fastify';

function safe(obj: any) {
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch {
    return undefined;
  }
}

export function requestLoggerMiddleware(
  req: FastifyRequest,
  reply: FastifyReply,
  done: () => void,
) {
  const start = Date.now();

  const isError = reply.statusCode >= 400;

  reply.raw.on('finish', () => {
    const log = {
      method: req.method,
      url: req.url,
      reqId: req.id,
      duration: Date.now() - start,
      status: reply.statusCode,
      state: isError ? 'KO' : 'OK',
      query: safe(req.query),
      params: safe(req.params),
    };

    if (isError) {
      $log.error(log);
    } else {
      $log.info(log);
    }
  });

  done();
}
