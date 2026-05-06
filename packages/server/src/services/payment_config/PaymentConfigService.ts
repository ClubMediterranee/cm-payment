import { Inject, Service } from '@tsed/di';

import { LegacyCmsClient } from '../../infra/cms/LegacyCmsClient.js';
import { PaymentConfig, PaymentProviderConfig } from './models.js';
import { mapFeatureFlips, mapSettings } from './PaymentConfigMapper.js';
import { mapPaymentProvidersConfig } from './PaymentProvidersConfigMapper.js';
import { OidcIssuerTypes } from './types.js';

@Service()
export class PaymentConfigService {
  @Inject()
  protected legacyCmsClient!: LegacyCmsClient;

  async getPaymentConfig({
    issuerType,
    locale,
  }: {
    issuerType: OidcIssuerTypes;
    locale: string;
  }): Promise<PaymentConfig> {
    const { legacyFlips, settings } = await this.legacyCmsClient.fetchData(locale, issuerType);

    return {
      feature_flips: mapFeatureFlips(legacyFlips),
      settings: mapSettings({ settings, issuerType }),
    };
  }

  async getPaymentProvidersConfig({
    issuerType,
    locale,
  }: {
    issuerType: OidcIssuerTypes;
    locale: string;
  }): Promise<Record<string, PaymentProviderConfig>> {
    const { legacyFlips, settings } = await this.legacyCmsClient.fetchData(locale, issuerType);

    return mapPaymentProvidersConfig({ legacyFlips, settings });
  }
}
