export type ProvinceResponse = {
  id: number;
  name: string | null;
  nameSlug: string | null;
  fullName: string | null;
  type: string | null;
};

export type WardResponse = {
  id: number;
  provinceId: number;
  name: string | null;
  slug: string | null;
  type: string | null;
  nameWithType: string | null;
  path: string | null;
  pathWithType: string | null;
};

export type AddressResponse = {
  id: string;
  fullName: string;
  phone: string;
  addressLine: string;
  provinceId: number;
  wardId: number;
  type: string;
  province: ProvinceResponse;
  ward: WardResponse;
  createdAt: Date;
  updatedAt?: Date;
};
