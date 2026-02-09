import '@tsed/ajv';
import '@tsed/platform-log-request';
import '@tsed/platform-fastify';
import '@tsed/swagger';

import { Configuration, configuration, constant, logger } from '@tsed/di';
import { application, type PlatformStaticsOptions } from '@tsed/platform-http';

import { config } from './config/config.js';

@Configuration(config)
export class Server {
  protected app = application();

  protected disableRoutesSummary = constant<boolean>('logger.disableRoutesSummary');

  $staticsMounted(mountPath: string, options: PlatformStaticsOptions) {
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
}

const toSpaFallbackRoute = (mountPath: string) => {
  if (mountPath === '/') {
    return '/*';
  }

  const normalized = mountPath.endsWith('/') ? mountPath.slice(0, -1) : mountPath;

  return `${normalized}/*`;
};
