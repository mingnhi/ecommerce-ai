import type { AppDispatch } from '@/stores';
import { clearUserAction } from './user/actions';
import { clearAuthAction } from './auth/actions';

/**
 * Xóa state người dùng và phiên đăng nhập khi đăng xuất.
 */
export function clearStateOnLogout(dispatch: AppDispatch): void {
  dispatch(clearUserAction());
  dispatch(clearAuthAction());
}
