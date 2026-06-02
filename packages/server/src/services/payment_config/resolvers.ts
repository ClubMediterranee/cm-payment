import type { ConfigurationOverrideModel, ProviderVariantModel } from './models.js';
import type { OidcIssuerTypes } from './types.js';

export const configMatchRules = (context: { locale: string; issuer: OidcIssuerTypes }) => [
  ({ locale, issuer }: ConfigurationOverrideModel) =>
    locale === context.locale && issuer === context.issuer,
  ({ locale, issuer }: ConfigurationOverrideModel) => locale === null && issuer === context.issuer,
  ({ locale, issuer }: ConfigurationOverrideModel) => locale === context.locale && !issuer,
];

export const providerMatchRules = (context: { locale: string }) => [
  ({ locale }: ProviderVariantModel) => locale === context.locale,
  ({ locale }: ProviderVariantModel) => locale === null,
];

export const findByRules = <T>(
  items: T[] | null | undefined,
  rules: ((item: T) => boolean)[],
): T | undefined => {
  if (!items?.length) return undefined;
  for (const rule of rules) {
    const match = items.find(rule);
    if (match) return match;
  }
  return undefined;
};
