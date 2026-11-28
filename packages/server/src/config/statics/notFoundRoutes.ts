import type { FastifyInstance } from 'fastify';

export const NOT_FOUND_BODY = { name: 'NOT_FOUND', message: 'Not Found', status: 404 };

/**
 * Answers a JSON 404 on `GET <pattern>`. Fastify prefers static and parametric routes (controllers, static files
 * registered one by one with `wildcard: false`) over this wildcard, so it only catches unknown paths. Registered next
 * to the `/*` SPA fallback, it keeps API calls and missing files from receiving `index.html` with a 200, which a CDN
 * could then cache under that URL.
 */
export function registerNotFound(app: FastifyInstance, pattern: string) {
  app.get(pattern, async (_, reply) => reply.code(404).send(NOT_FOUND_BODY));
}

/** `('/', '*')` → `/*`, `('/storybook/', 'assets/*')` → `/storybook/assets/*`. */
export const toMountRoute = (mountPath: string, suffix: string) =>
  `${mountPath.replace(/\/$/, '')}/${suffix}`;
