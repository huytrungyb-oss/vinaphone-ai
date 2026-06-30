import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export { AVAILABLE_MODELS, type ModelId } from "@/lib/models";
