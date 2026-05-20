import { httpClient } from "./http";

export const login = async (data: { email: string; password: string }) => {
  const res = await httpClient.post("/auth/login", data);
  return res.data;
};

export const getMe = async () => {
  const res = await httpClient.get("/auth/me");
  return res.data;
};

export const logout = async () => {
  const res = await httpClient.post("/auth/logout");
  return res.data;
};
