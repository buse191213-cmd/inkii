import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "inkii_session";

/**
 * Schützt alle /admin-Routen außer /admin/login.
 * Ohne gültiges Sitzungs-Cookie -> Weiterleitung zur Anmeldung.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin/login")) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const expected = process.env.ADMIN_SESSION_SECRET ?? "inkii-dev-secret";

  if (token !== expected) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
