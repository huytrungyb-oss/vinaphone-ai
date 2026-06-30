import { GoogleGenAI } from "@google/genai";

let client: GoogleGenAI | null = null;

export function getGemini() {
  if (!client) {
    client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return client;
}
