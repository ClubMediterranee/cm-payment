import { constant, context, inject } from '@tsed/di';
import { PlatformContext } from '@tsed/platform-http';

import { fetcher } from './fetcher.js';

vi.mock('@tsed/di', async (importOriginal: () => Promise<any>) => {
  const actual = await importOriginal();
  return {
    ...actual,
    constant: vi.fn(),
    inject: vi.fn(),
    context: vi.fn(),
  };
});

describe('fetcher', () => {
  let mockHttpClient: {
    fetch: ReturnType<typeof vi.fn>;
  };
  let mockContext: Partial<PlatformContext>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockHttpClient = {
      fetch: vi.fn().mockResolvedValue({ data: 'success' }),
    };

    mockContext = {
      request: {
        headers: {
          'accept-language': 'en-US',
          'x-api-key': 'test-api-key',
        },
      } as any,
    };

    vi.mocked(constant).mockImplementation((key: string, defaultValue?: string) => {
      const values: Record<string, string> = {
        CLUBMED_API_URL: 'https://api.clubmed.com',
        CLUBMED_API_KEY: 'test-api-key',
        AKAMAI_CALLER_HEADER: 'X-CLUBMED-CALLER',
      };
      return values[key] || defaultValue || '';
    });

    vi.mocked(inject).mockReturnValue(mockHttpClient as any);
    vi.mocked(context).mockReturnValue(mockContext as any);
  });

  it('should make a GET request with all required headers', async () => {
    const result = await fetcher({
      url: '/test',
      method: 'GET',
    });

    expect(mockHttpClient.fetch).toHaveBeenCalledWith({
      callee: 'API',
      url: 'https://api.clubmed.com/test',
      method: 'GET',
      params: {},
      headers: {
        'x-api-key': 'test-api-key',
        caller: 'X-CLUBMED-CALLER',
        'Accept-Language': 'en-US',
      },
      data: undefined,
    });
    expect(result).toEqual({ data: 'success' });
  });

  it('should make a POST request with data and params', async () => {
    const payload = { name: 'test' };
    const params = { id: '123' };

    await fetcher({
      url: '/users',
      method: 'POST',
      data: payload,
      params,
    });

    expect(mockHttpClient.fetch).toHaveBeenCalledWith({
      callee: 'API',
      url: 'https://api.clubmed.com/users',
      method: 'POST',
      params: { id: '123' },
      headers: {
        'x-api-key': 'test-api-key',
        caller: 'X-CLUBMED-CALLER',
        'Accept-Language': 'en-US',
      },
      data: payload,
    });
  });

  it('should not include Accept-Language header when not present in context', async () => {
    vi.mocked(context).mockReturnValue({
      request: {
        headers: {
          'x-api-key': 'test-api-key',
        },
      },
    } as any);

    await fetcher({
      url: '/test',
      method: 'GET',
    });

    expect(mockHttpClient.fetch).toHaveBeenCalledWith(
      expect.objectContaining({
        headers: {
          'x-api-key': 'test-api-key',
          caller: 'X-CLUBMED-CALLER',
        },
      }),
    );
  });

  it('should handle missing context gracefully', async () => {
    vi.mocked(context).mockReturnValue(undefined as any);

    await fetcher({
      url: '/test',
      method: 'GET',
    });

    expect(mockHttpClient.fetch).toHaveBeenCalledWith(
      expect.objectContaining({
        headers: {
          'x-api-key': 'test-api-key',
          caller: 'X-CLUBMED-CALLER',
        },
      }),
    );
  });

  it('should use empty params object when params not provided', async () => {
    await fetcher({
      url: '/test',
      method: 'GET',
    });

    expect(mockHttpClient.fetch).toHaveBeenCalledWith(
      expect.objectContaining({
        params: {},
      }),
    );
  });

  it('should handle different HTTP methods', async () => {
    await fetcher({
      url: '/resource/1',
      method: 'PUT',
      data: { updated: true },
    });

    expect(mockHttpClient.fetch).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'PUT',
        data: { updated: true },
      }),
    );

    await fetcher({
      url: '/resource/2',
      method: 'DELETE',
    });

    expect(mockHttpClient.fetch).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'DELETE',
      }),
    );
  });
});
