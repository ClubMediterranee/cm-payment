import { CONFIG_MATCH_RULES, findByRules, PROVIDER_MATCH_RULES } from './resolvers.js';

describe('findByRules', () => {
  it('returns undefined when items is undefined', () => {
    expect(findByRules(undefined, [], {})).toBeUndefined();
  });

  it('returns undefined when items is empty', () => {
    expect(findByRules([], [], {})).toBeUndefined();
  });

  it('returns the first item matching the first rule', () => {
    const items = [{ id: 'a' }, { id: 'b' }];
    const rules = [(item: { id: string }) => item.id === 'b'];

    expect(findByRules(items, rules, {})).toEqual({ id: 'b' });
  });

  it('falls back to the next rule when the first one finds nothing', () => {
    const items = [{ id: 'a' }];
    const rules = [
      (item: { id: string }) => item.id === 'z',
      (item: { id: string }) => item.id === 'a',
    ];

    expect(findByRules(items, rules, {})).toEqual({ id: 'a' });
  });

  it('returns undefined when no rule matches', () => {
    expect(findByRules([{ id: 'a' }], [() => false], {})).toBeUndefined();
  });
});

describe('CONFIG_MATCH_RULES', () => {
  const ctx = { locale: 'fr-FR', issuer: 'GM' };

  it('first rule matches when locale and issuer match', () => {
    expect(CONFIG_MATCH_RULES[0]({ locale: 'fr-FR', issuer: 'GM' }, ctx)).toBe(true);
  });

  it('second rule matches a global locale with the same issuer', () => {
    expect(CONFIG_MATCH_RULES[1]({ locale: '*', issuer: 'GM' }, ctx)).toBe(true);
    expect(CONFIG_MATCH_RULES[1]({ locale: 'fr-FR', issuer: 'GM' }, ctx)).toBe(false);
  });

  it('third rule matches the locale when no issuer is set', () => {
    expect(CONFIG_MATCH_RULES[2]({ locale: 'fr-FR' }, ctx)).toBe(true);
    expect(CONFIG_MATCH_RULES[2]({ locale: 'fr-FR', issuer: 'GO' }, ctx)).toBe(false);
  });
});

describe('PROVIDER_MATCH_RULES', () => {
  it('first rule matches an exact locale', () => {
    expect(PROVIDER_MATCH_RULES[0]({ locale: 'fr-FR' }, { locale: 'fr-FR' })).toBe(true);
    expect(PROVIDER_MATCH_RULES[0]({ locale: 'en-US' }, { locale: 'fr-FR' })).toBe(false);
  });

  it('second rule matches the global locale wildcard', () => {
    expect(PROVIDER_MATCH_RULES[1]({ locale: '*' })).toBe(true);
    expect(PROVIDER_MATCH_RULES[1]({ locale: 'fr-FR' })).toBe(false);
  });
});
