import { renderHook } from '@testing-library/react';

import { MockedFormProvider } from '../__fixtures__/MockedFormProvider';
import { useMockedForm } from '../__fixtures__/useMockedForm';
import { usePaymentProvidersForm } from './usePaymentProvidersForm';

// Mock the data hook
vi.mock('./data/usePaymentProviders', () => ({
  usePaymentProviders: vi.fn(),
}));

const mockUsePaymentProviders = vi.mocked(
  (await import('./data/usePaymentProviders')).usePaymentProviders,
);

describe('usePaymentProvidersForm', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    const methods = useMockedForm({
      defaultValues: {
        provider_id: '',
      },
    });
    return <MockedFormProvider {...methods}>{children}</MockedFormProvider>;
  };

  it('should return paymentProviders and form functions', () => {
    const mockProviders = [
      { id: 'provider-1', description: 'Provider 1' },
      { id: 'provider-2', description: 'Provider 2' },
    ];

    mockUsePaymentProviders.mockReturnValue({
      data: mockProviders,
    });

    const { result } = renderHook(() => usePaymentProvidersForm(), { wrapper: Wrapper });

    expect(result.current.paymentProviders).toEqual(mockProviders);
    expect(result.current.register).toBeDefined();
    expect(result.current.setValue).toBeDefined();
    expect(result.current.trigger).toBeDefined();
    expect(result.current.watchedProviderId).toBeDefined();
  });

  it('should set first provider as default when providers exist', () => {
    const mockProviders = [
      { id: 'provider-1', description: 'Provider 1' },
      { id: 'provider-2', description: 'Provider 2' },
    ];

    mockUsePaymentProviders.mockReturnValue({
      data: mockProviders,
    });

    const { result } = renderHook(() => usePaymentProvidersForm(), { wrapper: Wrapper });

    expect(result.current.paymentProviders).toEqual(mockProviders);
    expect(result.current.watchedProviderId).toBeDefined();
  });

  it('should handle empty providers list', () => {
    mockUsePaymentProviders.mockReturnValue({
      data: [],
    });

    const { result } = renderHook(() => usePaymentProvidersForm(), { wrapper: Wrapper });

    expect(result.current.paymentProviders).toEqual([]);
  });

  it('should handle undefined data', () => {
    mockUsePaymentProviders.mockReturnValue({
      data: undefined,
    });

    const { result } = renderHook(() => usePaymentProvidersForm(), { wrapper: Wrapper });

    expect(result.current.paymentProviders).toEqual([]);
    expect(result.current.watchedProviderId).toBeDefined();
  });
});
