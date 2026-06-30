"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Email hoặc mật khẩu không đúng");
      return;
    }

    router.push("/chat");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-(--vnp-blue-dark) via-(--vnp-blue) to-(--vnp-blue-light) px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        <div className="flex flex-col items-center mb-6">
          <Image src="/logo.svg" alt="Vinaphone AI" width={48} height={48} className="mb-3" />
          <h1 className="text-2xl font-bold text-(--vnp-gray-900)">Đăng nhập Vinaphone AI</h1>
          <p className="text-sm text-(--vnp-gray-700) mt-1">Trợ lý AI thông minh của Vinaphone</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-(--vnp-gray-900) mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-(--vnp-gray-200) focus:outline-none focus:ring-2 focus:ring-(--vnp-blue)"
              placeholder="ban@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-(--vnp-gray-900) mb-1">Mật khẩu</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-(--vnp-gray-200) focus:outline-none focus:ring-2 focus:ring-(--vnp-blue)"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-sm text-(--vnp-red)">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-(--vnp-blue) hover:bg-(--vnp-blue-dark) text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-60"
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        <p className="text-center text-sm text-(--vnp-gray-700) mt-6">
          Chưa có tài khoản?{" "}
          <Link href="/register" className="text-(--vnp-blue) font-medium hover:underline">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
}
