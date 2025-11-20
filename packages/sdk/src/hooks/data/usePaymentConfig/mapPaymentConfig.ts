import { OidcIssuerTypes } from '../../../types/CapsSettings';
import {
  FeatureFlipsConfig,
  PaymentConfig,
  PaymentProviderConfig,
} from '../../../types/PaymentConfig';
import { FEATURE_FLIPS_MAPPING } from './mapping';

type ExtractParams = {
  legacyFlips: Record<string, boolean>;
  issuerType: OidcIssuerTypes;
  locale: string;
};

const transformKeysToRecord = (
  keys: Array<{ key: string; value: boolean }>,
): Record<string, boolean> => {
  return keys.reduce(
    (acc: Record<string, boolean>, item: { key: string; value: boolean }) => {
      acc[item.key] = item.value;
      return acc;
    },
    {} as Record<string, boolean>,
  );
};

const getFeatureFlipValue = ({
  legacyFlips,
  key,
  issuerType,
  locale,
}: {
  legacyFlips: Record<string, boolean>;
  key: string;
  issuerType: OidcIssuerTypes;
  locale: string;
}) => {
  const isSeller = [OidcIssuerTypes.GO, OidcIssuerTypes.PARTNERS].includes(issuerType);
  const sellerPrefix = isSeller ? 'seller.' : '';

  const candidates = [
    `override.${locale}.featureFlipping.${sellerPrefix}${key}`,
    `featureFlipping.${sellerPrefix}${key}`,
  ];

  for (const candidate of candidates) {
    if (candidate in legacyFlips) {
      return legacyFlips[candidate];
    }
  }

  return undefined;
};

const extractProviders = ({
  legacyFlips,
  issuerType,
  locale,
}: ExtractParams): Record<string, PaymentProviderConfig> => {
  const providers: Record<string, PaymentProviderConfig> = {};

  Object.keys(legacyFlips).forEach((key) => {
    const match = key.match(/\.psp\.(\w+)$/);
    if (match) {
      const providerId = match[1];
      const pspKey = `psp.${providerId}`;
      const value = getFeatureFlipValue({ legacyFlips, key: pspKey, issuerType, locale });
      if (value !== undefined) {
        providers[providerId.toUpperCase()] = { is_active: value };
      }
    }
  });

  return providers;
};

const extractFeatureFlips = ({
  legacyFlips,
  issuerType,
  locale,
}: ExtractParams): FeatureFlipsConfig => {
  const featureFlip: FeatureFlipsConfig = {};

  Object.entries(FEATURE_FLIPS_MAPPING).forEach(([legacyKey, normalizedKey]) => {
    const value = getFeatureFlipValue({ legacyFlips, key: legacyKey, issuerType, locale });

    if (value !== undefined) {
      featureFlip[normalizedKey] = value;
    }
  });

  return featureFlip;
};

export interface MapPaymentConfigParams {
  json: { keys: Array<{ key: string; value: boolean }> };
  issuerType: OidcIssuerTypes;
  locale: string;
}

export const mapPaymentConfig = ({
  json,
  issuerType,
  locale,
}: MapPaymentConfigParams): PaymentConfig => {
  const keys = json.keys ?? [];
  const legacyFlips = transformKeysToRecord(keys);

  return {
    providers: extractProviders({ legacyFlips, issuerType, locale }),
    featureFlip: extractFeatureFlips({ legacyFlips, issuerType, locale }),
    settings: {},
  };
};
