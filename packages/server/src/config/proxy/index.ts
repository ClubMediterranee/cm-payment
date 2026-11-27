import '../utils/index.js';

import httpProxy from '@fastify/http-proxy';

import { DEFAULT_HTTP_CLIENT_TIMEOUT_MS } from '../../infra/http/HttpClient.js';

const CLUBMED_API_URL = process.env.CLUBMED_API_URL || 'https://api.integ.clubmed.com';
// Same budget as the HTTP client: undici waits 300 s by default, far past CloudFront's 30 s. A timeout answers 504.
const PROXY_TIMEOUT_MS =
  Number(process.env.HTTP_CLIENT_TIMEOUT_MS) || DEFAULT_HTTP_CLIENT_TIMEOUT_MS;

export const proxyConfig = {
  use: httpProxy,
  options: {
    upstream: CLUBMED_API_URL,
    prefix: '/api',
    rewritePrefix: '/',
    http2: false,
    replyOptions: {
      timeout: PROXY_TIMEOUT_MS,
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
};
