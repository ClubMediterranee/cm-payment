import { render, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { useEffect } from 'react';

import CapsForm, { type CapsRemoteFormProps, getTokenSubject } from './CapsForm';

const providerProps = vi.fn();
const flowMounts = vi.fn();
const flowProps = vi.fn();
const defaultNavigate = vi.fn();

vi.mock('@clubmed/caps', () => ({
  CAPS_PROTOCOL_VERSION: 1,
  OidcIssuerTypes: { GM: 'GM', GO: 'GO', PARTNERS: 'PARTNERS' },
  defaultNavigate: (request: unknown) => defaultNavigate(request),
  PaymentConfigProvider: ({ children, ...props }: { children: ReactNode }) => {
    providerProps(props);
    return <div data-testid="payment-config-provider">{children}</div>;
  },
}));

vi.mock('@clubmed/trident-icons', () => ({
  IconsProvider: ({ children }: { children: ReactNode }) => children,
}));
vi.mock('@clubmed/trident-ui/atoms/Icons/svg/Actions', () => ({ default: {} }));
vi.mock('@clubmed/trident-ui/atoms/Icons/svg/Brand', () => ({ default: {} }));
vi.mock('@clubmed/trident-ui/atoms/Icons/svg/Utilities', () => ({ default: {} }));
vi.mock('@clubmed/trident-ui/molecules/Spinner', () => ({
  Spinner: () => <div data-testid="spinner" />,
}));

vi.mock('./flow/CapsFlow', () => ({
  CapsFlow: (props: Record<string, unknown>) => {
    flowProps(props);
    useEffect(() => {
      flowMounts();
    }, []);
    return <div data-testid="caps-flow" />;
  },
}));

const CAPS_URL = 'https://caps.example';

const baseProps: CapsRemoteFormProps = {
  capsUrl: CAPS_URL,
  issuerType: 'GM',
  type: 'proposal',
  id: '2057923',
  locale: 'fr-FR',
  callbackUrl: 'https://host.example/cb',
};

// Header.payload.signature with { "sub": "customer-42" }
const TOKEN = `x.${btoa(JSON.stringify({ sub: 'customer-42' }))
  .replace(/\+/g, '-')
  .replace(/\//g, '_')
  .replace(/=+$/, '')}.y`;

const getShadowRoot = (container: HTMLElement) => container.querySelector('caps-form')!.shadowRoot!;

function mockConfig(response: Partial<Response> & { json?: () => Promise<unknown> }) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({
      ok: true,
      json: async () => ({
        apiUrl: CAPS_URL,
        apiKey: 'api-key',
        allowedOrigins: [],
        protocolVersion: 1,
      }),
      ...response,
    })),
  );
}

