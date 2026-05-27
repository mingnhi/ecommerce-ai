import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { STORAGE_KEYS } from "@/shared/constants";
import { storage } from "@/shared/lib/storage";
import {
  getProfile,
  updateAvatar as updateAvatarApi,
  updatePassword as updatePasswordApi,
  updateProfile as updateProfileApi,
} from "@/services/auth";
import type { AuthUser } from "@/features/auth/types";
import { parseProfile } from "./lib";
import type { UpdatePasswordDto, UpdateProfileDto, UserProfile } from "./types";

const PROFILE_KEY = ["profile"] as const;
const ME_KEY = ["me"] as const;

function syncMeFromProfile(profile: UserProfile) {
  const cached = storage.get<AuthUser>(STORAGE_KEYS.authUser);
  if (!cached) return;

  const next: AuthUser = {
    ...cached,
    fullName: profile.fullName ?? cached.fullName,
  };
  storage.set(STORAGE_KEYS.authUser, next);
  return next;
}

export function useProfile() {
  return useQuery({
    queryKey: PROFILE_KEY,
    queryFn: async () => {
      const response = await getProfile();
      return parseProfile(response);
    },
    enabled: Boolean(storage.get<string>(STORAGE_KEYS.accessToken)),
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileDto) => updateProfileApi(data),
    onSuccess: (response) => {
      const profile = parseProfile(response);
      if (!profile) return;
      queryClient.setQueryData(PROFILE_KEY, profile);
      const user = syncMeFromProfile(profile);
      if (user) queryClient.setQueryData(ME_KEY, user);
    },
  });
}

export function useUpdateAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => updateAvatarApi(file),
    onSuccess: (response) => {
      const profile = parseProfile(response);
      if (!profile) return;
      queryClient.setQueryData(PROFILE_KEY, profile);
    },
  });
}

export function useUpdatePassword() {
  return useMutation({
    mutationFn: (data: UpdatePasswordDto) => updatePasswordApi(data),
  });
}
