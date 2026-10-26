import { act, render } from '@testing-library/react';
import type { ReactNode } from 'react';

import { FormSubmitContext } from '../../contexts/FormSubmitContext';
import { CapsPaymentForm, type CapsPaymentFormProps } from './CapsPaymentForm';

const cmsTheme = vi.hoisted(() => vi.fn(() => 'current'));
const providerProps = vi.fn();
const formProps = vi.fn();
const defaultNavigate = vi.fn();

vi.mock('../../utils/navigate', () => ({
  defaultNavigate: (request: unknown) => defaultNavigate(request),
}));

vi.mock('../../hooks/data/usePaymentConfig', () => ({ useCapsTheme: () => cmsTheme() }));

vi.mock('../../providers/PaymentConfigProvider', async () => {
  const { CapsConfigContext } = await import('../../contexts/CapsConfigContext');
  const { contentByTheme } = await import('../../content/themes');
  const { mergeFromPattern } = await import('../../utils/mergeFromPattern');

  return {
    PaymentConfigProvider: ({
      children,
      content,
      theme,
      ...props
    }: {
      children: ReactNode;
      content?: object;
      theme: keyof typeof contentByTheme;
    } & Record<string, unknown>) => {
      providerProps({ ...props, theme, content });
      return (
        <CapsConfigContext.Provider
          value={{ content: mergeFromPattern(contentByTheme[theme], content) } as never}
        >
          <div data-testid="payment-config-provider">{children}</div>
        </CapsConfigContext.Provider>
      );
    },
  };
});

vi.mock('../../providers/CapsForm', () => ({
  CapsForm: ({ children, ...props }: Record<string, unknown> & { children: ReactNode }) => {
    formProps(props);
    return (
      <FormSubmitContext.Provider value={{ onSubmit: () => {} }}>
        <form id="payment-form">{children}</form>
      </FormSubmitContext.Provider>
    );
  },
}));

const { step, submit } = await vi.hoisted(async () => {
  const { createElement } = await import('react');

  return {
    step:
      (name: string) =>
      ({ children, ...props }: { children?: ReactNode }) =>
        createElement(
          'section',
          { 'data-testid': name, 'data-props': JSON.stringify(props) },
          children,
        ),
    submit: ({ children, className }: { children: ReactNode; className?: string }) =>
      createElement('button', { type: 'submit', form: 'payment-form', className }, children),
  };
});

vi.mock('../BillingAddress', () => ({ BillingAddress: step('billing-address') }));
vi.mock('../CardInstallments', () => ({ CardInstallments: step('card-installments') }));
vi.mock('../Cgv', () => ({ Cgv: step('cgv') }));
vi.mock('../Comments', () => ({ Comments: step('comments') }));
vi.mock('../ContactChoice', () => ({ ContactChoice: step('contact-choice') }));
vi.mock('../Donation', () => ({ Donation: step('donation') }));
vi.mock('../PaymentProviders', () => ({
  PaymentProviders: Object.assign(step('payment-providers'), {
    Panel: step('payment-providers-panel'),
  }),
}));
vi.mock('../PaymentSchedule', () => ({ PaymentSchedule: step('payment-schedule') }));
vi.mock('../PaymentWidget', () => ({ PaymentWidget: step('payment-widget') }));
vi.mock('../SubmitButton', () => ({ SubmitButton: submit }));
vi.mock('./PayLabel', () => ({ PayLabel: () => 'Pay now' }));
vi.mock('./Step', () => ({ Step: step('step') }));
vi.mock('../legacy', () => ({
  LegacyBillingAddress: step('legacy-billing-address'),
  LegacyCardInstallments: step('legacy-card-installments'),
  LegacyCgv: step('legacy-cgv'),
  LegacyComments: step('legacy-comments'),
  LegacyContactChoice: step('legacy-contact-choice'),
  LegacyDonation: step('legacy-donation'),
  LegacyPaymentProviders: step('legacy-payment-providers'),
  LegacyPaymentSchedule: step('legacy-payment-schedule'),
  LegacyPaymentWidget: step('legacy-payment-widget'),
  LegacySubmitButton: submit,
}));

