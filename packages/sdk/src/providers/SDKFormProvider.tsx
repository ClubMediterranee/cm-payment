import type {ComponentProps, PropsWithChildren} from "react";
import {FormProvider as ReactHookFormProvider, useForm} from "react-hook-form";
import {SDKForm} from "../components/SDKForm.js";
import {validateComponents} from "@clubmed/payment-sdk/utils/validateComponents.js";
import {useSDKPaymentContext} from "@clubmed/payment-sdk/hooks/useSDKPaymentContext.js";

/**
 * Check the presence of required components based on the issuer type and provide form context
 */
export function SDKFormProvider({children, ...props}: PropsWithChildren<ComponentProps<typeof SDKForm>>) {
  const methods = useForm();
  const {oidc} = useSDKPaymentContext()

  validateComponents(oidc.issuerType, children);

  return (
    <ReactHookFormProvider {...methods}>
      <SDKForm {...props}>{children}</SDKForm>
    </ReactHookFormProvider>
  );
}
