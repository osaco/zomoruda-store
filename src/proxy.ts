import { NextResponse, type NextRequest } from "next/server";

/** Gate admin routes and admin API endpoints unless a signed session cookie is present. */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const cookie = request.cookies.get("zm_admin")?.value;
  const hasSignedFormat = Boolean(cookie && cookie.includes("."));

  if (pathname.startsWith("/api/admin") && !hasSignedFormat) {
    return NextResponse.json({ ok: false, error: "\u063A\u064A\u0631 \u0645\u0635\u0631\u062D" }, { status: 401 });
  }

  if (pathname.startsWith("/admin") && pathname !== "/admin/login" && !hasSignedFormat) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*", "/api/admin/:path*"] };
