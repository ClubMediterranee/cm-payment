import { render } from '@testing-library/react';
import { createContext, useContext } from 'react';

import { FormSubmitContext } from '../../contexts/FormSubmitContext';
import { FormSlot, SubmitSlot } from './FormSlots';

const FormContext = createContext('none');
const ContextValue = () => <span data-testid="value">{useContext(FormContext)}</span>;

const submitButton = (
  <button type="submit" form="payment-form">
    Pay
  </button>
);

describe('FormSlot', () => {
  it('renders in place without target', () => {
    const { getByTestId } = render(
      <FormContext.Provider value="form">
        <FormSlot>
          <ContextValue />
        </FormSlot>
      </FormContext.Provider>,
    );

    expect(getByTestId('value').textContent).toBe('form');
  });

  it('renders in the target with the contexts of the form', () => {
    const target = document.body.appendChild(document.createElement('div'));

    render(
      <FormContext.Provider value="form">
        <FormSlot target={target}>
          <ContextValue />
        </FormSlot>
      </FormContext.Provider>,
    );

    expect(target.querySelector('[data-testid=value]')!.textContent).toBe('form');
    target.remove();
  });
});

describe('SubmitSlot', () => {
  it('renders the button in place without target', () => {
    const { getByRole } = render(
      <FormSubmitContext.Provider value={{ onSubmit: () => {} }}>
        <SubmitSlot>{submitButton}</SubmitSlot>
      </FormSubmitContext.Provider>,
    );

    expect(getByRole('button').textContent).toBe('Pay');
  });

  it('renders the button in the target and submits through the form context', () => {
    const onSubmit = vi.fn();
    const target = document.body.appendChild(document.createElement('div'));

    render(
      <FormSubmitContext.Provider value={{ onSubmit }}>
        <SubmitSlot target={target}>{submitButton}</SubmitSlot>
      </FormSubmitContext.Provider>,
    );

    target.querySelector('button')!.click();

    expect(onSubmit).toHaveBeenCalledTimes(1);
    target.remove();
  });

  it('leaves a button that reaches its form to submit it natively', () => {
    const onSubmit = vi.fn();
    const target = document.body.appendChild(document.createElement('div'));
    const form = document.body.appendChild(document.createElement('form'));
    form.id = 'payment-form';
    form.addEventListener('submit', (event) => event.preventDefault());

    render(
      <FormSubmitContext.Provider value={{ onSubmit }}>
        <SubmitSlot target={target}>{submitButton}</SubmitSlot>
      </FormSubmitContext.Provider>,
    );

    target.querySelector('button')!.click();

    expect(onSubmit).not.toHaveBeenCalled();
    target.remove();
    form.remove();
  });
});
