'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { getCookie } from 'cookies-next';
import { store } from '@/stores';
import { clearUserAction, setAccessTokenAction, setRefreshTokenAction, setUserAction } from '@/stores/user/actions';
import { clearAuthAction, setTokensAction } from '@/stores/auth/actions';
import { AuthService } from '@/apis/auth/requests';
import { getRoleFromToken, isTokenExpired } from '@/utils/jwt';
import { refreshAtsTokens } from '@/lib/auth/nextauth-ats';
import type { IUser } from '@/types/user';

async function buildUserFromMe(accessToken: string): Promise<IUser | null> {
  try {
    const res = await AuthService.me();
    if (!res?.data || !(res.succeeded === true || res.status === true)) return null;
    const d = res.data as {
      id?: string; email?: string; firstName?: string; lastName?: string;
      phoneNumber?: string; introduction?: string; avatar?: string; image?: string;
    };
    return {
      id: d.id ?? '',
      email: d.email ?? '',
      firstName: d.firstName ?? '',
      lastName: d.lastName ?? '',
      phoneNumber: d.phoneNumber,
      introduction: d.introduction,
      name: [d.firstName, d.lastName].filter(Boolean).join(' ').trim() || undefined,
      image: d.avatar ?? d.image,
      roles: getRoleFromToken(accessToken) ?? undefined,
    } as IUser;
  } catch {
    return null;
  }
}

async function tryRestoreFromCookies() {
  const accessToken = getCookie('accessToken') as string | undefined;
  const refreshToken = getCookie('refreshToken') as string | undefined;
  if (!accessToken) return false;

  if (!isTokenExpired(accessToken)) {
    store.dispatch(setAccessTokenAction(accessToken));
    if (refreshToken) {
      store.dispatch(setRefreshTokenAction(refreshToken));
      store.dispatch(setTokensAction({ token: accessToken, refreshToken }));
    }
    const user = await buildUserFromMe(accessToken);
    if (user) { store.dispatch(setUserAction(user)); return true; }
    return false;
  }

  if (!refreshToken) return false;
  const refreshed = await refreshAtsTokens(accessToken, refreshToken).catch(() => null);
  if (!refreshed) return false;

  store.dispatch(setAccessTokenAction(refreshed.accessToken));
  store.dispatch(setRefreshTokenAction(refreshed.refreshToken));
  store.dispatch(setTokensAction({ token: refreshed.accessToken, refreshToken: refreshed.refreshToken }));
  const user = await buildUserFromMe(refreshed.accessToken);
  if (user) { store.dispatch(setUserAction(user)); return true; }
  return false;
}

export function AuthSessionSync() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      tryRestoreFromCookies().then((restored) => {
        if (!restored) {
          store.dispatch(clearUserAction());
          store.dispatch(clearAuthAction());
        }
      });
      return;
    }

    if (status !== 'authenticated' || !session) return;

    const sessionAny = session as { accessToken?: string; refreshToken?: string; error?: string };
    const accessToken = sessionAny.accessToken;
    const refreshToken = sessionAny.refreshToken;

    if (sessionAny.error === 'RefreshTokenExpired') {
      tryRestoreFromCookies().then((restored) => {
        if (!restored) {
          store.dispatch(clearUserAction());
          store.dispatch(clearAuthAction());
        }
      });
      return;
    }

    // Token refresh đã xử lý trong jwt callback (auth.ts) khi GET /api/auth/session
    // Không cần gọi update() - tránh vòng lặp vô hạn
    if (!accessToken) return;

    store.dispatch(setAccessTokenAction(accessToken));
    if (refreshToken) {
      store.dispatch(setRefreshTokenAction(refreshToken));
      store.dispatch(setTokensAction({ token: accessToken, refreshToken }));
    }

    // Chỉ set user từ API /me để tránh hiển thị thông tin cũ (session/JWT có thể stale)
    buildUserFromMe(accessToken).then((user) => {
      if (user) store.dispatch(setUserAction(user));
    });
  }, [status, session?.accessToken, session?.user?.id, (session as { error?: string })?.error]);

  return null;
}
