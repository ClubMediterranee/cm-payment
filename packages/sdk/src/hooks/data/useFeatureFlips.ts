import { sdkQueryClient } from '@clubmed/payment-sdk/providers/QueryClientProvider';
import { useSuspenseQuery } from '@tanstack/react-query';

export const fetchFeatureFlips = async (): Promise<Record<string, boolean>> => {
  const response = await fetch(
    `${import.meta.env.VITE_CMS_URL}/v1/contents/feature-flip/locales/fr-FR/releases/live/value`,
  );

  const json = await response.json();
  if (!response.ok) {
    if (json.status_code === 404) {
      throw new Error(json.error_description);
    }

    throw new Error(json.errors[0].error_description);
  }

  return selectFeatureFlips(json);
};

const selectFeatureFlips = (data: { keys: { key: string; value: boolean }[] }) => {
  return (
    data.keys.reduce(
      (acc: Record<string, boolean>, item: { key: string; value: boolean }) => {
        acc[item.key] = item.value;
        return acc;
      },
      {} as Record<string, boolean>,
    ) ?? {}
  );
};

export const FEATURE_FLIPS_QUERY_KEY = ['featureFlips'];

export const getFeaturesFlips = () => {
  return sdkQueryClient.getQueryData<Awaited<ReturnType<typeof fetchFeatureFlips>>>(
    FEATURE_FLIPS_QUERY_KEY,
  );
};

export const useFeatureFlips = () => {
  return useSuspenseQuery({
    queryKey: FEATURE_FLIPS_QUERY_KEY,
    queryFn: fetchFeatureFlips,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};
