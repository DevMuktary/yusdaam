import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // 1. Strict Protection for Admin Routes
    if (path.startsWith("/admin/dashboard") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }

    // 2. Strict Protection for Asset Owner Routes
    if (path.startsWith("/owner/dashboard") && token?.role !== "ASSET_OWNER") {
      return NextResponse.redirect(new URL("/owner/login", req.url));
    }

    // 3. Strict Protection for Rider Routes
    if (path.startsWith("/rider/dashboard") && token?.role !== "RIDER") {
      return NextResponse.redirect(new URL("/rider/login", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Middleware only executes if this returns true (user is authenticated)
      authorized: ({ token }) => !!token,
    },
  }
);

// Define exactly which routes are intercepted by the security middleware
export const config = {
  matcher: [
    "/admin/dashboard/:path*",
    "/owner/dashboard/:path*",
    "/rider/dashboard/:path*",
  ],
};
