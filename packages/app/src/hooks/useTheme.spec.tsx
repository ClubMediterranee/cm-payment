import { renderHook } from '@testing-library/react';

import { useTheme } from './useTheme';

const useCapsTheme = vi.fn((_config: unknown) => 'current');

vi.mock('@clubmed/caps', () => ({
  useCapsTheme: (config: unknown) => useCapsTheme(config),
}));

const api = { url: 'https://caps.example', apiKey: 'key' };
const oidc = { issuerType: 'GM', accessToken: 'token' };

vi.mock('../providers/AppProvider', () => ({
  useAppContext: () => ({ api, oidc, values: { locale: 'fr-FR' } }),
}));

describe('useTheme', () => {
  it('resolves the theme from the CMS with the app configuration', () => {
    const { result } = renderHook(() => useTheme());

    expect(result.current).toBe('current');
    expect(useCapsTheme).toHaveBeenCalledWith({ locale: 'fr-FR', oidc, api });
  });
});
