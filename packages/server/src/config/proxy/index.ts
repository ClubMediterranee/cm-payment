import '../utils/index.js';

import httpProxy from '@fastify/http-proxy';

const CLUBMED_API_URL = process.env.CLUBMED_API_URL || 'https://api.integ.clubmed.com';

export const proxyConfig = {
  use: httpProxy,
  options: {
    upstream: CLUBMED_API_URL,
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
};
