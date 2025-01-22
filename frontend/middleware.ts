import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('token');

  // Paths that do not require authentication
  const publicPaths = ["/"];

  // Check if the user is authenticated
  if (token) {
    // User is authenticated, redirect to the dashboard if trying to access login
    if (publicPaths.includes(req.nextUrl.pathname)) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  } else {
    // User is not authenticated
    if (!publicPaths.includes(req.nextUrl.pathname) && req.nextUrl.pathname === "/dashboard") {
      // Redirect to login if trying to access dashboard without being authenticated
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // Allow the request to proceed for other paths
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard",'/datasets/'], // Adjust paths to apply middleware
};