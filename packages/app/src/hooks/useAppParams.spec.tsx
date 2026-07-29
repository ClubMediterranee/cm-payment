import { OidcIssuerTypes } from '@clubmed/caps';
import { renderHook } from '@testing-library/react';
import { useAuth } from 'react-oidc-context';
import { useRoute, useSearchParams } from 'wouter';

import { useAppParams } from './useAppParams.js';

vi.mock('../config', () => ({
  AppSettings: {
    url: 'https://app.example.com',
    api: {
      [OidcIssuerTypes.GM]: {
        apiKey: { BE: 'gm-be-key', CA: 'gm-ca-key' },
      },
      [OidcIssuerTypes.GO]: { apiKey: 'go-key' },
      [OidcIssuerTypes.PARTNERS]: { apiKey: 'partners-key' },
    },
  },
}));

vi.mock('react-oidc-context', () => ({
  useAuth: vi.fn(),
}));

vi.mock('wouter', () => ({
  useLocation: vi.fn(() => ['/', vi.fn()]),
  useRoute: vi.fn(),
  useSearchParams: vi.fn(),
}));

const CALLBACK_URL = 'https://app.example.com/callback';

function mockRoute(issuer: OidcIssuerTypes, type: 'booking' | 'proposal', id: string) {
  vi.mocked(useRoute).mockImplementation(
    (pattern) =>
      (pattern === '/:issuer/:type/:id'
        ? [true, { issuer, type, id }]
        : [false, null]) as ReturnType<typeof useRoute>,
  );
}

describe('useAppParams', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();

    vi.mocked(useAuth).mockReturnValue({
      isLoading: false,
      isAuthenticated: false,
      user: { access_token: 'token', profile: {} },
    } as ReturnType<typeof useAuth>);
    vi.mocked(useRoute).mockReturnValue([false, null] as ReturnType<typeof useRoute>);
    vi.mocked(useSearchParams).mockReturnValue([
      new URLSearchParams({ callback_url: CALLBACK_URL }),
      vi.fn(),
    ]);
  });

  it('uses the GM CA key for a booking', () => {
    mockRoute(OidcIssuerTypes.GM, 'booking', '123');

    const { result } = renderHook(() => useAppParams());

    expect(result.current?.api.apiKey).toBe('gm-ca-key');
  });

  it('uses the GM BE key for a proposal', () => {
    mockRoute(OidcIssuerTypes.GM, 'proposal', '123');

    const { result } = renderHook(() => useAppParams());

    expect(result.current?.api.apiKey).toBe('gm-be-key');
  });

  it('uses the GO key for a booking (CCA does not apply outside GM)', () => {
    mockRoute(OidcIssuerTypes.GO, 'booking', '123');

    const { result } = renderHook(() => useAppParams());

    expect(result.current?.api.apiKey).toBe('go-key');
  });

  it('uses the PARTNERS key for a booking', () => {
    mockRoute(OidcIssuerTypes.PARTNERS, 'booking', '123');

    const { result } = renderHook(() => useAppParams());

    expect(result.current?.api.apiKey).toBe('partners-key');
  });
});
