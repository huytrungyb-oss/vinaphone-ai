import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";

export async function GET() {
  const result: Record<string, unknown> = {
    hasMongoUri: !!process.env.MONGODB_URI,
    hasOpenAiKey: !!process.env.OPENAI_API_KEY,
    hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
    nextAuthUrl: process.env.NEXTAUTH_URL || null,
    nodeVersion: process.version,
  };

  try {
    await connectDB();
    result.mongoConnect = "OK";
  } catch (err) {
    result.mongoConnect = "FAILED";
    result.mongoError = err instanceof Error ? err.message : String(err);
  }

  return NextResponse.json(result);
}
