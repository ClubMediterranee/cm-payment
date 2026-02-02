import '@tsed/ajv';
import '@tsed/platform-log-request';
import '@tsed/platform-fastify';
import '@tsed/swagger';

import { join } from 'node:path';

import { Configuration } from '@tsed/di';
import { application } from '@tsed/platform-http';

import { config } from './config/config.js';
// import * as pages from './controllers/pages/index.js';
import * as rest from './controllers/rest/index.js';

@Configuration({
  ...config,
  acceptMimes: ['application/json'],
  httpPort: 8083,
  httpsPort: false, // CHANGE
  mount: {
    '/rest': [...Object.values(rest)],
    // '/': [...Object.values(pages)],
  },
  views: {
    root: join(process.cwd(), '../views'),
    extensions: {
      ejs: 'ejs',
    },
  },
  swagger: [
    {
      path: '/doc',
      specVersion: '3.1.0',
    },
  ],
  plugins: [
    '@fastify/accepts',
    '@fastify/cookie',
    {
      use: 'fastify-raw-body',
      options: {
        global: false,
        runFirst: true,
      },
    },
    '@fastify/formbody',
  ],
})
export class Server {
  protected app = application();
}
