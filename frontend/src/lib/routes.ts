export const ROUTES = {
  HOME: '/',
  LOGIN: '/dang-nhap',
  REGISTER: '/dang-ky',
  VERIFY_OTP: '/xac-thuc-otp',
  FORGOT_PASSWORD: '/quen-mat-khau',
  RESET_PASSWORD: '/quen-mat-khau/dat-lai-mat-khau',
  CART: '/gio-hang',
  CHECKOUT: '/thanh-toan',
  PAYMENT_RESULT: '/thanh-toan/ket-qua',
  ORDER_HISTORY: '/lich-su-don-hang',
  PROFILE: '/thong-tin-tai-khoan',
  VOUCHERS: '/voucher-cua-toi',
  NOTIFICATIONS: '/thong-bao',
  CHANGE_PASSWORD: '/doi-mat-khau',
  PRODUCTS: '/san-pham',
  GOI_Y_SAN_PHAM: '/goi-y-san-pham',
} as const;

export function paymentResultRoute(orderId: string) {
  return `${ROUTES.PAYMENT_RESULT}/${orderId}`;
}
