import OpenAI from "openai";

let client: OpenAI | null = null;

export function getDeepSeek() {
  if (!client) {
    client = new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseURL: "https://api.deepseek.com",
    });
  }
  return client;
}
