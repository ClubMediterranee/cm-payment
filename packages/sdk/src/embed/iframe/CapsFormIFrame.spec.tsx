import { act, render, screen, waitFor } from '@testing-library/react';

import { CapsMessageType, createCapsMessage } from '../shared/protocol';
import type { CapsEnv } from '../shared/types';
import { CapsFormIFrame } from './CapsFormIFrame';

const CAPS_ORIGIN = 'https://staging.caps.api.clubmed';

const flowProps = {
  issuerType: 'GO' as const,
  type: 'proposal' as const,
  id: '456',
  customerId: '789',
  locale: 'fr-FR',
  callbackUrl: 'https://host.example/cb',
};

function getIframe() {
  return screen.getByTitle('Club Med payment') as HTMLIFrameElement;
}

function postFromFrame(
  data: unknown,
  { origin = CAPS_ORIGIN, source }: { origin?: string; source?: Window | null } = {},
) {
  act(() => {
    window.dispatchEvent(
      new MessageEvent('message', {
        data,
        origin,
        source: source === undefined ? getIframe().contentWindow : source,
      }),
    );
  });
}

describe('CapsFormIFrame', () => {
  let originalLocation: Location;

  beforeEach(() => {
    originalLocation = window.location;
  });

  afterEach(() => {
    window.location = originalLocation as Location & string;
    vi.restoreAllMocks();
  });

  it('renders the embedded flow url of the environment, without the token', () => {
    render(<CapsFormIFrame {...flowProps} env="staging" accessToken="secret-token" />);

    const src = new URL(getIframe().src);

    expect(src.origin + src.pathname).toBe(`${CAPS_ORIGIN}/go/proposal/456`);
    expect(Object.fromEntries(src.searchParams)).toEqual({
      locale: 'fr-FR',
      customer_id: '789',
      callback_url: 'https://host.example/cb',
      embedded: '1',
      parent_origin: window.location.origin,
    });
    expect(getIframe().src).not.toContain('secret-token');
    expect(getIframe().getAttribute('allow')).toBe('payment');
  });

  it('sends the host token on ready and again when it changes', () => {
    const { rerender } = render(
      <CapsFormIFrame {...flowProps} env="staging" accessToken="token-1" content={{ a: 1 }} />,
    );
    const postMessage = vi.spyOn(getIframe().contentWindow!, 'postMessage');
    const onReady = vi.fn();

    rerender(
      <CapsFormIFrame
        {...flowProps}
        env="staging"
        accessToken="token-1"
        content={{ a: 1 }}
        onReady={onReady}
      />,
    );
    postFromFrame(createCapsMessage(CapsMessageType.READY));

    expect(onReady).toHaveBeenCalledTimes(1);
    expect(postMessage).toHaveBeenLastCalledWith(
      expect.objectContaining({ type: 'CAPS_INIT', accessToken: 'token-1', content: { a: 1 } }),
      CAPS_ORIGIN,
    );

    rerender(
      <CapsFormIFrame {...flowProps} env="staging" accessToken="token-2" content={{ a: 1 }} />,
    );

    expect(postMessage).toHaveBeenCalledTimes(2);
    expect(postMessage).toHaveBeenLastCalledWith(
      expect.objectContaining({ accessToken: 'token-2' }),
      CAPS_ORIGIN,
    );
  });

  it('sends the host token again when the frame announces itself again (reload)', () => {
    render(<CapsFormIFrame {...flowProps} env="staging" accessToken="token-1" />);
    const postMessage = vi.spyOn(getIframe().contentWindow!, 'postMessage');

    postFromFrame(createCapsMessage(CapsMessageType.READY));
    postFromFrame(createCapsMessage(CapsMessageType.READY));

    expect(postMessage).toHaveBeenCalledTimes(2);
    expect(postMessage).toHaveBeenLastCalledWith(
      expect.objectContaining({ type: 'CAPS_INIT', accessToken: 'token-1' }),
      CAPS_ORIGIN,
    );
  });

  it('resizes the iframe unless a height is given', () => {
    const { rerender } = render(<CapsFormIFrame {...flowProps} env="staging" />);

    postFromFrame(createCapsMessage(CapsMessageType.RESIZE, { height: 1234 }));
    expect(getIframe().style.height).toBe('1234px');

    rerender(<CapsFormIFrame {...flowProps} env="staging" height={500} />);
    expect(getIframe().style.height).toBe('500px');
  });

  it('forwards loading and errors', () => {
    const onLoadingChange = vi.fn();
    const onError = vi.fn();
    render(
      <CapsFormIFrame
        {...flowProps}
        env="staging"
        onLoadingChange={onLoadingChange}
        onError={onError}
      />,
    );

    postFromFrame(createCapsMessage(CapsMessageType.LOADING, { loading: true }));
    postFromFrame(
      createCapsMessage(CapsMessageType.ERROR, { code: 'AUTH_REQUIRED', message: 'login' }),
    );

    expect(onLoadingChange).toHaveBeenCalledWith(true);
    expect(onError).toHaveBeenCalledWith({ code: 'AUTH_REQUIRED', message: 'login' });
  });

  it('navigates the top window on redirect unless onRedirect returns false', () => {
    const assign = vi.fn();
    // @ts-expect-error jsdom location is not writable
    delete window.location;
    window.location = { ...originalLocation, assign } as unknown as Location & string;

    const onRedirect = vi.fn().mockReturnValueOnce(false);
    render(<CapsFormIFrame {...flowProps} env="staging" onRedirect={onRedirect} />);

    postFromFrame(createCapsMessage(CapsMessageType.PAYMENT_REDIRECT, { url: 'https://psp/1' }));
    expect(assign).not.toHaveBeenCalled();

    postFromFrame(createCapsMessage(CapsMessageType.PAYMENT_REDIRECT, { url: 'https://psp/2' }));
    expect(onRedirect).toHaveBeenLastCalledWith('https://psp/2');
    expect(assign).toHaveBeenCalledWith('https://psp/2');
  });

  it('submits POST redirects as a top-level form', () => {
    const submit = vi.spyOn(HTMLFormElement.prototype, 'submit').mockImplementation(() => {});
    render(<CapsFormIFrame {...flowProps} env="staging" />);

    postFromFrame(
      createCapsMessage(CapsMessageType.PAYMENT_REDIRECT, {
        url: 'https://psp/pay',
        method: 'POST',
        fields: { token: 'abc' },
      }),
    );

    const form = document.querySelector('form')!;
    expect(submit).toHaveBeenCalledTimes(1);
    expect(form.target).toBe('_top');
    expect(form.action).toBe('https://psp/pay');
    expect(form.querySelector('input')?.value).toBe('abc');
    form.remove();
  });

  it('ignores messages from other origins, other frames, or foreign sources', () => {
    const onRedirect = vi.fn();
    render(<CapsFormIFrame {...flowProps} env="staging" onRedirect={onRedirect} />);
    const redirect = createCapsMessage(CapsMessageType.PAYMENT_REDIRECT, { url: 'https://evil' });

    postFromFrame(redirect, { origin: 'https://evil.example' });
    postFromFrame(redirect, { source: window });
    postFromFrame({ type: 'CAPS_PAYMENT_REDIRECT', url: 'https://evil' });
    postFromFrame({ ...redirect, version: 99 });

    expect(onRedirect).not.toHaveBeenCalled();
  });

  it('reports an unknown environment and renders the fallback', async () => {
    const onError = vi.fn();
    render(
      <CapsFormIFrame
        {...flowProps}
        env={'qa' as CapsEnv}
        onError={onError}
        fallback={<span>loading</span>}
      />,
    );

    await waitFor(() =>
      expect(onError).toHaveBeenCalledWith(expect.objectContaining({ code: 'REMOTE_LOAD_FAILED' })),
    );
    expect(screen.getByText('loading')).toBeTruthy();
  });

  it('reports an invalid flow', async () => {
    const onError = vi.fn();
    render(
      <CapsFormIFrame
        {...flowProps}
        customerId={undefined as unknown as string}
        env="staging"
        onError={onError}
      />,
    );

    await waitFor(() =>
      expect(onError).toHaveBeenCalledWith(expect.objectContaining({ code: 'FLOW_ERROR' })),
    );
  });
});
