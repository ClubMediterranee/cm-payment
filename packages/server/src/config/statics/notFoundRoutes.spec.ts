import Fastify from 'fastify';

import { NOT_FOUND_BODY, registerNotFound, toMountRoute } from './notFoundRoutes.js';

// The routing next to the SPA fallback is covered by `Server.spec.ts`, against the real hooks.
describe('registerNotFound', () => {
  it('answers a JSON 404 under the pattern and keeps the more specific routes', async () => {
    const app = Fastify();

    app.get('/rest/health', async () => ({ status: 'ok' }));
    registerNotFound(app, '/rest/*');

    const response = await app.inject({ url: '/rest/unknown' });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual(NOT_FOUND_BODY);
    expect((await app.inject({ url: '/rest/health' })).json()).toEqual({ status: 'ok' });
  });
});

describe('toMountRoute', () => {
  it.each([
    ['/', '*', '/*'],
    ['/', 'assets/*', '/assets/*'],
    ['/storybook', 'assets/*', '/storybook/assets/*'],
    ['/storybook/', '*', '/storybook/*'],
  ])('maps (%s, %s) to %s', (mountPath, suffix, route) => {
    expect(toMountRoute(mountPath, suffix)).toBe(route);
  });
});
