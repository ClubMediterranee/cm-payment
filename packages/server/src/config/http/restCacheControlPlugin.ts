import type { FastifyInstance } from 'fastify';

export const REST_CACHE_CONTROL = 'private, no-store';

const isRestPath = (url: string) => {
  const path = url.split('?')[0];

  return path === '/rest' || path.startsWith('/rest/');
};

/**
 * `/rest` responses depend on the user (`authorization`), the locale (`accept-language`) and the issuer type
 * (`x-issuer-type`): never let a shared cache (CloudFront, a proxy) store them. Handlers that set their own
 * `Cache-Control` keep it.
 */
export async function restCacheControlPlugin(app: FastifyInstance) {
  app.addHook('onSend', async (request, reply, payload) => {
    if (isRestPath(request.url) && !reply.hasHeader('cache-control')) {
      reply.header('cache-control', REST_CACHE_CONTROL);
    }

    return payload;
  });
}

// Equivalent of `fastify-plugin`: the hook applies to the whole application.
(restCacheControlPlugin as unknown as Record<symbol, boolean>)[Symbol.for('skip-override')] = true;
