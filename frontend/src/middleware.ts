import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { ROUTES } from '@/lib/routes';

const authRoutes = [ROUTES.LOGIN, ROUTES.REGISTER];

function isAuthRoute(pathname: string): boolean {
  return authRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

function getAccessTokenFromCookie(req: NextRequest): string | undefined {
  return req.cookies.get('accessToken')?.value;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }

  const nextAuthToken = await getToken({ req, secret: process.env.AUTH_SECRET });
  const accessToken =
    (nextAuthToken?.accessToken as string | undefined) ?? getAccessTokenFromCookie(req);
  const isAuth = isAuthRoute(pathname);

  if (isAuth && accessToken) {
    return NextResponse.redirect(new URL(ROUTES.HOME, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|api|.*\\..*).*)'],
};
