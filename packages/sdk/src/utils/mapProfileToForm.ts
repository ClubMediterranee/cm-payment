import { UseFormSetValue } from 'react-hook-form';

import { ProfileModelV2 } from '../__generated__/index.schemas';
import { CapsFormSchema } from '../schemas/capsFormSchema';

type ProfilePath = string;
type FormPath = string;

export type FieldMapping = [ProfilePath, FormPath];

const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

export const mapProfileToForm = (
  profile: ProfileModelV2,
  mapping: FieldMapping[],
  setValue: UseFormSetValue<CapsFormSchema>,
): ProfileModelV2 => {
  mapping.forEach(([profilePath, formPath]) => {
    const value = getNestedValue(profile, profilePath);
    if (value !== undefined && value !== null) {
      setValue(formPath as any, value);
    }
  });

  return profile;
};
