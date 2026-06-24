import '@tsed/platform-log-request';
import '@tsed/logger-std';
import '@tsed/logger/layouts/JsonLayout.js';
import '@tsed/logger/layouts/ColoredLayout.js';

import { cleanObject } from '@tsed/core/utils/cleanObject.js';
import { attachLogger, DIContext } from '@tsed/di';
import { $log } from '@tsed/logger';

import { isProduction } from '../utils/index.js';

attachLogger($log);

export const level = String(process.env.LOG_LEVEL || 'info') as 'info';

$log.level = level;

if (isProduction) {
  $log.appenders.set('stdout', {
    type: 'stdout',
    levels: ['info', 'debug'],
    layout: {
      type: 'json',
    },
  });

  $log.appenders.set('stderr', {
    levels: ['trace', 'fatal', 'error', 'warn'],
    type: 'stderr',
    layout: {
      type: 'json',
    },
  });
}

export default {
  level,
  maxStackSize: isProduction ? 0 : 100,
  disableRoutesSummary: isProduction,
  disableBootstrapLog: isProduction,
  ignoreUrlPatterns: ['/favicon.ico'],
  alterLog: (level: string, obj: Record<string, unknown>, ctx: DIContext) => {
    const minimalLog = {
      method: ctx.request.method,
      url: ctx.request.url,
      route: ctx.request.route || ctx.request.url,
      response_headers: ctx.response.getHeaders(),
      ...obj,
    };

    if (level === 'info') {
      return minimalLog;
    }

    return {
      ...minimalLog,
      headers: ctx.request.headers,
      body: ctx.request.body,
      query: ctx.request.query,
      params: ctx.request.params,
    };
  },
  onLogResponse: ($ctx: DIContext) => {
    if ($ctx.response.statusCode >= 400) {
      const error = $ctx.error as any | undefined;

      $ctx.logger.error({
        event: 'request.end',
        status: $ctx.response.statusCode,
        status_code: String($ctx.response.statusCode),
        state: 'KO',
        ...cleanObject({
          error_name: error?.name || error?.code,
          error_message: error?.message,
          error_errors: error?.errors,
          error_stack: error?.stack,
          error_body: error?.body,
          error_headers: error?.headers,
        }),
      });
    } else {
      $ctx.logger.info({
        event: 'request.end',
        status: $ctx.response.statusCode,
        status_code: String($ctx.response.statusCode),
        response_headers: $ctx.response.getHeaders(),
        state: 'OK',
      });
    }
  },
} satisfies TsED.LoggerConfiguration;
