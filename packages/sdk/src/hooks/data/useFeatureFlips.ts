import { CMS_URL } from '@clubmed/payment-sdk/config/cms';
import { useSuspenseQuery } from '@tanstack/react-query';

import type { FeatureFlipsResponse } from '../../types/FeatureFlips';

const fetchFeatureFlips = async (): Promise<FeatureFlipsResponse> => {
  const response = await fetch(
    `${CMS_URL}/v1/contents/feature-flip/locales/fr-FR/releases/live/value`,
  );

  const json = await response.json();
  if (!response.ok) {
    if (json.status_code === 404) {
      throw new Error(json.error_description);
    }

    throw new Error(json.errors[0].error_description);
  }
  return json;
};

export const useFeatureFlips = () => {
  return useSuspenseQuery({
    queryKey: ['featureFlips'],
    queryFn: fetchFeatureFlips,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};
