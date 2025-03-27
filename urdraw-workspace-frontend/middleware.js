import { NextResponse } from "next/server";

const publicRoutes = ["/", "/silent-check-sso.html"];

export default function middleware(request) {
  const { pathname } = request.nextUrl;

  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route)
  );

  if (isPublicRoute) {
    return NextResponse.next();
  }

  const keycloakSession = request.cookies.get("KEYCLOAK_SESSION");

  if (!keycloakSession) {
    const loginUrl = new URL("/", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/workspace/:path*"],
};
