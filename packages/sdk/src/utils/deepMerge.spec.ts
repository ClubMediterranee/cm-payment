import { deepMerge } from './deepMerge';

describe('deepMerge', () => {
  describe('simple merging', () => {
    it('adds new properties from source', () => {
      const result = deepMerge({ a: 1 }, { b: 2 });
      expect(result).toEqual({ a: 1, b: 2 });
    });

    it('overwrites existing properties', () => {
      const result = deepMerge({ a: 1 }, { a: 2 });
      expect(result).toEqual({ a: 2 });
    });

    it('handles empty target', () => {
      const result = deepMerge({}, { a: 1 });
      expect(result).toEqual({ a: 1 });
    });

    it('handles empty source', () => {
      const result = deepMerge({ a: 1 }, {});
      expect(result).toEqual({ a: 1 });
    });
  });

  describe('nested objects', () => {
    it('merges one level deep', () => {
      const result = deepMerge({ a: { b: 1 } }, { a: { c: 2 } });
      expect(result).toEqual({ a: { b: 1, c: 2 } });
    });

    it('merges two levels deep', () => {
      const result = deepMerge({ a: { b: { c: 1 } } }, { a: { b: { d: 2 } } });
      expect(result).toEqual({ a: { b: { c: 1, d: 2 } } });
    });

    it('overwrites nested properties', () => {
      const result = deepMerge({ a: { b: 1 } }, { a: { b: 2 } });
      expect(result).toEqual({ a: { b: 2 } });
    });
  });

  describe('type replacement', () => {
    it('replaces object with primitive', () => {
      const result = deepMerge({ a: { b: 1 } }, { a: 'text' });
      expect(result).toEqual({ a: 'text' });
    });

    it('replaces primitive with object', () => {
      const result = deepMerge({ a: 'text' }, { a: { b: 1 } });
      expect(result).toEqual({ a: { b: 1 } });
    });

    it('replaces array with new array', () => {
      const result = deepMerge({ a: [1, 2] }, { a: [3, 4] });
      expect(result).toEqual({ a: [3, 4] });
    });
  });

  describe('primitive values', () => {
    it('handles strings', () => {
      const result = deepMerge({ a: 'foo' }, { a: 'bar' });
      expect(result).toEqual({ a: 'bar' });
    });

    it('handles numbers', () => {
      const result = deepMerge({ a: 1 }, { a: 2 });
      expect(result).toEqual({ a: 2 });
    });

    it('handles zero', () => {
      const result = deepMerge({ a: 1 }, { a: 0 });
      expect(result).toEqual({ a: 0 });
    });

    it('handles booleans', () => {
      const result = deepMerge({ a: true }, { a: false });
      expect(result).toEqual({ a: false });
    });

    it('handles null', () => {
      const result = deepMerge({ a: 1 }, { a: null });
      expect(result).toEqual({ a: null });
    });

    it('handles undefined', () => {
      const result = deepMerge({ a: 1 }, { a: undefined });
      expect(result).toEqual({ a: undefined });
    });
  });

  describe('immutability', () => {
    it('does not mutate target', () => {
      const target = { a: 1 };
      deepMerge(target, { b: 2 });
      expect(target).toEqual({ a: 1 });
    });

    it('does not mutate source', () => {
      const source = { b: 2 };
      deepMerge({ a: 1 }, source);
      expect(source).toEqual({ b: 2 });
    });

    it('does not mutate nested target', () => {
      const target = { a: { b: 1 } };
      deepMerge(target, { a: { c: 2 } });
      expect(target).toEqual({ a: { b: 1 } });
    });
  });
});
