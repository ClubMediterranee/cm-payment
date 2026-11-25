import { act, renderHook } from '@testing-library/react';

import * as useForm from './utils/useForm';
import { cardFieldMessages, useHostedFieldsState } from './useHostedFieldsState';

const MESSAGES = {
  number: { required: 'Card number is required', invalid: 'Invalid card number' },
};

describe('useHostedFieldsState', () => {
  let formState: { submitCount: number };

  beforeEach(() => {
    formState = { submitCount: 0 };
    vi.spyOn(useForm, 'useFormContext').mockImplementation(
      () => ({ formState }) as unknown as ReturnType<typeof useForm.useFormContext>,
    );
  });

  afterEach(() => vi.restoreAllMocks());

  const setup = () => renderHook(() => useHostedFieldsState(MESSAGES));

  it('starts neutral, then shows the required message once the form is submitted', () => {
    const { result, rerender } = setup();

    expect(result.current.fields.number).toEqual({
      status: 'default',
      focused: false,
      filled: false,
      error: undefined,
    });

    formState.submitCount = 1;
    rerender();

    expect(result.current.fields.number).toMatchObject({
      status: 'error',
      error: 'Card number is required',
    });
  });

  it('does not show errors on a field mounted after a submit', () => {
    formState.submitCount = 2;
    const { result } = setup();

    expect(result.current.fields.number.status).toBe('default');
  });

  it('follows typing, focus and blur', () => {
    const { result } = setup();

    act(() => {
      result.current.actions.focus('number');
      result.current.actions.change('number', { valid: false, empty: false });
    });
    expect(result.current.fields.number).toMatchObject({ status: 'default', focused: true });

    act(() => result.current.actions.blur('number'));
    expect(result.current.fields.number).toMatchObject({
      status: 'error',
      focused: false,
      error: 'Invalid card number',
    });

    act(() =>
      result.current.actions.change('number', { valid: false, empty: false }, 'Luhn check failed'),
    );
    expect(result.current.fields.number.error).toBe('Luhn check failed');

    act(() => result.current.actions.change('number', { valid: true, empty: false }));
    expect(result.current.fields.number.status).toBe('success');
    expect(result.current.isValid('number')).toBe(true);
  });

  it('keeps its actions stable across renders', () => {
    const { result, rerender } = setup();
    const { actions } = result.current;

    rerender();

    expect(result.current.actions).toBe(actions);
  });

  it('shows the error reported by the PSP at tokenization', () => {
    const { result } = setup();

    act(() => {
      result.current.actions.change('number', { valid: true, empty: false });
      result.current.actions.rejectAll({ number: 'Card refused', unknown: 'Ignored' });
    });

    expect(result.current.fields.number).toMatchObject({
      status: 'error',
      error: 'Card refused',
    });
    expect(result.current.isValid('number')).toBe(false);
    expect(Object.keys(result.current.fields)).toEqual(['number']);
  });

  it('builds the card number and CVC messages from the validation content', () => {
    expect(
      cardFieldMessages({
        cardNumber: 'Invalid card number',
        cardNumberRequired: 'Card number is required',
        cvc: 'Invalid CVC',
        cvcRequired: 'CVC is required',
        cardHolder: '',
        expiryDate: '',
        expiryDateInvalid: '',
        expired: '',
      }),
    ).toEqual({
      cardNumber: { required: 'Card number is required', invalid: 'Invalid card number' },
      cvc: { required: 'CVC is required', invalid: 'Invalid CVC' },
    });
  });
});
