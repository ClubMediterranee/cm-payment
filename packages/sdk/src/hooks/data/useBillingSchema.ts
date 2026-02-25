import { useSuspenseQuery } from '@tanstack/react-query';

import { getV3SchemasResourceLocaleorcountry } from '../../__generated__';
import { sdkQueryClient } from '../../providers/QueryClientProvider';
import { setBillingFields } from '../../stores/billingFieldsStore';
import { LocaleOrCountry } from '../../types/LocaleOrCountry';
import { hasCountryField } from '../../utils/billing/hasCountryField';
import { injectCountryField } from '../../utils/billing/injectCountryField';
import { parseBillingSchema } from '../../utils/billing/parseBillingSchema';
import { countriesQueryOptions } from './useCountries';

export const billingSchemaQueryOptions = (countryCode: LocaleOrCountry) => ({
  queryKey: ['billing-schema', countryCode],
  queryFn: async () => {
    const rawSchema = await getV3SchemasResourceLocaleorcountry('billing', countryCode);
    const fields = parseBillingSchema(rawSchema);

    if (!hasCountryField(fields)) {
      return fields;
    }

    const countries = await sdkQueryClient.fetchQuery(countriesQueryOptions());
    return injectCountryField(fields, countries);
  },
  retry: false,
});

export const useBillingSchema = (countryCode: LocaleOrCountry) => {
  return useSuspenseQuery({
    ...billingSchemaQueryOptions(countryCode),
    select: (data) => {
      setBillingFields(data);
      return data;
    },
  });
};
