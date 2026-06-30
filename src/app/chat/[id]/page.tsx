import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Conversation from "@/models/Conversation";
import ChatWindow from "@/components/chat/ChatWindow";

export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) {
    notFound();
  }

  await connectDB();
  const conversation = await Conversation.findOne({ _id: id, userId: session.user.id }).lean();

  if (!conversation) {
    notFound();
  }

  const messages = conversation.messages.map((m: { role: string; content: string }) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  return (
    <ChatWindow conversationId={id} initialMessages={messages} initialModel={conversation.model} />
  );
}
