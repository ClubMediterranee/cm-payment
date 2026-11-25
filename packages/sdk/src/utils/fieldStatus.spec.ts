import {
  hiddenError,
  isErrorRevealed,
  resolveFieldStatus,
  revealOnBlur,
  revealOnChange,
} from './fieldStatus';

const INVALID = { valid: false, empty: false };
const VALID = { valid: true, empty: false };
const EMPTY = { valid: false, empty: true };

describe('fieldStatus', () => {
  it('hides the error of a new field until it is left or the form submitted again', () => {
    const reveal = hiddenError(1);

    expect(isErrorRevealed(reveal, 1)).toBe(false);
    expect(isErrorRevealed(reveal, 2)).toBe(true);
  });

  it('reveals the error of an incorrect value on blur, not of an empty one', () => {
    expect(revealOnBlur(hiddenError(0), INVALID).shown).toBe(true);
    expect(revealOnBlur(hiddenError(0), EMPTY).shown).toBe(false);
    expect(revealOnBlur(hiddenError(0), VALID).shown).toBe(false);
  });

  it('keeps a revealed error while the value stays incorrect, and hides it once valid or emptied', () => {
    const shown = { shown: true, hiddenAt: 0 };

    expect(revealOnChange(shown, INVALID, 1)).toBe(shown);
    expect(revealOnChange(shown, VALID, 1)).toEqual({ shown: false, hiddenAt: 1 });
    expect(revealOnChange(shown, EMPTY, 1)).toEqual({ shown: false, hiddenAt: 1 });
  });

  it('resolves the status shown by the field', () => {
    expect(resolveFieldStatus({ ...VALID, revealed: false })).toBe('success');
    expect(resolveFieldStatus({ ...VALID, revealed: false, checked: false })).toBe('default');
    expect(resolveFieldStatus({ valid: true, empty: true, revealed: true })).toBe('default');
    expect(resolveFieldStatus({ ...INVALID, revealed: false })).toBe('default');
    expect(resolveFieldStatus({ ...INVALID, revealed: true })).toBe('error');
  });
});
