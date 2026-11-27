import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import fastifyStatic from '@fastify/static';
import { logger } from '@tsed/di';
import { PlatformTest } from '@tsed/platform-http/testing';
import Fastify, { type FastifyInstance } from 'fastify';

import { MFE_MOUNT_PATH } from './config/embed/mfeStatics.js';
import { Server } from './Server.js';

/**
 * Runs the Server hooks against a plain Fastify app, without bootstrapping the whole platform (Directus, statics,
 * plugins). `this.app.getApp()` is the only platform API the hooks use.
 */
function createHooks(fastify: FastifyInstance) {
  const hooks = Object.create(Server.prototype) as Server;

  Object.assign(hooks, { app: { getApp: () => fastify }, disableRoutesSummary: true });

  return hooks;
}

describe('Server', () => {
  let root: string;

  beforeEach(async () => {
    root = mkdtempSync(join(tmpdir(), 'server-spec-'));
    mkdirSync(join(root, 'assets'));
    writeFileSync(join(root, 'index.html'), '<html>app</html>');
    writeFileSync(join(root, 'assets', 'index-abc.js'), 'console.log(1)');

    await PlatformTest.create();
  });

  afterEach(async () => {
    await PlatformTest.reset();
    rmSync(root, { recursive: true, force: true });
  });

  async function createApp() {
    const fastify = Fastify();
    const hooks = createHooks(fastify);

    await fastify.register(fastifyStatic, { root, wildcard: false });
    fastify.get('/rest/health', async () => ({ status: 'OK' }));
    hooks.$staticsMounted('/', { root, isApp: true } as never);
    hooks.$staticsMounted(MFE_MOUNT_PATH, { root } as never);
    hooks.$afterRoutesInit();

    return fastify;
  }

  it('serves index.html for app pages', async () => {
    const response = await (await createApp()).inject({ url: '/gm/booking/123' });

    expect(response.statusCode).toBe(200);
    expect(response.body).toContain('app');
    expect(response.headers['cache-control']).toBe('no-cache, no-store, must-revalidate');
  });

  it('serves the existing assets', async () => {
    const response = await (await createApp()).inject({ url: '/assets/index-abc.js' });

    expect(response.statusCode).toBe(200);
  });

  it.each(['/assets/index-old.js', '/rest/unknown', `${MFE_MOUNT_PATH}/missing.js`])(
    'answers a JSON 404 for %s instead of index.html',
    async (url) => {
      const response = await (await createApp()).inject({ url });

      expect(response.statusCode).toBe(404);
      expect(response.json()).toMatchObject({ name: 'NOT_FOUND', status: 404 });
    },
  );

  it('keeps the REST routes', async () => {
    const response = await (await createApp()).inject({ url: '/rest/health' });

    expect(response.json()).toEqual({ status: 'OK' });
  });

  it('logs the environment level when ready', () => {
    const info = vi.spyOn(logger(), 'info');

    createHooks(Fastify()).$onReady();

    expect(info).toHaveBeenCalledWith(
      expect.objectContaining({ event: 'SERVER_READY', env_level: 'local' }),
    );
  });
});
