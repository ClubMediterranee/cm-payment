import { act, render } from '@testing-library/react';
import type { ReactNode } from 'react';

import RemoteCapsForm, { type CapsRemoteFormProps } from './RemoteCapsForm';

const formProps = vi.fn();

vi.mock('@clubmed/caps', () => ({
  CapsPaymentForm: (props: Record<string, unknown>) => {
    formProps(props);
    return <section data-testid="caps-payment-form" />;
  },
}));

vi.mock('@clubmed/trident-icons', () => ({
  IconsProvider: ({ children }: { children: ReactNode }) => children,
}));
vi.mock('@clubmed/trident-icons/svg/Actions', () => ({ default: {} }));
vi.mock('@clubmed/trident-icons/svg/Brand', () => ({ default: {} }));
vi.mock('@clubmed/trident-icons/svg/Utilities', () => ({ default: {} }));

const baseProps: CapsRemoteFormProps = {
  capsUrl: 'https://caps.example',
  apiKey: 'api-key',
  issuerType: 'GM',
  type: 'proposal',
  id: '2057923',
  locale: 'fr-FR',
  callbackUrl: 'https://host.example/cb',
};

const lastFormProps = () => formProps.mock.lastCall![0];

const getShadowRoot = (container: HTMLElement) => container.querySelector('caps-form')!.shadowRoot!;

describe('RemoteCapsForm (federated)', () => {
  beforeEach(() => {
    Element.prototype.scrollIntoView = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the SDK form inside the <caps-form> shadow root with the flow props', () => {
    const { container } = render(<RemoteCapsForm {...baseProps} theme="legacy" />);

    expect(getShadowRoot(container).querySelector('[data-testid=caps-payment-form]')).toBeTruthy();
    // Nothing is rendered in the light DOM of the host.
    expect(container.querySelector('[data-testid=caps-payment-form]')).toBeNull();
    expect(formProps).toHaveBeenLastCalledWith(
      expect.objectContaining({ ...baseProps, theme: 'legacy' }),
    );
  });

  it('hands the host content to the form untouched', () => {
    const content = { submit: { label: 'Payer' }, cgv: { title: 'CGV' } };

    render(<RemoteCapsForm {...baseProps} content={content} />);

    expect(lastFormProps().content).toEqual(content);
  });

  it('keeps the host presentation props out of the SDK form', () => {
    const { container } = render(
      <RemoteCapsForm {...baseProps} className="host-class" style={{ color: 'red' }} />,
    );

    expect(lastFormProps()).not.toHaveProperty('className');
    expect(lastFormProps()).not.toHaveProperty('style');
    expect(container.querySelector('caps-form')!.className).toBe('host-class');
  });

  it('hands the host slots to the form as style-isolated shadow roots', () => {
    const donation = document.body.appendChild(document.createElement('div'));
    const submit = document.body.appendChild(document.createElement('div'));

    render(<RemoteCapsForm {...baseProps} slots={{ donation, submit }} />);

    const { slots } = lastFormProps();
    expect(slots.donation).toBe(donation.shadowRoot!.querySelector('[data-caps-root]'));
    expect(slots.submit).toBe(submit.shadowRoot!.querySelector('[data-caps-root]'));

    donation.remove();
    submit.remove();
  });

  it('keeps the regions in the form without slots', () => {
    render(<RemoteCapsForm {...baseProps} />);

    expect(lastFormProps().slots).toEqual({ donation: undefined, submit: undefined });
  });

  it('displays the payment error and reports it to the host', () => {
    const onError = vi.fn();
    const { container } = render(<RemoteCapsForm {...baseProps} onError={onError} />);
    const root = getShadowRoot(container);

    act(() => lastFormProps().onError({ code: 'FLOW_ERROR', message: 'Payment refused' }));

    expect(root.querySelector('p')!.textContent).toBe('Payment refused');
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
    expect(onError).toHaveBeenCalledWith({ code: 'FLOW_ERROR', message: 'Payment refused' });

    act(() => lastFormProps().onError({ code: 'ORIGIN_NOT_ALLOWED', message: 'No token' }));
    expect(root.querySelector('p')).toBeNull();
  });

  it('does not require a host error callback', () => {
    const { container } = render(<RemoteCapsForm {...baseProps} />);

    act(() => lastFormProps().onError({ code: 'FLOW_ERROR', message: 'Payment refused' }));

    expect(getShadowRoot(container).textContent).toContain('Payment refused');
  });
});
