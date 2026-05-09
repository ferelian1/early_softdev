import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow login page through without JWT check
  if (pathname === '/void/login') {
    return NextResponse.next();
  }

  const token = request.cookies.get('cztoken')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/void/login', request.url));
  }

  try {
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET ?? 'fallback-secret-for-dev-only',
    );
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch {
    // Token expired or invalid signature — clear cookie and redirect
    const response = NextResponse.redirect(new URL('/void/login', request.url));
    response.cookies.delete('cztoken');
    return response;
  }
}

export const config = {
  matcher: ['/void/:path*'],
};
