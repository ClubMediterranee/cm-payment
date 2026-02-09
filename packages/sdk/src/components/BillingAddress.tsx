import { Select } from '@clubmed/trident-ui/molecules/Forms/Select';
import { TextField } from '@clubmed/trident-ui/molecules/Forms/TextField';
import { Suspense } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { useBillingSchema } from '../hooks/data/useBillingSchema';
import { useProfilePrefill } from '../hooks/useProfilePrefill';
import { useCapsConfigContext } from '../hooks/utils/useCapsConfigContext';
import { useWatch } from '../hooks/utils/useForm';
import { useWatchedPaymentProvider } from '../hooks/utils/useWatchedPaymentProvider';
import { TOKENS } from '../types/Tokens';
import { FormPanel } from './ui/FormPanel';
import { TextFieldSkeleton } from './ui/skeletons';

const FIELD_LAYOUT = [
  { group: 'attendee', name: 'first_name', width: 'col-span-3' },
  { group: 'attendee', name: 'last_name', width: 'col-span-3' },
  { group: 'address', name: 'country_code', width: 'col-span-6' },
  { group: 'address', name: 'number', width: 'col-span-2' },
  { group: 'address', name: 'street', width: 'col-span-4' },
  { group: 'address', name: 'add_on', width: 'col-span-6' },
  { group: 'address', name: 'additional_information_1', width: 'col-span-6' },
  { group: 'address', name: 'zip_code', width: 'col-span-2' },
  { group: 'address', name: 'city', width: 'col-span-4' },
  { group: 'address', name: 'state_or_district', width: 'col-span-6' },
];

const BillingAddressContent = () => {
  const { content } = useCapsConfigContext();
  const { control } = useFormContext();

  const watchedCountryCode = useWatch('billing_details.address.country_code');

  const { data: fields } = useBillingSchema(watchedCountryCode);

  useProfilePrefill();

  return (
    <div className="w-full">
      <FormPanel>
        <div className="grid grid-cols-6 gap-20">
          {FIELD_LAYOUT.map((layoutItem) => {
            const field = fields.find(
              (f) => f.group === layoutItem.group && f.name === layoutItem.name,
            );

            if (!field) return null;

            const fieldName = `billing_details.${field.group}.${field.name}`;
            const label =
              content.billingAddress.fields[
                field.name as keyof typeof content.billingAddress.fields
              ];

            return (
              <div key={`${field.group}-${field.name}`} className={layoutItem.width}>
                <Controller
                  name={fieldName}
                  control={control}
                  render={({
                    field: { value, onChange, name },
                    fieldState: { error, isTouched },
                  }) => {
                    const fieldProps = {
                      name,
                      value: value || '',
                      onChange: (_: unknown, val: string) => onChange(val),
                      errorMessage: error?.message,
                      validationStatus:
                        isTouched && !error ? 'success' : error ? 'error' : 'default',
                    } as const;

                    return (
                      <div className="flex flex-col gap-6">
                        <span className="font-semibold px-20">
                          {label}
                          {field.required && ' *'}
                        </span>
                        {field.type === 'select' && field.options ? (
                          <Select {...fieldProps}>
                            <option value="" disabled>
                              {content.billingAddress.placeholders.select}
                            </option>

                            {field.options?.map((option) => (
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
          })}
        </div>
      </FormPanel>
    </div>
  );
};

export const BillingAddress = () => {
  const watchedProvider = useWatchedPaymentProvider();
  const showBillingForm = watchedProvider?.billing_address_form === true;

  if (!showBillingForm) {
    return null;
  }

  return (
    <Suspense fallback={<BillingAddressSkeleton />}>
      <BillingAddressContent />
    </Suspense>
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

BillingAddress.Skeleton = BillingAddressSkeleton;
BillingAddress.COMPONENT_KEY = TOKENS.BillingAddress;
