import { normalizeOrigin, parseOriginList } from './origins.js';

describe('origins', () => {
  describe('normalizeOrigin', () => {
    it.each([
      ['https://Host.Example', 'https://host.example'],
      ['https://host.example/', 'https://host.example'],
      ['https://host.example:8443', 'https://host.example:8443'],
      ['http://localhost:4003', 'http://localhost:4003'],
      ['  https://host.example  ', 'https://host.example'],
    ])('normalizes %s', (value, expected) => {
      expect(normalizeOrigin(value)).toBe(expected);
    });

    it.each([
      ['an empty string', ''],
      ['a non string', 42],
      ['a path', 'https://host.example/path'],
      ['a query', 'https://host.example?x=1'],
      ['a hash', 'https://host.example#x'],
      ['credentials', 'https://user:pass@host.example'],
      ['another protocol', 'ftp://host.example'],
      ['an invalid url', 'not an url'],
    ])('rejects %s', (_, value) => {
      expect(normalizeOrigin(value)).toBeUndefined();
    });
  });

  describe('parseOriginList', () => {
    it('parses a comma separated list and drops invalid entries', () => {
      expect(
        parseOriginList(' https://a.example, ,https://b.example/path,https://C.example '),
      ).toEqual(['https://a.example', 'https://c.example']);
    });

    it('returns an empty list when unset', () => {
      expect(parseOriginList(undefined)).toEqual([]);
      expect(parseOriginList('')).toEqual([]);
    });
  });
});
