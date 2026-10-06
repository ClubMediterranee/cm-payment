import { render } from '@testing-library/react';
import { FormSubmitContext } from '@clubmed/caps';
import { createContext, useContext } from 'react';

import { SubmitSlot } from '../flow/CapsFlow';
import { ShadowSlot } from './ShadowHost';

const FormContext = createContext('none');

const ContextValue = () => <span data-testid="value">{useContext(FormContext)}</span>;

describe('ShadowSlot', () => {
  it('renders in place without target', () => {
    const { getByTestId } = render(
      <FormContext.Provider value="form">
        <ShadowSlot>
          <ContextValue />
        </ShadowSlot>
      </FormContext.Provider>,
    );

    expect(getByTestId('value').textContent).toBe('form');
  });

  it('renders in the shadow root of the target with the form contexts', () => {
    const target = document.body.appendChild(document.createElement('div'));

    render(
      <FormContext.Provider value="form">
        <ShadowSlot target={target}>
          <ContextValue />
        </ShadowSlot>
      </FormContext.Provider>,
    );

    expect(target.shadowRoot?.querySelector('[data-testid="value"]')?.textContent).toBe('form');
    target.remove();
  });
});

describe('SubmitSlot', () => {
  it('renders the children in the slot shadow root', () => {
    const target = document.body.appendChild(document.createElement('div'));

    render(
      <FormSubmitContext.Provider value={{ onSubmit: () => {} }}>
        <SubmitSlot target={target}>
          <button type="submit" form="payment-form">
            Pay
          </button>
        </SubmitSlot>
      </FormSubmitContext.Provider>,
    );

    expect(target.shadowRoot!.querySelector('button')?.textContent).toBe('Pay');
    target.remove();
  });

  it('submits through the form context when a slotted submit button is clicked', () => {
    const onSubmit = vi.fn();
    const target = document.body.appendChild(document.createElement('div'));

    render(
      <FormSubmitContext.Provider value={{ onSubmit }}>
        <SubmitSlot target={target}>
          <button type="submit" form="payment-form">
            Pay
          </button>
        </SubmitSlot>
      </FormSubmitContext.Provider>,
    );

    target.shadowRoot!.querySelector('button')!.click();

    expect(onSubmit).toHaveBeenCalledTimes(1);
    target.remove();
  });
});
