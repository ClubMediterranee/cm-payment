import { LegacyFlips } from '../../infra/cms/LegacyFlips.js';
import {
  PROVIDER_DISPLAY_TYPE_MAPPING,
  PROVIDER_PSP_PREFIX,
  PROVIDER_SETTINGS_MAPPING,
} from './constants.js';
import { PaymentProviderConfig, PaymentProviderDisplayType } from './models.js';

const mapPaymentProvidersSettings = (
  settings: Record<string, unknown>,
): Record<string, Record<string, unknown>> => {
  const allProvidersSettings: Record<string, Record<string, unknown>> = {};

  Object.entries(PROVIDER_SETTINGS_MAPPING).forEach(([provider, settingsMapping]) => {
    const providerSettings: Record<string, unknown> = {};

    Object.entries(settingsMapping).forEach(([settingKey, cmsPath]) => {
      if (typeof cmsPath === 'string') {
        const settingValue = cmsPath
          .split('.')
          .reduce((obj, key) => (obj as Record<string, unknown>)?.[key], settings);
        providerSettings[settingKey] = settingValue !== undefined ? settingValue : cmsPath;
      } else {
        providerSettings[settingKey] = cmsPath;
      }
    });

    allProvidersSettings[provider] = providerSettings;
  });

  return allProvidersSettings;
};

export const mapPaymentProvidersConfig = ({
  legacyFlips,
  settings,
}: {
  legacyFlips: LegacyFlips;
  settings: Record<string, unknown>;
}): Record<string, PaymentProviderConfig> => {
  const providersSettings = mapPaymentProvidersSettings(settings);
  const providerNames: string[] = Array.from(
    new Set(
      legacyFlips
        .getKeys()
        .filter((key: string) => key.includes('psp.'))
        .map((key: string) => {
          const afterPsp = key.split('psp.')[1];
          return afterPsp.split('.')[0].toUpperCase();
        }),
    ),
  );

  return providerNames.reduce<Record<string, PaymentProviderConfig>>(
    (acc, providerUpper) => {
      const provider = providerUpper.toLowerCase();
      const pspKey = `${PROVIDER_PSP_PREFIX}${provider}`;
      const value = legacyFlips.getValue(pspKey);

      if (value) {
        acc[providerUpper] = {
          is_active: value,
          display_type:
            (PROVIDER_DISPLAY_TYPE_MAPPING[
              providerUpper as keyof typeof PROVIDER_DISPLAY_TYPE_MAPPING
            ] as PaymentProviderDisplayType) || 'redirect',
          settings: providersSettings[providerUpper] || {},
        };
      }

      return acc;
    },
    {} as Record<string, PaymentProviderConfig>,
  );
};
