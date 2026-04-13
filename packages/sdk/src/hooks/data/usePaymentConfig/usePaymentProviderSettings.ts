import { CommonProviderSettings } from '../../../types/PaymentConfig';
import { usePaymentConfig } from '.';
import { PROVIDER_SETTINGS_MAPPING } from './mapping';

export type ProviderSettings = {
  [K in keyof typeof PROVIDER_SETTINGS_MAPPING]: {
    [SK in keyof (typeof PROVIDER_SETTINGS_MAPPING)[K]]: string;
  } & CommonProviderSettings;
};

export const usePaymentProviderSettings = <T extends keyof typeof PROVIDER_SETTINGS_MAPPING>(
  providerId: T,
): ProviderSettings[T] => {
  const { data: paymentConfig } = usePaymentConfig();

  const settings = (paymentConfig.providers[providerId]?.settings ?? {}) as Record<
    string,
    string | null
  >;

  return {
    ...settings,
    max_amount: settings.max_amount ?? null,
    min_days_before_departure: settings.min_days_before_departure ?? null,
  } as ProviderSettings[T];
};
