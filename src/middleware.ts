import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    if (path.startsWith("/api/meals") && token?.role == "WAITER") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    if ((path.startsWith("/api/users") || path.startsWith("/api/tables")) && token?.role !== "CASHIER") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
  }
);

export const config = {
  matcher: [
    "/api/categories/:path*",
    "/api/finishorder/:path*",
    "/api/orders/:path*",
    "/api/tables/:path*",
    "/api/users/:path*",
    "/api/meals/:path*"
  ],
};