import { OidcIssuerTypes } from '@clubmed/payment-sdk/types/CapsSettings';

import { PaymentConfig } from '../../../types/PaymentConfig';
import { LegacyCmsFeatureFlipResponse } from './LegacyCms';
import { mapPaymentConfig } from './mapPaymentConfig';

const LEGACY_FEATURE_FLIP_CMS_ENDPOINT = `${import.meta.env.VITE_CMS_URL}/v1/contents/feature-flip/locales/fr-FR/releases/live/value`;
const LEGACY_CMS_ENDPOINT = (locale: string) =>
  `${import.meta.env.VITE_CMS_URL}/v1/contents/b2c-common/locales/${locale}/releases/live/value`;

const fetcher = async <T>(url: string) => {
  const response = await fetch(url);
  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.error_description!);
  }
  return json as T;
};

export const getPaymentConfig = async ({
  issuerType,
  locale,
}: {
  issuerType: OidcIssuerTypes;
  locale: string;
}): Promise<PaymentConfig> => {
  const [featureFlip, settings] = await Promise.all([
    fetcher<LegacyCmsFeatureFlipResponse>(LEGACY_FEATURE_FLIP_CMS_ENDPOINT),
    fetcher<Record<string, unknown>>(LEGACY_CMS_ENDPOINT(locale)),
  ]);

  return mapPaymentConfig({ featureFlip, settings, issuerType, locale });
};
