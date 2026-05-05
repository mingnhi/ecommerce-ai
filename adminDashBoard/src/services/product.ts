import { httpClient } from "./http";

export const getProducts = async () => {
  const res = await httpClient.get("/products");
  return res.data;
};
