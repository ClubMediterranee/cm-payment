import { getV0Countries } from '../../__generated__';

export const countriesQueryOptions = () => ({
  queryKey: ['countries'] as const,
  queryFn: () => getV0Countries(),
  staleTime: Infinity,
  gcTime: Infinity,
});