describe('CapsForm (federated)', () => {
  beforeEach(() => {
    mockConfig({});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('exposes its protocol version', () => {
    expect(CapsForm.protocolVersion).toBe(1);
  });

  it('renders the flow inside the <caps-form> shadow root with the runtime configuration', async () => {
    const { container } = render(<CapsForm {...baseProps} />);
    const root = getShadowRoot(container);

    expect(root.querySelector('[data-testid=spinner]')).toBeTruthy();
    await waitFor(() => expect(root.querySelector('[data-testid=caps-flow]')).toBeTruthy());

    // Nothing is rendered in the light DOM of the host.
    expect(container.querySelector('[data-testid=caps-flow]')).toBeNull();
    expect(fetch).toHaveBeenCalledWith(
      new URL(`${CAPS_URL}/rest/embed/config?issuer=GM&type=proposal`),
      expect.objectContaining({ headers: { accept: 'application/json' } }),
    );
    expect(providerProps).toHaveBeenLastCalledWith(
      expect.objectContaining({
        locale: 'fr-FR',
        proposalId: '2057923',
        bookingId: undefined,
        api: { url: CAPS_URL, apiKey: 'api-key' },
        oidc: { issuerType: 'GM', accessToken: '' },
        callbackUrl: 'https://host.example/cb',
      }),
    );
  });

  it('uses the token subject as GM customer and refreshes the token without remounting the flow', async () => {
    const { container, rerender } = render(
      <CapsForm {...baseProps} type="booking" accessToken={TOKEN} />,
    );
    await waitFor(() =>
      expect(getShadowRoot(container).querySelector('[data-testid=caps-flow]')).toBeTruthy(),
    );

    expect(providerProps).toHaveBeenLastCalledWith(
      expect.objectContaining({ bookingId: '2057923', customerId: 'customer-42' }),
    );

    const otherToken = TOKEN.replace(/y$/, 'z');
    rerender(<CapsForm {...baseProps} type="booking" accessToken={otherToken} />);

    expect(providerProps).toHaveBeenLastCalledWith(
      expect.objectContaining({ oidc: { issuerType: 'GM', accessToken: otherToken } }),
    );
    expect(flowMounts).toHaveBeenCalledTimes(1);
  });

  it('lets the host cancel a redirect', async () => {
    const onRedirect = vi.fn().mockReturnValueOnce(false).mockReturnValueOnce(undefined);
    const { container } = render(<CapsForm {...baseProps} onRedirect={onRedirect} />);
    await waitFor(() =>
      expect(getShadowRoot(container).querySelector('[data-testid=caps-flow]')).toBeTruthy(),
    );

    const { onNavigate } = providerProps.mock.lastCall![0] as {
      onNavigate: (request: { url: string }) => void;
    };

    onNavigate({ url: 'https://psp/1' });
    expect(defaultNavigate).not.toHaveBeenCalled();

    onNavigate({ url: 'https://psp/2' });
    expect(onRedirect).toHaveBeenLastCalledWith('https://psp/2');
    expect(defaultNavigate).toHaveBeenCalledWith({ url: 'https://psp/2' });
  });

  it('forwards the flow callbacks and section labels', async () => {
    const onReady = vi.fn();
    const onLoadingChange = vi.fn();
    const onError = vi.fn();
    const { container } = render(
      <CapsForm
        {...baseProps}
        content={{ embed: { submit: 'Payer' }, cgv: { title: 'CGV' } }}
        onReady={onReady}
        onLoadingChange={onLoadingChange}
        onError={onError}
      />,
    );
    await waitFor(() =>
      expect(getShadowRoot(container).querySelector('[data-testid=caps-flow]')).toBeTruthy(),
    );

    const props = flowProps.mock.lastCall![0];
    props.onReady();
    props.onLoadingChange(true);
    props.onError(new Error('Payment refused'));

    expect(props.labels).toEqual({ submit: 'Payer' });
    expect(providerProps).toHaveBeenLastCalledWith(
      expect.objectContaining({ content: { cgv: { title: 'CGV' } } }),
    );
    expect(onReady).toHaveBeenCalled();
    expect(onLoadingChange).toHaveBeenCalledWith(true);
    expect(onError).toHaveBeenCalledWith({ code: 'FLOW_ERROR', message: 'Payment refused' });
  });

  it('reports a configuration error', async () => {
    mockConfig({ ok: false, status: 403 });
    const onError = vi.fn();
    const { container } = render(<CapsForm {...baseProps} onError={onError} />);

    await waitFor(() =>
      expect(onError).toHaveBeenCalledWith({
        code: 'FLOW_ERROR',
        message: expect.stringContaining('HTTP 403'),
      }),
    );
    expect(getShadowRoot(container).querySelector('[role=alert]')?.textContent).toContain(
      'HTTP 403',
    );
  });

  it.each([
    [{ type: 'booking' as const }, 'accessToken is required for GM booking flows'],
    [
      { issuerType: 'GO' as const, customerId: '1' },
      'accessToken is required for GO proposal flows',
    ],
    [{ issuerType: 'GO' as const, accessToken: TOKEN }, 'customerId is required for GO flows'],
  ])('fails fast without the required authentication (%o)', async (overrides, message) => {
    const onError = vi.fn();
    const { container } = render(
      <CapsForm {...({ ...baseProps, ...overrides } as CapsRemoteFormProps)} onError={onError} />,
    );

    await waitFor(() => expect(onError).toHaveBeenCalledWith({ code: 'AUTH_REQUIRED', message }));
    expect(getShadowRoot(container).querySelector('[role=alert]')?.textContent).toBe(message);
    expect(providerProps).not.toHaveBeenCalled();
  });
});

describe('getTokenSubject', () => {
  it('reads the sub claim and ignores invalid tokens', () => {
    expect(getTokenSubject(TOKEN)).toBe('customer-42');
    expect(getTokenSubject('not-a-jwt')).toBeUndefined();
    expect(getTokenSubject(undefined)).toBeUndefined();
  });
});
