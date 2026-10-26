import { useSuspenseQueries } from '@tanstack/react-query';
import type { PropsWithChildren, ReactNode } from 'react';
import { Suspense } from 'react';
import type { FallbackProps } from 'react-error-boundary';
import { ErrorBoundary } from 'react-error-boundary';
import { FormProvider as ReactHookFormProvider } from 'react-hook-form';

import { Action } from '../__generated__/index.schemas';
import { BillingAddress } from '../components/BillingAddress';
import { Form } from '../components/Form';
import { FormErrorFallback } from '../components/ui/fallbacks/FormErrorFallback';
import { GlobalFormSkeleton } from '../components/ui/fallbacks/GlobalFormSkeleton';
import { FormCallbacks, FormCallbacksContext } from '../contexts/FormCallbacksContext';
import { FormSchemaContext } from '../contexts/FormSchemaContext';
import { useActionResolver } from '../hooks/data/useActionResolver';
import { useOverpaymentAllowance } from '../hooks/data/useOverpaymentAllowance';
import { paymentConfigQueryOptions } from '../hooks/data/usePaymentConfig';
import { paymentProvidersQueryOptions } from '../hooks/data/usePaymentProviders';
import { paymentScheduleQueryOptions } from '../hooks/data/usePaymentSchedule';
import { useCapsForm } from '../hooks/useCapsForm';
import { useCapsConfigContext, useOidcContext } from '../hooks/utils/useCapsConfigContext';
import { LocaleOrCountry } from '../types/LocaleOrCountry';
import {
  getDefaultPaymentConditionId,
  getDefaultSelection,
  hasMultiplePaymentConditions,
} from '../utils/paymentProviders';
import { validateComponents } from '../utils/validation/validateComponents';

type CapsFormProps = PropsWithChildren<
  FormCallbacks & {
    fallback?: ReactNode;
    action?: Action;
    errorFallback?: (props: FallbackProps) => ReactNode;
    stepper?: boolean;
  }
>;

function CapsFormProvider({ children, action, stepper, onEvent, ...props }: CapsFormProps) {
  const {
    id,
    content,
    locale,
    type,
    customerId,
    oidc,
    api,
    theme,
    salesNetworkId,
    salesmanId,
    opportunityId,
  } = useCapsConfigContext();
  const requireInstallmentChoice = theme === 'current';
  const { isSeller } = useOidcContext();

  const resolvedAction = useActionResolver(action);

  const [
    {
      data: { paymentProviders, buyNowPayLaterProviders },
    },
    { data: paymentSchedule },
  ] = useSuspenseQueries({
    queries: [
      paymentProvidersQueryOptions({
        id,
        type,
        customerId,
      }),
      paymentScheduleQueryOptions(id, type, customerId),
      paymentConfigQueryOptions({ locale, oidc, api }),
    ],
  });

  const { data: overpaymentAllowanceData } = useOverpaymentAllowance({
    enabled: resolvedAction === Action.PAYMENT_PARTIAL,
  });
  const maxAmount = (paymentSchedule?.[0]?.amount ?? 0) + (overpaymentAllowanceData?.amount ?? 0);

  const { amount: defaultAmount, provider: defaultProvider } = getDefaultSelection({
    stepper,
    isPartial: resolvedAction === Action.PAYMENT_PARTIAL,
    paymentSchedule,
    paymentProviders,
    buyNowPayLaterProviders,
  });

  const countryCode = (locale.split('-')[1] || locale.toUpperCase()) as LocaleOrCountry;

  const { schema, ...methods } = useCapsForm({
    config: {
      content,
      isSeller,
      maxAmount,
      requiresPaymentCondition: (providerId: string) =>
        requireInstallmentChoice &&
        hasMultiplePaymentConditions(paymentProviders.find((p) => p.id === providerId)),
      getProviderConfiguration: (providerId: string) => {
        const provider = [...paymentProviders, ...buyNowPayLaterProviders].find(
          (p) => p.id === providerId,
        );
        return provider?.configuration;
      },
    },
    defaultValues: {
      action: resolvedAction,
      provider_id: defaultProvider?.id,
      amount: defaultAmount,
      currency: paymentSchedule?.[0]?.currency,
      payment_condition_id: getDefaultPaymentConditionId(defaultProvider, {
        requireChoice: requireInstallmentChoice,
      }),
      billing_details: {
        address: {
          country_code: countryCode,
        },
      },
      sales_network_id: salesNetworkId,
      salesman_id: salesmanId,
      opportunity_id: opportunityId,
    },
  });

  const callbacks: FormCallbacks = { onEvent };

  const needsBillingSchema = [...paymentProviders, ...buyNowPayLaterProviders].some(
    (provider) => provider.billing_address_form,
  );

  return (
    <FormCallbacksContext.Provider value={callbacks}>
      <FormSchemaContext.Provider value={schema}>
        <ReactHookFormProvider {...methods}>
          {needsBillingSchema && <BillingAddress.Preload countryCode={countryCode} />}
          <Form {...props}>{children}</Form>
        </ReactHookFormProvider>
      </FormSchemaContext.Provider>
    </FormCallbacksContext.Provider>
  );
}

export function CapsForm({
  children,
  fallback,
  errorFallback = FormErrorFallback,
  ...props
}: CapsFormProps) {
  const { oidc, id } = useCapsConfigContext();
  if (!id) {
    throw new Error('Either bookingId or proposalId must be provided');
  }

  const symbols = validateComponents(oidc.issuerType, children);

  const defaultFallback = <GlobalFormSkeleton symbols={symbols} />;

  return (
    <ErrorBoundary FallbackComponent={errorFallback}>
      <Suspense fallback={fallback ?? defaultFallback}>
        <CapsFormProvider {...props}>{children}</CapsFormProvider>
      </Suspense>
    </ErrorBoundary>
  );
}

export { CapsForm as Form };
