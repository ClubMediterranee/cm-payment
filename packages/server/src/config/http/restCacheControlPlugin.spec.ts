import Fastify from 'fastify';

import { REST_CACHE_CONTROL, restCacheControlPlugin } from './restCacheControlPlugin.js';

function createApp() {
  const app = Fastify();

  app.register(restCacheControlPlugin);
  app.get('/rest/payment_config', async () => ({ ok: true }));
  app.get('/rest/failing', async (_, reply) => reply.code(502).send({ message: 'Bad Gateway' }));
  app.get('/rest/cached', async (_, reply) => {
    reply.header('cache-control', 'public, max-age=60');
    return { ok: true };
  });
  app.get('/mfe/remoteEntry.js', async (_, reply) => reply.type('text/javascript').send(''));

  return app;
}

describe('restCacheControlPlugin', () => {
  it('marks a /rest success as not cacheable', async () => {
    const response = await createApp().inject({ url: '/rest/payment_config?locale=fr-FR' });

    expect(response.headers['cache-control']).toBe(REST_CACHE_CONTROL);
  });

  it('marks a /rest error as not cacheable', async () => {
    const response = await createApp().inject({ url: '/rest/failing' });

    expect(response.statusCode).toBe(502);
    expect(response.headers['cache-control']).toBe(REST_CACHE_CONTROL);
  });

  it('marks an unknown /rest route as not cacheable', async () => {
    const response = await createApp().inject({ url: '/rest/unknown' });

    expect(response.statusCode).toBe(404);
    expect(response.headers['cache-control']).toBe(REST_CACHE_CONTROL);
  });

  it('keeps the Cache-Control set by the handler', async () => {
    const response = await createApp().inject({ url: '/rest/cached' });

    expect(response.headers['cache-control']).toBe('public, max-age=60');
  });

  it('leaves the other paths alone', async () => {
    const response = await createApp().inject({ url: '/mfe/remoteEntry.js' });

    expect(response.headers['cache-control']).toBeUndefined();
  });
});
