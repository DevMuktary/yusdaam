import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // 1. Admin Route Protection
    if (path.startsWith("/admin/dashboard")) {
      if (token?.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/admin/login", req.url));
      }
    }

    // 2. Asset Owner Route Protection
    if (path.startsWith("/owner/dashboard")) {
      if (token?.role !== "ASSET_OWNER") {
        return NextResponse.redirect(new URL("/owner/login", req.url));
      }
    }

    // 3. Rider Route Protection
    if (path.startsWith("/rider/dashboard")) {
      if (token?.role !== "RIDER") {
        return NextResponse.redirect(new URL("/rider/login", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // This ensures the middleware logic above only runs IF a token exists
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  // We strictly match the dashboards. We DO NOT match the login pages 
  // (/admin/login) because we want unauthenticated users to be able to reach them.
  matcher: [
    "/admin/dashboard/:path*",
    "/owner/dashboard/:path*",
    "/rider/dashboard/:path*",
  ],
};
