import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthSessionProvider from "@/components/SessionProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vinaphone AI — Trợ lý AI thông minh",
  description:
    "Vinaphone AI là trợ lý trí tuệ nhân tạo giúp bạn trò chuyện, tìm kiếm thông tin và giải quyết công việc nhanh chóng.",
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-(--vnp-gray-50)">
        <AuthSessionProvider>{children}</AuthSessionProvider>
      </body>
    </html>
  );
}
