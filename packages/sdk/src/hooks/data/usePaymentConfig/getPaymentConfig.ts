import { OidcIssuerTypes } from '@clubmed/payment-sdk/types/CapsSettings';

import { PaymentConfig } from '../../../types/PaymentConfig';
import { LegacyCmsResponse } from './LegacyCms';
import { mapPaymentConfig } from './mapPaymentConfig';

const LEGACY_FEATURE_FLIP_CMS_ENDPOINT = `${import.meta.env.VITE_CMS_URL}/v1/contents/feature-flip/locales/fr-FR/releases/live/value`;

export const getPaymentConfig = async ({
  issuerType,
  locale,
}: {
  issuerType: OidcIssuerTypes;
  locale: string;
}): Promise<PaymentConfig> => {
  const response = await fetch(LEGACY_FEATURE_FLIP_CMS_ENDPOINT);

  const json: LegacyCmsResponse = await response.json();
  if (!response.ok) {
    throw new Error(json.error_description!);
  }

  return mapPaymentConfig({ json, issuerType, locale });
};
