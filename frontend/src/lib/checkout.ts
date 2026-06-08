import { ROUTES } from '@/lib/routes';
import type { Address, AddressType } from '@/apis/address';

export type { AddressType };

export type CheckoutAddress = {
  id?: string;
  name: string;
  phone: string;
  addressLine: string;
  provinceId: number;
  wardId: number;
  type: AddressType;
  address: string;
};

export const CHECKOUT_ADDRESS_PLACEHOLDER = 'Vui lòng cập nhật địa chỉ nhận hàng';

export function emptyCheckoutAddress(): CheckoutAddress {
  return {
    name: '',
    phone: '',
    addressLine: '',
    provinceId: 0,
    wardId: 0,
    type: 'HOME',
    address: CHECKOUT_ADDRESS_PLACEHOLDER,
  };
}

export function isCheckoutAddressReady(address: CheckoutAddress) {
  return Boolean(
    address.id &&
      address.name.trim() &&
      address.phone.trim() &&
      address.addressLine.trim() &&
      address.provinceId > 0 &&
      address.wardId > 0,
  );
}

export function toAddressType(value: string): AddressType {
  return value === 'OFFICE' ? 'OFFICE' : 'HOME';
}

export function toUiAddressType(type: AddressType): 'home' | 'office' {
  return type === 'OFFICE' ? 'office' : 'home';
}

export function fromUiAddressType(value: string): AddressType {
  return value === 'office' ? 'OFFICE' : 'HOME';
}

export function formatProvinceLabel(province: { fullName?: string | null; name?: string | null }) {
  return province.fullName?.trim() || province.name?.trim() || '';
}

export function formatWardLabel(ward: { nameWithType?: string | null; name?: string | null }) {
  return ward.nameWithType?.trim() || ward.name?.trim() || '';
}

export function buildAddressDisplay(
  addressLine: string,
  province: { fullName?: string | null; name?: string | null },
  ward: { nameWithType?: string | null; name?: string | null },
) {
  const location = [formatWardLabel(ward), formatProvinceLabel(province)].filter(Boolean).join(', ');
  return [addressLine.trim(), location].filter(Boolean).join(', ');
}

export function toCheckoutAddress(item: Address): CheckoutAddress {
  return {
    id: item.id,
    name: item.fullName,
    phone: item.phone,
    addressLine: item.addressLine,
    provinceId: item.provinceId,
    wardId: item.wardId,
    type: toAddressType(item.type),
    address: buildAddressDisplay(item.addressLine, item.province, item.ward),
  };
}

export function checkoutUrl(cartLineIds: string[]) {
  const ids = cartLineIds.filter(Boolean).join(',');
  return `${ROUTES.CHECKOUT}?ids=${encodeURIComponent(ids)}`;
}
