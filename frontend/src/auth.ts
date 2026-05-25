import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import { KEYS } from '@/apis/auth/keys';
import { getApiMessage } from '@/lib/api-response';
import {
  isAccessTokenExpired,
  postToAts,
  isAtsSuccess,
  getAtsData,
  getAtsTokenPair,
  refreshAtsTokens,
} from '@/lib/auth/nextauth-ats';

const nextAuth = NextAuth({
  pages: { signIn: '/dang-nhap', signOut: '/' },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    }),
    Credentials({
      credentials: { email: { type: 'email' }, password: { type: 'password' } },
      async authorize(creds) {
        if (!creds?.email || !creds?.password) return null;

        const res = await postToAts(KEYS.AUTH_LOGIN, {
          email: creds.email,
          password: creds.password,
        });
        const raw = (await res.json()) as Record<string, unknown>;

        if (!res.ok || !isAtsSuccess(raw)) {
          throw new Error(getApiMessage(raw, 'Email hoặc mật khẩu không đúng.'));
        }

        const d = getAtsData(raw);
        if (!d) return null;

        const { token, refreshToken } = getAtsTokenPair(d);
        if (!token) return null;

        const u = (d.user ?? d.User) as Record<string, unknown> | undefined;
        const fullName = typeof u?.fullName === 'string' ? u.fullName : undefined;

        return {
          id: (u?.id ?? '').toString(),
          email: (u?.email ?? creds.email) as string,
          name: fullName || undefined,
          accessToken: token,
          refreshToken,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        const u = user as { accessToken?: string; refreshToken?: string };
        token.accessToken = u.accessToken;
        token.refreshToken = u.refreshToken;
        token.id = user.id;
      }
      if (account?.provider === 'google' && account.access_token && !token.accessToken) {
        const res = await postToAts(KEYS.AUTH_GOOGLE, { accessToken: account.access_token });
        const raw = (await res.json()) as Record<string, unknown>;

        if (!res.ok || !isAtsSuccess(raw)) {
          throw new Error(getApiMessage(raw, 'Đăng nhập Google thất bại.'));
        }

        const payload = getAtsData(raw);
        const { token: appToken, refreshToken: appRefresh } = getAtsTokenPair(payload);

        if (!appToken) {
          throw new Error('Đăng nhập Google thất bại.');
        }

        token.accessToken = appToken;
        token.refreshToken = appRefresh;

        const userData = (payload?.user ?? payload?.User) as Record<string, unknown> | undefined;
        token.id = userData?.id?.toString() ?? token.sub;
        if (typeof userData?.email === 'string') token.email = userData.email;
        if (typeof userData?.fullName === 'string') token.name = userData.fullName;
      }
      const at = token.accessToken as string | undefined;
      const rt = token.refreshToken as string | undefined;
      if (at && rt && isAccessTokenExpired(at)) {
        const refreshed = await refreshAtsTokens(at, rt).catch(() => null);
        if (refreshed) {
          token.accessToken = refreshed.accessToken;
          token.refreshToken = refreshed.refreshToken;
          delete (token as Record<string, unknown>).error;
        } else {
          (token as Record<string, unknown>).error = 'RefreshTokenExpired';
        }
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) ?? '';
        (session as { accessToken?: string }).accessToken = token.accessToken as string;
        (session as { refreshToken?: string }).refreshToken = token.refreshToken as string;
      }
      return session;
    },
  },
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
});

export const handlers = nextAuth.handlers;
export const auth = nextAuth.auth as (req: import('next/server').NextRequest) => Promise<import('next-auth').Session | null>;
export const signIn = nextAuth.signIn as (provider?: string, options?: Record<string, unknown>) => Promise<{ url?: string; error?: string; status?: number; ok?: boolean } | undefined>;
export const signOut = nextAuth.signOut;
