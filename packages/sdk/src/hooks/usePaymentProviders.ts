import {useSuspenseQuery} from "@tanstack/react-query";
import {getV1PaymentProviders} from "../__generated__";
import {useOidcContext} from "./useSDKPaymentContext.js";

export const usePaymentProviders = () => {
  const {withAuth} = useOidcContext();

  return useSuspenseQuery({
    queryKey: ["paymentProviders"],
    queryFn: () => getV1PaymentProviders({withAuth}),
    retry: false,
  });
};
