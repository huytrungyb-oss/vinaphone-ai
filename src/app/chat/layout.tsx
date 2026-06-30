import { auth } from "@/lib/auth";
import Sidebar from "@/components/chat/Sidebar";
import { SidebarProvider } from "@/components/chat/SidebarContext";

export default async function ChatLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden relative">
        <Sidebar userName={session?.user?.name || (session?.user as { phone?: string })?.phone || null} />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </SidebarProvider>
  );
}
