import { inject } from '@tsed/di';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

import { AllowedOriginsService } from '../../services/embed/AllowedOriginsService.js';

export const EMBED_CORS_PREFIXES = ['/api', '/rest', '/mfe'];

export const EMBED_CORS_ALLOWED_HEADERS = [
  'content-type',
  'authorization',
  'x-api-key',
  'x-issuer-type',
  'accept-language',
  'x-request-id',
].join(',');

const EMBED_CORS_ALLOWED_METHODS = 'GET,POST,PUT,PATCH,DELETE,OPTIONS';

type OriginChecker = Pick<AllowedOriginsService, 'isAllowed'>;

export type EmbedHttpPluginOptions = {
  /**
   * Allow-list provider. Defaults to the DI `AllowedOriginsService`, resolved lazily per request.
   */
  getAllowedOriginsService?: () => OriginChecker;
};

const matchesPrefix = (path: string, prefixes: string[]) =>
  prefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));

const getPath = (request: FastifyRequest) => request.url.split('?')[0];

const allowedCorsOrigins = new WeakMap<FastifyRequest, string>();

function removeUpstreamCorsHeaders(reply: FastifyReply) {
  Object.keys(reply.getHeaders())
    .filter((header) => header.toLowerCase().startsWith('access-control-'))
    .forEach((header) => reply.removeHeader(header));
}

function appendVary(reply: FastifyReply, value: string) {
  const current = reply.getHeader('vary');
  const values = new Set(
    String(current || '')
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean),
  );

  values.add(value);
  reply.header('vary', [...values].join(', '));
}

/**
 * Embed HTTP policy: CORS on `/api`, `/rest` and `/mfe` for the allow-listed host origins (no credentials).
 */
export async function embedHttpPlugin(app: FastifyInstance, options: EmbedHttpPluginOptions = {}) {
  const getService = options.getAllowedOriginsService || (() => inject(AllowedOriginsService));

  app.addHook('onRequest', async (request, reply) => {
    const path = getPath(request);
    const origin = request.headers.origin;

    if (!origin || !matchesPrefix(path, EMBED_CORS_PREFIXES)) {
      return;
    }

    const isAllowed = await getService().isAllowed(origin);

    if (isAllowed) {
      allowedCorsOrigins.set(request, origin);
    }

    if (request.method === 'OPTIONS' && request.headers['access-control-request-method']) {
      appendVary(reply, 'Origin');

      if (isAllowed) {
        reply.headers({
          'access-control-allow-origin': origin,
          'access-control-allow-methods': EMBED_CORS_ALLOWED_METHODS,
          'access-control-allow-headers': EMBED_CORS_ALLOWED_HEADERS,
          'access-control-max-age': '600',
        });
      }

      return reply.code(204).send();
    }
  });

  app.addHook('onSend', async (request, reply, payload) => {
    if (!matchesPrefix(getPath(request), EMBED_CORS_PREFIXES)) {
      return payload;
    }

    if (request.method !== 'OPTIONS') {
      removeUpstreamCorsHeaders(reply);
    }

    const origin = allowedCorsOrigins.get(request);

    if (origin) {
      reply.header('access-control-allow-origin', origin);
    }

    if (request.headers.origin) {
      appendVary(reply, 'Origin');
    }

    return payload;
  });
}

// Equivalent of `fastify-plugin`: hooks apply to the whole application, including the `/api` proxy.
(embedHttpPlugin as unknown as Record<symbol, boolean>)[Symbol.for('skip-override')] = true;
