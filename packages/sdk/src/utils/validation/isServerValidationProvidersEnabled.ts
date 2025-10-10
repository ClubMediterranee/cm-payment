import { GLOBAL_SDK_SETTINGS } from '@clubmed/payment-sdk/config.js';

export function isServerValidationProvidersEnabled(paymentId?: string, provider_id?: string) {
  return (
    !!paymentId &&
    (GLOBAL_SDK_SETTINGS.serverValidationProviders as readonly string[]).includes(provider_id || '')
  );
}
