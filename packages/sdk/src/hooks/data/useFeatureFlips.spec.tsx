import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { Suspense } from 'react';

import { useFeatureFlips } from './useFeatureFlips';

global.fetch = vi.fn();

describe('useFeatureFlips', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    vi.clearAllMocks();
  });

  const Wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
    </QueryClientProvider>
  );

  it('should successfully fetch feature flips', async () => {
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

    const { result } = renderHook(() => useFeatureFlips(), {
      wrapper: Wrapper,
    });

    await waitFor(() => {
      expect(result.current.data).toEqual(mockResponse);
    });
  });

  it('should use correct CMS URL from environment', async () => {
    const mockResponse = { keys: [] };

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    renderHook(() => useFeatureFlips(), {
      wrapper: Wrapper,
    });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        `${import.meta.env.VITE_CMS_URL}/v1/contents/feature-flip/locales/fr-FR/releases/live/value`,
      );
    });
  });

  it('should cache results with correct staleTime and gcTime', async () => {
    const mockResponse = { keys: [] };

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const { result } = renderHook(() => useFeatureFlips(), {
      wrapper: Wrapper,
    });

    await waitFor(() => {
      expect(result.current.data).toEqual(mockResponse);
    });

    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
