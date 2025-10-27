import { getCachedFlips } from '../providers/FeatureFlipsProvider';
import { getSDKPaymentOptions } from '../providers/SDKConfigProvider';

export const hasFlip = (key: string): boolean => {
  const prefixedKey = key.startsWith('featureFlipping.') ? key : `featureFlipping.${key}`;
  const { locale } = getSDKPaymentOptions();
  const localeOverrideKey = `override.${locale}.${prefixedKey}`;
  const cachedFlips = getCachedFlips();

  if (cachedFlips[localeOverrideKey] !== undefined) {
    return cachedFlips[localeOverrideKey];
  }

  return cachedFlips[prefixedKey];
};
