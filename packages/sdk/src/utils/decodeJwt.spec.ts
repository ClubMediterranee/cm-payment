import { describe, expect, it } from 'vitest';

import { decodeJwt } from './decodeJwt';

describe('decodeJwt', () => {
  it('should decode a valid JWT token', () => {
    const payload = { userId: 123, name: 'John Doe' };
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const encodedPayload = btoa(JSON.stringify(payload));
    const signature = 'fake-signature';
    const token = `${header}.${encodedPayload}.${signature}`;

    const result = decodeJwt<typeof payload>(token);

    expect(result).toEqual(payload);
  });

  it('should decode JWT with URL-safe base64', () => {
    const payload = { data: 'test-data' };
    const header = btoa(JSON.stringify({ alg: 'HS256' }));
    const encodedPayload = btoa(JSON.stringify(payload))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
    const token = `${header}.${encodedPayload}.signature`;

    const result = decodeJwt<typeof payload>(token);

    expect(result).toEqual(payload);
  });

  it('should decode CyberSource token structure', () => {
    const payload = {
      ctx: [
        {
          data: {
            clientLibrary:
              'https://testflex.cybersource.com/microform/bundle/v2/flex-microform.min.js',
            clientLibraryIntegrity: 'sha384-test',
          },
        },
      ],
    };

    const header = btoa(JSON.stringify({ alg: 'HS256' }));
    const encodedPayload = btoa(JSON.stringify(payload));
    const token = `${header}.${encodedPayload}.signature`;

    const result = decodeJwt<typeof payload>(token);

    expect(result.ctx[0].data.clientLibrary).toBe(
      'https://testflex.cybersource.com/microform/bundle/v2/flex-microform.min.js',
    );
    expect(result.ctx[0].data.clientLibraryIntegrity).toBe('sha384-test');
  });
});
