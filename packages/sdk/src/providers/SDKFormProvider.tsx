import { useSDKPaymentContext } from '@clubmed/payment-sdk/hooks/utils/useSDKPaymentContext';
import { validateComponents } from '@clubmed/payment-sdk/utils/validation/validateComponents';
import type { ComponentProps, PropsWithChildren, ReactNode } from 'react';
import { Suspense } from 'react';
import type { FallbackProps } from 'react-error-boundary';
import { ErrorBoundary } from 'react-error-boundary';
import { FormProvider as ReactHookFormProvider } from 'react-hook-form';

import { SDKForm } from '../components/SDKForm';
import { FormErrorFallback } from '../components/ui/fallbacks/FormErrorFallback';
import { GlobalFormSpinner } from '../components/ui/fallbacks/GlobalFormSpinner';
import { useForm } from '../hooks/utils/useForm';
import { FeatureFlipsProvider } from './FeatureFlipsProvider';

type SDKFormProviderProps = PropsWithChildren<ComponentProps<typeof SDKForm>> & {
  fallback?: ReactNode;
  errorFallback?: (props: FallbackProps) => ReactNode;
};

/**
 * Check the presence of required components based on the issuer type and provide form context
 */
export function SDKFormProvider({
  children,
  fallback = <GlobalFormSpinner />,
  errorFallback = FormErrorFallback,
  ...props
}: SDKFormProviderProps) {
  const methods = useForm();
  const { oidc, locale } = useSDKPaymentContext();

  try {
    validateComponents(oidc.issuerType, children);
  } catch (error) {
    return <FormErrorFallback error={error as Error} />;
  }

  return (
    <ErrorBoundary FallbackComponent={errorFallback}>
      <Suspense fallback={fallback}>
        <FeatureFlipsProvider locale={locale}>
          <ReactHookFormProvider {...methods}>
            <SDKForm {...props}>{children}</SDKForm>
          </ReactHookFormProvider>
        </FeatureFlipsProvider>
      </Suspense>
    </ErrorBoundary>
  );
}
