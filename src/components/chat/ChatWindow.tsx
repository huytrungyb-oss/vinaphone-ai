"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Send, Bot, User, Sparkles, Lock } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { isProModel, type ModelId, DEFAULT_GUEST_MODEL } from "@/lib/models";
import ModelSelector from "@/components/chat/ModelSelector";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type Props = {
  conversationId?: string;
  initialMessages?: ChatMessage[];
  initialModel?: string;
  isGuest?: boolean;
};

const SUGGESTIONS = [
  "Viết email xin nghỉ phép lịch sự",
  "Tóm tắt bài báo dài thành 5 ý chính",
  "Giải thích trí tuệ nhân tạo cho trẻ em",
  "Gợi ý thực đơn ăn uống lành mạnh trong tuần",
];

export default function ChatWindow({ conversationId, initialMessages, initialModel, isGuest = false }: Props) {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages || []);
  const [input, setInput] = useState("");
  const [model, setModel] = useState(initialModel || DEFAULT_GUEST_MODEL);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState("");
  const [needsRegister, setNeedsRegister] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const currentIdRef = useRef<string | undefined>(conversationId);

  useEffect(() => {
    currentIdRef.current = conversationId;
    setMessages(initialMessages || []);
  }, [conversationId, initialMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleModelChange(modelId: ModelId) {
    if (isGuest && isProModel(modelId)) {
      setNeedsRegister(true);
      return;
    }
    setNeedsRegister(false);
    setModel(modelId);
  }

  async function sendMessage(text: string) {
    if (!text.trim() || streaming) return;

    if (isGuest && isProModel(model)) {
      setNeedsRegister(true);
      return;
    }

    setError("");
    setNeedsRegister(false);
    setInput("");
    const historyBeforeSend = messages;
    setMessages((prev) => [...prev, { role: "user", content: text }, { role: "assistant", content: "" }]);
    setStreaming(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: currentIdRef.current,
          message: text,
          model,
          history: isGuest ? historyBeforeSend : undefined,
        }),
      });

      if (res.status === 401) {
        const data = await res.json().catch(() => ({}));
        if (data.code === "REGISTER_REQUIRED") {
          setNeedsRegister(true);
        } else {
          setError(data.error || "Vui lòng đăng nhập để tiếp tục");
        }
        setMessages((prev) => prev.slice(0, -2));
        setStreaming(false);
        return;
      }

      if (!res.ok || !res.body) {
        throw new Error("Không thể kết nối tới máy chủ");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let newConversationId: string | undefined;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() || "";

        for (const evt of events) {
          const lines = evt.split("\n");
          const eventLine = lines.find((l) => l.startsWith("event:"));
          const dataLine = lines.find((l) => l.startsWith("data:"));
          if (!eventLine || !dataLine) continue;

          const eventType = eventLine.replace("event:", "").trim();
          const data = JSON.parse(dataLine.replace("data:", "").trim());

          if (eventType === "meta") {
            newConversationId = data.conversationId;
            if (!currentIdRef.current) {
              currentIdRef.current = newConversationId;
            }
          } else if (eventType === "token") {
            setMessages((prev) => {
              const updated = [...prev];
              updated[updated.length - 1] = {
                role: "assistant",
                content: updated[updated.length - 1].content + data.delta,
              };
              return updated;
            });
          } else if (eventType === "error") {
            setError(data.message || "Đã có lỗi xảy ra");
          }
        }
      }

      if (!isGuest && !conversationId && newConversationId) {
        router.replace(`/chat/${newConversationId}`);
      }
      if (!isGuest) {
        router.refresh();
      }
    } catch {
      setError("Không thể kết nối tới máy chủ. Vui lòng thử lại.");
    } finally {
      setStreaming(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center justify-between px-6 py-3 border-b border-(--vnp-gray-200) bg-white">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-(--vnp-blue)" />
          <span className="font-medium text-sm text-(--vnp-gray-900)">Vinaphone AI</span>
        </div>
        <ModelSelector value={model} onChange={handleModelChange} isGuest={isGuest} />
      </header>

      {needsRegister && (
        <div className="bg-(--vnp-red)/5 border-b border-(--vnp-red)/20 px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-(--vnp-gray-900)">
            <Lock size={15} className="text-(--vnp-red) shrink-0" />
            <span>Model PRO yêu cầu tài khoản. Đăng ký miễn phí để mở khoá toàn bộ model.</span>
          </div>
          <Link
            href="/register"
            className="shrink-0 text-sm font-medium px-4 py-1.5 rounded-lg bg-(--vnp-red) hover:bg-(--vnp-red-dark) text-white transition-colors"
          >
            Đăng ký ngay
          </Link>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {isEmpty ? (
          <div className="h-full flex flex-col items-center justify-center px-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-(--vnp-blue) flex items-center justify-center mb-4">
              <Bot size={32} className="text-white" />
            </div>
            <h2 className="text-xl font-semibold text-(--vnp-gray-900) mb-2">
              Tôi có thể giúp gì cho bạn?
            </h2>
            <p className="text-(--vnp-gray-700) text-sm mb-8 max-w-md">
              Hãy đặt câu hỏi hoặc chọn một gợi ý bên dưới để bắt đầu.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl w-full">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="text-left text-sm px-4 py-3 rounded-xl border border-(--vnp-gray-200) hover:border-(--vnp-blue) hover:bg-(--vnp-blue)/5 transition-colors text-(--vnp-gray-900)"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
            {messages.map((m, i) => (
              <div key={i} className="flex gap-3">
                <div
                  className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    m.role === "user" ? "bg-(--vnp-gray-200)" : "bg-(--vnp-blue)"
                  }`}
                >
                  {m.role === "user" ? (
                    <User size={16} className="text-(--vnp-gray-700)" />
                  ) : (
                    <Bot size={16} className="text-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-(--vnp-gray-700) mb-1">
                    {m.role === "user" ? "Bạn" : "Vinaphone AI"}
                  </p>
                  {m.role === "assistant" && m.content === "" && streaming && i === messages.length - 1 ? (
                    <span className="inline-flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-(--vnp-blue) animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-(--vnp-blue) animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-(--vnp-blue) animate-bounce" />
                    </span>
                  ) : (
                    <div className="markdown-body text-sm text-(--vnp-gray-900) leading-relaxed">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <div className="border-t border-(--vnp-gray-200) bg-white px-4 py-4">
        {error && <p className="text-xs text-(--vnp-red) max-w-3xl mx-auto mb-2">{error}</p>}
        {isGuest && (
          <p className="text-xs text-(--vnp-gray-700)/70 max-w-3xl mx-auto mb-2">
            Bạn đang chat với tư cách khách - lịch sử sẽ không được lưu lại.{" "}
            <Link href="/register" className="text-(--vnp-blue) font-medium hover:underline">
              Đăng ký
            </Link>{" "}
            để lưu hội thoại và dùng model PRO.
          </p>
        )}
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Nhập câu hỏi của bạn..."
            rows={1}
            disabled={streaming}
            className="flex-1 resize-none px-4 py-3 rounded-xl border border-(--vnp-gray-200) focus:outline-none focus:ring-2 focus:ring-(--vnp-blue) text-sm max-h-40"
          />
          <button
            type="submit"
            disabled={streaming || !input.trim()}
            className="shrink-0 w-11 h-11 rounded-xl bg-(--vnp-blue) hover:bg-(--vnp-blue-dark) disabled:opacity-40 text-white flex items-center justify-center transition-colors"
            aria-label="Gửi"
          >
            <Send size={18} />
          </button>
        </form>
        <p className="text-center text-xs text-(--vnp-gray-700)/60 mt-2">
          Vinaphone AI có thể đưa ra thông tin không chính xác. Hãy kiểm tra lại các nội dung quan trọng.
        </p>
      </div>
    </div>
  );
}
