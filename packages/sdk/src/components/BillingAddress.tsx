import { Icon } from '@clubmed/trident-icons';
import { Checkbox } from '@clubmed/trident-ui/ui/forms/checkboxes/Checkbox';
import { useSuspenseQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import { PropsWithChildren, Suspense, useEffect, useState } from 'react';
import { get } from 'react-hook-form';

import { useBillingSchema } from '../hooks/data/useBillingSchema';
import { profilePreloadQueryOptions } from '../hooks/data/useProfile';
import { useMainTravelerFill } from '../hooks/useProfilePrefill';
import { useCapsConfigContext } from '../hooks/utils/useCapsConfigContext';
import { useFormContext, useWatch } from '../hooks/utils/useForm';
import { useWatchedPaymentProvider } from '../hooks/utils/useWatchedPaymentProvider';
import { setBillingFields } from '../stores/billingFieldsStore';
import type { FieldMetadata } from '../utils/billing/parseBillingSchema';
import { LocaleOrCountry } from '../types/LocaleOrCountry';
import { TOKENS } from '../types/Tokens';
import { TextFieldSkeleton } from './ui/skeletons';
import { ValidatedTextField } from './ui/ValidatedTextField';

type Cell = { name: FieldMetadata['name']; narrow?: boolean };

const LAYOUT: Cell[][] = [
  [{ name: 'first_name' }, { name: 'last_name' }],
  [{ name: 'number', narrow: true }, { name: 'street' }],
  [{ name: 'add_on' }],
  [{ name: 'zip_code', narrow: true }, { name: 'city' }],
  [{ name: 'state_or_district' }],
  [{ name: 'country_code' }],
];

const BillingField = ({ field, className }: { field: FieldMetadata; className?: string }) => {
  const { content } = useCapsConfigContext();
  const hints: Partial<Record<FieldMetadata['name'], string>> = content.billingAddress.hints;

  return (
    <ValidatedTextField
      name={field.path}
      label={content.billingAddress.fields[field.name]}
      description={hints[field.name]}
      required={field.required}
      options={field.options}
      className={clsx('w-full', className)}
    />
  );
};

const AdditionalInformation = ({ fields }: { fields: FieldMetadata[] }) => {
  const { content } = useCapsConfigContext();
  const { formState } = useFormContext();
  const [isOpen, setIsOpen] = useState(true);

  const isForcedOpen = fields.some(({ path, required }) => required || get(formState.errors, path));
  const showFields = isOpen || isForcedOpen;

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        aria-expanded={showFields}
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full cursor-pointer items-center justify-between gap-12 text-left text-b4"
      >
        <span>{content.billingAddress.additionalInformation}</span>
        <span className="flex size-24 shrink-0 items-center justify-center rounded-full border border-black">
          <Icon name={showFields ? 'ArrowDefaultUp' : 'ArrowDefaultDown'} width="22px" />
        </span>
      </button>
      {showFields && (
        <div className="grid grid-cols-1 gap-20 pt-16 md:grid-cols-2">
          {fields.map((field) => (
            <BillingField key={field.name} field={field} />
          ))}
        </div>
      )}
    </div>
  );
};

const BillingAddressContent = () => {
  const { content } = useCapsConfigContext();
  const { trigger } = useFormContext();
  const watchedCountryCode = useWatch('billing_details.address.country_code');
  const { data: fields } = useBillingSchema(watchedCountryCode);
  const fillWithMainTraveler = useMainTravelerFill();
  const [sameAsMainTraveler, setSameAsMainTraveler] = useState(false);

  const additionalFields = fields.filter(({ name }) => name.startsWith('additional_information_'));
  const mainFields = fields.filter((field) => !additionalFields.includes(field));
  const unplaced = mainFields.filter(
    ({ name }) => !LAYOUT.flat().some((cell) => cell.name === name),
  );
  const rows = [...LAYOUT, ...unplaced.map(({ name }): Cell[] => [{ name }])]
    .map((row) =>
      row.flatMap(({ name, narrow }) => {
        const field = mainFields.find((mainField) => mainField.name === name);
        return field ? { field, narrow } : [];
      }),
    )
    .filter((row) => row.length > 0);

  useEffect(() => {
    void trigger(fields.map((field) => field.path));
  }, [fields, trigger]);

  return (
    <div className="flex w-full flex-col gap-20 md:px-20">
      {fillWithMainTraveler && (
        <Checkbox
          checked={sameAsMainTraveler}
          onChange={(_, checked) => {
            setSameAsMainTraveler(checked);
            if (checked) fillWithMainTraveler();
          }}
        >
          <span className="ms-4 text-b4 text-black">
            {content.billingAddress.sameAsMainTraveler}
          </span>
        </Checkbox>
      )}

      {fields.some(({ required }) => required) && (
        <p className="text-right text-b4 text-black">{content.billingAddress.mandatoryField}</p>
      )}

      {rows.map((row) => (
        <div key={row[0].field.name} className="flex flex-col gap-20 md:flex-row">
          {row.map(({ field, narrow }) => (
            <BillingField
              key={field.name}
              field={field}
              className={narrow ? 'md:w-160 md:shrink-0' : 'md:min-w-0 md:flex-1'}
            />
          ))}
        </div>
      ))}

      {additionalFields.length > 0 && <AdditionalInformation fields={additionalFields} />}
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
  <div className="flex w-full flex-col gap-20 md:px-20">
    <div className="flex flex-col gap-20 md:flex-row">
      <TextFieldSkeleton />
      <TextFieldSkeleton />
    </div>
    <div className="grid grid-cols-1 gap-20 md:grid-cols-2">
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
