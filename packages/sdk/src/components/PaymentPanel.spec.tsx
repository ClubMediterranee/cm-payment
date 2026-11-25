import { act, fireEvent, render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { defaultContent } from '../content/default';
import { FormSubmitContext } from '../contexts/FormSubmitContext';
import { PaymentPanel, type PaymentPanelProps } from './PaymentPanel';

const watchedProvider = vi.hoisted(() => vi.fn());
const CARD = { id: 'CARD', description: 'Pay by card', category_payment_method: 'CreditCard' };
const PAYPAL = { id: 'PAYPAL', description: 'Pay with PayPal', category_payment_method: 'Paypal' };
const providers = vi.hoisted(() => ({ current: [] as { id: string }[] }));

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
      paymentProviders: providers.current,
      buyNowPayLaterProviders: [],
    },
  }),
}));

const { block, submit } = await vi.hoisted(async () => {
  const { createElement } = await import('react');

  return {
    block:
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

vi.mock('./BillingAddress', () => ({ BillingAddress: block('billing-address') }));
vi.mock('./CardInstallments', () => ({ CardInstallments: block('card-installments') }));
vi.mock('./Cgv', () => ({ Cgv: block('cgv') }));
vi.mock('./Comments', () => ({ Comments: block('comments') }));
vi.mock('./ContactChoice', () => ({ ContactChoice: block('contact-choice') }));
vi.mock('./Donation', () => ({ Donation: block('donation') }));
vi.mock('./PaymentWidget', () => ({ PaymentWidget: block('payment-widget') }));
vi.mock('./PaymentSchedule/FreeDepositField', () => ({ FreeDepositField: block('free-deposit') }));
vi.mock('./PaymentPanel/Step', () => ({ Step: block('step') }));
vi.mock('./SubmitButton', () => ({ SubmitButton: submit }));

type FormHandle = {
  current: { setValue: (name: 'amount' | 'provider_id', value: string) => void } | null;
};

type HarnessProps = PaymentPanelProps & {
  action?: string;
  amount?: string;
  formRef?: FormHandle;
};

const Harness = ({ action, amount = '', formRef, ...panelProps }: HarnessProps) => {
  const methods = useForm({ defaultValues: { provider_id: 'CARD', action, amount } });

  if (formRef) formRef.current = methods;

  return (
    <FormSubmitContext.Provider value={{ onSubmit: () => {} }}>
      <FormProvider {...methods}>
        <form id="payment-form">
          <PaymentPanel {...panelProps} />
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
    providers.current = [CARD, PAYPAL];
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

  it('reveals the panel and the donation once a schedule is chosen, and every block at once', () => {
    const { container } = render(<Harness />);

    expect(stepsOf(container)).toEqual(['amount']);
    expect(
      container.querySelector('[data-testid=step]')!.querySelectorAll('[data-testid]'),
    ).toHaveLength(7);
  });

  describe('scroll', () => {
    const scrollIntoView = vi.fn();

    beforeEach(() => {
      scrollIntoView.mockClear();
      Element.prototype.scrollIntoView = scrollIntoView;
      vi.stubGlobal('matchMedia', () => ({ matches: false }));
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    const pickSchedule = (form: FormHandle, amount = '100') =>
      act(() => form.current!.setValue('amount', amount));

    it('scrolls to the providers once a schedule is picked', () => {
      const form: FormHandle = { current: null };
      const { container } = render(<Harness formRef={form} />);

      expect(scrollIntoView).not.toHaveBeenCalled();

      pickSchedule(form);

      expect(scrollIntoView).toHaveBeenCalledTimes(1);
      expect(scrollIntoView.mock.contexts[0]).toBe(container.querySelector('.scroll-mt-40'));
      expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
    });

    it('scrolls again on every schedule change', () => {
      const form: FormHandle = { current: null };
      const { rerender } = render(<Harness amount="100" formRef={form} />);

      pickSchedule(form, '200');

      expect(scrollIntoView).toHaveBeenCalledTimes(1);

      watchedProvider.mockReturnValue({ id: 'ONEY', category_payment_method: 'BuyNowPayLater' });
      rerender(<Harness amount="100" formRef={form} />);

      expect(scrollIntoView).toHaveBeenCalledTimes(2);
    });

    it('scrolls instantly when the user prefers reduced motion', () => {
      vi.stubGlobal('matchMedia', (query: string) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
      }));
      const form: FormHandle = { current: null };
      render(<Harness formRef={form} />);

      pickSchedule(form);

      expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'instant', block: 'start' });
    });

    it('does not scroll when the schedule is already chosen on load', () => {
      render(<Harness amount="100" />);

      expect(scrollIntoView).not.toHaveBeenCalled();
    });

    it('does not scroll while typing a free deposit', () => {
      const form: FormHandle = { current: null };
      render(<Harness action="PAYMENT_PARTIAL" formRef={form} />);

      pickSchedule(form);

      expect(scrollIntoView).not.toHaveBeenCalled();
    });
  });

  it('renders the donation and the submit button in the host slots', () => {
    const donation = document.body.appendChild(document.createElement('div'));
    const submitSlot = document.body.appendChild(document.createElement('div'));

    const { container } = render(<Harness slots={{ donation, submit: submitSlot }} />);

    expect(container.querySelector('[data-testid=donation]')).toBeNull();
    expect(container.querySelector('button')).toBeNull();
    expect(donation.querySelector('[data-testid=donation]')).toBeTruthy();
    expect(submitSlot.querySelector('button')!.className).toBe('w-full');

    donation.remove();
    submitSlot.remove();
  });

  it('keeps the donation and the submit button in the form while a slot has no host element yet', () => {
    const { container, getByRole } = render(<Harness slots={{ donation: null, submit: null }} />);

    expect(container.querySelector('[data-testid=donation]')).toBeTruthy();
    expect(getByRole('button').className).toBe('self-center');
  });

  describe('children', () => {
    const renderWithResetButton = () =>
      render(
        <Harness>
          {({ isProviderSelected, deselectProvider }) => (
            <button type="button" onClick={deselectProvider}>
              {isProviderSelected ? 'selected' : 'none'}
            </button>
          )}
        </Harness>,
      );

    it('tells whether a provider is selected', () => {
      expect(renderWithResetButton().getByRole('button', { name: 'selected' })).toBeTruthy();

      watchedProvider.mockReturnValue(undefined);

      expect(renderWithResetButton().getByRole('button', { name: 'none' })).toBeTruthy();
    });

    it('gives a callback that resets the provider', () => {
      const { getByRole, queryAllByRole } = renderWithResetButton();

      expect(queryAllByRole('radio', { checked: true })).toHaveLength(1);

      fireEvent.click(getByRole('button', { name: 'selected' }));

      expect(queryAllByRole('radio', { checked: true })).toHaveLength(0);
    });
  });

  it('renders its children after the panel, inside the same step', () => {
    const { container, getByText } = render(<Harness>{() => <p>Extra</p>}</Harness>);

    const step = container.querySelector('[data-testid=step]')!;

    expect(step.contains(getByText('Extra'))).toBe(true);
    expect(
      step.querySelector('[data-testid=cgv]')!.compareDocumentPosition(getByText('Extra')),
    ).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });

  describe('single provider', () => {
    beforeEach(() => {
      providers.current = [CARD];
    });

    it('shows no radio and keeps the panel open', () => {
      const { container, queryAllByRole } = render(<Harness />);

      expect(queryAllByRole('radio')).toHaveLength(0);
      expect(container.textContent).toContain('Pay by card');
      expect(container.querySelector('[data-testid=cgv]')).toBeTruthy();
    });

    it('keeps the radio when children are passed', () => {
      const { getAllByRole } = render(<Harness>{() => <p>Extra</p>}</Harness>);

      expect(getAllByRole('radio')).toHaveLength(1);
    });
  });

  it('shows only the blocks, without the provider list, for a buy now pay later provider', () => {
    watchedProvider.mockReturnValue({ id: 'ONEY', category_payment_method: 'BuyNowPayLater' });

    const { container, queryAllByRole } = render(<Harness />);

    expect(queryAllByRole('radio')).toHaveLength(0);
    expect(container.textContent).not.toContain('How do you want to pay?');
    expect(container.querySelector('[data-testid=cgv]')).toBeTruthy();
  });
});
