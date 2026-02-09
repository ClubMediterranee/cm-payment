import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';

import { ProfileModelV2 } from '../__generated__/index.schemas';
import { FieldMapping, mapProfileToForm } from '../utils/mapProfileToForm';
import { profileQueryOptions } from './data/useProfile';
import { useCapsConfigContext } from './utils/useCapsConfigContext';
import { useFormContext } from './utils/useForm';

export const BILLING_DETAILS_MAPPING: FieldMapping[] = [
  ['email', 'billing_details.email'],
  ['phones.0.number', 'billing_details.mobile_phone'],
  ['first_name', 'billing_details.attendee.first_name'],
  ['last_name', 'billing_details.attendee.last_name'],
  ['address.additional_information_1', 'billing_details.address.additional_information_1'],
  ['address.additional_information_2', 'billing_details.address.additional_information_2'],
  ['address.number', 'billing_details.address.number'],
  ['address.street', 'billing_details.address.street'],
  ['address.add_on', 'billing_details.address.add_on'],
  ['address.town', 'billing_details.address.town'],
  ['address.city', 'billing_details.address.city'],
  ['address.state_or_district', 'billing_details.address.state_or_district'],
  ['address.zip_code', 'billing_details.address.zip_code'],
  ['address.country', 'billing_details.address.country'],
  ['address.country_code', 'billing_details.address.country_code'],
];

export const useProfilePrefill = (enabled = true) => {
  const { setValue } = useFormContext();
  const { customerId, oidc } = useCapsConfigContext();

  const prefillFormWithProfile = useCallback(
    (profile: ProfileModelV2) => mapProfileToForm(profile, BILLING_DETAILS_MAPPING, setValue),
    [setValue],
  );

  return useQuery({
    ...profileQueryOptions(customerId!),
    select: prefillFormWithProfile,
    enabled: enabled && !!customerId && !!oidc?.accessToken,
  });
};
