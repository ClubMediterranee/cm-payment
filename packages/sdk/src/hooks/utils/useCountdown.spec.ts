import { act, renderHook } from '@testing-library/react';

import { useCountdown } from './useCountdown';

describe('useCountdown', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('initializes secondsRemaining with the given duration', () => {
    const { result } = renderHook(() => useCountdown(10));

    expect(result.current.secondsRemaining).toBe(10);
    expect(result.current.expired).toBe(false);
  });

  it('decrements secondsRemaining every second', () => {
    const { result } = renderHook(() => useCountdown(10));

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.secondsRemaining).toBe(9);

    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(result.current.secondsRemaining).toBe(6);
  });

  it('marks as expired once the countdown reaches zero', () => {
    const { result } = renderHook(() => useCountdown(2));

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(result.current.secondsRemaining).toBe(0);
    expect(result.current.expired).toBe(true);
  });

  it('does not start a countdown when duration is zero', () => {
    const { result } = renderHook(() => useCountdown(0));

    expect(result.current.secondsRemaining).toBe(0);
    expect(result.current.expired).toBe(false);
  });

  it('resets the countdown when resetKey changes', () => {
    const { result, rerender } = renderHook(({ resetKey }) => useCountdown(10, resetKey), {
      initialProps: { resetKey: 'a' },
    });

    act(() => {
      vi.advanceTimersByTime(4000);
    });
    expect(result.current.secondsRemaining).toBe(6);

    rerender({ resetKey: 'b' });
    expect(result.current.secondsRemaining).toBe(10);
  });
});
