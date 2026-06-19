import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import accepts from '@fastify/accepts';
import formBody from '@fastify/formbody';
import httpProxy from '@fastify/http-proxy';
import { DotEnvsConfigSource } from '@tsed/config/dotenv';
import formRawbody from 'fastify-raw-body';

import * as rest from '../controllers/rest/index.js';
import loggerConfig from './logger/index.js';

const pkg = JSON.parse(readFileSync('./package.json', { encoding: 'utf8' }));
const rootDir = process.cwd();
/**
 * This is the shared configuration for the application
 */
export const config: Partial<TsED.Configuration> = {
  rootDir,
  version: pkg.version,
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
  extends: [DotEnvsConfigSource],
  host: process.env['HOST'],
  acceptMimes: ['application/json'],
  httpPort: process.env['PORT'] || 8083,
  httpsPort: false, // CHANGE
  CLUBMED_API_URL: process.env['CLUBMED_API_URL'] || 'https://api.integ.clubmed.com',
  DIRECTUS_URL: process.env['DIRECTUS_URL'] || 'https://staging.cms.api.clubmed',
  DIRECTUS_API_TOKEN: process.env['DIRECTUS_API_TOKEN'] || '',
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
    {
      use: httpProxy,
      options: {
        upstream: process.env.CLUBMED_API_URL || 'https://api.integ.clubmed.com',
        prefix: '/api',
        rewritePrefix: '/',
        http2: false,
        replyOptions: {
          rewriteRequestHeaders: (originalReq: any, headers: any) => ({
            ...headers,
            ...(originalReq.headers['x-request-id'] && {
              'x-request-id': originalReq.headers['x-request-id'],
            }),
            ...(originalReq.headers['x-api-key'] && {
              'x-api-key': originalReq.headers['x-api-key'],
            }),
            ...(originalReq.headers.authorization && {
              authorization: originalReq.headers.authorization,
            }),
            ...(originalReq.headers['accept-language'] && {
              'accept-language': originalReq.headers['accept-language'],
            }),
          }),
        },
      },
    },
  ],
  fastify: {
    trustProxy: process.env.TRUST_PROXY === 'true',
  } as any,
  statics: {
    '/storybook': {
      isApp: true,
      root: join(rootDir, '..', '..', 'storybook-static'),
      maxAge: '1d',
      wildcard: false,
    },
    '/docs': {
      isApp: true,
      root: join(rootDir, '..', 'docs', 'build'),
      maxAge: '1d',
      wildcard: false,
    },
    '/starter': {
      isApp: true,
      root: join(rootDir, '..', 'starter', 'dist'),
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
