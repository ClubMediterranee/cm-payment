import { groupOriginsByMode, normalizeOrigin, parseOriginList } from './origins.js';

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
    it('parses a comma separated list for every mode and drops invalid entries', () => {
      expect(
        parseOriginList(' https://a.example, ,https://b.example/path,https://C.example '),
      ).toEqual([
        { origin: 'https://a.example', modes: ['webcomponent', 'iframe'] },
        { origin: 'https://c.example', modes: ['webcomponent', 'iframe'] },
      ]);
    });

    it('returns an empty list when unset', () => {
      expect(parseOriginList(undefined)).toEqual([]);
      expect(parseOriginList('')).toEqual([]);
    });
  });

  describe('groupOriginsByMode', () => {
    it('merges duplicated origins and splits them by mode', () => {
      expect(
        groupOriginsByMode([
          { origin: 'https://a.example', modes: ['webcomponent'] },
          { origin: 'https://a.example', modes: ['iframe'] },
          { origin: 'https://b.example', modes: ['iframe'] },
          { origin: 'https://c.example', modes: [] },
        ]),
      ).toEqual({
        webcomponent: ['https://a.example'],
        iframe: ['https://a.example', 'https://b.example'],
      });
    });
  });
});
