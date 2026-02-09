import '@tsed/logger-std';
import '@tsed/logger/layouts/JsonLayout.js';

import { DILoggerOptions } from '@tsed/di';
import { $log } from '@tsed/logger';

import { isProduction } from '../utils/index.js';

console.log('Logger mode:', isProduction ? 'Production' : 'Development');
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

export default <DILoggerOptions>{
  disableRoutesSummary: isProduction,
};
