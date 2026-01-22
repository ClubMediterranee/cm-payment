import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useSearchParams } from 'wouter';

import { useQueryParams } from './useQueryParams';

vi.mock('wouter', () => ({
  useSearchParams: vi.fn(),
}));

describe('useQueryParams', () => {
  it('returns an empty object when there are no query params', () => {
    const mockSearchParams = new URLSearchParams('');
    vi.mocked(useSearchParams).mockReturnValue([mockSearchParams, vi.fn()]);

    const { result } = renderHook(() => useQueryParams());

    expect(result.current).toEqual({});
  });

  it('returns query params as an object', () => {
    const mockSearchParams = new URLSearchParams('?foo=bar&baz=qux');
    vi.mocked(useSearchParams).mockReturnValue([mockSearchParams, vi.fn()]);

    const { result } = renderHook(() => useQueryParams());

    expect(result.current).toEqual({
      foo: 'bar',
      baz: 'qux',
    });
  });

  it('handles multiple values for the same param', () => {
    const mockSearchParams = new URLSearchParams('?tag=react&tag=typescript');
    vi.mocked(useSearchParams).mockReturnValue([mockSearchParams, vi.fn()]);

    const { result } = renderHook(() => useQueryParams());

    expect(result.current).toEqual({
      tag: 'typescript',
    });
  });

  it('decodes URL-encoded values', () => {
    const mockSearchParams = new URLSearchParams('?url=https%3A%2F%2Fexample.com');
    vi.mocked(useSearchParams).mockReturnValue([mockSearchParams, vi.fn()]);

    const { result } = renderHook(() => useQueryParams());

    expect(result.current).toEqual({
      url: 'https://example.com',
    });
  });

  it('handles typed return value', () => {
    const mockSearchParams = new URLSearchParams('?id=123&name=test');
    vi.mocked(useSearchParams).mockReturnValue([mockSearchParams, vi.fn()]);

    const { result } = renderHook(() => useQueryParams<{ id: string; name: string }>());

    expect(result.current).toEqual({
      id: '123',
      name: 'test',
    });
  });
});
