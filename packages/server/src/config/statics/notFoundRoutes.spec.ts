import Fastify from 'fastify';

import { NOT_FOUND_BODY, registerNotFound, toAssetsRoute } from './notFoundRoutes.js';

function createApp() {
  const app = Fastify();

  // Same layout as the server: controllers, static files, then the SPA fallback.
  app.get('/rest/health', async () => ({ status: 'ok' }));
  app.get('/rest/payment_providers/:type/:id', async () => ({ ok: true }));
  app.get('/assets/index-abc123.js', async (_, reply) => reply.type('text/javascript').send(''));
  app.get('/*', async (_, reply) => reply.type('text/html').send('<html>app</html>'));
  registerNotFound(app, '/rest/*');
  registerNotFound(app, toAssetsRoute('/'));

  return app;
}

describe('registerNotFound', () => {
  it('answers a JSON 404 for an unknown /rest path', async () => {
    const response = await createApp().inject({ url: '/rest/unknown' });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual(NOT_FOUND_BODY);
  });

  it('answers a 404 for a missing asset', async () => {
    const response = await createApp().inject({ url: '/assets/index-old.js' });

    expect(response.statusCode).toBe(404);
  });

  it('keeps the existing routes and files', async () => {
    const app = createApp();

    expect((await app.inject({ url: '/rest/health' })).json()).toEqual({ status: 'ok' });
    expect((await app.inject({ url: '/rest/payment_providers/booking/42' })).statusCode).toBe(200);
    expect((await app.inject({ url: '/assets/index-abc123.js' })).statusCode).toBe(200);
  });

  it('keeps the SPA fallback for app pages', async () => {
    const response = await createApp().inject({ url: '/gm/booking/123' });

    expect(response.statusCode).toBe(200);
    expect(response.body).toContain('app');
  });
});

describe('toAssetsRoute', () => {
  it.each([
    ['/', '/assets/*'],
    ['/storybook', '/storybook/assets/*'],
    ['/storybook/', '/storybook/assets/*'],
  ])('maps %s to %s', (mountPath, route) => {
    expect(toAssetsRoute(mountPath)).toBe(route);
  });
});
