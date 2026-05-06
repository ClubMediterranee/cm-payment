import { PaymentProvider1 } from '../../../infra/api/__generated__/index.schemas.js';
import { DEFAULT_VALIDATION_RULES, PROVIDER_VALIDATION_RULES } from '../constants.js';
import { EnrichedPaymentProvider, PaymentProviderDisplayType } from '../models.js';
import { ProviderConfigMap } from '../types.js';

export const enrichWithConfig = (
  providers: PaymentProvider1[],
  config: ProviderConfigMap,
): EnrichedPaymentProvider[] => {
  return providers.map((provider) => {
    const providerConfig = config[provider.id];
    const displayType = (providerConfig?.display_type || 'redirect') as PaymentProviderDisplayType;
    const specificRules = PROVIDER_VALIDATION_RULES[provider.id] || {};
    const requires_token = displayType === 'hosted_field' || specificRules.requires_token === true;

    return {
      ...provider,
      configuration: {
        display_type: displayType,
        settings: providerConfig?.settings || {},
        validation: {
          requires_token,
          requires_expiry_date:
            specificRules.requires_expiry_date ?? DEFAULT_VALIDATION_RULES.requires_expiry_date,
        },
      },
      payment_conditions: {},
    };
  });
};
