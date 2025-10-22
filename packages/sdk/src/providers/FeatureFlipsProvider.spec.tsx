import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { PropsWithChildren } from 'react';

import type { FeatureFlipsResponse } from '../types/FeatureFlips';
import { FeatureFlipsProvider, useFeatureFlipsContext } from './FeatureFlipsProvider';

vi.mock('../hooks/data/useFeatureFlips', () => ({
  useFeatureFlips: vi.fn(),
}));

const mockUseFeatureFlips = vi.mocked(
  (await import('../hooks/data/useFeatureFlips')).useFeatureFlips,
);

describe('FeatureFlipsProvider', () => {
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
      <FeatureFlipsProvider locale="fr-FR">{children}</FeatureFlipsProvider>
    </QueryClientProvider>
  );

  const WrapperUS = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>
      <FeatureFlipsProvider locale="en-US">{children}</FeatureFlipsProvider>
    </QueryClientProvider>
  );

  describe('basic functionality', () => {
    it('should provide flips loaded from CMS to React context', async () => {
      const mockFlipsData: FeatureFlipsResponse = {
        keys: [
          { key: 'featureFlipping.newPaymentFlow', value: true },
          { key: 'featureFlipping.enablePayPal', value: false },
        ],
      };

      mockUseFeatureFlips.mockReturnValue({
        data: mockFlipsData,
      } as any);

      const { result } = renderHook(() => useFeatureFlipsContext(), {
        wrapper: Wrapper,
      });

      await waitFor(() => {
        expect(result.current.flips).toEqual({
          'featureFlipping.newPaymentFlow': true,
          'featureFlipping.enablePayPal': false,
        });
      });
    });

    it('should allow checking flip via getFlip function', async () => {
      const mockFlipsData: FeatureFlipsResponse = {
        keys: [
          { key: 'featureFlipping.paymentSchedule', value: true },
          { key: 'featureFlipping.cryptoPayment', value: false },
        ],
      };

      mockUseFeatureFlips.mockReturnValue({
        data: mockFlipsData,
      } as any);

      const { result } = renderHook(() => useFeatureFlipsContext(), {
        wrapper: Wrapper,
      });

      await waitFor(() => {
        const isPaymentScheduleEnabled = result.current.getFlip('featureFlipping.paymentSchedule');
        const isCryptoEnabled = result.current.getFlip('featureFlipping.cryptoPayment');

        expect(isPaymentScheduleEnabled).toBe(true);
        expect(isCryptoEnabled).toBe(false);
      });
    });
  });

  describe('locale override', () => {
    it('should prioritize locale override for specific region', async () => {
      const mockFlipsData: FeatureFlipsResponse = {
        keys: [
          { key: 'featureFlipping.premiumCheckout', value: false },
          { key: 'override.fr-FR.featureFlipping.premiumCheckout', value: true },
        ],
      };

      mockUseFeatureFlips.mockReturnValue({
        data: mockFlipsData,
      } as any);

      const { result } = renderHook(() => useFeatureFlipsContext(), {
        wrapper: Wrapper,
      });

      await waitFor(() => {
        const isPremiumEnabled = result.current.getFlip('featureFlipping.premiumCheckout');
        expect(isPremiumEnabled).toBe(true);
      });
    });

    it('should use global flip when no override exists for current locale', async () => {
      const mockFlipsData: FeatureFlipsResponse = {
        keys: [
          { key: 'featureFlipping.globalFeature', value: true },
          { key: 'override.de-DE.featureFlipping.globalFeature', value: false },
        ],
      };

      mockUseFeatureFlips.mockReturnValue({
        data: mockFlipsData,
      } as any);

      const { result } = renderHook(() => useFeatureFlipsContext(), {
        wrapper: Wrapper,
      });

      await waitFor(() => {
        const isEnabled = result.current.getFlip('featureFlipping.globalFeature');
        expect(isEnabled).toBe(true);
      });
    });

    it('should disable feature for specific locale via override', async () => {
      const mockFlipsData: FeatureFlipsResponse = {
        keys: [
          { key: 'featureFlipping.betaFeature', value: true },
          { key: 'override.en-US.featureFlipping.betaFeature', value: false },
        ],
      };

      mockUseFeatureFlips.mockReturnValue({
        data: mockFlipsData,
      } as any);

      const { result } = renderHook(() => useFeatureFlipsContext(), {
        wrapper: WrapperUS,
      });

      await waitFor(() => {
        const isEnabled = result.current.getFlip('featureFlipping.betaFeature');
        expect(isEnabled).toBe(false);
      });
    });
  });

  describe('edge cases and defaults', () => {
    it('should return false for non-existent flip', async () => {
      const mockFlipsData: FeatureFlipsResponse = {
        keys: [{ key: 'featureFlipping.existingFeature', value: true }],
      };

      mockUseFeatureFlips.mockReturnValue({
        data: mockFlipsData,
      } as any);

      const { result } = renderHook(() => useFeatureFlipsContext(), {
        wrapper: Wrapper,
      });

      await waitFor(() => {
        const nonExistent = result.current.getFlip('featureFlipping.nonExistent');
        expect(nonExistent).toBe(false);
      });
    });

    it('should handle no flip data available (empty CMS)', async () => {
      mockUseFeatureFlips.mockReturnValue({
        data: undefined,
      } as any);

      const { result } = renderHook(() => useFeatureFlipsContext(), {
        wrapper: Wrapper,
      });

      await waitFor(() => {
        expect(result.current.flips).toEqual({});
        expect(result.current.getFlip('featureFlipping.anyFeature')).toBe(false);
      });
    });

    it('should handle empty CMS response with empty array', async () => {
      const mockFlipsData: FeatureFlipsResponse = {
        keys: [],
      };

      mockUseFeatureFlips.mockReturnValue({
        data: mockFlipsData,
      } as any);

      const { result } = renderHook(() => useFeatureFlipsContext(), {
        wrapper: Wrapper,
      });

      await waitFor(() => {
        expect(result.current.flips).toEqual({});
        expect(result.current.getFlip('featureFlipping.anyFeature')).toBe(false);
      });
    });
  });

  describe('business scenarios', () => {
    it('should support regional A/B testing for payment experience', async () => {
      const mockFlipsData: FeatureFlipsResponse = {
        keys: [
          { key: 'featureFlipping.newCheckoutUI', value: false },
          { key: 'override.fr-FR.featureFlipping.newCheckoutUI', value: true },
          { key: 'override.en-US.featureFlipping.newCheckoutUI', value: false },
        ],
      };

      mockUseFeatureFlips.mockReturnValue({
        data: mockFlipsData,
      } as any);

      const { result: frenchResult } = renderHook(() => useFeatureFlipsContext(), {
        wrapper: Wrapper,
      });

      const { result: usResult } = renderHook(() => useFeatureFlipsContext(), {
        wrapper: WrapperUS,
      });

      await waitFor(() => {
        expect(frenchResult.current.getFlip('featureFlipping.newCheckoutUI')).toBe(true);
        expect(usResult.current.getFlip('featureFlipping.newCheckoutUI')).toBe(false);
      });
    });

    it('should handle multiple flip checks to conditionally display payment options', async () => {
      const mockFlipsData: FeatureFlipsResponse = {
        keys: [
          { key: 'featureFlipping.enableCreditCard', value: true },
          { key: 'featureFlipping.enablePayPal', value: true },
          { key: 'featureFlipping.enableBankTransfer', value: false },
          { key: 'featureFlipping.enableCrypto', value: false },
        ],
      };

      mockUseFeatureFlips.mockReturnValue({
        data: mockFlipsData,
      } as any);

      const { result } = renderHook(() => useFeatureFlipsContext(), {
        wrapper: Wrapper,
      });

      await waitFor(() => {
        const availablePaymentMethods = {
          creditCard: result.current.getFlip('featureFlipping.enableCreditCard'),
          payPal: result.current.getFlip('featureFlipping.enablePayPal'),
          bankTransfer: result.current.getFlip('featureFlipping.enableBankTransfer'),
          crypto: result.current.getFlip('featureFlipping.enableCrypto'),
        };

        expect(availablePaymentMethods).toEqual({
          creditCard: true,
          payPal: true,
          bankTransfer: false,
          crypto: false,
        });
      });
    });
  });

  describe('cache and synchronization', () => {
    it('should correctly transform CMS data into usable flips', async () => {
      const mockFlipsData: FeatureFlipsResponse = {
        keys: [
          { key: 'featureFlipping.feature1', value: true },
          { key: 'featureFlipping.feature2', value: false },
          { key: 'override.fr-FR.featureFlipping.feature3', value: true },
        ],
      };

      mockUseFeatureFlips.mockReturnValue({
        data: mockFlipsData,
      } as any);

      const { result } = renderHook(() => useFeatureFlipsContext(), {
        wrapper: Wrapper,
      });

      await waitFor(() => {
        expect(result.current.flips).toEqual({
          'featureFlipping.feature1': true,
          'featureFlipping.feature2': false,
          'override.fr-FR.featureFlipping.feature3': true,
        });
      });
    });

    it('should recalculate flips when CMS data changes', async () => {
      const initialData: FeatureFlipsResponse = {
        keys: [{ key: 'featureFlipping.dynamicFeature', value: false }],
      };

      mockUseFeatureFlips.mockReturnValue({
        data: initialData,
      } as any);

      const { result, rerender } = renderHook(() => useFeatureFlipsContext(), {
        wrapper: Wrapper,
      });

      await waitFor(() => {
        expect(result.current.getFlip('featureFlipping.dynamicFeature')).toBe(false);
      });

      const updatedData: FeatureFlipsResponse = {
        keys: [{ key: 'featureFlipping.dynamicFeature', value: true }],
      };

      mockUseFeatureFlips.mockReturnValue({
        data: updatedData,
      } as any);

      rerender();

      await waitFor(() => {
        expect(result.current.getFlip('featureFlipping.dynamicFeature')).toBe(true);
      });
    });
  });

  describe('error handling', () => {
    it('should provide default context even outside Provider', () => {
      const { result } = renderHook(() => useFeatureFlipsContext());

      expect(result.current.flips).toEqual({});
      expect(result.current.getFlip('anyFeature')).toBe(false);
    });
  });
});
