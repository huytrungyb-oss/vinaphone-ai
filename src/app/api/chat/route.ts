import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Conversation from "@/models/Conversation";
import { getOpenAI } from "@/lib/openai";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  const { conversationId, message, model } = await req.json();

  if (!message || typeof message !== "string") {
    return NextResponse.json({ error: "Thiếu nội dung tin nhắn" }, { status: 400 });
  }

  await connectDB();

  let conversation = conversationId
    ? await Conversation.findOne({ _id: conversationId, userId: session.user.id })
    : null;

  if (!conversation) {
    conversation = await Conversation.create({
      userId: session.user.id,
      title: message.slice(0, 50),
      model: model || "gpt-4o-mini",
      messages: [],
    });
  }

  conversation.messages.push({ role: "user", content: message, createdAt: new Date() });
  await conversation.save();

  const chatHistory = conversation.messages.map((m: { role: string; content: string }) => ({
    role: m.role,
    content: m.content,
  }));

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(
        encoder.encode(`event: meta\ndata: ${JSON.stringify({ conversationId: conversation._id.toString(), title: conversation.title })}\n\n`)
      );

      let fullResponse = "";

      try {
        const completion = await getOpenAI().chat.completions.create({
          model: conversation.model || "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "Bạn là Vinaphone AI, trợ lý ảo thông minh của Vinaphone. Hãy trả lời bằng tiếng Việt thân thiện, chính xác và hữu ích.",
            },
            ...chatHistory,
          ],
          stream: true,
        });

        for await (const chunk of completion) {
          const delta = chunk.choices[0]?.delta?.content || "";
          if (delta) {
            fullResponse += delta;
            controller.enqueue(encoder.encode(`event: token\ndata: ${JSON.stringify({ delta })}\n\n`));
          }
        }

        conversation.messages.push({
          role: "assistant",
          content: fullResponse,
          createdAt: new Date(),
        });
        await conversation.save();

        controller.enqueue(encoder.encode(`event: done\ndata: ${JSON.stringify({ ok: true })}\n\n`));
      } catch (err) {
        const message = err instanceof Error ? err.message : "Lỗi không xác định";
        controller.enqueue(encoder.encode(`event: error\ndata: ${JSON.stringify({ message })}\n\n`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
