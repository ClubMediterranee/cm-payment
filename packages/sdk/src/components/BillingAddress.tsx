import { Icon } from '@clubmed/trident-icons';
import { Select } from '@clubmed/trident-ui/ui/forms/Select';
import { TextField } from '@clubmed/trident-ui/ui/forms/TextField';
import { useSuspenseQuery } from '@tanstack/react-query';
import { PropsWithChildren, Suspense, useState } from 'react';
import { Controller, get, useFormContext } from 'react-hook-form';

import { useBillingSchema } from '../hooks/data/useBillingSchema';
import { profilePreloadQueryOptions } from '../hooks/data/useProfile';
import { useProfilePrefill } from '../hooks/useProfilePrefill';
import { useCapsConfigContext } from '../hooks/utils/useCapsConfigContext';
import { useWatch } from '../hooks/utils/useForm';
import { useWatchedPaymentProvider } from '../hooks/utils/useWatchedPaymentProvider';
import { setBillingFields } from '../stores/billingFieldsStore';
import type { FieldMetadata } from '../utils/billing/parseBillingSchema';
import { LocaleOrCountry } from '../types/LocaleOrCountry';
import { TOKENS } from '../types/Tokens';
import { FormPanel } from './ui/FormPanel';
import { TextFieldSkeleton } from './ui/skeletons';

const FIELD_LAYOUT = [
  { group: 'attendee', name: 'first_name', width: 'col-span-3' },
  { group: 'attendee', name: 'last_name', width: 'col-span-3' },
  { group: 'address', name: 'number', width: 'col-span-2' },
  { group: 'address', name: 'street', width: 'col-span-4' },
  { group: 'address', name: 'add_on', width: 'col-span-6' },
  { group: 'address', name: 'zip_code', width: 'col-span-2' },
  { group: 'address', name: 'city', width: 'col-span-4' },
  { group: 'address', name: 'state_or_district', width: 'col-span-6' },
  { group: 'address', name: 'country_code', width: 'col-span-6' },
];

const BillingField = ({ field, className }: { field: FieldMetadata; className: string }) => {
  const { content } = useCapsConfigContext();
  const { control } = useFormContext();
  const { fields: labels, hints } = content.billingAddress;
  const hint = hints[field.name as keyof typeof hints];

  return (
    <div className={className}>
      <Controller
        name={`billing_details.${field.group}.${field.name}`}
        control={control}
        render={({
          field: { value, onChange, onBlur, name },
          fieldState: { error, isTouched },
        }) => {
          const fieldProps = {
            name,
            onBlur,
            value: value || '',
            onChange: (_: unknown, val: string) => onChange(val),
            errorMessage: error?.message,
            validationStatus: isTouched && !error ? 'success' : error ? 'error' : 'default',
          } as const;

          return (
            <div className="flex flex-col gap-6">
              <span className="text-b5 font-bold">
                {labels[field.name as keyof typeof labels]}
                {field.required && ' *'}
                {hint && <span className="ml-8 font-normal text-grey">{hint}</span>}
              </span>
              {field.type === 'select' && field.options ? (
                <Select {...fieldProps}>
                  <option value="" disabled>
                    {content.billingAddress.placeholders.select}
                  </option>

                  {field.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              ) : (
                <TextField {...fieldProps} />
              )}
            </div>
          );
        }}
      />
    </div>
  );
};

const AdditionalInformation = ({ fields }: { fields: FieldMetadata[] }) => {
  const { content } = useCapsConfigContext();
  const { formState } = useFormContext();
  const [isOpen, setIsOpen] = useState(false);

  const isForcedOpen = fields.some(
    ({ name, required }) => required || get(formState.errors, `billing_details.address.${name}`),
  );
  const showFields = isOpen || isForcedOpen;

  return (
    <div className="mt-20 flex flex-col gap-12">
      <button
        type="button"
        aria-expanded={showFields}
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full cursor-pointer items-center justify-between gap-12 text-left text-b5"
      >
        <span>{content.billingAddress.additionalInformation}</span>
        <span className="grid size-24 shrink-0 place-items-center rounded-full border border-black">
          <Icon name={showFields ? 'ArrowDefaultUp' : 'ArrowDefaultDown'} width="0.75rem" />
        </span>
      </button>
      {showFields && (
        <div className="grid grid-cols-6 gap-20">
          {fields.map((field) => (
            <BillingField key={field.name} field={field} className="col-span-6 md:col-span-3" />
          ))}
        </div>
      )}
    </div>
  );
};

const BillingAddressContent = () => {
  const watchedCountryCode = useWatch('billing_details.address.country_code');

  const { data: fields } = useBillingSchema(watchedCountryCode);

  useProfilePrefill();

  const additionalFields = fields.filter(({ name }) => name.startsWith('additional_information_'));

  return (
    <div className="w-full">
      <FormPanel>
        <div className="grid grid-cols-6 gap-20">
          {FIELD_LAYOUT.map(({ group, name, width }) => {
            const field = fields.find((f) => f.group === group && f.name === name);

            return (
              field && <BillingField key={`${group}-${name}`} field={field} className={width} />
            );
          })}
        </div>
        {additionalFields.length > 0 && <AdditionalInformation fields={additionalFields} />}
      </FormPanel>
    </div>
  );
};

export const BillingAddress = ({
  className,
  children,
}: PropsWithChildren<{ className?: string }>) => {
  const watchedProvider = useWatchedPaymentProvider();

  const showBillingForm = watchedProvider?.billing_address_form === true;

  if (!showBillingForm) {
    setBillingFields([]);
    return null;
  }

  return (
    <div className={className}>
      {children}
      <Suspense fallback={<BillingAddressSkeleton />}>
        <BillingAddressContent />
      </Suspense>
    </div>
  );
};

const BillingAddressSkeleton = () => (
  <div className="w-full">
    <FormPanel>
      <div className="flex flex-col gap-16">
        <div className="flex flex-col md:flex-row gap-16">
          <TextFieldSkeleton />
          <TextFieldSkeleton />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <TextFieldSkeleton />
          <TextFieldSkeleton />
          <div className="md:col-span-2">
            <TextFieldSkeleton />
          </div>
          <TextFieldSkeleton />
          <TextFieldSkeleton />
          <TextFieldSkeleton />
          <TextFieldSkeleton />
        </div>
      </div>
    </FormPanel>
  </div>
);

const BillingAddressPreload = ({ countryCode }: { countryCode: LocaleOrCountry }) => {
  const { customerId, oidc } = useCapsConfigContext();
  const { data: profile } = useSuspenseQuery(
    profilePreloadQueryOptions(customerId, oidc.accessToken),
  );

  useBillingSchema((profile?.address?.country_code as LocaleOrCountry) || countryCode);

  return null;
};

BillingAddress.Skeleton = BillingAddressSkeleton;
BillingAddress.Preload = BillingAddressPreload;
BillingAddress.COMPONENT_KEY = TOKENS.BillingAddress;
