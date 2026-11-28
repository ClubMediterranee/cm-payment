import '@tsed/ajv';
import '@tsed/platform-cache';
import '@tsed/platform-fastify';
import '@tsed/platform-log-request';
import '@tsed/swagger';

import { Configuration, configuration, constant, logger } from '@tsed/di';
import { application, type PlatformStaticsOptions } from '@tsed/platform-http';

import { config } from './config/config.js';
import { checkMfeRoot, MFE_MOUNT_PATH } from './config/embed/mfeStatics.js';
import { REST_MOUNT_PATH } from './config/http/paths.js';
import { registerNotFound, toMountRoute } from './config/statics/notFoundRoutes.js';
import { APP_ENV_LEVEL, isProduction } from './config/utils/index.js';
import { ExternalRefResolver } from './infra/spec/ExternalRefResolver.js';

@Configuration(config)
export class Server {
  protected app = application();

  protected disableRoutesSummary = constant<boolean>('logger.disableRoutesSummary');

  $beforeRoutesInit() {
    const statics = constant<Record<string, PlatformStaticsOptions>>('statics', {});
    const result = checkMfeRoot(statics[MFE_MOUNT_PATH]?.root, isProduction);

    if (!result.ok) {
      logger().warn({ event: 'EMBED_REMOTE_MISSING', message: result.message });
    }
  }

  $staticsMounted(mountPath: string, options: PlatformStaticsOptions) {
    if (mountPath === MFE_MOUNT_PATH) {
      // Takes precedence over the `/*` SPA fallback: a missing remote file must never return the app.
      registerNotFound(this.app.getApp(), toMountRoute(MFE_MOUNT_PATH, '*'));
    }

    if (options.isApp) {
      // A missing hashed file (e.g. an old chunk during a deploy) must not receive `index.html`.
      registerNotFound(this.app.getApp(), toMountRoute(mountPath, 'assets/*'));

      async function handler(_: any, reply: any) {
        reply.header('Cache-Control', 'no-cache, no-store, must-revalidate');
        // `cacheControl: false`, or @fastify/static replaces the header with the mount's `maxAge` (1 day on `/`).
        return reply.sendFile('index.html', options.root, { cacheControl: false });
      }

      this.app.getApp().get(toMountRoute(mountPath, '*'), handler);
    }
  }

  $afterRoutesInit() {
    // Unknown `/rest` paths answer a JSON 404 instead of the `/*` SPA fallback.
    registerNotFound(this.app.getApp(), toMountRoute(REST_MOUNT_PATH, '*'));
  }

  $onReady() {
    logger().info({
      event: 'SERVER_READY',
      env_level: APP_ENV_LEVEL,
      node_env: process.env.NODE_ENV,
    });

    const host = configuration().getBestHost();

    if (host && !this.disableRoutesSummary) {
      const url = host.toString();
      const statics = constant<PlatformStaticsOptions>('statics')!;

      Object.entries(statics).forEach(([mountPath, config]) => {
        logger().info(`Statics files are available on ${url}${mountPath} => ${config.root}`);
      });
    }
  }

  async $alterOpenSpec(openSpec: any): Promise<any> {
    return ExternalRefResolver.resolve(openSpec);
  }
}
