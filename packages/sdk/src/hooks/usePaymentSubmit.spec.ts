import { renderHook } from '@testing-library/react';
import type { UseFormReturn } from 'react-hook-form';

import type { CapsFormData } from '../types/FormData';
import * as usePaymentRedirectModule from './data/usePaymentRedirect';
import { usePaymentSubmit } from './usePaymentSubmit';
import * as useTokenRetryModule from './useTokenRetry';
import * as useFormModule from './utils/useForm';

describe('usePaymentSubmit', () => {
  let mockMutate: ReturnType<typeof vi.fn>;
  let mockHandleSubmit: ReturnType<typeof vi.fn>;
  let mockGetValues: ReturnType<typeof vi.fn>;
  let mockHandleTokenValidationError: ReturnType<typeof vi.fn>;
  let onErrorMock: ReturnType<typeof vi.fn>;
  let onLoadMock: ReturnType<typeof vi.fn>;
  let onLoadEndMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockMutate = vi.fn();
    mockGetValues = vi.fn(() => ({ amount: '100', currency: 'EUR' }));
    mockHandleSubmit = vi.fn(
      (
        onValid?: (data: CapsFormData) => void | Promise<void>,
        onInvalid?: (errors: any) => void | Promise<void>,
      ) =>
        async (e?: React.BaseSyntheticEvent) => {
          e?.preventDefault();
          const data = mockGetValues();
          if (onValid) {
            await onValid(data);
          }
          if (onInvalid && mockHandleSubmit.mock.lastCall?.[1]) {
            await onInvalid({ token: { value: 'Token is required' } });
          }
        },
    );
    mockHandleTokenValidationError = vi.fn();

    onErrorMock = vi.fn();
    onLoadMock = vi.fn();
    onLoadEndMock = vi.fn();

    vi.spyOn(useFormModule, 'useFormContext').mockReturnValue({
      handleSubmit: mockHandleSubmit,
      getValues: mockGetValues,
    } as Partial<UseFormReturn<CapsFormData>> as UseFormReturn<CapsFormData>);

    vi.spyOn(usePaymentRedirectModule, 'usePaymentRedirect').mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as any);

    vi.spyOn(useTokenRetryModule, 'useTokenRetry').mockReturnValue({
      handleTokenValidationError: mockHandleTokenValidationError,
    });
  });

  it('should initialize with isPending false', () => {
    const { result } = renderHook(() =>
      usePaymentSubmit({ onError: onErrorMock, onLoad: onLoadMock, onLoadEnd: onLoadEndMock }),
    );

    expect(result.current.isPending).toBe(false);
  });

  it('should call mutate on handleSubmit with form data', async () => {
    const { result } = renderHook(() =>
      usePaymentSubmit({ onError: onErrorMock, onLoad: onLoadMock, onLoadEnd: onLoadEndMock }),
    );

    const mockEvent = { preventDefault: vi.fn() } as any;
    await result.current.handleSubmit(mockEvent);

    expect(mockMutate).toHaveBeenCalledWith({ amount: '100', currency: 'EUR' });
  });

  it('should call onLoad when isPending becomes true', () => {
    vi.spyOn(usePaymentRedirectModule, 'usePaymentRedirect').mockReturnValue({
      mutate: mockMutate,
      isPending: true,
    } as any);

    renderHook(() =>
      usePaymentSubmit({ onError: onErrorMock, onLoad: onLoadMock, onLoadEnd: onLoadEndMock }),
    );

    expect(onLoadMock).toHaveBeenCalledTimes(1);
  });

  it('should not call onLoad when isPending is false', () => {
    renderHook(() =>
      usePaymentSubmit({ onError: onErrorMock, onLoad: onLoadMock, onLoadEnd: onLoadEndMock }),
    );

    expect(onLoadMock).not.toHaveBeenCalled();
  });

  it('should pass onError to usePaymentRedirect', () => {
    renderHook(() =>
      usePaymentSubmit({ onError: onErrorMock, onLoad: onLoadMock, onLoadEnd: onLoadEndMock }),
    );

    expect(usePaymentRedirectModule.usePaymentRedirect).toHaveBeenCalledWith(
      expect.objectContaining({
        onError: expect.any(Function),
      }),
    );
  });

  it('should call onError when mutation fails', () => {
    const testError = new Error('Payment failed');

    renderHook(() =>
      usePaymentSubmit({ onError: onErrorMock, onLoad: onLoadMock, onLoadEnd: onLoadEndMock }),
    );

    const paymentRedirectCall = vi.mocked(usePaymentRedirectModule.usePaymentRedirect).mock
      .calls[0][0];
    paymentRedirectCall.onError?.(testError);

    expect(onErrorMock).toHaveBeenCalledWith(testError);
  });

  it('should redirect on success', () => {
    delete (window as any).location;
    window.location = { href: '' } as any;

    renderHook(() =>
      usePaymentSubmit({ onError: onErrorMock, onLoad: onLoadMock, onLoadEnd: onLoadEndMock }),
    );

    const paymentRedirectCall = vi.mocked(usePaymentRedirectModule.usePaymentRedirect).mock
      .calls[0][0];
    paymentRedirectCall.onSuccess?.('https://payment.gateway.com');

    expect(window.location.href).toBe('https://payment.gateway.com');
  });

  it('should pass onLoadEnd to usePaymentRedirect', () => {
    renderHook(() =>
      usePaymentSubmit({ onError: onErrorMock, onLoad: onLoadMock, onLoadEnd: onLoadEndMock }),
    );

    expect(usePaymentRedirectModule.usePaymentRedirect).toHaveBeenCalledWith(
      expect.objectContaining({
        onLoadEnd: onLoadEndMock,
      }),
    );
  });

  it('should call handleTokenValidationError on form validation error', async () => {
    mockHandleSubmit.mockImplementation(
      (
        _onValid?: (data: CapsFormData) => void | Promise<void>,
        onInvalid?: (errors: any) => void | Promise<void>,
      ) =>
        async (e?: React.BaseSyntheticEvent) => {
          e?.preventDefault();
          if (onInvalid) {
            await onInvalid({ token: { value: 'Token is required' } });
          }
        },
    );

    const { result } = renderHook(() =>
      usePaymentSubmit({ onError: onErrorMock, onLoad: onLoadMock, onLoadEnd: onLoadEndMock }),
    );

    const mockEvent = { preventDefault: vi.fn() } as any;
    await result.current.handleSubmit(mockEvent);

    expect(mockHandleTokenValidationError).toHaveBeenCalledWith({
      token: { value: 'Token is required' },
    });
  });

  it('should retry with getValues when token retry is triggered', () => {
    renderHook(() =>
      usePaymentSubmit({ onError: onErrorMock, onLoad: onLoadMock, onLoadEnd: onLoadEndMock }),
    );

    const tokenRetryCall = vi.mocked(useTokenRetryModule.useTokenRetry).mock.calls[0][0];
    tokenRetryCall.onRetry();

    expect(mockGetValues).toHaveBeenCalled();
    expect(mockMutate).toHaveBeenCalledWith({ amount: '100', currency: 'EUR' });
  });

  it('should work without optional callbacks', async () => {
    const { result } = renderHook(() => usePaymentSubmit({}));

    const mockEvent = { preventDefault: vi.fn() } as any;
    await result.current.handleSubmit(mockEvent);

    expect(mockMutate).toHaveBeenCalled();
  });
});
