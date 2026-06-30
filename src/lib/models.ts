export const AVAILABLE_MODELS = [
  { id: "gpt-4o-mini", label: "GPT-4o mini (Nhanh)", provider: "openai" },
  { id: "gpt-4o", label: "GPT-4o (Mạnh mẽ)", provider: "openai" },
  { id: "gpt-4-turbo", label: "GPT-4 Turbo", provider: "openai" },
  { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash (Nhanh)", provider: "gemini" },
  { id: "gemini-2.5-pro", label: "Gemini 2.5 Pro (Mạnh mẽ)", provider: "gemini" },
] as const;

export type ModelId = (typeof AVAILABLE_MODELS)[number]["id"];
export type Provider = (typeof AVAILABLE_MODELS)[number]["provider"];

export function getProviderForModel(modelId: string): Provider {
  return AVAILABLE_MODELS.find((m) => m.id === modelId)?.provider ?? "openai";
}
