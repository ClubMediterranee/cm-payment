import {useSuspenseQuery} from "@tanstack/react-query";
import {getV2ProductsProductId} from "../__generated__/index.js";

export const useProduct = ({productId}: { productId: string }) => {
  return useSuspenseQuery({
    queryKey: ["product"],
    queryFn: () => getV2ProductsProductId(productId),
    retry: false,
  });
};
