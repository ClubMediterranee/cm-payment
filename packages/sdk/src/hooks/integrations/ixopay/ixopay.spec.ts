import { mapIxopayErrorsToObject, removeErrorKey } from './ixopay';

describe('mapIxopayErrorsToObject', () => {
  it('maps an empty list to an empty object', () => {
    expect(mapIxopayErrorsToObject([])).toEqual({});
  });

  it('maps each error attribute to its message', () => {
    const result = mapIxopayErrorsToObject([
      { attribute: 'number', message: 'Invalid card number' },
      { attribute: 'cvv', message: 'Invalid CVV' },
    ]);

    expect(result).toEqual({
      number: 'Invalid card number',
      cvv: 'Invalid CVV',
    });
  });

  it('keeps the last message when an attribute is repeated', () => {
    const result = mapIxopayErrorsToObject([
      { attribute: 'number', message: 'First' },
      { attribute: 'number', message: 'Second' },
    ]);

    expect(result).toEqual({ number: 'Second' });
  });
});

describe('removeErrorKey', () => {
  it('removes the given key from the errors object', () => {
    const errors = { number: 'Invalid card number', cvv: 'Invalid CVV' };

    expect(removeErrorKey(errors, 'number')).toEqual({ cvv: 'Invalid CVV' });
  });

  it('returns an equivalent object when the key is absent', () => {
    const errors = { number: 'Invalid card number' };

    expect(removeErrorKey(errors, 'cvv')).toEqual({ number: 'Invalid card number' });
  });

  it('does not mutate the original object', () => {
    const errors = { number: 'Invalid card number', cvv: 'Invalid CVV' };

    removeErrorKey(errors, 'number');

    expect(errors).toEqual({ number: 'Invalid card number', cvv: 'Invalid CVV' });
  });
});
