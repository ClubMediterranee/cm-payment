import { renderHook } from '@testing-library/react';

import { useBackUrl } from './useBackUrl';

const useSearch = vi.hoisted(() => vi.fn());

vi.mock('wouter', () => ({ useSearch }));

describe('useBackUrl', () => {
  it('returns the back_url query parameter', () => {
    useSearch.mockReturnValue('back_url=https%3A%2F%2Fclubmed.com%2Fstay');

    const { result } = renderHook(() => useBackUrl());

    expect(result.current).toBe('https://clubmed.com/stay');
  });

  it('falls back to the referrer when there is no back_url', () => {
    useSearch.mockReturnValue('');
    vi.spyOn(document, 'referrer', 'get').mockReturnValue('https://clubmed.com/referrer');

    const { result } = renderHook(() => useBackUrl());

    expect(result.current).toBe('https://clubmed.com/referrer');
  });
});
