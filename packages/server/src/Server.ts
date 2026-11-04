import '@tsed/ajv';
import '@tsed/platform-cache';
import '@tsed/platform-fastify';
import '@tsed/platform-log-request';
import '@tsed/swagger';

import { Configuration, configuration, constant, logger } from '@tsed/di';
import { application, type PlatformStaticsOptions } from '@tsed/platform-http';

import { config } from './config/config.js';
import { checkMfeRoot, MFE_MOUNT_PATH } from './config/embed/mfeStatics.js';
import { isProduction } from './config/utils/index.js';
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
      this.app
        .getApp()
        .get(`${MFE_MOUNT_PATH}/*`, async (_: any, reply: any) =>
          reply.code(404).send({ name: 'NOT_FOUND', message: 'Not Found', status: 404 }),
        );
    }

    if (options.isApp) {
      const fallbackRoute = toSpaFallbackRoute(mountPath);

      async function handler(_: any, reply: any) {
        reply.header('Cache-Control', 'no-cache, no-store, must-revalidate');
        return reply.sendFile('index.html', { root: options.root });
      }

      this.app.getApp().get(fallbackRoute, handler);
    }
  }

  $onReady() {
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

const toSpaFallbackRoute = (mountPath: string) => {
  if (mountPath === '/') {
    return '/*';
  }

  const normalized = mountPath.endsWith('/') ? mountPath.slice(0, -1) : mountPath;

  return `${normalized}/*`;
};
