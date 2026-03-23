import { renderHook } from '@testing-library/react';

import { usePaymentConfig } from '.';
import { PspProviders } from '../../../types/PspProviders';
import { usePaymentProviderSettings } from './usePaymentProviderSettings';

vi.mock('.', () => ({
  usePaymentConfig: vi.fn(),
}));

const mockUsePaymentConfig = vi.mocked(usePaymentConfig);

describe('usePaymentProviderSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return provider settings when provider exists', () => {
    mockUsePaymentConfig.mockReturnValue({
      data: {
        providers: {
          [PspProviders.HIPAY]: {
            is_active: true,
            display_type: 'hosted_field',
            settings: {
              api_key: 'test-api-key',
              merchant_id: 'merchant-123',
              max_amount: '10000',
              min_days_before_departure: '7',
            },
          },
        },
        featureFlip: {},
        settings: {},
      },
    } as any);

    const { result } = renderHook(() => usePaymentProviderSettings(PspProviders.HIPAY));

    expect(result.current).toEqual({
      api_key: 'test-api-key',
      merchant_id: 'merchant-123',
      max_amount: '10000',
      min_days_before_departure: '7',
    });
  });

  it('should return empty settings with null defaults when provider does not exist', () => {
    mockUsePaymentConfig.mockReturnValue({
      data: {
        providers: {},
        featureFlip: {},
        settings: {},
      },
    } as any);

    const { result } = renderHook(() => usePaymentProviderSettings(PspProviders.MHIPAY));

    expect(result.current).toEqual({
      max_amount: null,
      min_days_before_departure: null,
    });
  });

  it('should return null for missing max_amount', () => {
    mockUsePaymentConfig.mockReturnValue({
      data: {
        providers: {
          [PspProviders.EHIPAYBNPL]: {
            is_active: true,
            display_type: 'redirect',
            settings: {
              merchant_id: 'oney-merchant',
              payment_mode: '3x',
            },
          },
        },
        featureFlip: {},
        settings: {},
      },
    } as any);

    const { result } = renderHook(() => usePaymentProviderSettings(PspProviders.EHIPAYBNPL));

    expect(result.current.max_amount).toBeNull();
    expect(result.current.min_days_before_departure).toBeNull();
    expect(result.current).toHaveProperty('merchant_id', 'oney-merchant');
    expect(result.current).toHaveProperty('payment_mode', '3x');
  });

  it('should handle Uplift provider settings', () => {
    mockUsePaymentConfig.mockReturnValue({
      data: {
        providers: {
          [PspProviders.MUPLIFT]: {
            is_active: true,
            display_type: 'redirect',
            settings: {
              api_key: 'uplift-api-key',
              code: 'uplift-code',
              max_amount: '50000',
              min_days_before_departure: '14',
            },
          },
        },
        featureFlip: {},
        settings: {},
      },
    } as any);

    const { result } = renderHook(() => usePaymentProviderSettings(PspProviders.MUPLIFT));

    expect(result.current).toEqual({
      api_key: 'uplift-api-key',
      code: 'uplift-code',
      max_amount: '50000',
      min_days_before_departure: '14',
    });
  });

  it('should handle providers with partial settings', () => {
    mockUsePaymentConfig.mockReturnValue({
      data: {
        providers: {
          [PspProviders.EVOXPAY]: {
            is_active: true,
            display_type: 'redirect',
            settings: {
              merchant_id: 'evox-123',
            },
          },
        },
        featureFlip: {},
        settings: {},
      },
    } as any);

    const { result } = renderHook(() => usePaymentProviderSettings(PspProviders.EVOXPAY));

    expect(result.current).toEqual({
      merchant_id: 'evox-123',
      max_amount: null,
      min_days_before_departure: null,
    });
  });
});
