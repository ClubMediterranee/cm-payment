import { useSuspenseQueries } from '@tanstack/react-query';
import type { PropsWithChildren, ReactNode } from 'react';
import { Suspense } from 'react';
import type { FallbackProps } from 'react-error-boundary';
import { ErrorBoundary } from 'react-error-boundary';
import { FormProvider as ReactHookFormProvider } from 'react-hook-form';

import { Action } from '../__generated__/index.schemas';
import { Form } from '../components/Form';
import { FormErrorFallback } from '../components/ui/fallbacks/FormErrorFallback';
import { GlobalFormSkeleton } from '../components/ui/fallbacks/GlobalFormSkeleton';
import { FormCallbacks, FormCallbacksContext } from '../contexts/FormCallbacksContext';
import { useActionResolver } from '../hooks/data/useActionResolver';
import { useOverpaymentAllowance } from '../hooks/data/useOverpaymentAllowance';
import { paymentProvidersQueryOptions } from '../hooks/data/usePaymentProviders';
import { paymentScheduleQueryOptions } from '../hooks/data/usePaymentSchedule';
import { useCapsForm } from '../hooks/useCapsForm';
import { useCapsConfigContext, useOidcContext } from '../hooks/utils/useCapsConfigContext';
import { LocaleOrCountry } from '../types/LocaleOrCountry';
import { getDefaultPaymentConditionId } from '../utils/paymentProviders';
import { validateComponents } from '../utils/validation/validateComponents';

type CapsFormProps = PropsWithChildren<
  FormCallbacks & {
    fallback?: ReactNode;
    action?: Action;
    errorFallback?: (props: FallbackProps) => ReactNode;
  }
>;

function CapsFormProvider({
  children,
  action,
  onLoad,
  onError,
  onLoadEnd,
  ...props
}: CapsFormProps) {
  const { id, content, locale, type, customerId } = useCapsConfigContext();
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
    ],
  });

  const { data: overpaymentAllowanceData } = useOverpaymentAllowance({
    enabled: resolvedAction === Action.PAYMENT_PARTIAL,
  });
  const maxAmount = (paymentSchedule?.[0]?.amount ?? 0) + (overpaymentAllowanceData?.amount ?? 0);

  const countryCode = locale.split('-')[1] || locale.toUpperCase();

  const methods = useCapsForm({
    config: {
      content,
      isSeller,
      maxAmount,
      getProviderConfiguration: (providerId: string) => {
        const provider = [...paymentProviders, ...buyNowPayLaterProviders].find(
          (p) => p.id === providerId,
        );
        return provider?.configuration;
      },
    },
    defaultValues: {
      action: resolvedAction,
      provider_id: paymentProviders?.[0]?.id,
      amount: paymentSchedule?.[0]?.amount?.toString() || '',
      currency: paymentSchedule?.[0]?.currency,
      payment_condition_id: getDefaultPaymentConditionId(paymentProviders?.[0]),
      billing_details: {
        address: {
          country_code: countryCode as LocaleOrCountry,
        },
      },
    },
  });

  const callbacks: FormCallbacks = { onLoad, onError, onLoadEnd };

  return (
    <FormCallbacksContext.Provider value={callbacks}>
      <ReactHookFormProvider {...methods}>
        <Form {...props}>{children}</Form>
      </ReactHookFormProvider>
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
