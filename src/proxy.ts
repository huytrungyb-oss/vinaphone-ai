import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register");
  const isProtected = pathname.startsWith("/chat");

  if (isProtected && !isLoggedIn) {
    const url = new URL("/login", req.nextUrl.origin);
    return NextResponse.redirect(url);
  }

  if (isAuthPage && isLoggedIn) {
    const url = new URL("/chat", req.nextUrl.origin);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/chat/:path*", "/login", "/register"],
};
