import { mapIxopayErrorsToObject } from './ixopay.js';

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
