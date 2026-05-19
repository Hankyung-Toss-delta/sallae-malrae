// Auth Guard — 인증 여부에 따라 라우트 접근을 제어합니다.
// 파일명은 Next.js 16+ 컨벤션(proxy)을 따르며, 요청을 다른 서버로 전달하는 프록시 역할이 아닙니다.
import { NextResponse } from 'next/server';
import { verifyAccessTokenEdge } from '@/lib/jwt';

const PROTECTED = ['/dashboard', '/coolingoff'];
const AUTH_ONLY = ['/auth/login', '/auth/signup'];

export async function proxy(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('accessToken')?.value;

  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));
  const isAuthOnly = AUTH_ONLY.some((p) => pathname.startsWith(p));
  const isRoot = pathname === '/';

  if (isProtected) {
    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
    try {
      await verifyAccessTokenEdge(token);
    } catch {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  if (isAuthOnly && token) {
    try {
      await verifyAccessTokenEdge(token);
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } catch {
      // 만료된 토큰이면 로그인 페이지 그대로 진행
    }
  }

  // 루트(/): 로그인 상태면 대시보드, 비로그인이면 랜딩 페이지 그대로 노출
  if (isRoot && token) {
    try {
      await verifyAccessTokenEdge(token);
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } catch {
      // 만료된 토큰이면 랜딩 페이지 그대로 진행
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/dashboard/:path*', '/coolingoff/:path*', '/auth/login', '/auth/signup'],
};
