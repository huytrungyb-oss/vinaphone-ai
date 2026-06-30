import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Conversation from "@/models/Conversation";
import { getOpenAI } from "@/lib/openai";
import { getGemini } from "@/lib/gemini";
import { getDeepSeek } from "@/lib/deepseek";
import { getProviderForModel } from "@/lib/models";

const SYSTEM_PROMPT =
  "Bạn là Vinaphone AI, trợ lý ảo thông minh của Vinaphone. Hãy trả lời bằng tiếng Việt thân thiện, chính xác và hữu ích.";

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

  const selectedModel = conversation.model || "gpt-4o-mini";
  const provider = getProviderForModel(selectedModel);

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(
        encoder.encode(`event: meta\ndata: ${JSON.stringify({ conversationId: conversation._id.toString(), title: conversation.title })}\n\n`)
      );

      let fullResponse = "";

      try {
        if (provider === "gemini") {
          const contents = chatHistory.map((m: { role: string; content: string }) => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.content }],
          }));

          const response = await getGemini().models.generateContentStream({
            model: selectedModel,
            contents,
            config: { systemInstruction: SYSTEM_PROMPT },
          });

          for await (const chunk of response) {
            const delta = chunk.text || "";
            if (delta) {
              fullResponse += delta;
              controller.enqueue(encoder.encode(`event: token\ndata: ${JSON.stringify({ delta })}\n\n`));
            }
          }
        } else {
          const client = provider === "deepseek" ? getDeepSeek() : getOpenAI();
          const completion = await client.chat.completions.create({
            model: selectedModel,
            messages: [{ role: "system", content: SYSTEM_PROMPT }, ...chatHistory],
            stream: true,
          });

          for await (const chunk of completion) {
            const delta = chunk.choices[0]?.delta?.content || "";
            if (delta) {
              fullResponse += delta;
              controller.enqueue(encoder.encode(`event: token\ndata: ${JSON.stringify({ delta })}\n\n`));
            }
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
