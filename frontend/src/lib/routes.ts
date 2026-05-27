export const ROUTES = {
  HOME: '/',
  LOGIN: '/dang-nhap',
  REGISTER: '/dang-ky',
  REGISTER_VERIFY_OTP: '/dang-ky/xac-thuc-otp',
  CART: '/gio-hang',
  CHECKOUT: '/thanh-toan',
  PAYMENT_RESULT: '/thanh-toan/ket-qua',
  ORDER_HISTORY: '/lich-su-don-hang',
  PROFILE: '/thong-tin-tai-khoan',
  VOUCHERS: '/voucher-cua-toi',
  NOTIFICATIONS: '/thong-bao',
  CHANGE_PASSWORD: '/doi-mat-khau',
} as const;

export function paymentResultRoute(orderId: string) {
  return `${ROUTES.PAYMENT_RESULT}/${orderId}`;
}
