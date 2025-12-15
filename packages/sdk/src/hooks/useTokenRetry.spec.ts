import { act, renderHook } from '@testing-library/react';

import { useTokenRetry } from './useTokenRetry';

vi.mock('react-hook-form', async () => {
  const actual = await vi.importActual('react-hook-form');
  return {
    ...actual,
    useWatch: vi.fn(() => 'idle'),
  };
});

const mockUseWatch = vi.mocked(await import('react-hook-form')).useWatch;

describe('useTokenRetry', () => {
  let onRetryMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    onRetryMock = vi.fn();
    mockUseWatch.mockReturnValue('idle');
  });

  it('should not retry when shouldRetry is false', () => {
    const { result } = renderHook(() => useTokenRetry({ onRetry: onRetryMock }));

    result.current.handleTokenValidationError({});

    expect(onRetryMock).not.toHaveBeenCalled();
  });

  it('should enable retry when token error is unique and status is pending', () => {
    mockUseWatch.mockReturnValue('pending');

    const { result, rerender } = renderHook(() => useTokenRetry({ onRetry: onRetryMock }));

    act(() => {
      result.current.handleTokenValidationError({
        token: { value: 'Token is required' },
      });
    });

    act(() => {
      mockUseWatch.mockReturnValue('success');
      rerender();
    });

    expect(onRetryMock).toHaveBeenCalledTimes(1);
  });

  it('should not enable retry when there are multiple errors', () => {
    mockUseWatch.mockReturnValue('pending');

    const { result } = renderHook(() => useTokenRetry({ onRetry: onRetryMock }));

    result.current.handleTokenValidationError({
      token: { value: 'Token is required' },
      cardNumber: 'Card number is invalid',
    });

    expect(onRetryMock).not.toHaveBeenCalled();
  });

  it('should not enable retry when token error is not present', () => {
    mockUseWatch.mockReturnValue('pending');

    const { result } = renderHook(() => useTokenRetry({ onRetry: onRetryMock }));

    result.current.handleTokenValidationError({
      cardNumber: 'Card number is invalid',
    });

    expect(onRetryMock).not.toHaveBeenCalled();
  });

  it('should not enable retry when token status is not pending', () => {
    mockUseWatch.mockReturnValue('idle');

    const { result } = renderHook(() => useTokenRetry({ onRetry: onRetryMock }));

    result.current.handleTokenValidationError({
      token: { value: 'Token is required' },
    });

    expect(onRetryMock).not.toHaveBeenCalled();
  });

  it('should call onRetry when token status becomes success and retry is enabled', () => {
    mockUseWatch.mockReturnValue('pending');

    const { result, rerender } = renderHook(() => useTokenRetry({ onRetry: onRetryMock }));

    act(() => {
      result.current.handleTokenValidationError({
        token: { value: 'Token is required' },
      });
    });

    act(() => {
      mockUseWatch.mockReturnValue('success');
      rerender();
    });

    expect(onRetryMock).toHaveBeenCalledTimes(1);
  });

  it('should not call onRetry when token status becomes error', () => {
    mockUseWatch.mockReturnValue('pending');

    const { result, rerender } = renderHook(() => useTokenRetry({ onRetry: onRetryMock }));

    act(() => {
      result.current.handleTokenValidationError({
        token: { value: 'Token is required' },
      });
    });

    act(() => {
      mockUseWatch.mockReturnValue('error');
      rerender();
    });

    expect(onRetryMock).not.toHaveBeenCalled();
  });

  it('should disable retry when token status is no longer pending', () => {
    mockUseWatch.mockReturnValue('pending');

    const { result, rerender } = renderHook(() => useTokenRetry({ onRetry: onRetryMock }));

    act(() => {
      result.current.handleTokenValidationError({
        token: { value: 'Token is required' },
      });
    });

    act(() => {
      mockUseWatch.mockReturnValue('idle');
      rerender();
    });

    act(() => {
      mockUseWatch.mockReturnValue('success');
      rerender();
    });

    expect(onRetryMock).not.toHaveBeenCalled();
  });
});
