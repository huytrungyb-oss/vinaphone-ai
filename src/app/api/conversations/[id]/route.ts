import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Conversation from "@/models/Conversation";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  const { id } = await params;
  await connectDB();

  const conversation = await Conversation.findOne({ _id: id, userId: session.user.id }).lean();
  if (!conversation) {
    return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });
  }

  return NextResponse.json({ conversation });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  const { id } = await params;
  await connectDB();

  await Conversation.deleteOne({ _id: id, userId: session.user.id });
  return NextResponse.json({ ok: true });
}
