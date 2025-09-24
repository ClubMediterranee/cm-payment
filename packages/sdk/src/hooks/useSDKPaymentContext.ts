import {useContext} from "react";
import {SDKConfigContext} from "@clubmed/payment-sdk/contexts/SDKConfigContext.js";

export const useSDKPaymentContext = () => {
  return useContext(SDKConfigContext);
};

export const useOidcContext = () => {
  const {oidc} = useContext(SDKConfigContext);

  const withAuth = oidc.issuerType === "GO" || oidc.issuerType === "PARTNER";

  return {
    withAuth,
    ...oidc,
  };
}
