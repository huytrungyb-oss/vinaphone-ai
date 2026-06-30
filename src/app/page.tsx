import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-gradient-to-br from-(--vnp-blue-dark) via-(--vnp-blue) to-(--vnp-blue-light) text-white">
      <header className="flex items-center justify-between px-6 py-5 max-w-6xl w-full mx-auto">
        <div className="flex items-center gap-2">
          <Image src="/logo.svg" alt="Vinaphone AI" width={36} height={36} />
          <span className="font-bold text-lg">Vinaphone AI</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-medium rounded-lg hover:bg-white/10 transition-colors"
          >
            Đăng nhập
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 text-sm font-medium rounded-lg bg-white text-(--vnp-blue-dark) hover:bg-white/90 transition-colors"
          >
            Đăng ký miễn phí
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20 max-w-3xl mx-auto">
        <span className="inline-block mb-4 px-4 py-1.5 rounded-full bg-white/10 text-sm font-medium">
          Trợ lý trí tuệ nhân tạo thế hệ mới
        </span>
        <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-6">
          Vinaphone AI — Hỏi gì cũng có,
          <br /> đáp án tức thì
        </h1>
        <p className="text-white/80 text-lg mb-10 max-w-xl">
          Trò chuyện, tra cứu thông tin, soạn thảo văn bản và giải quyết công việc nhanh chóng
          cùng trợ lý AI thông minh của Vinaphone.
        </p>
        <Link
          href="/chat"
          className="px-8 py-3.5 rounded-xl bg-(--vnp-red) hover:bg-(--vnp-red-dark) text-white font-semibold text-lg shadow-lg transition-colors"
        >
          Bắt đầu trò chuyện ngay
        </Link>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-20 text-left">
          {[
            { title: "Trò chuyện tự nhiên", desc: "Giao tiếp như với con người, hiểu ngữ cảnh tiếng Việt." },
            { title: "Đa dạng mô hình AI", desc: "Lựa chọn mô hình phù hợp với nhu cầu của bạn." },
            { title: "Lưu lịch sử hội thoại", desc: "Mọi cuộc trò chuyện được lưu lại an toàn." },
          ].map((f) => (
            <div key={f.title} className="bg-white/10 rounded-xl p-5 backdrop-blur-sm">
              <h3 className="font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-white/70">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="text-center text-sm text-white/60 py-6">
        © {new Date().getFullYear()} Vinaphone AI. Đã đăng ký bản quyền.
      </footer>
    </div>
  );
}
