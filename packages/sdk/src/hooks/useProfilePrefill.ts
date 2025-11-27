import type { ProfileModelV2 } from '@clubmed/payment-sdk/__generated__';
import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';

import { profileQueryOptions } from './data/useProfile';
import { useCapsConfigContext, useOidcContext } from './utils/useCapsConfigContext';
import { useFormContext } from './utils/useForm';

export const useProfilePrefill = () => {
  const { setValue } = useFormContext();
  const { isSeller } = useOidcContext();
  const { customerId } = useCapsConfigContext();

  const prefillFormWithProfile = useCallback(
    (profile: ProfileModelV2) => {
      if (profile.email) {
        setValue('billing_details.email', profile.email);
      }

      const mobilePhone = profile.phones?.[0]?.number;
      if (mobilePhone) {
        setValue('billing_details.mobile_phone', mobilePhone);
      }

      return profile;
    },
    [setValue],
  );

  return useQuery({
    ...profileQueryOptions(customerId!),
    select: prefillFormWithProfile,
    enabled: isSeller,
  });
};
