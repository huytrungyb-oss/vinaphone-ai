import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

function noStore(res: NextResponse) {
  res.headers.set("Cache-Control", "private, no-cache, no-store, max-age=0, must-revalidate");
  return res;
}

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  // /chat (trang chat mới) công khai cho khách dùng model thường.
  // Chỉ /chat/<id> (xem lại hội thoại đã lưu) mới yêu cầu đăng nhập.
  const isProtected = /^\/chat\/.+/.test(pathname);

  if (isProtected && !isLoggedIn) {
    const url = new URL("/login", req.nextUrl.origin);
    return noStore(NextResponse.redirect(url));
  }

  return noStore(NextResponse.next());
});

export const config = {
  matcher: ["/chat/:path*"],
};
