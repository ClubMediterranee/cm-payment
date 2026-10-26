import { useSuspenseQuery } from '@tanstack/react-query';

import { getV2CustomersCustomerIdProfile } from '../../__generated__';
import { useCapsConfigContext } from '../utils/useCapsConfigContext';

export const profileQueryOptions = (customerId: string) => ({
  queryKey: ['profile', customerId],
  queryFn: () => getV2CustomersCustomerIdProfile(customerId),
  retry: false,
});

export const profilePreloadQueryOptions = (customerId?: string, accessToken?: string) => ({
  ...profileQueryOptions(customerId!),
  queryFn: async () =>
    customerId && accessToken
      ? getV2CustomersCustomerIdProfile(customerId).catch(() => null)
      : null,
});

export const useProfile = () => {
  const { customerId } = useCapsConfigContext();
  return useSuspenseQuery(profileQueryOptions(customerId!));
};
