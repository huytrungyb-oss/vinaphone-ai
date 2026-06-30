"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Plus, MessageSquare, Trash2, LogOut, UserPlus, X } from "lucide-react";
import Image from "next/image";
import { useSidebar } from "@/components/chat/SidebarContext";

type ConversationListItem = {
  _id: string;
  title: string;
  updatedAt: string;
};

export default function Sidebar({ userName }: { userName: string | null }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isOpen, close } = useSidebar();
  const isGuest = !userName;
  const [conversations, setConversations] = useState<ConversationListItem[]>([]);
  const [loading, setLoading] = useState(!isGuest);

  const loadConversations = useCallback(async () => {
    if (isGuest) return;
    try {
      const res = await fetch("/api/conversations");
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations);
      }
    } finally {
      setLoading(false);
    }
  }, [isGuest]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations, pathname]);

  useEffect(() => {
    close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

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
    <>
      {isOpen && (
        <div
          onClick={close}
          className="fixed inset-0 bg-black/50 z-30 sm:hidden"
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed sm:static inset-y-0 left-0 z-40 w-72 shrink-0 h-full bg-(--sidebar-bg) text-white flex flex-col transition-transform duration-200 ${
          isOpen ? "translate-x-0" : "-translate-x-full sm:translate-x-0"
        }`}
      >
        <div className="flex items-center justify-between px-2 border-b border-white/10">
          <Link
            href="/"
            className="flex-1 flex items-center gap-2 px-2 py-4 hover:bg-(--sidebar-bg-hover) transition-colors rounded-lg"
          >
            <Image src="/logo.svg" alt="Vinaphone AI" width={32} height={32} />
            <span className="font-bold text-lg">Vinaphone AI</span>
          </Link>
          <button
            onClick={close}
            className="sm:hidden p-2 text-white/60 hover:text-white transition-colors"
            aria-label="Đóng menu"
          >
            <X size={20} />
          </button>
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
        {isGuest && (
          <p className="text-xs text-white/50 px-2 py-2">
            Đăng nhập để lưu lại lịch sử trò chuyện của bạn.
          </p>
        )}
        {!isGuest && loading && <p className="text-xs text-white/50 px-2 py-2">Đang tải...</p>}
        {!isGuest && !loading && conversations.length === 0 && (
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

      <div className="border-t border-white/10 p-3">
        {isGuest ? (
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="flex-1 text-center text-sm font-medium px-3 py-2 rounded-lg hover:bg-(--sidebar-bg-hover) transition-colors"
            >
              Đăng nhập
            </Link>
            <Link
              href="/register"
              className="flex-1 flex items-center justify-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg bg-(--vnp-blue) hover:bg-(--vnp-blue-dark) transition-colors"
            >
              <UserPlus size={15} />
              Đăng ký
            </Link>
          </div>
        ) : (
          <div className="flex items-center justify-between">
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
        )}
      </div>
      </aside>
    </>
  );
}
