import { request } from '../axios';
import { KEYS } from './keys';
import type {
  AddressResponse,
  AddressesResponse,
  CreateAddressPayload,
  ProvincesResponse,
  UpdateAddressPayload,
  WardsResponse,
} from './types';

export const AddressService = {
  getProvinces: () => request.get<ProvincesResponse>(KEYS.PROVINCES),

  getWards: (provinceId: number) =>
    request.get<WardsResponse>(KEYS.WARDS(provinceId)),

  list: () => request.get<AddressesResponse>(KEYS.ADDRESSES),

  create: (data: CreateAddressPayload) =>
    request.post<AddressResponse>(KEYS.ADDRESSES, data),

  update: (id: string, data: UpdateAddressPayload) =>
    request.patch<AddressResponse>(`${KEYS.ADDRESSES}/${id}`, data),
};
