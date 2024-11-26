import { useSuspenseQuery } from "@tanstack/react-query";
import { useAuth } from "react-oidc-context";
import { getV1PaymentProviders } from "../api";
export const usePaymentProviders = () => {
  const { user } = useAuth();
  const profile = user?.profile.type;

  return useSuspenseQuery({
    queryKey: ["paymentProviders"],
    queryFn: () => getV1PaymentProviders({ withAuth: !!profile }),
    retry: false,
  });
};
