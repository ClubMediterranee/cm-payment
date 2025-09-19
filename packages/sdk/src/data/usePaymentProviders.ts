import { useSuspenseQuery } from "@tanstack/react-query";
import { getV1PaymentProviders } from "../gen";
import { useAppContext } from "../hooks/useAppContext";
export const usePaymentProviders = () => {
  const { issuer } = useAppContext();
  const withAuth = issuer === "go" || issuer === "partners";

  return useSuspenseQuery({
    queryKey: ["paymentProviders"],
    queryFn: () => getV1PaymentProviders({ withAuth }),
    retry: false,
  });
};
