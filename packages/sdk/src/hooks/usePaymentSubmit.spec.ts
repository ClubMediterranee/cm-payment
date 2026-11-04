import { renderHook } from '@testing-library/react';
import type { Mock } from 'vitest';

import * as FormCallbacksContextModule from '../contexts/FormCallbacksContext';
import type { CapsEvent } from '../embed/shared';
import { CapsFormSchema } from '../schemas/capsFormSchema';
import * as usePaymentRedirectModule from './data/usePaymentRedirect';
import { usePaymentSubmit } from './usePaymentSubmit';
import * as useTokenRetryModule from './useTokenRetry';
import * as useFormModule from './utils/useForm';
import * as useProviderIntegrationModeModule from './utils/useProviderIntegrationMode';

vi.mock('./utils/useProviderIntegrationMode');

describe('usePaymentSubmit', () => {
  let mockMutate: Mock;
  let mockHandleSubmit: Mock;
  let mockGetValues: Mock;
  let mockHandleTokenValidationError: Mock<(errors: any) => void>;
  let onEventMock: Mock<(event: CapsEvent) => void>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockMutate = vi.fn();
    mockGetValues = vi.fn(() => ({ amount: '100', currency: 'EUR' }));
    mockHandleSubmit = vi.fn(
      (
        onValid?: (data: CapsFormSchema) => void | Promise<void>,
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

    onEventMock = vi.fn();

    vi.spyOn(FormCallbacksContextModule, 'useFormCallbacks').mockReturnValue({
      onEvent: onEventMock,
    });

    vi.spyOn(useFormModule, 'useFormContext').mockReturnValue({
      handleSubmit: mockHandleSubmit,
      getValues: mockGetValues,
      triggerAndTouch: vi.fn(),
    } as unknown as ReturnType<typeof useFormModule.useFormContext>);

    vi.spyOn(usePaymentRedirectModule, 'usePaymentRedirect').mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as any);

    vi.spyOn(useTokenRetryModule, 'useTokenRetry').mockReturnValue({
      handleTokenValidationError: mockHandleTokenValidationError,
    });

    vi.spyOn(useProviderIntegrationModeModule, 'useProviderIntegrationMode').mockReturnValue({
      iframe: false,
      thirdPartyIframe: false,
      redirect: true,
      hostedField: false,
      custom: false,
    });
  });

  it('should initialize with isPending false', () => {
    const { result } = renderHook(() => usePaymentSubmit());

    expect(result.current.isPending).toBe(false);
  });

  it('should call mutate on handleSubmit with form data', async () => {
    const { result } = renderHook(() => usePaymentSubmit());

    const mockEvent = { preventDefault: vi.fn() } as any;
    await result.current.handleSubmit(mockEvent);

    expect(mockMutate).toHaveBeenCalledWith({ amount: '100', currency: 'EUR' });
  });

  it('should emit load when isPending becomes true', () => {
    vi.spyOn(usePaymentRedirectModule, 'usePaymentRedirect').mockReturnValue({
      mutate: mockMutate,
      isPending: true,
    } as any);

    renderHook(() => usePaymentSubmit());

    expect(onEventMock).toHaveBeenCalledTimes(1);
    expect(onEventMock).toHaveBeenCalledWith({ action: '', name: 'load' });
  });

  it('should emit load once while pending, even when the callback identity changes', () => {
    vi.spyOn(usePaymentRedirectModule, 'usePaymentRedirect').mockReturnValue({
      mutate: mockMutate,
      isPending: true,
    } as any);

    const { rerender } = renderHook(() => usePaymentSubmit());

    const nextOnEvent = vi.fn();
    vi.spyOn(FormCallbacksContextModule, 'useFormCallbacks').mockReturnValue({
      onEvent: nextOnEvent,
    });
    rerender();
    rerender();

    expect(onEventMock).toHaveBeenCalledTimes(1);
    expect(nextOnEvent).not.toHaveBeenCalled();
  });

  it('should not emit load when isPending is false', () => {
    renderHook(() => usePaymentSubmit());

    expect(onEventMock).not.toHaveBeenCalled();
  });

  it('should emit submit with the amount to pay before the payment request', async () => {
    mockGetValues.mockReturnValue({ provider_id: 'P1', amount: '1250.00', currency: 'EUR' });
    const { result } = renderHook(() => usePaymentSubmit());

    await result.current.handleSubmit({ preventDefault: vi.fn() } as any);

    expect(onEventMock).toHaveBeenCalledWith({
      action: 'click',
      name: 'submit',
      data: { provider_id: 'P1', amount: 1250, currency: 'EUR' },
    });
    expect(onEventMock.mock.invocationCallOrder[0]).toBeLessThan(
      mockMutate.mock.invocationCallOrder[0],
    );
  });

  it('should not emit submit when the form is invalid', async () => {
    mockHandleSubmit.mockImplementation(
      (_onValid: unknown, onInvalid?: (errors: any) => void) => async () => onInvalid?.({}),
    );
    const { result } = renderHook(() => usePaymentSubmit());

    await result.current.handleSubmit();

    expect(onEventMock).not.toHaveBeenCalled();
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('should pass onError to usePaymentRedirect', () => {
    renderHook(() => usePaymentSubmit());

    expect(usePaymentRedirectModule.usePaymentRedirect).toHaveBeenCalledWith(
      expect.objectContaining({
        onError: expect.any(Function),
      }),
    );
  });

  it('should emit an error event when mutation fails', () => {
    const testError = new Error('Payment failed');

    renderHook(() => usePaymentSubmit());

    const paymentRedirectCall = vi.mocked(usePaymentRedirectModule.usePaymentRedirect).mock
      .calls[0]?.[0];
    paymentRedirectCall?.onError?.(testError);

    expect(onEventMock).toHaveBeenCalledWith({
      action: '',
      name: 'error',
      data: { code: 'FLOW_ERROR', message: 'Payment failed' },
    });
  });

  it('should redirect on success by default', () => {
    delete (window as any).location;
    window.location = { href: '' } as any;

    renderHook(() => usePaymentSubmit());

    const paymentRedirectCall = vi.mocked(usePaymentRedirectModule.usePaymentRedirect).mock
      .calls[0]?.[0];
    const redirect = { url: 'https://payment.gateway.com', method: 'GET' };
    paymentRedirectCall?.onSuccess?.({ redirect } as any);

    expect(window.location.href).toBe('https://payment.gateway.com');
  });

  it('should call loadPaymentProviderUrl on success', () => {
    renderHook(() => usePaymentSubmit());

    const paymentRedirectCall = vi.mocked(usePaymentRedirectModule.usePaymentRedirect).mock
      .calls[0]?.[0];

    expect(paymentRedirectCall?.onSuccess).toBeDefined();
  });

  it('should emit load_end when the payment request ends', () => {
    renderHook(() => usePaymentSubmit());

    const paymentRedirectCall = vi.mocked(usePaymentRedirectModule.usePaymentRedirect).mock
      .calls[0]?.[0];
    paymentRedirectCall?.onLoadEnd?.();

    expect(onEventMock).toHaveBeenCalledWith({ action: '', name: 'load_end' });
  });

  it('should call handleTokenValidationError on form validation error', async () => {
    mockHandleSubmit.mockImplementation(
      (
        _onValid?: (data: CapsFormSchema) => void | Promise<void>,
        onInvalid?: (errors: any) => void | Promise<void>,
      ) =>
        async (e?: React.BaseSyntheticEvent) => {
          e?.preventDefault();
          if (onInvalid) {
            await onInvalid({ token: { value: 'Token is required' } });
          }
        },
    );

    const { result } = renderHook(() => usePaymentSubmit());

    const mockEvent = { preventDefault: vi.fn() } as any;
    await result.current.handleSubmit(mockEvent);

    expect(mockHandleTokenValidationError).toHaveBeenCalledWith({
      token: { value: 'Token is required' },
    });
  });

  it('should retry with getValues when token retry is triggered', () => {
    renderHook(() => usePaymentSubmit());

    const tokenRetryCall = vi.mocked(useTokenRetryModule.useTokenRetry).mock.calls[0][0];
    tokenRetryCall.onRetry();

    expect(mockGetValues).toHaveBeenCalled();
    expect(mockMutate).toHaveBeenCalledWith({ amount: '100', currency: 'EUR' });
    expect(onEventMock).not.toHaveBeenCalled();
  });

  it('should work without optional callbacks', async () => {
    const { result } = renderHook(() => usePaymentSubmit({}));

    const mockEvent = { preventDefault: vi.fn() } as any;
    await result.current.handleSubmit(mockEvent);

    expect(mockMutate).toHaveBeenCalled();
  });
});
