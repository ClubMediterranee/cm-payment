import Fastify, { type FastifyInstance } from 'fastify';

import { groupOriginsByMode } from '../../services/embed/origins.js';
import { EMBED_CORS_ALLOWED_HEADERS, embedHttpPlugin } from './embedHttpPlugin.js';

const HOST = 'https://host.example';
const IFRAME_HOST = 'https://iframe-host.example';

function createApp(
  entries = [
    { origin: HOST, modes: ['webcomponent' as const] },
    { origin: IFRAME_HOST, modes: ['iframe' as const] },
  ],
) {
  const allowed = groupOriginsByMode(entries);
  const service = {
    getAllowedOrigins: vi.fn(async () => allowed),
    isAllowed: vi.fn(async (origin: string | undefined, mode: 'webcomponent' | 'iframe') =>
      allowed[mode].includes(origin || ''),
    ),
  };

  const app: FastifyInstance = Fastify();

  app.register(embedHttpPlugin, { getAllowedOriginsService: () => service });
  app.register(async (child) => {
    // Simulates the `/api` proxy answering with its own CORS headers.
    child.get('/api/v1/payments', async (_, reply) => {
      reply.header('access-control-allow-origin', '*');
      return { ok: true };
    });
  });
  app.get('/rest/embed/config', async () => ({ ok: true }));
  app.get('/mfe/mf-manifest.json', async () => ({ name: 'caps' }));
  app.get('/gm/booking/123', async (_, reply) => reply.type('text/html').send('<html></html>'));
  app.get('/storybook/index.html', async (_, reply) =>
    reply.type('text/html').send('<html></html>'),
  );

  return { app, service };
}

describe('embedHttpPlugin', () => {
  describe('CORS', () => {
    it('answers the preflight of an allowed origin', async () => {
      const { app } = createApp();

      const response = await app.inject({
        method: 'OPTIONS',
        url: '/api/v1/payments',
        headers: {
          origin: HOST,
          'access-control-request-method': 'POST',
          'access-control-request-headers': 'authorization,x-api-key,x-issuer-type',
        },
      });

      expect(response.statusCode).toBe(204);
      expect(response.headers['access-control-allow-origin']).toBe(HOST);
      expect(response.headers['access-control-allow-headers']).toBe(EMBED_CORS_ALLOWED_HEADERS);
      expect(response.headers['access-control-allow-credentials']).toBeUndefined();
      expect(response.headers.vary).toContain('Origin');
    });

    it('answers the preflight of an unknown origin without CORS headers', async () => {
      const { app } = createApp();

      const response = await app.inject({
        method: 'OPTIONS',
        url: '/rest/embed/config',
        headers: { origin: 'https://evil.example', 'access-control-request-method': 'GET' },
      });

      expect(response.statusCode).toBe(204);
      expect(response.headers['access-control-allow-origin']).toBeUndefined();
    });

    it('replaces the upstream CORS headers for an allowed origin', async () => {
      const { app } = createApp();

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/payments',
        headers: { origin: HOST },
      });

      expect(response.statusCode).toBe(200);
      expect(response.headers['access-control-allow-origin']).toBe(HOST);
    });

    it('strips the upstream CORS headers for an unknown origin', async () => {
      const { app } = createApp();

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/payments',
        headers: { origin: 'https://evil.example' },
      });

      expect(response.headers['access-control-allow-origin']).toBeUndefined();
    });

    it('serves the remote manifest cross-origin', async () => {
      const { app } = createApp();

      const response = await app.inject({
        method: 'GET',
        url: '/mfe/mf-manifest.json',
        headers: { origin: HOST },
      });

      expect(response.headers['access-control-allow-origin']).toBe(HOST);
    });

    it('does not grant CORS to an iframe-only origin', async () => {
      const { app } = createApp();

      const response = await app.inject({
        method: 'GET',
        url: '/mfe/mf-manifest.json',
        headers: { origin: IFRAME_HOST },
      });

      expect(response.headers['access-control-allow-origin']).toBeUndefined();
    });

    it('does not check the allow-list for same-origin requests', async () => {
      const { app, service } = createApp();

      const response = await app.inject({ method: 'GET', url: '/rest/embed/config' });

      expect(response.statusCode).toBe(200);
      expect(service.isAllowed).not.toHaveBeenCalled();
    });
  });

  describe('frame-ancestors', () => {
    it('allows the iframe origins to frame the app', async () => {
      const { app } = createApp();

      const response = await app.inject({ method: 'GET', url: '/gm/booking/123?embedded=1' });

      expect(response.headers['content-security-policy']).toBe(
        `frame-ancestors 'self' ${IFRAME_HOST}`,
      );
    });

    it("falls back to 'self' when the allow-list is empty", async () => {
      const { app } = createApp([]);

      const response = await app.inject({ method: 'GET', url: '/gm/booking/123' });

      expect(response.headers['content-security-policy']).toBe("frame-ancestors 'self'");
    });

    it('does not apply to non-app responses', async () => {
      const { app } = createApp();

      const [storybook, api] = await Promise.all([
        app.inject({ method: 'GET', url: '/storybook/index.html' }),
        app.inject({ method: 'GET', url: '/rest/embed/config' }),
      ]);

      expect(storybook.headers['content-security-policy']).toBeUndefined();
      expect(api.headers['content-security-policy']).toBeUndefined();
    });
  });
});
