import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

function noStore(res: NextResponse) {
  res.headers.set("Cache-Control", "private, no-cache, no-store, max-age=0, must-revalidate");
  return res;
}

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  const isProtected = pathname.startsWith("/chat");

  if (isProtected && !isLoggedIn) {
    const url = new URL("/login", req.nextUrl.origin);
    return noStore(NextResponse.redirect(url));
  }

  return noStore(NextResponse.next());
});

export const config = {
  matcher: ["/chat/:path*"],
};
