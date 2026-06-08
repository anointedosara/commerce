import { NextResponse, type NextRequest } from "next/server";

// Next.js 16 renamed `middleware` to `proxy` (nodejs runtime).
// Lightweight gate: redirect users without an auth cookie away from protected
// routes. Full token verification happens in the page/route via getSession().
const PROTECTED = ["/dashboard", "/cart", "/checkout"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const needsAuth = PROTECTED.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (!needsAuth) return NextResponse.next();

  const hasToken = Boolean(request.cookies.get("token")?.value);
  if (hasToken) return NextResponse.next();

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/dashboard/:path*", "/cart/:path*", "/checkout/:path*"],
};
