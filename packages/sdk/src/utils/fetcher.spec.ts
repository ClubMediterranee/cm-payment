import { getPaymentConfig } from '../providers/PaymentConfigProvider';
import { fetcher } from './fetcher';

vi.mock('../providers/PaymentConfigProvider', () => ({
  getPaymentConfig: vi.fn(),
}));

global.fetch = vi.fn();

describe('fetcher', () => {
  const mockSDKOptions = {
    locale: 'fr-FR',
    oidc: {
      accessToken: 'test-token',
    },
    api: {
      url: 'https://api.test.com',
      apiKey: 'test-api-key',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getPaymentConfig).mockReturnValue(mockSDKOptions as any);
  });

  it('should successfully fetch data', async () => {
    const mockResponse = { data: 'test' };

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const result = await fetcher({
      url: '/test',
      method: 'GET',
    });

    expect(result).toEqual(mockResponse);
  });

  it('should include auth token when accessToken is present', async () => {
    const mockResponse = { data: 'test' };

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    await fetcher({
      url: '/test',
      method: 'GET',
    });

    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token',
        }),
      }),
    );
  });

  it('should not include auth token when accessToken is empty', async () => {
    const mockResponse = { data: 'test' };

    vi.mocked(getPaymentConfig).mockReturnValue({
      ...mockSDKOptions,
      oidc: { accessToken: '' },
    } as any);

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    await fetcher({
      url: '/test',
      method: 'GET',
    });

    const callArgs = vi.mocked(fetch).mock.calls[0];
    expect(callArgs[1]?.headers).not.toHaveProperty('Authorization');
  });

  it('should handle params with null values', async () => {
    const mockResponse = { data: 'test' };

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    await fetcher({
      url: '/test',
      method: 'GET',
      params: { key: null },
    });

    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('key=null'), expect.any(Object));
  });

  it('should skip undefined params', async () => {
    const mockResponse = { data: 'test' };

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    await fetcher({
      url: '/test',
      method: 'GET',
      params: { key: undefined },
    });

    expect(fetch).toHaveBeenCalledWith(expect.not.stringContaining('key='), expect.any(Object));
  });

  it('should handle params with string values', async () => {
    const mockResponse = { data: 'test' };

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    await fetcher({
      url: '/test',
      method: 'GET',
      params: { name: 'value', count: 123 },
    });

    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('name=value'), expect.any(Object));
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('count=123'), expect.any(Object));
  });

  it('should include body data for POST requests', async () => {
    const mockResponse = { data: 'test' };
    const postData = { name: 'test' };

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    await fetcher({
      url: '/test',
      method: 'POST',
      data: postData,
    });

    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        body: JSON.stringify(postData),
      }),
    );
  });

  it('should throw error with deepest error_description from nested errors', async () => {
    const mockErrorResponse = {
      name: 'BAD_REQUEST',
      message: 'Bad Request',
      status: 400,
      errors: [
        {
          status_code: 400,
          error: 'bad_request',
          errors: [
            {
              error_code: 'INVALID_EMAIL',
              error_description: 'Invalid customer email',
              status_code: 400,
            },
          ],
          error_description: 'Bad Request',
        },
      ],
    };

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => mockErrorResponse,
    } as Response);

    const error = await fetcher({ url: '/test', method: 'GET' }).catch((e) => e);

    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('Invalid customer email');
  });

  it('should fallback to json.message when no nested errors', async () => {
    const mockErrorResponse = {
      name: 'BAD_REQUEST',
      message: 'Bad Request',
      status: 400,
      errors: [],
    };

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => mockErrorResponse,
    } as Response);

    const error = await fetcher({ url: '/test', method: 'GET' }).catch((e) => e);

    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('Bad Request');
  });

  it('should include custom headers', async () => {
    const mockResponse = { data: 'test' };

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    await fetcher({
      url: '/test',
      method: 'GET',
      headers: { 'Custom-Header': 'value' },
    });

    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Custom-Header': 'value',
        }),
      }),
    );
  });
});
