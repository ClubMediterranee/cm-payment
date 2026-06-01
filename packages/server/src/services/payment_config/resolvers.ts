import { GLOBAL_LOCALE } from '../../infra/directus/constants.js';
import type { IssuerScopedItem, LocalizedItem } from '../../infra/directus/types.js';

export const CONFIG_MATCH_RULES = [
  (item: IssuerScopedItem, ctx: IssuerScopedItem) =>
    item.locale === ctx.locale && item.issuer === ctx.issuer,
  (item: IssuerScopedItem, ctx: IssuerScopedItem) =>
    item.locale === GLOBAL_LOCALE && item.issuer === ctx.issuer,
  (item: IssuerScopedItem, ctx: LocalizedItem) => item.locale === ctx.locale && !item.issuer,
];

export const PROVIDER_MATCH_RULES = [
  (item: LocalizedItem, ctx: LocalizedItem) => item.locale === ctx.locale,
  (item: LocalizedItem) => item.locale === GLOBAL_LOCALE,
];

export const findByRules = <T, C>(
  items: T[] | undefined,
  rules: ((item: T, context: C) => boolean)[],
  context: C,
): T | undefined => {
  if (!items?.length) return undefined;
  for (const rule of rules) {
    const match = items.find((item) => rule(item, context));
    if (match) return match;
  }
  return undefined;
};
