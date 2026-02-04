import { $log } from '@tsed/logger';
import { PlatformFastify } from '@tsed/platform-fastify';

import { Server } from './Server.js';

try {
  const platform = await PlatformFastify.bootstrap(Server);

  await platform.listen();

  const close = () => {
    $log.warn('Stop server gracefully...');

    platform
      .stop()
      .then(() => process.exit(0))
      .catch((error) => {
        console.error(error);
        process.exit(-1);
      });
  };

  process.on('SIGINT', close);
  process.on('SIGTERM', close);
} catch (error) {
  $log.error({ event: 'SERVER_BOOTSTRAP_ERROR', message: error.message, stack: error.stack });
}
