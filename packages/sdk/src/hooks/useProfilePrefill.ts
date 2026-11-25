import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';
import type { FieldPath } from 'react-hook-form';

import { ProfileModelV2 } from '../__generated__/index.schemas';
import type { CapsFormSchema } from '../schemas/capsFormSchema';
import { FieldMapping, mapProfileToForm } from '../utils/mapProfileToForm';
import { profileQueryOptions } from './data/useProfile';
import { useCapsConfigContext } from './utils/useCapsConfigContext';
import { useFormContext } from './utils/useForm';

export const CONTACT_MAPPING: FieldMapping[] = [
  ['email', 'billing_details.email'],
  ['phones.0.number', 'billing_details.mobile_phone'],
];

export const MAIN_TRAVELER_MAPPING: FieldMapping[] = [
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

export const BILLING_DETAILS_MAPPING = [...CONTACT_MAPPING, ...MAIN_TRAVELER_MAPPING];

const useProfileFill = (enabled = true) => {
  const { setValue, trigger } = useFormContext();
  const { customerId, oidc } = useCapsConfigContext();
  const { data: profile } = useQuery({
    ...profileQueryOptions(customerId!),
    enabled: enabled && !!customerId && !!oidc?.accessToken,
  });

  const fill = useCallback(
    (filledProfile: ProfileModelV2, mapping: FieldMapping[]) => {
      const paths: FieldPath<CapsFormSchema>[] = [];
      const setTouchedValue: typeof setValue = (path, value) => {
        paths.push(path);
        setValue(path, value, { shouldTouch: true, shouldDirty: true });
      };

      mapProfileToForm(filledProfile, mapping, setTouchedValue);
      void trigger(paths);
    },
    [setValue, trigger],
  );

  return { profile, fill };
};

export const useProfilePrefill = (enabled = true, mapping = BILLING_DETAILS_MAPPING) => {
  const { profile, fill } = useProfileFill(enabled);

  useEffect(() => {
    if (profile) fill(profile, mapping);
  }, [profile, fill, mapping]);
};

export const useMainTravelerFill = () => {
  const { profile, fill } = useProfileFill();

  return profile && (() => fill(profile, MAIN_TRAVELER_MAPPING));
};
