import { describe, expect, it } from 'vitest';

import { mergeActivationDayRange } from './mergeActivationDayRange.js';

describe('mergeActivationDayRange', () => {
  it('returns local when global is absent', () => {
    expect(mergeActivationDayRange(undefined, { min: 10, max: 200 })).toEqual({
      min: 10,
      max: 200,
    });
  });

  it('returns global when local is absent', () => {
    expect(mergeActivationDayRange({ min: 45, max: null }, undefined)).toEqual({
      min: 45,
      max: null,
    });
  });

  it('takes the higher min', () => {
    expect(mergeActivationDayRange({ min: 10, max: null }, { min: 45, max: null })).toMatchObject({
      min: 45,
    });
  });

  it('takes the lower max', () => {
    expect(mergeActivationDayRange({ min: 0, max: 300 }, { min: 0, max: 200 })).toMatchObject({
      max: 200,
    });
  });

  it('keeps null max when both are null', () => {
    expect(mergeActivationDayRange({ min: 0, max: null }, { min: 10, max: null })).toMatchObject({
      max: null,
    });
  });

  it('prefers a finite max over null', () => {
    expect(mergeActivationDayRange({ min: 0, max: null }, { min: 0, max: 200 })).toMatchObject({
      max: 200,
    });
  });

  it('combines: global min 45/null + local min 0/200 → min 45, max 200', () => {
    expect(mergeActivationDayRange({ min: 45, max: null }, { min: 0, max: 200 })).toEqual({
      min: 45,
      max: 200,
    });
  });

  it('min is 0 when both are 0', () => {
    expect(mergeActivationDayRange({ min: 0, max: null }, { min: 0, max: null })).toMatchObject({
      min: 0,
    });
  });
});
