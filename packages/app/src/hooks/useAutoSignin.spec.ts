import { act, renderHook } from '@testing-library/react';

import { useAutoSignin } from './useAutoSignin';

vi.mock('@clubmed/caps', () => ({
  OidcIssuerTypes: {
    GM: 'GM',
    GO: 'GO',
    PARTNERS: 'PARTNERS',
  },
}));

vi.mock('react-oidc-context', () => ({
  hasAuthParams: vi.fn(),
  useAuth: vi.fn(),
}));

vi.mock('wouter', () => ({
  useRoute: vi.fn(),
}));

vi.mock('./useAppParams', () => ({
  useAppParams: vi.fn(),
}));

import { hasAuthParams, useAuth } from 'react-oidc-context';
import { useRoute } from 'wouter';

import { useAppParams } from './useAppParams';

describe('useAutoSignin', () => {
  const mockSigninRedirect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useAppParams).mockReturnValue({
      oidc: {
        issuerType: 'GM',
      },
    } as any);

    vi.mocked(useRoute).mockReturnValue([false, undefined] as any);
    vi.mocked(hasAuthParams).mockReturnValue(false);
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      activeNavigator: undefined,
      signinRedirect: mockSigninRedirect,
    } as any);
  });

  it('starts signin redirect for booking routes when authentication is required', () => {
    vi.mocked(useRoute).mockReturnValue([true, undefined] as any);

    const { result } = renderHook(() => useAutoSignin());

    expect(mockSigninRedirect).toHaveBeenCalledWith({
      state: { return_url: window.location.href },
    });
    expect(result.current.isSigningIn).toBe(false);
  });

  it('starts signin redirect for seller issuers', () => {
    vi.mocked(useAppParams).mockReturnValue({
      oidc: {
        issuerType: 'GO',
      },
    } as any);

    const { result } = renderHook(() => useAutoSignin());

    expect(mockSigninRedirect).toHaveBeenCalledTimes(1);
    expect(result.current.isSigningIn).toBe(false);
  });

  it('does not redirect when auth params are already present', () => {
    vi.mocked(useRoute).mockReturnValue([true, undefined] as any);
    vi.mocked(hasAuthParams).mockReturnValue(true);

    const { result } = renderHook(() => useAutoSignin());

    expect(mockSigninRedirect).not.toHaveBeenCalled();
    expect(result.current.isSigningIn).toBe(false);
  });

  it('does not redirect when the user is already authenticated', () => {
    vi.mocked(useRoute).mockReturnValue([true, undefined] as any);
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      activeNavigator: undefined,
      signinRedirect: mockSigninRedirect,
    } as any);

    const { result } = renderHook(() => useAutoSignin());

    expect(mockSigninRedirect).not.toHaveBeenCalled();
    expect(result.current.isSigningIn).toBe(false);
  });

  it('does not trigger signin twice after initialization', () => {
    vi.mocked(useRoute).mockReturnValue([true, undefined] as any);

    const { result, rerender } = renderHook(() => useAutoSignin());

    expect(mockSigninRedirect).toHaveBeenCalledTimes(1);
    expect(result.current.isSigningIn).toBe(false);

    act(() => {
      rerender();
    });

    expect(mockSigninRedirect).toHaveBeenCalledTimes(1);
    expect(result.current.isSigningIn).toBe(false);
  });
});
