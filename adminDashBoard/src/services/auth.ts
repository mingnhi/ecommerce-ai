import { httpClient } from "./http";
import type { UpdatePasswordDto, UpdateProfileDto } from "@/features/account/types";

export const login = async (data: { email: string; password: string }) => {
  const res = await httpClient.post("/auth/login", data);
  return res.data;
};

export const getMe = async () => {
  const res = await httpClient.get("/auth/me");
  return res.data;
};

export const getProfile = async () => {
  const res = await httpClient.get("/auth/profile");
  return res.data;
};

export const updateProfile = async (data: UpdateProfileDto) => {
  const res = await httpClient.patch("/auth/profile", data);
  return res.data;
};

export const updateAvatar = async (file: File) => {
  const formData = new FormData();
  formData.append("avatar", file);
  const res = await httpClient.patch("/auth/profile/avatar", formData);
  return res.data;
};

export const updatePassword = async (data: UpdatePasswordDto) => {
  const res = await httpClient.patch("/auth/password", data);
  return res.data;
};

export const logout = async () => {
  const res = await httpClient.post("/auth/logout");
  return res.data;
};
