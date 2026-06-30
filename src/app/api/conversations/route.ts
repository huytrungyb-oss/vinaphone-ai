import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Conversation from "@/models/Conversation";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  await connectDB();

  const conversations = await Conversation.find({ userId: session.user.id })
    .sort({ updatedAt: -1 })
    .select("_id title model updatedAt")
    .lean();

  return NextResponse.json({ conversations });
}