const baseProps: CapsPaymentFormProps = {
  capsUrl: 'https://caps.example',
  apiKey: 'api-key',
  issuerType: 'GM',
  type: 'proposal',
  id: '2057923',
  locale: 'fr-FR',
  callbackUrl: 'https://host.example/cb',
};

const lastFormProps = () => formProps.mock.lastCall![0];

describe('CapsPaymentForm', () => {
  beforeEach(() => {
    Element.prototype.scrollIntoView = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('configures the SDK with the API key from the props, without fetching it', () => {
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);

    render(<CapsPaymentForm {...baseProps} />);

    expect(providerProps).toHaveBeenLastCalledWith(
      expect.objectContaining({
        locale: 'fr-FR',
        proposalId: '2057923',
        bookingId: undefined,
        api: { url: 'https://caps.example', apiKey: 'api-key' },
        oidc: { issuerType: 'GM', accessToken: '' },
        callbackUrl: 'https://host.example/cb',
      }),
    );
    expect(fetch).not.toHaveBeenCalled();

    vi.unstubAllGlobals();
  });

  it('renders every step with its title and the default submit button', () => {
    const { container, getByRole } = render(
      <CapsPaymentForm {...baseProps} action="PAYMENT_RESA" reference="REF" uuid="abc" />,
    );

    expect(
      container.querySelector('[data-testid=contact-choice]')!.getAttribute('data-props'),
    ).toBe(JSON.stringify({ reference: 'REF', uuid: 'abc' }));
    [
      'Choose the payment schedule',
      'How do you want to pay?',
      'Comments',
      'General Terms and Conditions of Sale',
      'Billing address',
    ].forEach((title) => expect(container.textContent).toContain(title));
    expect(getByRole('button').className).toBe('self-center');
    expect(getByRole('button').textContent).toBe('Pay now');
    expect(lastFormProps().action).toBe('PAYMENT_RESA');
  });

  it('renders the legacy steps with the legacy theme', () => {
    const { container } = render(<CapsPaymentForm {...baseProps} theme="legacy" />);

    expect(container.querySelector('[data-testid=legacy-payment-schedule]')).toBeTruthy();
    expect(container.querySelector('[data-testid=payment-schedule]')).toBeNull();
  });

  it('resolves the theme from the CMS when the prop is absent', () => {
    cmsTheme.mockReturnValueOnce('legacy');

    const { container } = render(<CapsPaymentForm {...baseProps} />);

    expect(container.querySelector('[data-testid=legacy-payment-schedule]')).toBeTruthy();
    expect(container.querySelector('[data-testid=payment-schedule]')).toBeNull();
  });

  it('gives the provider the resolved theme so it serves a single content', () => {
    cmsTheme.mockReturnValueOnce('legacy');
    const { container } = render(<CapsPaymentForm {...baseProps} />);

    expect(providerProps).toHaveBeenLastCalledWith(expect.objectContaining({ theme: 'legacy' }));
    expect(container.textContent).toContain('Choose your payment schedule');
    expect(container.textContent).not.toContain('Choose the payment schedule');
  });

  it('prefers the theme prop over the CMS without reading it', () => {
    cmsTheme.mockReturnValue('legacy');

    const { container } = render(<CapsPaymentForm {...baseProps} theme="current" />);

    expect(container.querySelector('[data-testid=payment-schedule]')).toBeTruthy();
    expect(cmsTheme).not.toHaveBeenCalled();

    cmsTheme.mockReturnValue('current');
  });

  it('reveals the sections step by step in stepper mode', () => {
    const { container } = render(<CapsPaymentForm {...baseProps} stepper />);

    expect(
      [...container.querySelectorAll('[data-testid=step]')].map(
        (element) => JSON.parse(element.getAttribute('data-props')!).after,
      ),
    ).toEqual([
      'amount',
      'provider_id',
      ['payment_condition_id', 'billing_details.attendee', 'billing_details.address'],
      'billing_details.address',
      ['template_id', 'billing_details.mobile_phone', 'billing_details.email'],
      'comments',
      undefined,
      'billing_details.address',
    ]);
    expect(lastFormProps().stepper).toBe(true);
  });

  it('renders every section at once without the stepper', () => {
    render(<CapsPaymentForm {...baseProps} />);

    expect(lastFormProps().stepper).toBe(false);
  });

  it('ignores the stepper with the legacy theme', () => {
    const { container } = render(<CapsPaymentForm {...baseProps} theme="legacy" stepper />);

    expect(container.querySelector('[data-testid=step]')).toBeNull();
    expect(lastFormProps().stepper).toBe(false);
  });

  it('applies className and style to the container', () => {
    const { container } = render(
      <CapsPaymentForm {...baseProps} className="host-class" style={{ color: 'red' }} />,
    );

    expect((container.firstChild as HTMLElement).className).toBe('w-full host-class');
    expect((container.firstChild as HTMLElement).style.color).toBe('red');
  });

  it('forwards the host customer and refreshes the token', () => {
    const { rerender } = render(
      <CapsPaymentForm
        {...baseProps}
        type="booking"
        customerId="customer-42"
        accessToken="token-1"
      />,
    );

    expect(providerProps).toHaveBeenLastCalledWith(
      expect.objectContaining({ bookingId: '2057923', customerId: 'customer-42' }),
    );

    rerender(
      <CapsPaymentForm
        {...baseProps}
        type="booking"
        customerId="customer-42"
        accessToken="token-2"
      />,
    );

    expect(providerProps).toHaveBeenLastCalledWith(
      expect.objectContaining({ oidc: { issuerType: 'GM', accessToken: 'token-2' } }),
    );
  });

  it('lets the host cancel a redirect', () => {
    const onRedirect = vi.fn().mockReturnValueOnce(false).mockReturnValueOnce(undefined);
    render(<CapsPaymentForm {...baseProps} onRedirect={onRedirect} />);

    const { onNavigate } = providerProps.mock.lastCall![0] as {
      onNavigate: (request: { url: string }) => void;
    };

    onNavigate({ url: 'https://psp/1' });
    expect(defaultNavigate).not.toHaveBeenCalled();

    onNavigate({ url: 'https://psp/2' });
    expect(onRedirect).toHaveBeenLastCalledWith('https://psp/2');
    expect(defaultNavigate).toHaveBeenCalledWith({ url: 'https://psp/2' });
  });

  it('emits the redirect event only when the navigation goes on', () => {
    const onEvent = vi.fn();
    const onRedirect = vi.fn().mockReturnValueOnce(false).mockReturnValueOnce(undefined);
    render(<CapsPaymentForm {...baseProps} onEvent={onEvent} onRedirect={onRedirect} />);

    const { onNavigate } = providerProps.mock.lastCall![0] as {
      onNavigate: (request: { url: string }) => void;
    };

    onNavigate({ url: 'https://psp/1' });
    expect(onEvent).not.toHaveBeenCalled();

    onNavigate({ url: 'https://psp/2' });
    expect(onEvent).toHaveBeenCalledWith({
      action: '',
      name: 'redirect',
      data: { url: 'https://psp/2' },
    });
  });

  it('navigates by default when no redirect handler is given', () => {
    render(<CapsPaymentForm {...baseProps} />);

    providerProps.mock.lastCall![0].onNavigate({ url: 'https://psp/3' });

    expect(defaultNavigate).toHaveBeenCalledWith({ url: 'https://psp/3' });
  });

  it('renders the donation and the submit button in the host slots', () => {
    const donation = document.body.appendChild(document.createElement('div'));
    const submit = document.body.appendChild(document.createElement('div'));

    const { container } = render(<CapsPaymentForm {...baseProps} slots={{ donation, submit }} />);

    expect(container.querySelector('[data-testid=donation]')).toBeNull();
    expect(container.querySelector('button')).toBeNull();
    expect(container.querySelector('[data-testid=cgv]')).toBeTruthy();
    expect(donation.querySelector('[data-testid=donation]')).toBeTruthy();
    expect(submit.querySelector('button')!.className).toBe('w-full');

    donation.remove();
    submit.remove();
  });

  it('keeps the regions in the form while a slot has no host element yet', () => {
    const { container, getByRole } = render(
      <CapsPaymentForm {...baseProps} slots={{ donation: null, submit: null }} />,
    );

    expect(container.querySelector('[data-testid=donation]')).toBeTruthy();
    expect(getByRole('button').className).toBe('self-center');
  });

  it('forwards the events of the form to the host', () => {
    const onEvent = vi.fn();
    render(<CapsPaymentForm {...baseProps} onEvent={onEvent} />);

    const submit = {
      action: 'click',
      name: 'submit',
      data: { provider_id: 'P1', amount: 1250, currency: 'EUR' },
    };
    act(() => lastFormProps().onEvent({ action: '', name: 'load' }));
    act(() => lastFormProps().onEvent(submit));
    act(() => lastFormProps().onEvent({ action: '', name: 'load_end' }));

    expect(onEvent.mock.calls).toEqual([
      [{ action: '', name: 'load' }],
      [submit],
      [{ action: '', name: 'load_end' }],
    ]);
  });

  it('reports the payment error without displaying it', () => {
    const onEvent = vi.fn();
    const { container } = render(<CapsPaymentForm {...baseProps} onEvent={onEvent} />);
    const error = {
      action: '',
      name: 'error',
      data: { code: 'FLOW_ERROR', message: 'Payment refused' },
    };

    act(() => lastFormProps().onEvent(error));

    expect(container.textContent).not.toContain('Payment refused');
    expect(onEvent).toHaveBeenCalledWith(error);
  });

  it('reports a flow loading error through the fallback', () => {
    const onEvent = vi.fn();
    render(<CapsPaymentForm {...baseProps} onEvent={onEvent} />);

    const { getByRole } = render(
      <>{lastFormProps().errorFallback({ error: 'boom', resetErrorBoundary: vi.fn() })}</>,
    );

    expect(getByRole('alert').textContent).toContain('boom');
    expect(onEvent).toHaveBeenLastCalledWith({
      action: '',
      name: 'error',
      data: { code: 'FLOW_ERROR', message: 'boom' },
    });
  });

  it('keeps the flow going when the host handler throws', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const onEvent = vi.fn(() => {
      throw new Error('host failure');
    });
    render(<CapsPaymentForm {...baseProps} onEvent={onEvent} />);

    expect(() => act(() => lastFormProps().onEvent({ action: '', name: 'load' }))).not.toThrow();
    expect(onEvent).toHaveBeenCalledTimes(1);
    vi.mocked(console.error).mockRestore();
  });

  it('renders the headings and the submit label from the content', () => {
    const { container } = render(
      <CapsPaymentForm
        {...baseProps}
        theme="legacy"
        content={{ submit: { label: 'Payer' }, cgv: { heading: 'CGV' } }}
      />,
    );

    expect(container.querySelector('button')!.textContent).toBe('Payer');
    expect(container.textContent).toContain('CGV');
    expect(providerProps).toHaveBeenLastCalledWith(
      expect.objectContaining({
        content: expect.objectContaining({ cgv: { heading: 'CGV' } }),
      }),
    );
  });

  it('renders no heading when the host empties it', () => {
    const { container } = render(
      <CapsPaymentForm {...baseProps} content={{ cgv: { heading: '' } }} />,
    );

    expect(container.textContent).not.toContain('General Terms and Conditions of Sale');
  });

  it('does not require the host to provide any callback', () => {
    render(<CapsPaymentForm {...baseProps} />);

    act(() => lastFormProps().onEvent({ action: '', name: 'load' }));
    act(() => lastFormProps().onEvent({ action: '', name: 'load_end' }));

    expect(formProps).toHaveBeenCalled();
  });
});
