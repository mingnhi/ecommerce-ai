import { useQuery } from "@tanstack/react-query";
import { getProducts } from "@/services/product";

export const useProducts = () => {
  return useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
  });
};
