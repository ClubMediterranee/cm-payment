import type { OidcIssuerTypes } from './types.js';

type LocaleScoped = { locale: string | null };
type IssuerScoped = LocaleScoped & { issuer?: string | null };

export const configMatchRules = (context: { locale?: string; issuer?: OidcIssuerTypes }) => [
  ({ locale, issuer }: IssuerScoped) => locale === context.locale && issuer === context.issuer,
  ({ locale, issuer }: IssuerScoped) => locale === null && issuer === context.issuer,
  ({ locale, issuer }: IssuerScoped) => locale === context.locale && !issuer,
];

export const providerMatchRules = (context: { locale: string }) => [
  ({ locale }: LocaleScoped) => locale === context.locale,
  ({ locale }: LocaleScoped) => locale === null,
];

export const findByRules = <T extends R, R = T>(
  items: T[] | null | undefined,
  rules: ((item: R) => boolean)[],
): T | undefined => {
  if (!items?.length) return undefined;
  for (const rule of rules) {
    const match = items.find(rule);
    if (match) return match;
  }
  return undefined;
};
