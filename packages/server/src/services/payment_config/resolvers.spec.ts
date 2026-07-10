import { configMatchRules, findByRules, providerMatchRules } from './resolvers.js';
import { OidcIssuerTypes } from './types.js';

describe('findByRules', () => {
  it('returns undefined when items is undefined', () => {
    expect(findByRules(undefined, [])).toBeUndefined();
  });

  it('returns undefined when items is empty', () => {
    expect(findByRules([], [])).toBeUndefined();
  });

  it('returns the first item matching the first rule', () => {
    const items = [{ id: 'a' }, { id: 'b' }];
    const rules = [(item: { id: string }) => item.id === 'b'];

    expect(findByRules(items, rules)).toEqual({ id: 'b' });
  });

  it('falls back to the next rule when the first one finds nothing', () => {
    const items = [{ id: 'a' }];
    const rules = [
      (item: { id: string }) => item.id === 'z',
      (item: { id: string }) => item.id === 'a',
    ];

    expect(findByRules(items, rules)).toEqual({ id: 'a' });
  });

  it('returns undefined when no rule matches', () => {
    expect(findByRules([{ id: 'a' }], [() => false])).toBeUndefined();
  });
});

describe('configMatchRules', () => {
  const rules = configMatchRules({ locale: 'fr-FR', issuer: OidcIssuerTypes.GM });

  it('first rule matches when locale and issuer match', () => {
    expect(rules[0]({ locale: 'fr-FR', issuer: 'GM' })).toBe(true);
  });

  it('second rule matches the global fallback (locale null) with the same issuer', () => {
    expect(rules[1]({ locale: null, issuer: 'GM' })).toBe(true);
    expect(rules[1]({ locale: 'fr-FR', issuer: 'GM' })).toBe(false);
  });

  it('third rule matches the locale when no issuer is set', () => {
    expect(rules[2]({ locale: 'fr-FR' })).toBe(true);
    expect(rules[2]({ locale: 'fr-FR', issuer: 'GO' })).toBe(false);
  });
});

describe('providerMatchRules', () => {
  const variant = (locale: string | null) => ({
    locale,
    active: true,
    settings: [],
    validation: {},
  });

  it('first rule matches an exact locale', () => {
    const rules = providerMatchRules({ locale: 'fr-FR' });
    expect(rules[0](variant('fr-FR'))).toBe(true);
    expect(rules[0](variant('en-US'))).toBe(false);
  });

  it('second rule matches the global fallback variant (locale null)', () => {
    const rules = providerMatchRules({ locale: 'fr-FR' });
    expect(rules[1](variant(null))).toBe(true);
    expect(rules[1](variant('fr-FR'))).toBe(false);
  });
});
