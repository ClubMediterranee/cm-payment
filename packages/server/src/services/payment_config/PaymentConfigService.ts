import { Inject, Service } from '@tsed/di';

import { PaymentConfigRepository } from './PaymentConfigRepository.js';
import { configMatchRules, findByRules, providerMatchRules } from './resolvers.js';
import { OidcIssuerTypes, PaymentConfigSettings, PaymentFeatureFlips } from './types.js';

@Service()
export class PaymentConfigService {
  @Inject()
  protected paymentConfigRepository!: PaymentConfigRepository;

  async getPaymentConfig({
    issuerType,
    locale,
  }: {
    issuerType?: OidcIssuerTypes;
    locale?: string;
  } = {}): Promise<{ feature_flips: PaymentFeatureFlips; settings: PaymentConfigSettings }> {
    const configurations = await this.paymentConfigRepository.getConfigurations();

    const feature_flips: PaymentFeatureFlips = {};
    const settings: PaymentConfigSettings = {};

    for (const config of configurations) {
      const override = findByRules(
        config.overrides,
        configMatchRules({ locale, issuer: issuerType }),
      );
      const value = override ? override.value : config.value;

      if (config.type === 'boolean') {
        (feature_flips as Record<string, boolean>)[config.key] = value as boolean;
      } else {
        (settings as Record<string, unknown>)[config.key] = value;
      }
    }

    return { feature_flips, settings };
  }

  async getPaymentProvidersConfig({
    locale,
    issuerType,
  }: {
    locale: string;
    issuerType?: OidcIssuerTypes;
  }) {
    const providers = await this.paymentConfigRepository.getProviders();

    const activeProviders = providers.filter(
      (provider) => !!findByRules(provider.variants, providerMatchRules({ locale }))?.active,
    );

    return Object.fromEntries(
      activeProviders.map((provider) => {
        const global = provider.variants.find((v) => v.locale === null);
        const local = provider.variants.find((v) => v.locale === locale);

        const settings = [...(global?.settings || []), ...(local?.settings || [])].reduce<
          Record<string, unknown>
        >((acc, setting) => ({ ...acc, [setting.key]: setting.value }), {});

        const validation = { ...global?.validation, ...local?.validation };

        return [
          provider.id,
          {
            ...global?.validation,
            requires_contact_choice: (validation.requires_contact_choice ?? []).includes(
              issuerType!,
            ),
            settings,
            display_type: provider.default_display_type,
            confirmation_strategy: provider.confirmation_strategy ?? 'status',
          },
        ] as const;
      }),
    );
  }
}
