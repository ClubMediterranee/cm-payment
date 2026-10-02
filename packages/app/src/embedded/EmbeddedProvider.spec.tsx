import { act, render, screen, waitFor } from '@testing-library/react';

import { EmbeddedProvider, HANDSHAKE_TIMEOUT_MS, useEmbedded } from './EmbeddedProvider';

vi.mock('@clubmed/caps', () => ({
  CapsMessageType: {
    READY: 'CAPS_READY',
    INIT: 'CAPS_INIT',
    RESIZE: 'CAPS_RESIZE',
    PAYMENT_REDIRECT: 'CAPS_PAYMENT_REDIRECT',
  },
  createCapsMessage: (type: string, payload = {}) => ({
    ...payload,
    type,
    source: 'caps',
    version: 1,
  }),
  isCapsMessage: (data: any) => data?.source === 'caps',
}));

const HOST = 'https://host.example';

function Probe() {
  const embedded = useEmbedded();

  if (!embedded.active) {
    return <div data-testid="state">inactive</div>;
  }

  return (
    <div>
      <div data-testid="state">
        {embedded.status}|{String(embedded.handshakeDone)}|{embedded.hostToken ?? ''}
      </div>
      <button
        type="button"
        onClick={() => embedded.navigate({ url: 'https://psp/pay', method: 'POST', fields: {} })}
      >
        navigate
      </button>
    </div>
  );
}

function setLocation(search: string) {
  window.history.replaceState({}, '', `/go/proposal/1${search}`);
}

describe('EmbeddedProvider', () => {
  const parentPostMessage = vi.fn();
  let top: PropertyDescriptor | undefined;

  beforeEach(() => {
    sessionStorage.clear();
    top = Object.getOwnPropertyDescriptor(window, 'top');
    // Simulate a framed document.
    Object.defineProperty(window, 'top', { value: {}, configurable: true });
    vi.spyOn(window.parent, 'postMessage').mockImplementation(parentPostMessage);
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({ allowedOrigins: { webcomponent: [], iframe: [HOST] } }),
      })),
    );
  });

  afterEach(() => {
    if (top) {
      Object.defineProperty(window, 'top', top);
    }
    parentPostMessage.mockReset();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    vi.useRealTimers();
    document.documentElement.classList.remove('caps-embedded');
  });

  it('is inactive outside the embedded mode', () => {
    setLocation('');
    render(
      <EmbeddedProvider>
        <Probe />
      </EmbeddedProvider>,
    );

    expect(screen.getByTestId('state').textContent).toBe('inactive');
  });

  it('validates the parent origin and announces the frame to the host only', async () => {
    setLocation(`?embedded=1&parent_origin=${encodeURIComponent(HOST)}`);
    render(
      <EmbeddedProvider>
        <Probe />
      </EmbeddedProvider>,
    );

    await waitFor(() => expect(screen.getByTestId('state').textContent).toMatch(/^allowed/));
    expect(fetch).toHaveBeenCalledWith('/rest/embed/config?issuer=GO&type=proposal');
    expect(parentPostMessage).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'CAPS_READY' }),
      HOST,
    );
    expect(document.documentElement.classList.contains('caps-embedded')).toBe(true);
  });

  it('rejects a parent that is not allow-listed and never posts to it', async () => {
    setLocation('?embedded=1&parent_origin=https%3A%2F%2Fevil.example');
    render(
      <EmbeddedProvider>
        <Probe />
      </EmbeddedProvider>,
    );

    await waitFor(() => expect(screen.getByTestId('state').textContent).toMatch(/^rejected/));
    expect(parentPostMessage).not.toHaveBeenCalled();
  });

  it('uses the host token received through the handshake', async () => {
    setLocation(`?embedded=1&parent_origin=${encodeURIComponent(HOST)}`);
    render(
      <EmbeddedProvider>
        <Probe />
      </EmbeddedProvider>,
    );
    await waitFor(() => expect(screen.getByTestId('state').textContent).toMatch(/^allowed/));

    act(() => {
      window.dispatchEvent(
        new MessageEvent('message', {
          origin: HOST,
          source: window.parent,
          data: { type: 'CAPS_INIT', source: 'caps', version: 1, accessToken: 'host-token' },
        }),
      );
    });

    expect(screen.getByTestId('state').textContent).toBe('allowed|true|host-token');
  });

  it('ignores handshakes from another origin and times out', async () => {
    setLocation(`?embedded=1&parent_origin=${encodeURIComponent(HOST)}`);
    render(
      <EmbeddedProvider>
        <Probe />
      </EmbeddedProvider>,
    );
    await waitFor(() => expect(screen.getByTestId('state').textContent).toMatch(/^allowed/));

    act(() => {
      window.dispatchEvent(
        new MessageEvent('message', {
          origin: 'https://evil.example',
          source: window.parent,
          data: { type: 'CAPS_INIT', source: 'caps', version: 1, accessToken: 'evil' },
        }),
      );
    });

    expect(screen.getByTestId('state').textContent).toBe('allowed|false|');
    await waitFor(() => expect(screen.getByTestId('state').textContent).toBe('allowed|true|'), {
      timeout: HANDSHAKE_TIMEOUT_MS + 500,
    });
  });

  it('forwards top-level navigations to the host', async () => {
    setLocation(`?embedded=1&parent_origin=${encodeURIComponent(HOST)}`);
    render(
      <EmbeddedProvider>
        <Probe />
      </EmbeddedProvider>,
    );
    await waitFor(() => expect(screen.getByTestId('state').textContent).toMatch(/^allowed/));

    act(() => screen.getByText('navigate').click());

    expect(parentPostMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'CAPS_PAYMENT_REDIRECT',
        url: 'https://psp/pay',
        method: 'POST',
      }),
      HOST,
    );
  });

  it('keeps the embedded mode across internal navigations', async () => {
    setLocation(`?embedded=1&parent_origin=${encodeURIComponent(HOST)}`);
    const { unmount } = render(
      <EmbeddedProvider>
        <Probe />
      </EmbeddedProvider>,
    );
    unmount();

    setLocation('');
    render(
      <EmbeddedProvider>
        <Probe />
      </EmbeddedProvider>,
    );

    await waitFor(() => expect(screen.getByTestId('state').textContent).toMatch(/^allowed/));
  });
});
