import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getApiErrorMessage, getEnvelopeData } from '@/lib/api-response';
import { useAppSelector } from '@/stores';
import { selectIsAuthenticated } from '@/stores/auth/selectors';
import { AddressService } from './requests';
import { KEYS } from './keys';
import type {
  Address,
  CreateAddressPayload,
  Province,
  UpdateAddressPayload,
  Ward,
} from './types';

export const useProvinces = () =>
  useQuery<Province[]>({
    queryKey: [KEYS.PROVINCES],
    queryFn: async () => {
      const res = await AddressService.getProvinces();
      return getEnvelopeData(res) ?? [];
    },
    staleTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
  });

export const useWards = (provinceId: number | null) =>
  useQuery<Ward[]>({
    queryKey: [KEYS.PROVINCES, provinceId, 'wards'],
    queryFn: async () => {
      const res = await AddressService.getWards(provinceId!);
      return getEnvelopeData(res) ?? [];
    },
    enabled: provinceId != null && provinceId > 0,
    staleTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
  });

export const useAddresses = () => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  return useQuery<Address[]>({
    queryKey: [KEYS.ADDRESSES],
    queryFn: async () => {
      const res = await AddressService.list();
      return getEnvelopeData(res) ?? [];
    },
    enabled: isAuthenticated,
    refetchOnWindowFocus: false,
  });
};

export const useSaveAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id?: string;
      data: CreateAddressPayload | UpdateAddressPayload;
    }): Promise<Address | undefined> => {
      if (id) {
        const res = await AddressService.update(id, data);
        return getEnvelopeData(res);
      }
      const res = await AddressService.create(data as CreateAddressPayload);
      return getEnvelopeData(res);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [KEYS.ADDRESSES] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Không thể lưu địa chỉ'));
    },
  });
};
