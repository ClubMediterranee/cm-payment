import type { FastifyRequest } from 'fastify';

export const REST_MOUNT_PATH = '/rest';

export const getPath = (request: FastifyRequest) => request.url.split('?')[0];

/** `true` when `path` is one of `prefixes` or below one of them (`/rest`, `/rest/x`, not `/restore`). */
export const matchesPrefix = (path: string, prefixes: string[]) =>
  prefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
