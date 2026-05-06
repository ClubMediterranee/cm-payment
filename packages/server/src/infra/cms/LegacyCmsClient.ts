import { Constant, Inject, Service } from '@tsed/di';

import { OidcIssuerTypes } from '../../services/payment_config/types.js';
import { HttpClient } from '../http/HttpClient.js';
import { LegacyCmsFeatureFlipResponse } from './LegacyCms.js';
import { LegacyFlips } from './LegacyFlips.js';

@Service()
export class LegacyCmsClient {
  @Constant('CMS_URL')
  protected cmsUrl!: string;

  @Inject()
  protected httpClient!: HttpClient;

  async fetchData(
    locale: string,
    issuerType: OidcIssuerTypes,
  ): Promise<{
    legacyFlips: LegacyFlips;
    settings: Record<string, unknown>;
  }> {
    const [featureFlipResponse, settings] = await Promise.all([
      this.fetchFeatureFlips(),
      this.fetchSettings(locale),
    ]);

    const flipsRecord = this.transformKeysToRecord(featureFlipResponse.keys ?? []);
    const legacyFlips = new LegacyFlips(flipsRecord, issuerType, locale);

    return { legacyFlips, settings };
  }

  private transformKeysToRecord(
    keys: Array<{ key: string; value: boolean }>,
  ): Record<string, boolean> {
    return keys.reduce(
      (acc: Record<string, boolean>, item: { key: string; value: boolean }) => {
        acc[item.key] = item.value;
        return acc;
      },
      {} as Record<string, boolean>,
    );
  }

  private async fetchFeatureFlips(): Promise<LegacyCmsFeatureFlipResponse> {
    const url = `${this.cmsUrl}/v1/contents/feature-flip/locales/fr-FR/releases/live/value`;
    return this.httpClient.get<LegacyCmsFeatureFlipResponse>(url);
  }

  private async fetchSettings(locale: string): Promise<Record<string, unknown>> {
    const url = `${this.cmsUrl}/v1/contents/b2c-common/locales/${locale}/releases/live/value`;
    return this.httpClient.get<Record<string, unknown>>(url);
  }
}
