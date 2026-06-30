"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Đã có lỗi xảy ra");
      setLoading(false);
      return;
    }

    const signInRes = await signIn("credentials", {
      phone,
      password,
      redirect: false,
    });

    setLoading(false);

    if (signInRes?.error) {
      router.push("/login");
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
          <h1 className="text-2xl font-bold text-(--vnp-gray-900)">Tạo tài khoản Vinaphone AI</h1>
          <p className="text-sm text-(--vnp-gray-700) mt-1">Bắt đầu trò chuyện cùng trợ lý AI</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-(--vnp-gray-900) mb-1">Họ và tên</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-(--vnp-gray-200) focus:outline-none focus:ring-2 focus:ring-(--vnp-blue)"
              placeholder="Nguyễn Văn A"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-(--vnp-gray-900) mb-1">Số điện thoại</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-(--vnp-gray-200) focus:outline-none focus:ring-2 focus:ring-(--vnp-blue)"
              placeholder="0912345678"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-(--vnp-gray-900) mb-1">Mật khẩu</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-(--vnp-gray-200) focus:outline-none focus:ring-2 focus:ring-(--vnp-blue)"
              placeholder="Tối thiểu 6 ký tự"
            />
          </div>

          {error && <p className="text-sm text-(--vnp-red)">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-(--vnp-blue) hover:bg-(--vnp-blue-dark) text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-60"
          >
            {loading ? "Đang tạo tài khoản..." : "Đăng ký"}
          </button>
        </form>

        <p className="text-center text-sm text-(--vnp-gray-700) mt-6">
          Đã có tài khoản?{" "}
          <Link href="/login" className="text-(--vnp-blue) font-medium hover:underline">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}
