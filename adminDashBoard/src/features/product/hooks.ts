import { useQuery } from "@tanstack/react-query";
import { getProducts } from "@/services/product";

const PRODUCTS_KEY = ["products"] as const;

export const useProducts = () => {
  return useQuery({
    queryKey: PRODUCTS_KEY,
    queryFn: getProducts,
  });
};
