import type { PropsWithChildren } from 'react';
import { createContext, useContext } from 'react';

import { useFeatureFlips } from '../hooks/data/useFeatureFlips';
import type { FeatureFlipsContextValue } from '../types/FeatureFlips';

const FeatureFlipsContext = createContext<FeatureFlipsContextValue>({
  flips: {},
  getFlip: () => false,
});

export const useFeatureFlipsContext = () => {
  const context = useContext(FeatureFlipsContext);
  if (!context) {
    throw new Error('useFeatureFlipsContext must be used within a FeatureFlipsProvider');
  }
  return context;
};

const flipsRef: { value: Record<string, boolean> } = {
  value: {},
};

export const getCachedFlips = () => flipsRef.value;

export const FeatureFlipsProvider = ({
  locale,
  children,
}: PropsWithChildren<{ locale: string }>) => {
  const { data } = useFeatureFlips();

  const flips =
    data?.keys.reduce(
      (acc, item) => {
        acc[item.key] = item.value;
        return acc;
      },
      {} as Record<string, boolean>,
    ) ?? {};

  flipsRef.value = flips;

  const getFlip = (key: string): boolean => {
    const localeOverrideKey = `override.${locale}.${key}`;

    if (flips[localeOverrideKey] !== undefined) {
      return flips[localeOverrideKey];
    }

    return flips[key] ?? false;
  };

  const value: FeatureFlipsContextValue = {
    flips,
    getFlip,
  };

  return <FeatureFlipsContext.Provider value={value}>{children}</FeatureFlipsContext.Provider>;
};
