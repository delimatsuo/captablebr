import { NextRequest, NextResponse } from "next/server";

const publicPaths = ["/", "/login", "/request-access", "/privacy", "/terms", "/api/health"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (
    publicPaths.some((p) => pathname === p || pathname.startsWith("/api/auth")) ||
    pathname.startsWith("/convite/")
  ) {
    return NextResponse.next();
  }

  // Allow access request, signup, and email verification APIs
  if (pathname === "/api/access-request" || pathname.startsWith("/api/signup") || pathname === "/api/verify-email") {
    return NextResponse.next();
  }

  // Allow static files and public assets
  if (pathname.startsWith("/_next") || pathname.startsWith("/favicon") || pathname.match(/\.(svg|png|jpg|jpeg|gif|ico|webp|woff2?)$/)) {
    return NextResponse.next();
  }

  // Check for session cookie
  const session = request.cookies.get("session")?.value;
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
