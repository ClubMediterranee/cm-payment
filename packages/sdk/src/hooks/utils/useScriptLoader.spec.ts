import { act, renderHook, waitFor } from '@testing-library/react';

import { useScriptLoader } from './useScriptLoader';

const TEST_URL = 'https://example.com/sdk.js';

const fireLoad = (url: string) => {
  const script = document.querySelector<HTMLScriptElement>(`script[src="${url}"]`);
  if (!script) throw new Error(`No script tag found for src=${url}`);
  script.dispatchEvent(new Event('load'));
};

describe('useScriptLoader', () => {
  beforeEach(() => {
    document.querySelectorAll('script').forEach((s) => s.remove());
  });

  it('appends a script tag and flips isLoaded to true on load', async () => {
    const { result } = renderHook(() => useScriptLoader(TEST_URL));

    expect(document.querySelectorAll(`script[src="${TEST_URL}"]`)).toHaveLength(1);
    expect(result.current.isLoaded).toBe(false);

    await act(async () => {
      fireLoad(TEST_URL);
    });

    await waitFor(() => expect(result.current.isLoaded).toBe(true));
  });

  it('reuses an existing script tag when a second consumer requests the same URL', async () => {
    const { result: first } = renderHook(() => useScriptLoader(TEST_URL));

    expect(document.querySelectorAll(`script[src="${TEST_URL}"]`)).toHaveLength(1);

    await act(async () => {
      fireLoad(TEST_URL);
    });
    await waitFor(() => expect(first.current.isLoaded).toBe(true));

    const { result: second } = renderHook(() => useScriptLoader(TEST_URL));

    expect(document.querySelectorAll(`script[src="${TEST_URL}"]`)).toHaveLength(1);
    await waitFor(() => expect(second.current.isLoaded).toBe(true));
  });

  it('leaves the script tag in the DOM after the consumer unmounts', async () => {
    const { unmount } = renderHook(() => useScriptLoader(TEST_URL));

    expect(document.querySelectorAll(`script[src="${TEST_URL}"]`)).toHaveLength(1);

    unmount();

    expect(document.querySelectorAll(`script[src="${TEST_URL}"]`)).toHaveLength(1);
  });

  it('does not duplicate the script tag when the URL is requested again after a previous consumer unmounts', () => {
    const { unmount } = renderHook(() => useScriptLoader(TEST_URL));
    unmount();

    renderHook(() => useScriptLoader(TEST_URL));

    expect(document.querySelectorAll(`script[src="${TEST_URL}"]`)).toHaveLength(1);
  });
});
