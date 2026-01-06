import { type NextRequest, NextResponse } from "next/server"

const SESSION_COOKIE_NAME = "user_session"
const PUBLIC_ROUTES = ["/", "/api/auth/login", "/api/auth/register"]

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow API health and init endpoints
  if (pathname.startsWith("/api/health") || pathname.startsWith("/api/init")) {
    return NextResponse.next()
  }

  // Check if route is public
  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next()
  }

  // Check for session cookie
  const session = request.cookies.get(SESSION_COOKIE_NAME)

  // If trying to access protected route without session, redirect to login
  if (!session && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  // If logged in and trying to access login page, redirect to dashboard
  if (session && pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\.png).*)"],
}
