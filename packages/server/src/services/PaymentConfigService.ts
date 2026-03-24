import { Service } from '@tsed/di';

import { mapPaymentConfig } from './mapPaymentConfig.js';
import { PaymentConfig } from 'src/types/PaymentConfig.js';

const LEGACY_FEATURE_FLIP_CMS_ENDPOINT = (cmsUrl: String) =>
  `${cmsUrl}/v1/contents/feature-flip/locales/fr-FR/releases/live/value`;
const LEGACY_CMS_ENDPOINT = (cmsUrl: String, locale: string) =>
  `${cmsUrl}/v1/contents/b2c-common/locales/${locale}/releases/live/value`;

const fetcher = async <T>(url: string) => {
  const response = await fetch(url);
  const json = await (response.json() as Promise<any>);
  if (!response.ok) {
    throw new Error(json.error_description!);
  }
  return json as T;
};

interface LegacyCmsFeatureFlipKey {
  key: string;
  value: boolean;
}

interface LegacyCmsFeatureFlipResponse {
  keys: Array<LegacyCmsFeatureFlipKey>;
  status_code?: number;
  error_description?: string;
  errors?: Array<{ error_description: string }>;
}

@Service()
export class PaymentConfigService {
  async getPaymentConfig(queryParams: Record<string, any>): Promise<PaymentConfig> {
    const { cms_url, locale, issuerType } = queryParams;

    const [featureFlip, settings] = await Promise.all([
      fetcher<LegacyCmsFeatureFlipResponse>(LEGACY_FEATURE_FLIP_CMS_ENDPOINT(cms_url)),
      fetcher<Record<string, unknown>>(LEGACY_CMS_ENDPOINT(cms_url, locale)),
    ]);

    return mapPaymentConfig({ featureFlip, settings, issuerType, locale });
  }
}
