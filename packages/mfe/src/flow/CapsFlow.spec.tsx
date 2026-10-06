import { act, fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';

import { CapsFlow } from './CapsFlow';

type FormProps = {
  action?: string;
  errorFallback: (props: { error: unknown; resetErrorBoundary: () => void }) => ReactNode;
  onError: (error: Error) => void;
  onLoad: () => void;
  onLoadEnd: () => void;
};

const formProps = vi.fn<(props: FormProps) => void>();
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
    Form: ({ children, ...props }: FormProps & { children: ReactNode }) => {
      formProps(props);
      return (
        <form id="payment-form" onSubmit={(event) => event.preventDefault()}>
          {children}
        </form>
      );
    },
    useFormSubmit: () => ({ onSubmit }),
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

const lastFormProps = () => formProps.mock.lastCall![0];

describe('CapsFlow', () => {
  beforeEach(() => {
    formProps.mockClear();
    onSubmit.mockClear();
    Element.prototype.scrollIntoView = vi.fn();
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('renders every step with its title and signals that the flow is ready once', () => {
    const onReady = vi.fn();

    const { rerender } = render(
      <CapsFlow
        action="PAYMENT_RESA"
        reference="REF"
        uuid="abc"
        labels={{ submit: 'Payer' }}
        onReady={onReady}
      />,
    );
    expect(screen.getByTestId('contact-choice').dataset.props).toBe(
      JSON.stringify({ reference: 'REF', uuid: 'abc' }),
    );

    rerender(<CapsFlow labels={{ submit: 'Payer' }} onReady={onReady} />);

    expect(screen.getByText('Choose your payment schedule')).toBeTruthy();
    expect(screen.getByText('Make a donation')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Payer' }).className).toBe('my-8 self-center');
    expect(formProps.mock.calls[0][0].action).toBe('PAYMENT_RESA');
    expect(onReady).toHaveBeenCalledTimes(1);
  });

  it('mirrors the payment processing state', () => {
    const onLoadingChange = vi.fn();
    render(<CapsFlow onLoadingChange={onLoadingChange} />);

    lastFormProps().onLoad();
    lastFormProps().onLoadEnd();

    expect(onLoadingChange.mock.calls).toEqual([[true], [false]]);
  });

  it('displays a payment error and reports it', () => {
    const onError = vi.fn();
    const onLoadingChange = vi.fn();
    render(<CapsFlow onError={onError} onLoadingChange={onLoadingChange} />);
    const error = new Error('Payment refused');

    act(() => lastFormProps().onError(error));

    expect(screen.getByText('Payment refused')).toBeTruthy();
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
    expect(onLoadingChange).toHaveBeenCalledWith(false);
    expect(onError).toHaveBeenCalledWith(error);
  });

  it('reports a flow loading error and lets the user retry', () => {
    const onError = vi.fn();
    const resetErrorBoundary = vi.fn();
    render(<CapsFlow onError={onError} />);

    const { getByRole } = render(
      <>{lastFormProps().errorFallback({ error: 'boom', resetErrorBoundary })}</>,
    );

    expect(getByRole('alert').textContent).toContain('boom');
    expect(onError).toHaveBeenCalledWith(new Error('boom'));

    fireEvent.click(getByRole('button', { name: 'Réessayer' }));

    expect(resetErrorBoundary).toHaveBeenCalledTimes(1);
  });

  it('lets the browser submit the form when the button is inside it', () => {
    render(<CapsFlow />);

    fireEvent.click(screen.getByRole('button', { name: 'Pay' }));

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('renders the donation and the submit button in the host slots', () => {
    const donation = document.body.appendChild(document.createElement('div'));
    const submit = document.body.appendChild(document.createElement('div'));

    const { container } = render(<CapsFlow slots={{ donation, submit }} />);

    expect(container.querySelector('[data-testid="donation"]')).toBeNull();
    expect(donation.shadowRoot!.querySelector('[data-testid="donation"]')).not.toBeNull();

    const button = submit.shadowRoot!.querySelector('button')!;

    expect(button.className).toBe('w-full');
    expect(container.querySelector('button')).toBeNull();
  });

  it('submits the form from a slot, where the button cannot reach it', () => {
    const submit = document.body.appendChild(document.createElement('div'));
    render(<CapsFlow slots={{ submit }} />);

    fireEvent.click(submit.shadowRoot!.querySelector('button')!);

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});
