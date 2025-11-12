import { getFeaturesFlips } from '../hooks/data/useFeatureFlips';
import { getCapsConfig } from '../providers/CapsConfigProvider';

export const hasFlip = (key: string): boolean => {
  const prefixedKey = key.startsWith('featureFlipping.') ? key : `featureFlipping.${key}`;
  const { locale } = getCapsConfig();
  const localeOverrideKey = `override.${locale}.${prefixedKey}`;
  const featuresFlips = getFeaturesFlips() ?? {};

  if (featuresFlips[localeOverrideKey] !== undefined) {
    return featuresFlips[localeOverrideKey];
  }

  return featuresFlips[prefixedKey] ?? false;
};
