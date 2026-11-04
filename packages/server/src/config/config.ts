import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import accepts from '@fastify/accepts';
import formBody from '@fastify/formbody';
import { DotEnvsConfigSource } from '@tsed/config/dotenv';
import formRawbody from 'fastify-raw-body';

import * as rest from '../controllers/rest/index.js';
import { embedHttpPlugin } from './embed/embedHttpPlugin.js';
import { setMfeCacheHeaders } from './embed/mfeStatics.js';
import loggerConfig from './logger/index.js';
import { proxyConfig } from './proxy/index.js';
import { envs } from './utils/index.js';

const pkg = JSON.parse(readFileSync('./package.json', { encoding: 'utf8' }));
const rootDir = process.cwd();
/**
 * This is the shared configuration for the application
 */
export const config: Partial<TsED.Configuration> = {
  rootDir,
  version: pkg.version,
  ...envs,
  envs,
  ajv: {
    returnsCoercedValues: true,
    loadSchema: (async (uri: string) => {
      const response = await fetch(uri);
      if (!response.ok) {
        throw new Error(`Unable to load schema: ${uri}`);
      }
      return response.json();
    }) as any,
  },
  logger: loggerConfig,
  cache: {
    ttl: 300,
    store: 'memory',
  },
  extends: [DotEnvsConfigSource],
  host: process.env['HOST'],
  acceptMimes: ['application/json'],
  httpPort: process.env['PORT'] || 8083,
  httpsPort: false, // CHANGE
  mount: {
    '/rest': [...Object.values(rest)],
  },
  views: {
    root: join(process.cwd(), '../views'),
    extensions: {
      ejs: 'ejs',
    },
  },
  swagger: [
    {
      path: '/oas',
      specVersion: '3.1.0',
    },
  ],
  plugins: [
    // Must be registered before the `/api` proxy so that CORS and framing hooks also apply to it.
    embedHttpPlugin,
    accepts,
    // cookie,
    {
      use: formRawbody,
      options: {
        global: false,
        runFirst: true,
      },
    },
    formBody,
    proxyConfig,
  ],
  fastify: {
    trustProxy: process.env.TRUST_PROXY === 'true',
  } as any,
  statics: {
    // Module Federation remote of the CAPS form (`packages/mfe`). No SPA fallback: missing files answer 404.
    '/mfe': {
      root: join(rootDir, '..', 'mfe', 'dist'),
      wildcard: false,
      cacheControl: false,
      setHeaders: setMfeCacheHeaders,
    },
    '/storybook': {
      isApp: true,
      root: join(rootDir, '..', '..', 'storybook-static'),
      maxAge: '1d',
      wildcard: false,
    },
    '/': {
      isApp: true,
      root: join(rootDir, '..', 'app', 'dist'),
      maxAge: '1d',
      wildcard: false,
    },
  },
};
