import { logToCurl } from './logToCurl.js';

describe('logToCurl', () => {
  it('should get correct curl', () => {
    const curl = logToCurl({
      url: 'http://localhost3001/endpoint',
      method: 'get',
      params: { id: 1 },
      headers: { 'Content-Type': 'application/json' },
      data: { b: 2 },
    } as never);
    expect(curl).toBe(
      `curl -X GET 'http://localhost3001/endpoint?id=1' -d '{"b":2}' -H 'Content-Type: application/json'`,
    );
  });
  it('should get correct curl (multipart)', () => {
    const curl = logToCurl({
      url: 'http://localhost3001/endpoint',
      method: 'get',
      params: { id: 1 },
      headers: { 'Content-Type': 'multipart/form-data' },
      data: { a: 1, b: 2 },
    } as never);
    expect(curl).toBe(
      `curl -X GET 'http://localhost3001/endpoint?id=1' -F 'a=1' -F 'b=2' -H 'Content-Type: multipart/form-data'`,
    );
  });
  it('should get correct curl without headers', () => {
    const curl = logToCurl({
      response: {
        config: {
          baseURL: 'http://localhost3001/',
          headers: { 'Content-Type': 'application/json' },
        },
      },
      url: '/endpoint',
      params: { id: 1 },
      data: { b: 2 },
    } as never);
    expect(curl).toBe(
      `curl -X POST 'http://localhost3001//endpoint?id=1' -d '{"b":2}' -H 'Content-Type: application/json'`,
    );
  });
});
