import { NextResponse } from "next/server";
import { auth } from "@/auth";

// Define routes that do not require authentication
const publicRoutes = ["/", "/login", "/signup", "/company", "/products", "/legal"];

export const proxy = auth((req) => {
  const { pathname } = req.nextUrl;

  // Check if it's a public route or static asset
  const isPublicRoute = publicRoutes.includes(pathname) || 
    pathname.startsWith("/_next") || 
    pathname.startsWith("/images") || 
    pathname.includes(".");

  // `req.auth` is populated by NextAuth
  const nextAuthSession = req.auth;
  const customSession = req.cookies.get("session")?.value;
  const isLoggedIn = !!nextAuthSession || !!customSession;

  // If trying to access a protected route without a session, redirect to login
  if (!isPublicRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // If trying to access login/signup while already authenticated, redirect to dashboard
  if ((pathname === "/login" || pathname === "/signup") && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, images, svg
     */
    '/((?!api|_next/static|_next/image|images|.*\\.png$|.*\\.svg$|favicon.ico).*)',
  ],
};
