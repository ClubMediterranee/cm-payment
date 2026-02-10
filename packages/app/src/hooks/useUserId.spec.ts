import { renderHook } from '@testing-library/react';
import Cookies from 'js-cookie';
import { useAuth } from 'react-oidc-context';
import { useSearch } from 'wouter';

import { useUserId } from './useUserId';

vi.mock('react-oidc-context');
vi.mock('wouter');
vi.mock('js-cookie');

describe('useUserId', () => {
  it('returns the user sub when user has no type', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: {
        profile: {
          sub: 'user-123',
        },
      },
    } as any);
    vi.mocked(useSearch).mockReturnValue('');
    vi.mocked(Cookies.get).mockReturnValue(undefined);

    const { result } = renderHook(() => useUserId());

    expect(result.current).toBe('user-123');
  });

  it('returns neolane_id from cookies when user has a type', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: {
        profile: {
          sub: 'user-123',
          type: 'seller',
        },
      },
    } as any);
    vi.mocked(useSearch).mockReturnValue('');
    vi.mocked(Cookies.get).mockReturnValue('neolane-456');

    const { result } = renderHook(() => useUserId());

    expect(result.current).toBe('neolane-456');
  });

  it('returns neolane_id from query params when user has a type but no cookie', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: {
        profile: {
          sub: 'user-123',
          type: 'seller',
        },
      },
    } as any);
    vi.mocked(useSearch).mockReturnValue('?neolane_id=neolane-789');
    vi.mocked(Cookies.get).mockReturnValue(undefined);

    const { result } = renderHook(() => useUserId());

    expect(result.current).toBe('neolane-789');
  });

  it('returns an empty string when user has a type but no neolane_id', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: {
        profile: {
          sub: 'user-123',
          type: 'seller',
        },
      },
    } as any);
    vi.mocked(useSearch).mockReturnValue('');
    vi.mocked(Cookies.get).mockReturnValue(undefined);

    const { result } = renderHook(() => useUserId());

    expect(result.current).toBe('');
  });

  it('returns an empty string when there is no user', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: undefined,
    } as any);
    vi.mocked(useSearch).mockReturnValue('');
    vi.mocked(Cookies.get).mockReturnValue(undefined);

    const { result } = renderHook(() => useUserId());

    expect(result.current).toBe('');
  });
});
