import { auth } from "@/lib/auth";
import ChatWindow from "@/components/chat/ChatWindow";

export default async function NewChatPage() {
  const session = await auth();
  return <ChatWindow isGuest={!session?.user} />;
}
