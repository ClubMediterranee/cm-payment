import { renderHook } from '@testing-library/react';

import { useSessionStorage } from './useSessionStorage';

vi.mock('../utils/storage', () => ({
  getSessionItem: vi.fn(),
  setSessionItem: vi.fn(),
  removeSessionItem: vi.fn(),
}));

import { getSessionItem, removeSessionItem, setSessionItem } from '../utils/storage';

describe('useSessionStorage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('calls setSessionItem with the key and value', () => {
    const { result } = renderHook(() => useSessionStorage('stay' as any));

    const testData = { name: 'test stay' };
    result.current.set(testData);

    expect(setSessionItem).toHaveBeenCalledWith('stay', testData);
  });

  it('calls getSessionItem with the key', () => {
    const testData = { name: 'test stay' };
    vi.mocked(getSessionItem).mockReturnValue(testData);

    const { result } = renderHook(() => useSessionStorage('stay' as any));

    const value = result.current.get();

    expect(getSessionItem).toHaveBeenCalledWith('stay');
    expect(value).toEqual(testData);
  });

  it('calls removeSessionItem with the key', () => {
    const { result } = renderHook(() => useSessionStorage('stay' as any));

    result.current.clear();

    expect(removeSessionItem).toHaveBeenCalledWith('stay');
  });

  it('returns null when get is called and no value exists', () => {
    vi.mocked(getSessionItem).mockReturnValue(null);

    const { result } = renderHook(() => useSessionStorage('userId' as any));

    const value = result.current.get();

    expect(value).toBeNull();
  });

  it('works with different key types', () => {
    const { result: stayResult } = renderHook(() => useSessionStorage('stay' as any));
    const { result: userIdResult } = renderHook(() => useSessionStorage('userId' as any));

    stayResult.current.set({ id: '123' });
    userIdResult.current.set('user456');

    expect(setSessionItem).toHaveBeenCalledWith('stay', { id: '123' });
    expect(setSessionItem).toHaveBeenCalledWith('userId', 'user456');
  });
});
