import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // You can add custom role-based routing logic here later
    // e.g., if an Investor tries to access /admin routes, redirect them
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  // Protect all routes inside /dashboard and /admin
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
