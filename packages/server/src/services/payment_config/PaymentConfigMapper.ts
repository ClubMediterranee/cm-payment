import { LegacyFlips } from '../../infra/cms/LegacyFlips.js';
import { FEATURE_FLIPS_MAPPING, SETTINGS_MAPPING } from './constants.js';
import { FeatureFlipsConfig, PaymentSettings } from './models.js';
import { OidcIssuerTypes } from './types.js';

export const mapFeatureFlips = (legacyFlips: LegacyFlips): FeatureFlipsConfig => {
  const featureFlip: FeatureFlipsConfig = {};

  Object.entries(FEATURE_FLIPS_MAPPING).forEach(([legacyKey, normalizedKey]) => {
    const value = legacyFlips.getValue(legacyKey);
    featureFlip[normalizedKey] = value;
  });

  return featureFlip;
};

export const mapSettings = ({
  settings,
  issuerType,
}: {
  settings: Record<string, unknown>;
  issuerType: OidcIssuerTypes;
}): PaymentSettings => {
  const isSeller = [OidcIssuerTypes.GO, OidcIssuerTypes.PARTNERS].includes(issuerType);
  const userType = isSeller ? 'seller' : 'gm';

  const mappedSettings = {} as PaymentSettings;

  Object.entries(SETTINGS_MAPPING).forEach(([normalizedKey, legacyKeys]) => {
    const legacyKey = legacyKeys[userType];

    console.log({ settings });

    const value = legacyKey.split('.').reduce((obj, key) => obj?.[key], settings as any);

    if (value !== undefined) {
      mappedSettings[normalizedKey as keyof PaymentSettings] =
        value in SETTINGS_MAPPING
          ? SETTINGS_MAPPING[value as keyof typeof SETTINGS_MAPPING]
          : value;
    }
  });

  return mappedSettings;
};
