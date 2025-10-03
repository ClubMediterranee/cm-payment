import { useSDKPaymentContext } from '@clubmed/payment-sdk/hooks/utils/useSDKPaymentContext';
import { validateComponents } from '@clubmed/payment-sdk/utils/validation/validateComponents';
import type { ComponentProps, PropsWithChildren } from 'react';
import { FormProvider as ReactHookFormProvider } from 'react-hook-form';

import { SDKForm } from '../components/SDKForm';
import { useForm } from '../hooks/utils/useForm';

/**
 * Check the presence of required components based on the issuer type and provide form context
 */
export function SDKFormProvider({
  children,
  ...props
}: PropsWithChildren<ComponentProps<typeof SDKForm>>) {
  const methods = useForm();
  const { oidc } = useSDKPaymentContext();

  validateComponents(oidc.issuerType, children);

  return (
    <ReactHookFormProvider {...methods}>
      <SDKForm {...props}>{children}</SDKForm>
    </ReactHookFormProvider>
  );
}
