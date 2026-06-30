import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Sidebar from "@/components/chat/Sidebar";

export default async function ChatLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar userName={session.user.name || session.user.email || "Người dùng"} />
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
