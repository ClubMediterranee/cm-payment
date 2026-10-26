import { render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { defaultContent } from '../content/default';
import { FormSubmitContext } from '../contexts/FormSubmitContext';
import { PaymentPanel, type PaymentPanelProps } from './PaymentPanel';

const watchedProvider = vi.hoisted(() => vi.fn());

vi.mock('../hooks/utils/useCapsConfigContext', () => ({
  useCapsConfigContext: () => ({ content: defaultContent }),
}));
vi.mock('../hooks/utils/useWatchedPaymentProvider', () => ({
  useWatchedPaymentProvider: () => watchedProvider(),
}));
vi.mock('../hooks/utils/useProviderIntegrationMode', () => ({
  useProviderIntegrationMode: () => ({ iframe: false }),
}));
vi.mock('../hooks/data/usePaymentProviders', () => ({
  usePaymentProviders: () => ({
    data: {
      paymentProviders: [
        { id: 'CARD', description: 'Pay by card', category_payment_method: 'CreditCard' },
        { id: 'PAYPAL', description: 'Pay with PayPal', category_payment_method: 'Paypal' },
      ],
      buyNowPayLaterProviders: [],
    },
  }),
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

vi.mock('./BillingAddress', () => ({ BillingAddress: step('billing-address') }));
vi.mock('./CardInstallments', () => ({ CardInstallments: step('card-installments') }));
vi.mock('./Cgv', () => ({ Cgv: step('cgv') }));
vi.mock('./Comments', () => ({ Comments: step('comments') }));
vi.mock('./ContactChoice', () => ({ ContactChoice: step('contact-choice') }));
vi.mock('./Donation', () => ({ Donation: step('donation') }));
vi.mock('./PaymentWidget', () => ({ PaymentWidget: step('payment-widget') }));
vi.mock('./PaymentPanel/Step', () => ({ Step: step('step') }));
vi.mock('./SubmitButton', () => ({ SubmitButton: submit }));

const Harness = (props: PaymentPanelProps) => {
  const methods = useForm({ defaultValues: { provider_id: 'CARD' } });

  return (
    <FormSubmitContext.Provider value={{ onSubmit: () => {} }}>
      <FormProvider {...methods}>
        <form id="payment-form">
          <PaymentPanel {...props} />
        </form>
      </FormProvider>
    </FormSubmitContext.Provider>
  );
};

const stepsOf = (container: HTMLElement) =>
  [...container.querySelectorAll('[data-testid=step]')].map(
    (element) => JSON.parse(element.getAttribute('data-props')!).after,
  );

describe('PaymentPanel', () => {
  beforeEach(() => {
    watchedProvider.mockReturnValue({ id: 'CARD', category_payment_method: 'CreditCard' });
  });

  it('lists the providers under their heading and expands only the selected one', () => {
    const { container, getAllByRole } = render(<Harness />);

    expect(container.textContent).toContain('How do you want to pay?');
    expect(container.textContent).toContain('Pay by card');
    expect(container.textContent).toContain('Pay with PayPal');
    expect(getAllByRole('radio')).toHaveLength(2);
    expect(container.querySelectorAll('[data-testid=cgv]')).toHaveLength(1);
  });

  it('renders every block with its title and the default submit button', () => {
    const { container, getByRole } = render(<Harness reference="REF" uuid="abc" />);

    expect(
      container.querySelector('[data-testid=contact-choice]')!.getAttribute('data-props'),
    ).toBe(JSON.stringify({ reference: 'REF', uuid: 'abc' }));
    ['Comments', 'General Terms and Conditions of Sale', 'Billing address'].forEach((title) =>
      expect(container.textContent).toContain(title),
    );
    expect(getByRole('button').className).toBe('self-center');
  });

  it('reveals the providers, the blocks and the donation step by step', () => {
    const { container } = render(<Harness />);

    expect(stepsOf(container)).toEqual([
      'amount',
      'amount',
      'provider_id',
      ['payment_condition_id', 'billing_details.attendee', 'billing_details.address'],
      'billing_details.address',
      ['template_id', 'billing_details.mobile_phone', 'billing_details.email'],
      'comments',
      undefined,
      'billing_details.address',
    ]);
  });

  it('renders the donation and the submit button in the host slots', () => {
    const donation = document.body.appendChild(document.createElement('div'));
    const submitSlot = document.body.appendChild(document.createElement('div'));

    const { container } = render(<Harness slots={{ donation, submit: submitSlot }} />);

    expect(container.querySelector('[data-testid=donation]')).toBeNull();
    expect(container.querySelector('button')).toBeNull();
    expect(donation.querySelector('[data-testid=donation]')).toBeTruthy();
    expect(submitSlot.querySelector('button')!.className).toBe('w-full');
    expect(stepsOf(container)).toHaveLength(8);

    donation.remove();
    submitSlot.remove();
  });

  it('keeps the donation and the submit button in the form while a slot has no host element yet', () => {
    const { container, getByRole } = render(<Harness slots={{ donation: null, submit: null }} />);

    expect(container.querySelector('[data-testid=donation]')).toBeTruthy();
    expect(getByRole('button').className).toBe('self-center');
  });

  it('shows only the blocks, without the provider list, for a buy now pay later provider', () => {
    watchedProvider.mockReturnValue({ id: 'ONEY', category_payment_method: 'BuyNowPayLater' });

    const { container, queryAllByRole } = render(<Harness />);

    expect(queryAllByRole('radio')).toHaveLength(0);
    expect(container.textContent).not.toContain('How do you want to pay?');
    expect(container.querySelector('[data-testid=cgv]')).toBeTruthy();
  });
});
