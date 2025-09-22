import { useSuspenseQuery } from "@tanstack/react-query";
import { getV1ProductsProductId } from "../__generated__";

export const useProduct = ({ productId }: { productId: string }) => {
  return useSuspenseQuery({
    queryKey: ["product"],
    queryFn: () => getV1ProductsProductId(productId),
    retry: false,
  });
};
