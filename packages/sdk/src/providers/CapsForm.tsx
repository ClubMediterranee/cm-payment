import {
  useCapsConfigContext,
  useOidcContext,
} from '@clubmed/payment-sdk/hooks/utils/useCapsConfigContext';
import { validateComponents } from '@clubmed/payment-sdk/utils/validation/validateComponents';
import { useSuspenseQueries } from '@tanstack/react-query';
import type { ComponentProps, PropsWithChildren, ReactNode } from 'react';
import { Suspense } from 'react';
import type { FallbackProps } from 'react-error-boundary';
import { ErrorBoundary } from 'react-error-boundary';
import { FormProvider as ReactHookFormProvider } from 'react-hook-form';

import { Action } from '../__generated__';
import { Form } from '../components/Form';
import { FormErrorFallback } from '../components/ui/fallbacks/FormErrorFallback';
import { GlobalFormSkeleton } from '../components/ui/fallbacks/GlobalFormSkeleton';
import { GLOBAL_CAPS_SETTINGS } from '../config';
import { useActionResolver } from '../hooks/data/useActionResolver';
import { usePaymentConfig } from '../hooks/data/usePaymentConfig';
import { paymentProvidersQueryOptions } from '../hooks/data/usePaymentProviders';
import { paymentScheduleQueryOptions } from '../hooks/data/usePaymentSchedule';
import { useForm } from '../hooks/utils/useForm';

type CapsFormProps = PropsWithChildren<ComponentProps<typeof Form>> & {
  fallback?: ReactNode;
  action?: Action;
  errorFallback?: (props: FallbackProps) => ReactNode;
};

function CapsFormProvider({ children, action, ...props }: CapsFormProps) {
  const { isSeller } = useOidcContext();
  const { id } = useCapsConfigContext();

  const { data: paymentConfig } = usePaymentConfig();
  const resolvedAction = useActionResolver(action);
  const [{ data: paymentProviders }, { data: paymentSchedule }] = useSuspenseQueries({
    queries: [
      paymentProvidersQueryOptions(paymentConfig.providers),
      paymentScheduleQueryOptions(id),
    ],
  });

  const sellerDefaultValues = {
    template_id: GLOBAL_CAPS_SETTINGS.templateIds.mobilePhone,
  };

  const methods = useForm({
    defaultValues: {
      action: resolvedAction,
      template_id: GLOBAL_CAPS_SETTINGS.templateIds.mobilePhone,
      provider_id: paymentProviders?.[0]?.id,
      amount: paymentSchedule?.[0]?.amount?.toString(),
      currency: paymentSchedule?.[0]?.currency,
      ...(isSeller && sellerDefaultValues),
    },
  });

  return (
    <ReactHookFormProvider {...methods}>
      <Form {...props}>{children}</Form>
    </ReactHookFormProvider>
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
