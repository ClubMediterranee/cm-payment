import { OidcIssuerTypes } from '../../../types/CapsSettings';
import {
  FeatureFlipsConfig,
  PaymentConfig,
  PaymentProviderConfig,
} from '../../../types/PaymentConfig';
import { LegacyCmsResponse } from './LegacyCms';
import { CMS_PREFIXES, FEATURE_FLIPS_MAPPING, PROVIDER_PSP_PREFIX } from './mapping';

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
  const sellerPrefix = isSeller ? CMS_PREFIXES.SELLER : '';

  const candidates = [
    `${CMS_PREFIXES.OVERRIDE}${locale}.${CMS_PREFIXES.FEATURE_FLIPPING}${sellerPrefix}${key}`,
    `${CMS_PREFIXES.FEATURE_FLIPPING}${sellerPrefix}${key}`,
  ];

  for (const candidate of candidates) {
    if (candidate in legacyFlips) {
      return legacyFlips[candidate];
    }
  }

  return false;
};

const mapProvidersConfig = ({
  legacyFlips,
  issuerType,
  locale,
}: ExtractParams): Record<string, PaymentProviderConfig> => {
  const pattern = new RegExp(`${PROVIDER_PSP_PREFIX}([^.]+)$`);

  const providerNames = new Set(
    Object.keys(legacyFlips)
      .map((key) => key.match(pattern)?.[1])
      .filter((provider) => provider !== undefined),
  );

  return Array.from(providerNames).reduce(
    (acc, provider) => {
      const pspKey = `${PROVIDER_PSP_PREFIX}${provider}`;
      const value = getFeatureFlipValue({ legacyFlips, key: pspKey, issuerType, locale });
      acc[provider.toUpperCase()] = { is_active: value };
      return acc;
    },
    {} as Record<string, PaymentProviderConfig>,
  );
};

const mapFeatureFlips = ({
  legacyFlips,
  issuerType,
  locale,
}: ExtractParams): FeatureFlipsConfig => {
  const featureFlip: FeatureFlipsConfig = {};

  Object.entries(FEATURE_FLIPS_MAPPING).forEach(([legacyKey, normalizedKey]) => {
    const value = getFeatureFlipValue({ legacyFlips, key: legacyKey, issuerType, locale });
    featureFlip[normalizedKey] = value;
  });

  return featureFlip;
};

export const mapPaymentConfig = ({
  json,
  issuerType,
  locale,
}: {
  json: LegacyCmsResponse;
  issuerType: OidcIssuerTypes;
  locale: string;
}): PaymentConfig => {
  const keys = json.keys ?? [];
  const legacyFlips = transformKeysToRecord(keys);

  return {
    providers: mapProvidersConfig({ legacyFlips, issuerType, locale }),
    featureFlip: mapFeatureFlips({ legacyFlips, issuerType, locale }),
    settings: {},
  };
};
