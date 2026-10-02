import { render } from '@testing-library/react';
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
  it('submits the form from another shadow root', () => {
    const form = document.createElement('form');
    const onSubmit = vi.fn((event: Event) => event.preventDefault());
    form.addEventListener('submit', onSubmit);
    const target = document.body.appendChild(document.createElement('div'));

    render(
      <SubmitSlot target={target} getForm={() => form}>
        <button type="submit" form="payment-form">
          Pay
        </button>
      </SubmitSlot>,
    );

    target.shadowRoot!.querySelector('button')!.click();

    expect(onSubmit).toHaveBeenCalledTimes(1);
    target.remove();
  });
});
