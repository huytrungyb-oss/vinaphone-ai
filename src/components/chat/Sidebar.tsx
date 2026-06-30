"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Plus, MessageSquare, Trash2, LogOut } from "lucide-react";
import Image from "next/image";

type ConversationListItem = {
  _id: string;
  title: string;
  updatedAt: string;
};

export default function Sidebar({ userName }: { userName: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [conversations, setConversations] = useState<ConversationListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/conversations");
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations, pathname]);

  async function handleDelete(id: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    await fetch(`/api/conversations/${id}`, { method: "DELETE" });
    setConversations((prev) => prev.filter((c) => c._id !== id));
    if (pathname === `/chat/${id}`) {
      router.push("/chat");
    }
  }

  return (
    <aside className="w-72 shrink-0 h-full bg-(--sidebar-bg) text-white flex flex-col">
      <div className="flex items-center gap-2 px-4 py-4 border-b border-white/10">
        <Image src="/logo.svg" alt="Vinaphone AI" width={32} height={32} />
        <span className="font-bold text-lg">Vinaphone AI</span>
      </div>

      <div className="p-3">
        <Link
          href="/chat"
          className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg bg-(--vnp-red) hover:bg-(--vnp-red-dark) transition-colors text-sm font-medium"
        >
          <Plus size={18} />
          Cuộc trò chuyện mới
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-2 space-y-1">
        {loading && <p className="text-xs text-white/50 px-2 py-2">Đang tải...</p>}
        {!loading && conversations.length === 0 && (
          <p className="text-xs text-white/50 px-2 py-2">Chưa có cuộc trò chuyện nào</p>
        )}
        {conversations.map((c) => {
          const active = pathname === `/chat/${c._id}`;
          return (
            <Link
              key={c._id}
              href={`/chat/${c._id}`}
              className={`group flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                active ? "bg-(--sidebar-bg-hover)" : "hover:bg-(--sidebar-bg-hover)"
              }`}
            >
              <MessageSquare size={16} className="shrink-0 text-white/60" />
              <span className="flex-1 truncate">{c.title}</span>
              <button
                onClick={(e) => handleDelete(c._id, e)}
                className="opacity-0 group-hover:opacity-100 text-white/50 hover:text-(--vnp-red) transition-opacity"
                aria-label="Xóa cuộc trò chuyện"
              >
                <Trash2 size={15} />
              </button>
            </Link>
          );
        })}
      </div>

      <div className="border-t border-white/10 p-3 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-full bg-(--vnp-blue-light) flex items-center justify-center text-sm font-semibold shrink-0">
            {userName.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm truncate">{userName}</span>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="text-white/60 hover:text-white transition-colors"
          aria-label="Đăng xuất"
        >
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
}
