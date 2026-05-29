export const KEYS = {
  PROVINCES: '/addresses/provinces',
  WARDS: (provinceId: number) => `/addresses/provinces/${provinceId}/wards`,
  ADDRESSES: '/addresses',
} as const;
