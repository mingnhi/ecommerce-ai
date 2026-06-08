import type { ApiEnvelope } from '@/types/common';

export type AddressType = 'HOME' | 'OFFICE';

export type Province = {
  id: number;
  name: string | null;
  nameSlug: string | null;
  fullName: string | null;
  type: string | null;
};

export type Ward = {
  id: number;
  provinceId: number;
  name: string | null;
  slug: string | null;
  type: string | null;
  nameWithType: string | null;
  path: string | null;
  pathWithType: string | null;
};

export type Address = {
  id: string;
  fullName: string;
  phone: string;
  addressLine: string;
  provinceId: number;
  wardId: number;
  type: AddressType;
  province: Province;
  ward: Ward;
  createdAt: string;
  updatedAt?: string;
};

export type CreateAddressPayload = {
  fullName: string;
  phone: string;
  addressLine: string;
  provinceId: number;
  wardId: number;
  type: AddressType;
};

export type UpdateAddressPayload = Partial<CreateAddressPayload>;

export type ProvincesResponse = ApiEnvelope<Province[]>;
export type WardsResponse = ApiEnvelope<Ward[]>;
export type AddressesResponse = ApiEnvelope<Address[]>;
export type AddressResponse = ApiEnvelope<Address>;
