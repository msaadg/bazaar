// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { RateLimiterMemory } from "rate-limiter-flexible";
import { getToken } from "next-auth/jwt";

// Rate limiter: 100 requests per minute per user
const rateLimiter = new RateLimiterMemory({
  points: 100, // 100 requests
  duration: 60, // per minute
});

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const publicRoutes = ["/", "/login", "/api/auth"];
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route)
  );
  const isApiRoute = pathname.startsWith("/api/");

  // Check for authentication token
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  if (isPublicRoute) {
    return NextResponse.next();
  }

  if (!token) {
    if (isApiRoute) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Apply rate limiting for authenticated users on API routes
  if (isApiRoute) {
    const userId = token.sub || "anonymous";
    try {
      await rateLimiter.consume(userId);
    } catch (error) {
      return new NextResponse(JSON.stringify({ error: "Too Many Requests" }), {
        status: 429,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!$|_next/static|_next/image|favicon.ico|login|.*\\.(?:png|jpg|jpeg|gif|svg|ico|css|js)).*)",
    "/api/((?!auth).*)",
  ],
};