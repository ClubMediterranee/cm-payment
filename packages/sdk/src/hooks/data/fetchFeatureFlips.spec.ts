import { fetchFeatureFlips } from './useFeatureFlips';

global.fetch = vi.fn();

describe('fetchFeatureFlips', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should successfully fetch and return feature flips data', async () => {
    const mockResponse = {
      keys: [
        { key: 'featureFlipping.feature1', value: true },
        { key: 'featureFlipping.feature2', value: false },
      ],
    };

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const result = await fetchFeatureFlips();

    expect(result).toEqual(mockResponse);
  });

  it('should throw error with error_description for 404 status', async () => {
    const mockErrorResponse = {
      status_code: 404,
      error_description: 'Feature flips not found',
    };

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => mockErrorResponse,
    } as Response);

    await expect(fetchFeatureFlips()).rejects.toThrow('Feature flips not found');
  });

  it('should throw error from errors array for non-404 status', async () => {
    const mockErrorResponse = {
      errors: [
        {
          error_description: 'Internal server error',
        },
      ],
    };

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => mockErrorResponse,
    } as Response);

    await expect(fetchFeatureFlips()).rejects.toThrow('Internal server error');
  });

  it('should call correct CMS URL', async () => {
    const mockResponse = { keys: [] };

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    await fetchFeatureFlips();

    expect(fetch).toHaveBeenCalledWith(
      `${import.meta.env.VITE_CMS_URL}/v1/contents/feature-flip/locales/fr-FR/releases/live/value`,
    );
  });
});
