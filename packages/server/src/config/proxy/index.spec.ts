import { DEFAULT_HTTP_CLIENT_TIMEOUT_MS } from '../../infra/http/HttpClient.js';
import { proxyConfig } from './index.js';

describe('proxyConfig', () => {
  it('bounds the /api upstream calls with the HTTP client timeout', () => {
    expect(proxyConfig.options.replyOptions.timeout).toBe(DEFAULT_HTTP_CLIENT_TIMEOUT_MS);
  });

  it('forwards the tracing, auth and locale headers to the Club Med API', () => {
    const headers = proxyConfig.options.replyOptions.rewriteRequestHeaders(
      {
        headers: {
          'x-request-id': 'req-1',
          'x-api-key': 'key',
          authorization: 'Bearer token',
          'accept-language': 'fr-FR',
        },
      },
      { host: 'api.example' },
    );

    expect(headers).toEqual({
      host: 'api.example',
      'x-request-id': 'req-1',
      'x-api-key': 'key',
      authorization: 'Bearer token',
      'accept-language': 'fr-FR',
    });
  });
});
