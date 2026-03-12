import { GLOBAL_CAPS_SETTINGS } from '../../config';
import { getProviderIntegrationMode } from '../../hooks/utils/useProviderIntegrationMode';
import type { Validate } from '../capsFormSchema';

export const validateToken: Validate = (data, { content, providersConfig }) => {
  const { hostedField } = getProviderIntegrationMode(data.provider_id, providersConfig);
  const isThirdPartyIframe = GLOBAL_CAPS_SETTINGS.thirdPartyIframeProviders.includes(
    data.provider_id as (typeof GLOBAL_CAPS_SETTINGS.thirdPartyIframeProviders)[number],
  );

  if ((hostedField || isThirdPartyIframe) && !data.token?.value) {
    return {
      path: ['token', 'value'],
      message: content.paymentProviders.validation.required,
    };
  }
  return undefined;
};
