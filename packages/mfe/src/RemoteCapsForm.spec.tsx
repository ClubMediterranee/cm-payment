import { act, fireEvent, render, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';

import RemoteCapsForm, { type CapsRemoteFormProps, getTokenSubject } from './RemoteCapsForm';

const providerProps = vi.fn();
const formProps = vi.fn();
const defaultNavigate = vi.fn();
const onSubmit = vi.fn();

vi.mock('@clubmed/caps', () => {
  const Step =
    (name: string) =>
    ({ children, ...props }: { children?: ReactNode }) => (
      <section data-testid={name} data-props={JSON.stringify(props)}>
        {children}
      </section>
    );

  return {
    CAPS_PROTOCOL_VERSION: 1,
    OidcIssuerTypes: { GM: 'GM', GO: 'GO', PARTNERS: 'PARTNERS' },
    getDefaultLocale: () => 'fr-FR',
    defaultNavigate: (request: unknown) => defaultNavigate(request),
    useFormSubmit: () => ({ onSubmit }),
    PaymentConfigProvider: ({ children, ...props }: { children: ReactNode }) => {
      providerProps(props);
      return <div data-testid="payment-config-provider">{children}</div>;
    },
    Form: ({ children, ...props }: Record<string, unknown> & { children: ReactNode }) => {
      formProps(props);
      return (
        <form id="payment-form" onSubmit={(event) => event.preventDefault()}>
          {children}
        </form>
      );
    },
    PaymentSchedule: Step('payment-schedule'),
    PaymentProviders: Step('payment-providers'),
    CardInstallments: Step('card-installments'),
    ContactChoice: Step('contact-choice'),
    Donation: Step('donation'),
    Comments: Step('comments'),
    Cgv: Step('cgv'),
    BillingAddress: Step('billing-address'),
    PaymentWidget: Step('payment-widget'),
    SubmitButton: ({ children, className }: { children: ReactNode; className?: string }) => (
      <button type="submit" form="payment-form" className={className}>
        {children}
      </button>
    ),
  };
});

vi.mock('@clubmed/trident-icons', () => ({
  IconsProvider: ({ children }: { children: ReactNode }) => children,
}));
vi.mock('@clubmed/trident-ui/atoms/Icons/svg/Actions', () => ({ default: {} }));
vi.mock('@clubmed/trident-ui/atoms/Icons/svg/Brand', () => ({ default: {} }));
vi.mock('@clubmed/trident-ui/atoms/Icons/svg/Utilities', () => ({ default: {} }));
vi.mock('@clubmed/trident-ui/molecules/Spinner', () => ({
  Spinner: () => <div data-testid="spinner" />,
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

const lastFormProps = () => formProps.mock.lastCall![0];

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

describe('RemoteCapsForm (federated)', () => {
  beforeEach(() => {
    mockConfig({});
    Element.prototype.scrollIntoView = vi.fn();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('renders the flow inside the <caps-form> shadow root with the runtime configuration', async () => {
    const { container } = render(<RemoteCapsForm {...baseProps} />);
    const root = getShadowRoot(container);

    expect(root.querySelector('[data-testid=spinner]')).toBeTruthy();
    await waitFor(() => expect(root.querySelector('[data-testid=payment-schedule]')).toBeTruthy());

    // Nothing is rendered in the light DOM of the host.
    expect(container.querySelector('[data-testid=payment-schedule]')).toBeNull();
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

  it('renders every step with its title and the default submit button', async () => {
    const { container } = render(
      <RemoteCapsForm {...baseProps} action="PAYMENT_RESA" reference="REF" uuid="abc" />,
    );
    const root = getShadowRoot(container);

    await waitFor(() => expect(root.querySelector('[data-testid=payment-schedule]')).toBeTruthy());

    expect(root.querySelector('[data-testid=contact-choice]')!.getAttribute('data-props')).toBe(
      JSON.stringify({ reference: 'REF', uuid: 'abc' }),
    );
    expect(root.textContent).toContain('Choose your payment schedule');
    expect(root.textContent).toContain('Make a donation');
    expect(root.querySelector('button')!.className).toBe('my-8 self-center');
    expect(lastFormProps().action).toBe('PAYMENT_RESA');
  });

  it('uses the token subject as GM customer and refreshes the token without remounting the flow', async () => {
    const { container, rerender } = render(
      <RemoteCapsForm {...baseProps} type="booking" accessToken={TOKEN} />,
    );
    await waitFor(() =>
      expect(getShadowRoot(container).querySelector('[data-testid=payment-schedule]')).toBeTruthy(),
    );

    expect(providerProps).toHaveBeenLastCalledWith(
      expect.objectContaining({ bookingId: '2057923', customerId: 'customer-42' }),
    );

    const otherToken = TOKEN.replace(/y$/, 'z');
    rerender(<RemoteCapsForm {...baseProps} type="booking" accessToken={otherToken} />);

    expect(providerProps).toHaveBeenLastCalledWith(
      expect.objectContaining({ oidc: { issuerType: 'GM', accessToken: otherToken } }),
    );
    // The form section fetched its config once: the flow was not remounted.
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('lets the host cancel a redirect', async () => {
    const onRedirect = vi.fn().mockReturnValueOnce(false).mockReturnValueOnce(undefined);
    const { container } = render(<RemoteCapsForm {...baseProps} onRedirect={onRedirect} />);
    await waitFor(() =>
      expect(getShadowRoot(container).querySelector('[data-testid=payment-schedule]')).toBeTruthy(),
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

  it('signals that the flow is ready once and mirrors the payment processing state', async () => {
    const onReady = vi.fn();
    const onLoadingChange = vi.fn();
    const { container, rerender } = render(
      <RemoteCapsForm {...baseProps} onReady={onReady} onLoadingChange={onLoadingChange} />,
    );
    await waitFor(() =>
      expect(getShadowRoot(container).querySelector('[data-testid=payment-schedule]')).toBeTruthy(),
    );

    rerender(<RemoteCapsForm {...baseProps} onReady={onReady} onLoadingChange={onLoadingChange} />);
    expect(onReady).toHaveBeenCalledTimes(1);

    act(() => lastFormProps().onLoad());
    act(() => lastFormProps().onLoadEnd());
    expect(onLoadingChange.mock.calls).toEqual([[true], [false]]);
  });

  it('applies the embed label overrides and forwards the other content to the SDK', async () => {
    const { container } = render(
      <RemoteCapsForm
        {...baseProps}
        content={{ embed: { submit: 'Payer' }, cgv: { title: 'CGV' } }}
      />,
    );
    const root = getShadowRoot(container);
    await waitFor(() => expect(root.querySelector('[data-testid=payment-schedule]')).toBeTruthy());

    expect(root.querySelector('button')!.textContent).toBe('Payer');
    expect(providerProps).toHaveBeenLastCalledWith(
      expect.objectContaining({ content: { cgv: { title: 'CGV' } } }),
    );
  });

  it('displays a payment error, scrolls to it and reports it', async () => {
    const onError = vi.fn();
    const onLoadingChange = vi.fn();
    const { container } = render(
      <RemoteCapsForm {...baseProps} onError={onError} onLoadingChange={onLoadingChange} />,
    );
    const root = getShadowRoot(container);
    await waitFor(() => expect(root.querySelector('[data-testid=payment-schedule]')).toBeTruthy());

    const error = new Error('Payment refused');
    act(() => lastFormProps().onError(error));

    expect(root.textContent).toContain('Payment refused');
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
    expect(onLoadingChange).toHaveBeenCalledWith(false);
    expect(onError).toHaveBeenCalledWith({ code: 'FLOW_ERROR', message: 'Payment refused' });
  });

  it('reports a flow loading error and lets the user retry', async () => {
    const onError = vi.fn();
    const resetErrorBoundary = vi.fn();
    const { container } = render(<RemoteCapsForm {...baseProps} onError={onError} />);
    await waitFor(() =>
      expect(getShadowRoot(container).querySelector('[data-testid=payment-schedule]')).toBeTruthy(),
    );

    const { getByRole } = render(
      <>{lastFormProps().errorFallback({ error: 'boom', resetErrorBoundary })}</>,
    );

    expect(getByRole('alert').textContent).toContain('boom');
    expect(onError).toHaveBeenCalledWith({ code: 'FLOW_ERROR', message: 'boom' });

    fireEvent.click(getByRole('button', { name: 'Réessayer' }));
    expect(resetErrorBoundary).toHaveBeenCalledTimes(1);
  });

  it('reports a configuration error', async () => {
    mockConfig({ ok: false, status: 403 });
    const onError = vi.fn();
    const { container } = render(<RemoteCapsForm {...baseProps} onError={onError} />);

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

  it('renders the donation and the submit button in the host slots', async () => {
    const donation = document.body.appendChild(document.createElement('div'));
    const submit = document.body.appendChild(document.createElement('div'));

    const { container } = render(<RemoteCapsForm {...baseProps} slots={{ donation, submit }} />);
    const root = getShadowRoot(container);
    await waitFor(() => expect(root.querySelector('[data-testid=payment-schedule]')).toBeTruthy());

    expect(root.querySelector('[data-testid="donation"]')).toBeNull();
    expect(donation.shadowRoot!.querySelector('[data-testid="donation"]')).not.toBeNull();

    const button = submit.shadowRoot!.querySelector('button')!;
    expect(button.className).toBe('w-full');
    expect(root.querySelector('button')).toBeNull();

    donation.remove();
    submit.remove();
  });

  it('submits the form from a slot, where the button cannot reach it', async () => {
    const submit = document.body.appendChild(document.createElement('div'));
    const { container } = render(<RemoteCapsForm {...baseProps} slots={{ submit }} />);
    await waitFor(() =>
      expect(getShadowRoot(container).querySelector('[data-testid=payment-schedule]')).toBeTruthy(),
    );

    fireEvent.click(submit.shadowRoot!.querySelector('button')!);
    expect(onSubmit).toHaveBeenCalledTimes(1);

    submit.remove();
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
      <RemoteCapsForm
        {...({ ...baseProps, ...overrides } as CapsRemoteFormProps)}
        onError={onError}
      />,
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
