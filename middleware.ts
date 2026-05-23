import { NextResponse, type NextRequest } from "next/server";

/**
 * Basic auth in front of /admin. Two env vars:
 *   ADMIN_USER, ADMIN_PASS
 * If either is missing, the admin routes are sealed shut (401) so a misconfigured
 * deploy can't accidentally leak feedback emails.
 */
export function middleware(req: NextRequest) {
  if (!req.nextUrl.pathname.startsWith("/admin")) return NextResponse.next();

  const user = process.env.ADMIN_USER;
  const pass = process.env.ADMIN_PASS;
  if (!user || !pass) {
    return new NextResponse("Admin not configured", { status: 401 });
  }

  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Basic ")) {
    const decoded = Buffer.from(auth.slice(6), "base64").toString("utf8");
    const [u, p] = decoded.split(":");
    if (u === user && p === pass) return NextResponse.next();
  }

  return new NextResponse("Auth required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="parakhi-admin"' },
  });
}

export const config = {
  matcher: ["/admin/:path*"],
};
